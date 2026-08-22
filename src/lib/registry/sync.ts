import { entityConnectors, feedConnectors, type EntitySnapshot } from "./connectors";
import { deriveFactChange, factHash, stableStringify } from "./observations";
import { officialSources } from "./official-sources";
import type { D1Statement, RegistryDatabase } from "./repository";

type SourceRow = {
  id: string;
  name: string;
  connector: string;
  feed_url: string | null;
  url: string;
};

type SubscriptionRow = {
  id: string;
  entity_id: string;
  source_id: string;
  locator: string;
};

type CurrentFactRow = {
  value_json: string;
  value_hash: string;
};

export type SyncBatchResult = {
  sourceId: string;
  processed: number;
  observed: number;
  changed: number;
  errors: Array<{ locator: string; message: string }>;
  nextOffset?: number;
};

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function sqlDate(value = new Date()): string {
  return value.toISOString();
}

function metricValue(snapshot: EntitySnapshot, key: string): number | null {
  const value = snapshot.metrics[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export class RegistrySyncService {
  constructor(private readonly db: RegistryDatabase) {}

  async registerSources(): Promise<void> {
    const statements = officialSources.map((source) => this.db.prepare(`
      INSERT INTO sources (
        id, name, publisher, region, kind, trust_tier, automation_status, connector,
        url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 1, ?14, ?14)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, publisher = excluded.publisher, region = excluded.region,
        kind = excluded.kind, trust_tier = excluded.trust_tier,
        automation_status = excluded.automation_status, connector = excluded.connector,
        url = excluded.url, feed_url = excluded.feed_url, api_url = excluded.api_url,
        scope_json = excluded.scope_json, cadence = excluded.cadence,
        updated_at = excluded.updated_at
    `).bind(
      source.id,
      source.name,
      source.publisher,
      source.region,
      source.kind,
      source.trustTier,
      source.automationStatus,
      source.connector,
      source.url,
      source.feedUrl ?? null,
      source.apiUrl ?? null,
      JSON.stringify(source.scope),
      source.cadence,
      sqlDate()
    ));
    if (statements.length) await this.db.batch(statements);
  }

  async syncSubscriptions(options: {
    sourceId: string;
    offset?: number;
    limit?: number;
    token?: string;
  }): Promise<SyncBatchResult> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 25);
    const offset = Math.max(options.offset ?? 0, 0);
    const source = await this.db.prepare(`
      SELECT id, name, connector, feed_url, url FROM sources WHERE id = ?1 AND enabled = 1 LIMIT 1
    `).bind(options.sourceId).first<SourceRow>();
    if (!source) throw new Error(`Unknown or disabled source: ${options.sourceId}`);

    if (source.connector === "rss") {
      return this.syncFeed(source);
    }

    const connector = entityConnectors[source.connector];
    if (!connector) throw new Error(`No entity connector for ${source.connector}`);

    const subscriptions = await this.db.prepare(`
      SELECT id, entity_id, source_id, locator
      FROM source_subscriptions
      WHERE source_id = ?1 AND enabled = 1
        AND (next_sync_at IS NULL OR next_sync_at <= datetime('now'))
      ORDER BY COALESCE(last_synced_at, '1970-01-01') ASC, id ASC
      LIMIT ?2 OFFSET ?3
    `).bind(source.id, limit, offset).all<SubscriptionRow>();
    const rows = subscriptions.results ?? [];
    const result: SyncBatchResult = {
      sourceId: source.id,
      processed: 0,
      observed: 0,
      changed: 0,
      errors: []
    };
    const runId = id("run");
    const startedAt = sqlDate();
    await this.db.prepare(`
      INSERT INTO sync_runs (id, source_id, trigger_type, status, started_at)
      VALUES (?1, ?2, 'schedule', 'running', ?3)
    `).bind(runId, source.id, startedAt).run();

    for (const subscription of rows) {
      try {
        const snapshot = await connector.fetchEntity(subscription.locator, { token: options.token });
        const applied = await this.applyEntitySnapshot(subscription, runId, snapshot);
        result.processed += 1;
        result.observed += applied.observed;
        result.changed += applied.changed;
      } catch (error) {
        result.errors.push({
          locator: subscription.locator,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const status = result.errors.length === 0 ? "succeeded" : result.processed > 0 ? "partial" : "failed";
    await this.db.prepare(`
      UPDATE sync_runs SET status = ?2, finished_at = ?3, observed_count = ?4,
        changed_count = ?5, error_count = ?6, error_summary = ?7
      WHERE id = ?1
    `).bind(
      runId,
      status,
      sqlDate(),
      result.observed,
      result.changed,
      result.errors.length,
      result.errors.length ? JSON.stringify(result.errors) : null
    ).run();

    if (rows.length === limit) result.nextOffset = 0;
    return result;
  }

  private async applyEntitySnapshot(
    subscription: SubscriptionRow,
    runId: string,
    snapshot: EntitySnapshot
  ): Promise<{ observed: number; changed: number }> {
    const statements: D1Statement[] = [];
    let changed = 0;

    for (const [factKey, value] of Object.entries(snapshot.facts)) {
      if (value === undefined) continue;
      const valueJson = stableStringify(value);
      const valueHash = await factHash(value);
      const current = await this.db.prepare(`
        SELECT value_json, value_hash FROM current_facts WHERE entity_id = ?1 AND fact_key = ?2
      `).bind(subscription.entity_id, factKey).first<CurrentFactRow>();
      if (current?.value_hash === valueHash) continue;

      const observationId = id("obs");
      const observedAt = snapshot.observedAt;
      statements.push(this.db.prepare(`
        INSERT INTO observations (
          id, entity_id, source_id, sync_run_id, fact_key, value_json, value_hash,
          source_url, confidence, observed_at, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1.0, ?9, ?9)
      `).bind(
        observationId,
        subscription.entity_id,
        subscription.source_id,
        runId,
        factKey,
        valueJson,
        valueHash,
        snapshot.canonicalUrl,
        observedAt
      ));

      const previousValue = current ? JSON.parse(current.value_json) : undefined;
      // The first observation establishes a baseline. Public change events begin
      // only when a previously observed value moves.
      const change = current ? deriveFactChange(previousValue, value) : undefined;
      if (change) {
        changed += 1;
        statements.push(this.db.prepare(`
          INSERT INTO change_events (
            id, entity_id, source_id, observation_id, fact_key, change_type,
            previous_value_json, next_value_json, source_url, detected_at, created_at
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
        `).bind(
          id("change"),
          subscription.entity_id,
          subscription.source_id,
          observationId,
          factKey,
          change.changeType,
          change.previousValue === undefined ? null : stableStringify(change.previousValue),
          change.nextValue === undefined ? null : stableStringify(change.nextValue),
          snapshot.canonicalUrl,
          observedAt
        ));
      }

      statements.push(this.db.prepare(`
        INSERT INTO current_facts (
          entity_id, fact_key, observation_id, source_id, value_json, value_hash,
          confidence, observed_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1.0, ?7, ?7)
        ON CONFLICT(entity_id, fact_key) DO UPDATE SET
          observation_id = excluded.observation_id, source_id = excluded.source_id,
          value_json = excluded.value_json, value_hash = excluded.value_hash,
          confidence = excluded.confidence, observed_at = excluded.observed_at,
          updated_at = excluded.updated_at
      `).bind(
        subscription.entity_id,
        factKey,
        observationId,
        subscription.source_id,
        valueJson,
        valueHash,
        observedAt
      ));
    }

    const metricEntries = Object.entries(snapshot.metrics).filter(([, value]) => typeof value === "number");
    for (const [metricKey, metric] of metricEntries) {
      statements.push(this.db.prepare(`
        INSERT OR IGNORE INTO metric_snapshots (
          id, entity_id, source_id, metric_key, metric_value, observed_at, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
      `).bind(
        id("metric"),
        subscription.entity_id,
        subscription.source_id,
        metricKey,
        metric,
        snapshot.observedAt
      ));
    }

    statements.push(this.db.prepare(`
      INSERT INTO entity_metrics_current (
        entity_id, stars, forks, watchers, downloads_30d, open_issues,
        last_commit_at, source_id, observed_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)
      ON CONFLICT(entity_id) DO UPDATE SET
        stars = COALESCE(excluded.stars, entity_metrics_current.stars),
        forks = COALESCE(excluded.forks, entity_metrics_current.forks),
        watchers = COALESCE(excluded.watchers, entity_metrics_current.watchers),
        downloads_30d = COALESCE(excluded.downloads_30d, entity_metrics_current.downloads_30d),
        open_issues = COALESCE(excluded.open_issues, entity_metrics_current.open_issues),
        last_commit_at = COALESCE(excluded.last_commit_at, entity_metrics_current.last_commit_at),
        source_id = excluded.source_id, observed_at = excluded.observed_at, updated_at = excluded.updated_at
    `).bind(
      subscription.entity_id,
      metricValue(snapshot, "stars"),
      metricValue(snapshot, "forks"),
      metricValue(snapshot, "watchers"),
      metricValue(snapshot, "downloads_30d"),
      metricValue(snapshot, "open_issues"),
      typeof snapshot.metrics.last_commit_at === "string" ? snapshot.metrics.last_commit_at : null,
      subscription.source_id,
      snapshot.observedAt
    ));

    statements.push(this.db.prepare(`
      UPDATE source_subscriptions
      SET external_id = ?2, last_synced_at = ?3, next_sync_at = datetime(?3, '+1 day'), updated_at = ?3
      WHERE id = ?1
    `).bind(subscription.id, snapshot.externalId, snapshot.observedAt));
    statements.push(this.db.prepare(`
      UPDATE entities SET last_seen_at = ?2, last_verified_at = ?2, updated_at = ?2 WHERE id = ?1
    `).bind(subscription.entity_id, snapshot.observedAt));

    if (statements.length) await this.db.batch(statements);
    return { observed: metricEntries.length + Object.keys(snapshot.facts).length, changed };
  }

  private async syncFeed(source: SourceRow): Promise<SyncBatchResult> {
    const connector = feedConnectors[source.connector];
    const feedUrl = source.feed_url ?? source.url;
    if (!connector) throw new Error(`No feed connector for ${source.connector}`);
    const items = await connector.fetchItems(feedUrl);
    const now = sqlDate();
    const statements = items.map((item) => this.db.prepare(`
      INSERT INTO source_items (
        id, source_id, external_id, title, summary, url, published_at,
        discovered_at, updated_at, topics_json, raw_hash
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8, ?9, ?10)
      ON CONFLICT(source_id, url) DO UPDATE SET
        title = excluded.title, summary = excluded.summary,
        published_at = excluded.published_at, updated_at = excluded.updated_at,
        topics_json = excluded.topics_json, raw_hash = excluded.raw_hash
    `).bind(
      id("item"),
      source.id,
      item.externalId ?? null,
      item.title,
      item.summary ?? null,
      item.url,
      item.publishedAt ?? null,
      now,
      JSON.stringify(item.topics),
      item.rawHash
    ));
    if (statements.length) await this.db.batch(statements);
    return { sourceId: source.id, processed: items.length, observed: items.length, changed: 0, errors: [] };
  }
}

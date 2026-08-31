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
  table: "source_subscriptions" | "history_subscriptions";
};

type CurrentFactRow = {
  source_id: string;
  value_json: string;
  value_hash: string;
};

type NormalizedRelease = {
  upstreamId?: string;
  version?: string;
  title: string;
  kind: "software" | "model" | "weights" | "dataset" | "firmware" | "hardware" | "documentation" | "other";
  channel: "stable" | "prerelease" | "development" | "unknown";
  url: string;
  publishedAt?: string;
  notes?: string;
  metadata: Record<string, unknown>;
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

function stableId(prefix: string, ...parts: string[]): string {
  return `${prefix}_${parts.join("_").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 180)}`;
}

function sqlDate(value = new Date()): string {
  return value.toISOString();
}

function metricValue(snapshot: EntitySnapshot, key: string): number | null {
  const value = snapshot.metrics[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function releaseKind(category?: string): NormalizedRelease["kind"] {
  if (category === "foundation-model" || category === "robot-model") return "model";
  if (category === "robot-hardware") return "firmware";
  return "software";
}

function normalizedRelease(snapshot: EntitySnapshot, sourceId: string, category?: string): NormalizedRelease | undefined {
  const github = objectValue(snapshot.facts["github_release.latest"]);
  if (sourceId === "github-releases" && github && typeof github.url === "string" && typeof github.name === "string") {
    return {
      upstreamId: snapshot.externalId,
      version: typeof github.tag === "string" ? github.tag : undefined,
      title: github.name,
      kind: releaseKind(category),
      channel: "stable",
      url: github.url,
      publishedAt: typeof github.publishedAt === "string" ? github.publishedAt : undefined,
      metadata: { repository: github.repository }
    };
  }
  const npm = objectValue(snapshot.facts["npm.package"]);
  if (sourceId === "npm" && npm && typeof npm.url === "string" && typeof npm.version === "string") {
    return {
      upstreamId: snapshot.externalId,
      version: npm.version,
      title: `${typeof npm.name === "string" ? npm.name : snapshot.locator} ${npm.version}`,
      kind: "software",
      channel: "stable",
      url: npm.url,
      publishedAt: typeof npm.publishedAt === "string" ? npm.publishedAt : undefined,
      metadata: { deprecated: npm.deprecated ?? null, license: npm.license ?? null }
    };
  }
  return undefined;
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
    locator?: string;
    fetcher?: typeof fetch;
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

    const subscriptionTable: SubscriptionRow["table"] = source.id === "github-releases"
      ? "history_subscriptions"
      : "source_subscriptions";
    const subscriptions = await this.db.prepare(`
      SELECT id, entity_id, source_id, locator
      FROM ${subscriptionTable}
      WHERE source_id = ?1 AND enabled = 1
        AND (next_sync_at IS NULL OR julianday(next_sync_at) <= julianday('now'))
        AND (?4 IS NULL OR locator = ?4)
      ORDER BY COALESCE(last_synced_at, '1970-01-01') ASC, id ASC
      LIMIT ?2 OFFSET ?3
    `).bind(source.id, limit, offset, options.locator ?? null).all<Omit<SubscriptionRow, "table">>();
    const rows = (subscriptions.results ?? []).map((subscription) => ({ ...subscription, table: subscriptionTable }));
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
        const snapshot = await connector.fetchEntity(subscription.locator, { token: options.token, fetcher: options.fetcher });
        const applied = await this.applyEntitySnapshot(subscription, runId, snapshot);
        result.processed += 1;
        result.observed += applied.observed;
        result.changed += applied.changed;
      } catch (error) {
        // Back off failures so one inaccessible source cannot monopolize every batch.
        await this.db.prepare(`UPDATE ${subscription.table} SET error_count = error_count + 1,
          last_error = ?2, next_sync_at = datetime('now', '+' || MIN(24, (error_count + 1) * 2) || ' hours')
          WHERE id = ?1`).bind(subscription.id, (error instanceof Error ? error.message : String(error)).slice(0,1000)).run();
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

    const catalog = await this.db.prepare("SELECT primary_category FROM catalog_profiles WHERE entity_id = ?1 LIMIT 1")
      .bind(subscription.entity_id).first<{ primary_category: string }>();
    const normalized = normalizedRelease(snapshot, subscription.source_id, catalog?.primary_category);
    const releases: NormalizedRelease[] = snapshot.releases?.map((release) => ({
      upstreamId: release.upstreamId,
      version: release.version,
      title: release.title,
      kind: releaseKind(catalog?.primary_category),
      channel: release.channel,
      url: release.url,
      publishedAt: release.publishedAt,
      metadata: release.metadata ?? {},
      notes: release.notes
    })) ?? (normalized ? [normalized] : []);
    for (const release of releases) statements.push(this.db.prepare(`
      INSERT INTO project_releases (
        id, entity_id, upstream_id, version, title, release_kind, channel,
        release_url, notes, metadata_json, source_id, published_at, observed_at, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13)
      ON CONFLICT(entity_id, source_id, release_url) DO UPDATE SET
        upstream_id = excluded.upstream_id, version = excluded.version,
        title = excluded.title, release_kind = excluded.release_kind,
        channel = excluded.channel, notes = excluded.notes, metadata_json = excluded.metadata_json,
        published_at = excluded.published_at, observed_at = excluded.observed_at
    `).bind(
      id("release"), subscription.entity_id, release.upstreamId ?? null,
      release.version ?? null, release.title, release.kind, release.channel,
      release.url, release.notes ?? null, JSON.stringify(release.metadata), subscription.source_id,
      release.publishedAt ?? null, snapshot.observedAt
    ));

    for (const paper of snapshot.papers ?? []) {
      const paperId = paper.arxivId
        ? stableId("paper_arxiv", paper.arxivId)
        : paper.doi ? stableId("paper_doi", paper.doi) : stableId("paper_url", paper.url);
      statements.push(this.db.prepare(`
        INSERT INTO papers (
          id, title, doi, arxiv_id, paper_url, published_at, metadata_json,
          source_id, observed_at, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, doi = excluded.doi,
          arxiv_id = excluded.arxiv_id, paper_url = excluded.paper_url,
          published_at = COALESCE(excluded.published_at, papers.published_at),
          metadata_json = excluded.metadata_json, source_id = excluded.source_id,
          observed_at = excluded.observed_at
      `).bind(
        paperId, paper.title, paper.doi ?? null, paper.arxivId ?? null,
        paper.url, paper.publishedAt ?? null, JSON.stringify(paper.metadata ?? {}),
        subscription.source_id, snapshot.observedAt
      ));
      statements.push(this.db.prepare(`
        INSERT INTO entity_papers (entity_id, paper_id, relationship_type, source_url, observed_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(entity_id, paper_id, relationship_type) DO UPDATE SET
          source_url = excluded.source_url, observed_at = excluded.observed_at
      `).bind(subscription.entity_id, paperId, paper.relationshipType, paper.sourceUrl, snapshot.observedAt));
    }

    const benchmarkCategory = ["foundation-model", "agent", "robot-model", "robot-hardware"].includes(catalog?.primary_category ?? "")
      ? catalog?.primary_category : "cross-category";
    for (const evaluation of snapshot.evaluations ?? []) {
      const benchmarkId = stableId("benchmark", evaluation.benchmarkSlug);
      const evaluationId = stableId("evaluation", subscription.entity_id, evaluation.benchmarkSlug, evaluation.metricKey);
      statements.push(this.db.prepare(`
        INSERT INTO benchmarks (
          id, slug, name, category, task, primary_metric, methodology_url,
          evaluator, metadata_json, source_id, observed_at, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, '{}', ?9, ?10, ?10, ?10)
        ON CONFLICT(slug) DO UPDATE SET name = excluded.name, category = excluded.category,
          task = excluded.task, primary_metric = excluded.primary_metric,
          methodology_url = excluded.methodology_url, evaluator = excluded.evaluator,
          source_id = excluded.source_id, observed_at = excluded.observed_at,
          updated_at = excluded.updated_at
      `).bind(
        benchmarkId, evaluation.benchmarkSlug, evaluation.benchmarkName,
        benchmarkCategory, evaluation.task ?? null, evaluation.metricKey,
        evaluation.resultUrl, subscription.source_id === "huggingface" ? "Model card publisher" : subscription.source_id,
        subscription.source_id, snapshot.observedAt
      ));
      statements.push(this.db.prepare(`
        INSERT INTO evaluation_results (
          id, benchmark_id, entity_id, evaluator_type, metric_key, metric_value,
          metric_text, unit, higher_is_better, conditions_json, result_url,
          source_id, evaluated_at, observed_at, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?14)
        ON CONFLICT(id) DO UPDATE SET metric_value = excluded.metric_value,
          metric_text = excluded.metric_text, unit = excluded.unit,
          higher_is_better = excluded.higher_is_better,
          conditions_json = excluded.conditions_json, result_url = excluded.result_url,
          evaluated_at = excluded.evaluated_at, observed_at = excluded.observed_at
      `).bind(
        evaluationId, benchmarkId, subscription.entity_id, evaluation.evaluatorType,
        evaluation.metricKey, evaluation.metricValue ?? null, evaluation.metricText ?? null,
        evaluation.unit ?? null, evaluation.higherIsBetter === undefined ? null : evaluation.higherIsBetter ? 1 : 0,
        JSON.stringify(evaluation.conditions ?? {}), evaluation.resultUrl, subscription.source_id,
        evaluation.evaluatedAt ?? null, snapshot.observedAt
      ));
    }

    for (const [factKey, value] of Object.entries(snapshot.facts)) {
      if (value === undefined) continue;
      const valueJson = stableStringify(value);
      const valueHash = await factHash(value);
      const current = await this.db.prepare(`
        SELECT value_json, value_hash, source_id FROM current_facts WHERE entity_id = ?1 AND fact_key = ?2
      `).bind(subscription.entity_id, factKey).first<CurrentFactRow>();
      // Cross-source disagreements require review; never silently replace a
      // curated fact with a package/repository claim. New collectors use namespaces.
      if (current && current.source_id !== subscription.source_id) continue;
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
      if (change && factKey !== "npm.downloads") {
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

    // This legacy cache describes the primary repository/model metrics. Package
    // and release provenance stays in their namespaced facts and snapshots.
    if (!["npm", "github-releases"].includes(subscription.source_id)) statements.push(this.db.prepare(`
      INSERT INTO entity_metrics_current (
        entity_id, stars, forks, watchers, downloads_30d, open_issues,
        last_commit_at, last_release_at, source_id, observed_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
      ON CONFLICT(entity_id) DO UPDATE SET
        stars = COALESCE(excluded.stars, entity_metrics_current.stars),
        forks = COALESCE(excluded.forks, entity_metrics_current.forks),
        watchers = COALESCE(excluded.watchers, entity_metrics_current.watchers),
        downloads_30d = COALESCE(excluded.downloads_30d, entity_metrics_current.downloads_30d),
        open_issues = COALESCE(excluded.open_issues, entity_metrics_current.open_issues),
        last_commit_at = COALESCE(excluded.last_commit_at, entity_metrics_current.last_commit_at),
        last_release_at = COALESCE(excluded.last_release_at, entity_metrics_current.last_release_at),
        source_id = excluded.source_id, observed_at = excluded.observed_at, updated_at = excluded.updated_at
    `).bind(
      subscription.entity_id,
      metricValue(snapshot, "stars"),
      metricValue(snapshot, "forks"),
      metricValue(snapshot, "watchers"),
      metricValue(snapshot, "downloads_30d"),
      metricValue(snapshot, "open_issues"),
      typeof snapshot.metrics.last_commit_at === "string" ? snapshot.metrics.last_commit_at : null,
      typeof snapshot.metrics.last_release_at === "string" ? snapshot.metrics.last_release_at : null,
      subscription.source_id,
      snapshot.observedAt
    ));

    statements.push(this.db.prepare(`
      UPDATE ${subscription.table}
      SET external_id = ?2, last_synced_at = ?3, next_sync_at = datetime(?3, '+1 day'), updated_at = ?3, error_count = 0, last_error = NULL
      WHERE id = ?1
    `).bind(subscription.id, snapshot.externalId, snapshot.observedAt));
    statements.push(this.db.prepare(`
      UPDATE entities SET last_seen_at = ?2 WHERE id = ?1
    `).bind(subscription.entity_id, snapshot.observedAt));

    if (statements.length) await this.db.batch(statements);
    return {
      observed: metricEntries.length + Object.keys(snapshot.facts).length + releases.length
        + (snapshot.papers?.length ?? 0) + (snapshot.evaluations?.length ?? 0),
      changed
    };
  }

  private async syncFeed(source: SourceRow): Promise<SyncBatchResult> {
    const connector = feedConnectors[source.connector];
    const feedUrl = source.feed_url ?? source.url;
    if (!connector) throw new Error(`No feed connector for ${source.connector}`);
    const runId = id("run");
    const startedAt = sqlDate();
    await this.db.prepare(`
      INSERT INTO sync_runs (id, source_id, trigger_type, status, started_at)
      VALUES (?1, ?2, 'schedule', 'running', ?3)
    `).bind(runId, source.id, startedAt).run();

    try {
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
      await this.db.prepare(`
        UPDATE sync_runs SET status = 'succeeded', finished_at = ?2,
          discovered_count = ?3, observed_count = ?3
        WHERE id = ?1
      `).bind(runId, sqlDate(), items.length).run();
      return { sourceId: source.id, processed: items.length, observed: items.length, changed: 0, errors: [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.db.prepare(`
        UPDATE sync_runs SET status = 'failed', finished_at = ?2,
          error_count = 1, error_summary = ?3
        WHERE id = ?1
      `).bind(runId, sqlDate(), JSON.stringify([{ locator: feedUrl, message }])).run();
      throw error;
    }
  }
}

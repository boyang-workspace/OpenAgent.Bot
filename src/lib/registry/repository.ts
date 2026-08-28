import type {
  EntityDomain,
  EntityKind,
  EntityQuery,
  EntityQueryResult,
  OpennessStatus,
  RegistryChange,
  RegistryDossier,
  RegistryEntity,
  RegistryRoboticsProfile,
  RegistryStats
} from "./types";
import { parseEntityDomains } from "./domains";

export type D1Result<T> = { results?: T[]; success: boolean; meta?: Record<string, unknown> };

export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T>() => Promise<D1Result<T>>;
  first: <T>() => Promise<T | null>;
  run: () => Promise<D1Result<unknown>>;
};

export type RegistryDatabase = {
  prepare: (query: string) => D1Statement;
  batch: (statements: D1Statement[]) => Promise<Array<D1Result<unknown>>>;
};

type EntityRow = {
  id: string;
  slug: string;
  kind: EntityKind;
  domains_csv: string | null;
  use_cases_json: string | null;
  primary_domain: EntityDomain | null;
  robotics_layer: RegistryRoboticsProfile["layer"] | null;
  robotics_model_type: RegistryRoboticsProfile["modelType"] | null;
  robotics_form_factor: RegistryRoboticsProfile["formFactor"] | null;
  robotics_stack_type: RegistryRoboticsProfile["stackType"] | null;
  robotics_metadata_json: string | null;
  robotics_confidence: number | null;
  robotics_classification_method: RegistryRoboticsProfile["classificationMethod"] | null;
  robotics_review_status: RegistryRoboticsProfile["reviewStatus"] | null;
  robotics_source_url: string | null;
  robotics_updated_at: string | null;
  name: string;
  summary: string;
  description: string | null;
  organization: string | null;
  country: string | null;
  lifecycle: RegistryEntity["lifecycle"];
  openness_status: OpennessStatus;
  license_spdx: string | null;
  canonical_url: string | null;
  repository_url: string | null;
  documentation_url: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  image_source: string | null;
  image_source_url: string | null;
  image_usage_note: string | null;
  stars: number | null;
  forks: number | null;
  watchers: number | null;
  downloads_30d: number | null;
  open_issues: number | null;
  last_release_at: string | null;
  last_commit_at: string | null;
  evidence_records: number | null;
  source_count: number | null;
  metric_history_started_at: string | null;
  stars_baseline: number | null;
  first_seen_at: string;
  last_seen_at: string;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

function entityFromRow(row: EntityRow): RegistryEntity {
  const metricHistoryDays = row.metric_history_started_at
    ? Math.max(0, Math.floor((Date.now() - new Date(row.metric_history_started_at).getTime()) / 86_400_000))
    : undefined;
  const robotics = row.robotics_layer ? {
    layer: row.robotics_layer,
    modelType: row.robotics_model_type ?? undefined,
    formFactor: row.robotics_form_factor ?? undefined,
    stackType: row.robotics_stack_type ?? undefined,
    metadata: (jsonValue(row.robotics_metadata_json) ?? {}) as Record<string, unknown>,
    confidence: Number(row.robotics_confidence ?? 0),
    classificationMethod: row.robotics_classification_method ?? "rule",
    reviewStatus: row.robotics_review_status ?? "provisional",
    sourceUrl: row.robotics_source_url ?? undefined,
    updatedAt: row.robotics_updated_at ?? row.updated_at
  } satisfies RegistryRoboticsProfile : undefined;
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    domains: parseEntityDomains(row.domains_csv),
    useCases: (jsonValue(row.use_cases_json) ?? []) as RegistryEntity["useCases"],
    primaryDomain: row.primary_domain ?? undefined,
    robotics,
    name: row.name,
    summary: row.summary,
    description: row.description ?? undefined,
    organization: row.organization ?? undefined,
    country: row.country ?? undefined,
    lifecycle: row.lifecycle,
    opennessStatus: row.openness_status,
    licenseSpdx: row.license_spdx ?? undefined,
    canonicalUrl: row.canonical_url ?? undefined,
    repositoryUrl: row.repository_url ?? undefined,
    documentationUrl: row.documentation_url ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    heroImageUrl: row.hero_image_url ?? undefined,
    imageSource: row.image_source ?? undefined,
    imageSourceUrl: row.image_source_url ?? undefined,
    imageUsageNote: row.image_usage_note ?? undefined,
    stars: row.stars ?? undefined,
    forks: row.forks ?? undefined,
    watchers: row.watchers ?? undefined,
    downloads30d: row.downloads_30d ?? undefined,
    openIssues: row.open_issues ?? undefined,
    lastReleaseAt: row.last_release_at ?? undefined,
    lastCommitAt: row.last_commit_at ?? undefined,
    evidenceRecords: row.evidence_records ?? undefined,
    sourceCount: row.source_count ?? undefined,
    metricHistoryDays,
    starsDelta30d: metricHistoryDays !== undefined && metricHistoryDays >= 28 && row.stars !== null && row.stars_baseline !== null
      ? row.stars - row.stars_baseline
      : undefined,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    lastVerifiedAt: row.last_verified_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const selectEntity = `
  SELECT e.*, m.stars, m.forks, m.watchers, m.downloads_30d, m.open_issues,
         m.last_release_at, m.last_commit_at,
         (SELECT COUNT(*) FROM observations o_count WHERE o_count.entity_id = e.id) AS evidence_records,
         (SELECT COUNT(*) FROM source_subscriptions ss_count WHERE ss_count.entity_id = e.id AND ss_count.enabled = 1) AS source_count,
         (SELECT MIN(ms_start.observed_at) FROM metric_snapshots ms_start WHERE ms_start.entity_id = e.id) AS metric_history_started_at,
         (SELECT ms_base.metric_value FROM metric_snapshots ms_base
          WHERE ms_base.entity_id = e.id AND ms_base.metric_key = 'stars'
          ORDER BY ms_base.observed_at ASC LIMIT 1) AS stars_baseline,
         (SELECT group_concat(ed.domain, '|') FROM entity_domains ed WHERE ed.entity_id = e.id) AS domains_csv,
         (SELECT json_group_array(json_object('slug', uc.slug, 'name', uc.name, 'sourceUrl', eu.source_url, 'observedAt', eu.observed_at))
          FROM entity_use_cases eu JOIN use_cases uc ON uc.slug = eu.use_case_slug WHERE eu.entity_id = e.id) AS use_cases_json,
         (SELECT ed.domain FROM entity_domains ed WHERE ed.entity_id = e.id AND ed.is_primary = 1 LIMIT 1) AS primary_domain,
         rp.layer AS robotics_layer, rp.model_type AS robotics_model_type,
         rp.form_factor AS robotics_form_factor, rp.stack_type AS robotics_stack_type,
         rp.metadata_json AS robotics_metadata_json, rp.confidence AS robotics_confidence,
         rp.classification_method AS robotics_classification_method,
         rp.review_status AS robotics_review_status, rp.source_url AS robotics_source_url,
         rp.updated_at AS robotics_updated_at
  FROM entities e
  LEFT JOIN entity_metrics_current m ON m.entity_id = e.id
  LEFT JOIN robotics_profiles rp ON rp.entity_id = e.id
`;

function jsonValue(value: string | null): unknown {
  if (value === null) return undefined;
  try { return JSON.parse(value); } catch { return value; }
}

function changeFromRow(row: Record<string, string | null>): RegistryChange {
  return {
    id: String(row.id),
    entityId: String(row.entity_id),
    entitySlug: String(row.entity_slug),
    entityName: String(row.entity_name),
    entityKind: row.entity_kind as EntityKind,
    factKey: String(row.fact_key),
    changeType: row.change_type as RegistryChange["changeType"],
    previousValue: jsonValue(row.previous_value_json),
    nextValue: jsonValue(row.next_value_json),
    sourceName: String(row.source_name),
    sourceUrl: row.source_url ?? undefined,
    detectedAt: String(row.detected_at)
  };
}

export class RegistryRepository {
  constructor(private readonly db: RegistryDatabase) {}

  async listEntities(query: EntityQuery = {}): Promise<EntityQueryResult> {
    const filters: string[] = ["e.visibility = 'public'"];
    const values: unknown[] = [];

    if (query.q?.trim()) {
      values.push(`%${query.q.trim()}%`);
      const index = values.length;
      filters.push(`(e.name LIKE ?${index} OR e.summary LIKE ?${index} OR e.organization LIKE ?${index})`);
    }
    if (query.kinds?.length) {
      const placeholders = query.kinds.map((kind) => {
        values.push(kind);
        return `?${values.length}`;
      });
      filters.push(`e.kind IN (${placeholders.join(", ")})`);
    }
    if (query.domains?.length) {
      const placeholders = query.domains.map((domain) => {
        values.push(domain);
        return `?${values.length}`;
      });
      filters.push(`EXISTS (
        SELECT 1 FROM entity_domains ed
        WHERE ed.entity_id = e.id AND ed.domain IN (${placeholders.join(", ")})
      )`);
    }
    if (query.roboticsLayers?.length) {
      const placeholders = query.roboticsLayers.map((layer) => {
        values.push(layer);
        return `?${values.length}`;
      });
      filters.push(`EXISTS (
        SELECT 1 FROM robotics_profiles rp_filter
        WHERE rp_filter.entity_id = e.id AND rp_filter.layer IN (${placeholders.join(", ")})
      )`);
    }
    if (query.openness?.length) {
      const placeholders = query.openness.map((status) => {
        values.push(status);
        return `?${values.length}`;
      });
      filters.push(`e.openness_status IN (${placeholders.join(", ")})`);
    }
    if (query.country) {
      values.push(query.country);
      filters.push(`e.country = ?${values.length}`);
    }
    if (query.useCase) {
      values.push(query.useCase);
      filters.push(`EXISTS (SELECT 1 FROM entity_use_cases eu WHERE eu.entity_id = e.id AND eu.use_case_slug = ?${values.length})`);
    }
    if (query.license) {
      values.push(query.license);
      filters.push(`e.license_spdx = ?${values.length}`);
    }
    if (query.verifiedWithinDays) {
      values.push(`-${Math.max(1, Math.floor(query.verifiedWithinDays))} days`);
      filters.push(`julianday(COALESCE(e.last_verified_at, e.updated_at)) >= julianday('now', ?${values.length})`);
    }

    const orderBy =
      query.sort === "stars"
        ? "COALESCE(m.stars, 0) DESC, e.name ASC"
        : query.sort === "activity"
          ? "COALESCE(m.last_commit_at, m.last_release_at, e.last_verified_at, e.updated_at) DESC, e.name ASC"
        : query.sort === "name"
          ? "e.name ASC"
          : "COALESCE(e.last_verified_at, e.updated_at) DESC, e.name ASC";
    const limit = Math.min(Math.max(query.limit ?? 40, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);
    const where = filters.join(" AND ");

    const count = await this.db
      .prepare(`SELECT COUNT(*) AS count FROM entities e WHERE ${where}`)
      .bind(...values)
      .first<{ count: number }>();

    values.push(limit, offset);
    const rows = await this.db
      .prepare(`${selectEntity} WHERE ${where} ORDER BY ${orderBy} LIMIT ?${values.length - 1} OFFSET ?${values.length}`)
      .bind(...values)
      .all<EntityRow>();

    return {
      items: (rows.results ?? []).map(entityFromRow),
      total: count?.count ?? 0,
      limit,
      offset
    };
  }

  async listUseCases(): Promise<Array<{ slug: string; name: string }>> {
    const rows = await this.db.prepare(`SELECT uc.slug, uc.name FROM use_cases uc
      WHERE EXISTS (SELECT 1 FROM entity_use_cases eu JOIN entities e ON e.id = eu.entity_id
        WHERE eu.use_case_slug = uc.slug AND e.visibility = 'public') ORDER BY uc.name`).all<{ slug: string; name: string }>();
    return rows.results ?? [];
  }

  async getEntity(slug: string): Promise<RegistryEntity | undefined> {
    const row = await this.db
      .prepare(`${selectEntity} WHERE e.slug = ?1 AND e.visibility = 'public' LIMIT 1`)
      .bind(slug)
      .first<EntityRow>();
    return row ? entityFromRow(row) : undefined;
  }

  async getEntityDossier(slug: string): Promise<RegistryDossier | undefined> {
    const entity = await this.getEntity(slug);
    if (!entity) return undefined;

    const [domainAssignments, facts, facets, changes, relationships, relationshipEvidence, subscriptions, metricSnapshots, record] = await Promise.all([
      this.db.prepare(`
        SELECT domain, is_primary, confidence, classification_method, review_status,
               source_url, updated_at
        FROM entity_domains
        WHERE entity_id = ?1
        ORDER BY is_primary DESC, domain
      `).bind(entity.id).all<Record<string, string | number | null>>(),
      this.db.prepare(`
        SELECT f.fact_key, f.value_json, f.confidence, f.observed_at,
               s.name AS source_name, s.trust_tier, o.source_url
        FROM current_facts f
        JOIN sources s ON s.id = f.source_id
        LEFT JOIN observations o ON o.id = f.observation_id
        WHERE f.entity_id = ?1
        ORDER BY f.fact_key
      `).bind(entity.id).all<Record<string, string | number | null>>(),
      this.db.prepare(`
        SELECT o.facet, o.status, o.license_or_terms, o.source_url, o.observed_at,
               s.name AS source_name
        FROM openness_facets o
        JOIN sources s ON s.id = o.source_id
        WHERE o.entity_id = ?1
        ORDER BY o.facet
      `).bind(entity.id).all<Record<string, string | null>>(),
      this.db.prepare(`
        SELECT c.id, c.entity_id, e.slug AS entity_slug, e.name AS entity_name,
               e.kind AS entity_kind, c.fact_key, c.change_type,
               c.previous_value_json, c.next_value_json, s.name AS source_name,
               c.source_url, c.detected_at
        FROM change_events c
        JOIN entities e ON e.id = c.entity_id
        JOIN sources s ON s.id = c.source_id
        WHERE c.entity_id = ?1
        ORDER BY c.detected_at DESC
        LIMIT 20
      `).bind(entity.id).all<Record<string, string | null>>(),
      this.db.prepare(`
        SELECT r.id, r.relationship_type, r.status, r.confidence,
               CASE WHEN r.source_entity_id = ?1 THEN 'outbound' ELSE 'inbound' END AS direction,
               e.id AS related_id, e.slug AS related_slug, e.name AS related_name,
               e.kind AS related_kind, e.summary AS related_summary
        FROM relationships r
        JOIN entities e ON e.id = CASE
          WHEN r.source_entity_id = ?1 THEN r.target_entity_id ELSE r.source_entity_id END
        WHERE (r.source_entity_id = ?1 OR r.target_entity_id = ?1)
          AND r.status != 'rejected' AND e.visibility = 'public'
        ORDER BY r.confidence DESC, e.name
      `).bind(entity.id).all<Record<string, string | number>>(),
      this.db.prepare(`
        SELECT re.relationship_id, re.source_url, re.excerpt, re.observed_at,
               s.name AS source_name
        FROM relationship_evidence re
        JOIN sources s ON s.id = re.source_id
        WHERE re.relationship_id IN (
          SELECT id FROM relationships
          WHERE source_entity_id = ?1 OR target_entity_id = ?1
        )
        ORDER BY re.observed_at DESC
      `).bind(entity.id).all<Record<string, string | null>>(),
      this.db.prepare(`
        SELECT s.name AS source_name, s.trust_tier, ss.locator,
               ss.last_synced_at, ss.next_sync_at
        FROM source_subscriptions ss
        JOIN sources s ON s.id = ss.source_id
        WHERE ss.entity_id = ?1 AND ss.enabled = 1
        ORDER BY s.trust_tier, s.name
      `).bind(entity.id).all<Record<string, string | null>>(),
      this.db.prepare(`
        SELECT metric_key, metric_value, observed_at
        FROM metric_snapshots
        WHERE entity_id = ?1
        ORDER BY observed_at DESC
        LIMIT 60
      `).bind(entity.id).all<Record<string, string | number>>(),
      this.db.prepare(`
        SELECT COUNT(*) AS observation_count, MIN(observed_at) AS first_observation_at,
               MAX(observed_at) AS last_observation_at,
               (SELECT COUNT(*) FROM metric_snapshots WHERE entity_id = ?1) AS metric_snapshot_count
        FROM observations WHERE entity_id = ?1
      `).bind(entity.id).first<Record<string, string | number | null>>()
    ]);

    const evidenceByRelationship = new Map<string, RegistryDossier["relationships"][number]["evidence"]>();
    for (const row of relationshipEvidence.results ?? []) {
      const relationshipId = String(row.relationship_id);
      const evidence = evidenceByRelationship.get(relationshipId) ?? [];
      evidence.push({
        sourceName: String(row.source_name),
        sourceUrl: String(row.source_url),
        excerpt: row.excerpt ?? undefined,
        observedAt: String(row.observed_at)
      });
      evidenceByRelationship.set(relationshipId, evidence);
    }

    return {
      entity,
      domainAssignments: (domainAssignments.results ?? []).map((row) => ({
        domain: String(row.domain) as EntityDomain,
        isPrimary: Number(row.is_primary) === 1,
        confidence: Number(row.confidence),
        classificationMethod: String(row.classification_method) as RegistryDossier["domainAssignments"][number]["classificationMethod"],
        reviewStatus: String(row.review_status) as RegistryDossier["domainAssignments"][number]["reviewStatus"],
        sourceUrl: typeof row.source_url === "string" ? row.source_url : undefined,
        updatedAt: String(row.updated_at)
      })),
      facts: (facts.results ?? []).map((row) => ({
        key: String(row.fact_key),
        value: jsonValue(typeof row.value_json === "string" ? row.value_json : null),
        confidence: Number(row.confidence),
        observedAt: String(row.observed_at),
        sourceName: String(row.source_name),
        sourceTrustTier: String(row.trust_tier) as RegistryDossier["facts"][number]["sourceTrustTier"],
        sourceUrl: typeof row.source_url === "string" ? row.source_url : undefined
      })),
      opennessFacets: (facets.results ?? []).map((row) => ({
        facet: String(row.facet) as RegistryDossier["opennessFacets"][number]["facet"],
        status: String(row.status) as RegistryDossier["opennessFacets"][number]["status"],
        licenseOrTerms: row.license_or_terms ?? undefined,
        sourceName: String(row.source_name),
        sourceUrl: row.source_url ?? undefined,
        observedAt: String(row.observed_at)
      })),
      changes: (changes.results ?? []).map(changeFromRow),
      relationships: (relationships.results ?? []).map((row) => ({
        id: String(row.id),
        direction: String(row.direction) as "outbound" | "inbound",
        type: String(row.relationship_type),
        status: String(row.status) as "candidate" | "verified",
        confidence: Number(row.confidence),
        entity: {
          id: String(row.related_id),
          slug: String(row.related_slug),
          name: String(row.related_name),
          kind: String(row.related_kind) as EntityKind,
          summary: String(row.related_summary)
        },
        evidence: evidenceByRelationship.get(String(row.id)) ?? []
      })),
      subscriptions: (subscriptions.results ?? []).map((row) => ({
        sourceName: String(row.source_name),
        sourceTrustTier: String(row.trust_tier) as RegistryDossier["subscriptions"][number]["sourceTrustTier"],
        locator: String(row.locator),
        lastSyncedAt: row.last_synced_at ?? undefined,
        nextSyncAt: row.next_sync_at ?? undefined
      })),
      metricSnapshots: (metricSnapshots.results ?? []).map((row) => ({
        key: String(row.metric_key),
        value: Number(row.metric_value),
        observedAt: String(row.observed_at)
      })),
      record: {
        observationCount: Number(record?.observation_count ?? 0),
        metricSnapshotCount: Number(record?.metric_snapshot_count ?? 0),
        firstObservationAt: typeof record?.first_observation_at === "string" ? record.first_observation_at : undefined,
        lastObservationAt: typeof record?.last_observation_at === "string" ? record.last_observation_at : undefined
      }
    };
  }

  async getStats(): Promise<RegistryStats> {
    const row = await this.db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public') AS entities,
        (SELECT COUNT(*) FROM entity_domains ed JOIN entities e ON e.id = ed.entity_id WHERE e.visibility = 'public' AND ed.domain = 'agent') AS agents,
        (SELECT COUNT(*) FROM entity_domains ed JOIN entities e ON e.id = ed.entity_id WHERE e.visibility = 'public' AND ed.domain = 'robotics') AS robots,
        (SELECT COUNT(*) FROM entity_domains ed JOIN entities e ON e.id = ed.entity_id WHERE e.visibility = 'public' AND ed.domain = 'shared') AS infrastructure,
        (SELECT COUNT(*) FROM robotics_profiles rp JOIN entities e ON e.id = rp.entity_id WHERE e.visibility = 'public' AND rp.layer = 'platform') AS robot_platforms,
        (SELECT COUNT(*) FROM robotics_profiles rp JOIN entities e ON e.id = rp.entity_id WHERE e.visibility = 'public' AND rp.layer = 'intelligence') AS robot_intelligence,
        (SELECT COUNT(*) FROM robotics_profiles rp JOIN entities e ON e.id = rp.entity_id WHERE e.visibility = 'public' AND rp.layer = 'stack') AS robotics_stack,
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public' AND kind = 'model') AS models,
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public' AND kind = 'tool') AS tools,
        (SELECT COUNT(*) FROM sources WHERE enabled = 1) AS sources,
        (SELECT COUNT(DISTINCT source_id) FROM sync_runs WHERE status = 'succeeded') AS live_sources,
        (SELECT COUNT(*) FROM observations) AS observations,
        (SELECT COUNT(DISTINCT entity_id) FROM metric_snapshots) AS metric_entities,
        (SELECT COUNT(*) FROM change_events WHERE detected_at >= datetime('now', '-30 days')) AS changes_30d,
        (SELECT MIN(observed_at) FROM metric_snapshots) AS history_started_at,
        (SELECT MAX(finished_at) FROM sync_runs WHERE status = 'succeeded') AS last_sync_at
    `).first<Record<string, number | string | null>>();

    return {
      entities: Number(row?.entities ?? 0),
      agents: Number(row?.agents ?? 0),
      robots: Number(row?.robots ?? 0),
      infrastructure: Number(row?.infrastructure ?? 0),
      robotPlatforms: Number(row?.robot_platforms ?? 0),
      robotIntelligence: Number(row?.robot_intelligence ?? 0),
      roboticsStack: Number(row?.robotics_stack ?? 0),
      models: Number(row?.models ?? 0),
      tools: Number(row?.tools ?? 0),
      sources: Number(row?.sources ?? 0),
      liveSources: Number(row?.live_sources ?? 0),
      observations: Number(row?.observations ?? 0),
      metricEntities: Number(row?.metric_entities ?? 0),
      changes30d: Number(row?.changes_30d ?? 0),
      historyStartedAt: typeof row?.history_started_at === "string" ? row.history_started_at : undefined,
      lastSyncAt: typeof row?.last_sync_at === "string" ? row.last_sync_at : undefined
    };
  }

  async listChanges(limit = 50): Promise<RegistryChange[]> {
    const result = await this.db.prepare(`
      SELECT c.id, c.entity_id, e.slug AS entity_slug, e.name AS entity_name, e.kind AS entity_kind,
             c.fact_key, c.change_type, c.previous_value_json, c.next_value_json,
             s.name AS source_name, c.source_url, c.detected_at
      FROM change_events c
      JOIN entities e ON e.id = c.entity_id
      JOIN sources s ON s.id = c.source_id
      WHERE e.visibility = 'public'
      ORDER BY c.detected_at DESC
      LIMIT ?1
    `).bind(Math.min(Math.max(limit, 1), 100)).all<Record<string, string | null>>();

    return (result.results ?? []).map(changeFromRow);
  }
}

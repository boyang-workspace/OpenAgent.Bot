import type {
  EntityKind,
  EntityQuery,
  EntityQueryResult,
  OpennessStatus,
  RegistryChange,
  RegistryEntity,
  RegistryStats
} from "./types";

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
  stars: number | null;
  forks: number | null;
  watchers: number | null;
  last_release_at: string | null;
  last_commit_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

function entityFromRow(row: EntityRow): RegistryEntity {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
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
    stars: row.stars ?? undefined,
    forks: row.forks ?? undefined,
    watchers: row.watchers ?? undefined,
    lastReleaseAt: row.last_release_at ?? undefined,
    lastCommitAt: row.last_commit_at ?? undefined,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    lastVerifiedAt: row.last_verified_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const selectEntity = `
  SELECT e.*, m.stars, m.forks, m.watchers, m.last_release_at, m.last_commit_at
  FROM entities e
  LEFT JOIN entity_metrics_current m ON m.entity_id = e.id
`;

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

    const orderBy =
      query.sort === "stars"
        ? "COALESCE(m.stars, 0) DESC, e.name ASC"
        : query.sort === "name"
          ? "e.name ASC"
          : "e.updated_at DESC, e.name ASC";
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

  async getEntity(slug: string): Promise<RegistryEntity | undefined> {
    const row = await this.db
      .prepare(`${selectEntity} WHERE e.slug = ?1 AND e.visibility = 'public' LIMIT 1`)
      .bind(slug)
      .first<EntityRow>();
    return row ? entityFromRow(row) : undefined;
  }

  async getStats(): Promise<RegistryStats> {
    const row = await this.db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public') AS entities,
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public' AND kind IN ('agent', 'agent-framework')) AS agents,
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public' AND kind IN ('robot', 'robotics-framework', 'hardware')) AS robots,
        (SELECT COUNT(*) FROM entities WHERE visibility = 'public' AND kind = 'model') AS models,
        (SELECT COUNT(*) FROM sources WHERE enabled = 1) AS sources,
        (SELECT COUNT(*) FROM observations) AS observations,
        (SELECT COUNT(*) FROM change_events WHERE detected_at >= datetime('now', '-30 days')) AS changes_30d,
        (SELECT MAX(finished_at) FROM sync_runs WHERE status = 'succeeded') AS last_sync_at
    `).first<Record<string, number | string | null>>();

    return {
      entities: Number(row?.entities ?? 0),
      agents: Number(row?.agents ?? 0),
      robots: Number(row?.robots ?? 0),
      models: Number(row?.models ?? 0),
      sources: Number(row?.sources ?? 0),
      observations: Number(row?.observations ?? 0),
      changes30d: Number(row?.changes_30d ?? 0),
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

    return (result.results ?? []).map((row) => ({
      id: String(row.id),
      entityId: String(row.entity_id),
      entitySlug: String(row.entity_slug),
      entityName: String(row.entity_name),
      entityKind: row.entity_kind as EntityKind,
      factKey: String(row.fact_key),
      changeType: row.change_type as RegistryChange["changeType"],
      previousValue: row.previous_value_json ? JSON.parse(row.previous_value_json) : undefined,
      nextValue: row.next_value_json ? JSON.parse(row.next_value_json) : undefined,
      sourceName: String(row.source_name),
      sourceUrl: row.source_url ?? undefined,
      detectedAt: String(row.detected_at)
    }));
  }
}

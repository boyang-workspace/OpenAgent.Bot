import type { RegistryDatabase } from "./repository";

export type UsageSubjectType = "model" | "app";
export type UsageDataset = "models" | "apps";

type IdentityRule = {
  match_kind: "exact" | "prefix";
  pattern: string;
  entity_id: string;
  openness_status: string;
};

type UsageInput = {
  sourceSubjectId: string;
  displayName: string;
  date: string;
  totalTokens: string;
  totalRequests?: number;
  rank?: number;
};

type DatasetPayload = {
  data?: unknown[];
  meta?: { as_of?: unknown; start_date?: unknown; end_date?: unknown; version?: unknown };
};

export type UsageSnapshotItem = {
  subjectId: string;
  displayName: string;
  entitySlug?: string;
  opennessStatus: string;
  totalTokens: string;
  totalRequests?: number;
  rank?: number;
  variants: number;
};

export type UsageTrendSeries = {
  key: string;
  displayName: string;
  entitySlug?: string;
  opennessStatus: string;
  points: Array<{ date: string; totalTokens: string }>;
  windowTokens: string;
};

export type UsagePageData = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  metricScope: string;
  licenseName?: string;
  attributionTemplate?: string;
  subjectType: UsageSubjectType;
  openOnly: boolean;
  latestDate?: string;
  sourceAsOf?: string;
  snapshot: UsageSnapshotItem[];
  series: UsageTrendSeries[];
  historyDays: number;
  mappedSubjects: number;
  totalSubjects: number;
  lastRun?: { status: string; finishedAt?: string; error?: string };
};

const OPEN_STATUSES = new Set(["open-source", "open-weights", "open-core", "source-available"]);

function stableId(prefix: string, value: string): string {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 180)}`;
}

function isoDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error(`Invalid UTC date: ${value}`);
  return value;
}

function previousUtcDate(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86_400_000).toISOString().slice(0, 10);
}

function datesBetween(start: string, end: string): string[] {
  const first = Date.parse(`${isoDate(start)}T00:00:00Z`);
  const last = Date.parse(`${isoDate(end)}T00:00:00Z`);
  if (first > last) throw new Error("Usage start date must not be after end date");
  const output: string[] = [];
  for (let value = first; value <= last; value += 86_400_000) output.push(new Date(value).toISOString().slice(0, 10));
  return output;
}

function tokenString(value: unknown): string {
  const text = typeof value === "string" ? value : typeof value === "number" && Number.isSafeInteger(value) ? String(value) : "";
  if (!/^\d+$/.test(text)) throw new Error("Invalid token total in usage dataset");
  BigInt(text);
  return text;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${field} in usage dataset`);
  return value.trim();
}

function normalizeAppName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchRule(rules: IdentityRule[], type: UsageSubjectType, sourceSubjectId: string, displayName: string): IdentityRule | undefined {
  const candidate = type === "model" ? sourceSubjectId.toLowerCase() : normalizeAppName(displayName);
  return rules.find((rule) => rule.match_kind === "exact" ? candidate === rule.pattern : candidate.startsWith(rule.pattern));
}

async function batch(db: RegistryDatabase, statements: ReturnType<RegistryDatabase["prepare"]>[], size = 75) {
  for (let index = 0; index < statements.length; index += size) await db.batch(statements.slice(index, index + size));
}

export class UsageSyncService {
  private readonly fetcher: typeof fetch;

  constructor(private readonly db: RegistryDatabase, fetcher?: typeof fetch) {
    // Workerd's native fetch must not be invoked with the service instance as
    // its `this` value. The arrow wrapper preserves a direct global call while
    // tests can still inject a deterministic fetch implementation.
    this.fetcher = fetcher ?? ((input, init) => fetch(input, init));
  }

  async syncOpenRouter(options: {
    apiKey?: string;
    datasets?: UsageDataset[];
    startDate?: string;
    endDate?: string;
  }) {
    if (!options.apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
    const endDate = isoDate(options.endDate ?? previousUtcDate());
    const startDate = isoDate(options.startDate ?? endDate);
    const dates = datesBetween(startDate, endDate);
    const datasets = [...new Set(options.datasets ?? ["models", "apps"])] as UsageDataset[];
    if (datasets.includes("apps") && dates.length > 31) throw new Error("App usage backfills are limited to 31 daily buckets per run");
    if (datasets.includes("models") && dates.length > 367) throw new Error("Model usage backfills are limited to 367 daily buckets per run");
    const results = [];
    for (const dataset of datasets) results.push(await this.syncDataset(dataset, startDate, endDate, options.apiKey));
    return { sourceId: "openrouter", startDate, endDate, results };
  }

  private async request(path: string, apiKey: string): Promise<DatasetPayload> {
    const response = await this.fetcher(`https://openrouter.ai${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}`, "User-Agent": "OpenAgentBot-Registry/2.0" },
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) throw new Error(`OpenRouter Data API ${response.status}`);
    const payload = await response.json() as DatasetPayload;
    if (!payload || !Array.isArray(payload.data) || !payload.meta || typeof payload.meta.as_of !== "string") throw new Error("Invalid OpenRouter Data API response");
    return payload;
  }

  private async fetchModels(startDate: string, endDate: string, apiKey: string): Promise<{ rows: UsageInput[]; asOf: string }> {
    const query = new URLSearchParams({ start_date: startDate, end_date: endDate });
    const payload = await this.request(`/api/v1/datasets/rankings-daily?${query}`, apiKey);
    const ranks = new Map<string, number>();
    const rows = (payload.data ?? []).map((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid model usage row");
      const row = value as Record<string, unknown>;
      const date = isoDate(stringValue(row.date, "model usage date"));
      const model = stringValue(row.model_permaslug, "model permaslug");
      const rank = model === "other" ? undefined : (ranks.set(date, (ranks.get(date) ?? 0) + 1), ranks.get(date));
      return { sourceSubjectId: model, displayName: model === "other" ? "Other models" : model, date, totalTokens: tokenString(row.total_tokens), rank };
    });
    return { rows, asOf: String(payload.meta?.as_of) };
  }

  private async fetchApps(startDate: string, endDate: string, apiKey: string): Promise<{ rows: UsageInput[]; asOf: string }> {
    const rows: UsageInput[] = [];
    let asOf = "";
    for (const date of datesBetween(startDate, endDate)) {
      for (const offset of [0, 100]) {
        const query = new URLSearchParams({ sort: "popular", start_date: date, end_date: date, limit: "100", offset: String(offset) });
        const payload = await this.request(`/api/v1/datasets/app-rankings?${query}`, apiKey);
        asOf = String(payload.meta?.as_of);
        for (const value of payload.data ?? []) {
          if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid app usage row");
          const row = value as Record<string, unknown>;
          const appId = typeof row.app_id === "number" || typeof row.app_id === "string" ? String(row.app_id) : "";
          const requests = typeof row.total_requests === "number" && Number.isSafeInteger(row.total_requests) && row.total_requests >= 0 ? row.total_requests : undefined;
          const rank = typeof row.rank === "number" && Number.isSafeInteger(row.rank) && row.rank > 0 ? row.rank : undefined;
          if (!appId) throw new Error("Invalid app ID in usage dataset");
          rows.push({ sourceSubjectId: appId, displayName: stringValue(row.app_name, "app name"), date, totalTokens: tokenString(row.total_tokens), totalRequests: requests, rank });
        }
        if ((payload.data ?? []).length < 100) break;
      }
    }
    return { rows, asOf };
  }

  private async syncDataset(dataset: UsageDataset, startDate: string, endDate: string, apiKey: string) {
    const runId = `usage_run_${crypto.randomUUID()}`;
    const startedAt = new Date().toISOString();
    await this.db.prepare(`INSERT INTO usage_sync_runs
      (id,source_id,dataset,status,start_date,end_date,started_at,created_at)
      VALUES (?1,'openrouter',?2,'running',?3,?4,?5,?5)`)
      .bind(runId, dataset, startDate, endDate, startedAt).run();
    try {
      const subjectType: UsageSubjectType = dataset === "models" ? "model" : "app";
      const [collected, ruleRows] = await Promise.all([
        dataset === "models" ? this.fetchModels(startDate, endDate, apiKey) : this.fetchApps(startDate, endDate, apiKey),
        this.db.prepare(`SELECT r.match_kind,r.pattern,r.entity_id,e.openness_status
          FROM usage_identity_rules r JOIN entities e ON e.id=r.entity_id
          WHERE r.source_id='openrouter' AND r.subject_type=?1
          ORDER BY CASE r.match_kind WHEN 'exact' THEN 0 ELSE 1 END, length(r.pattern) DESC`)
          .bind(subjectType).all<IdentityRule>()
      ]);
      const rules = ruleRows.results ?? [];
      const statements = [];
      let mapped = 0;
      let open = 0;
      for (const row of collected.rows) {
        const rule = matchRule(rules, subjectType, row.sourceSubjectId, row.displayName);
        const subjectId = stableId(`usage_openrouter_${subjectType}`, row.sourceSubjectId);
        const openness = rule?.openness_status ?? "unknown";
        if (rule) mapped += 1;
        if (OPEN_STATUSES.has(openness)) open += 1;
        statements.push(this.db.prepare(`INSERT INTO usage_subjects
          (id,source_id,subject_type,source_subject_id,display_name,entity_id,openness_status,
           mapping_basis,source_url,metadata_json,first_seen_at,last_seen_at,created_at,updated_at)
          VALUES (?1,'openrouter',?2,?3,?4,?5,?6,?7,'https://openrouter.ai/rankings','{}',?8,?8,?8,?8)
          ON CONFLICT(source_id,subject_type,source_subject_id) DO UPDATE SET
            display_name=excluded.display_name,entity_id=COALESCE(excluded.entity_id,usage_subjects.entity_id),
            openness_status=CASE WHEN excluded.entity_id IS NOT NULL THEN excluded.openness_status ELSE usage_subjects.openness_status END,
            mapping_basis=CASE WHEN excluded.entity_id IS NOT NULL THEN excluded.mapping_basis ELSE usage_subjects.mapping_basis END,
            last_seen_at=excluded.last_seen_at,updated_at=excluded.updated_at`)
          .bind(subjectId, subjectType, row.sourceSubjectId, row.displayName, rule?.entity_id ?? null, openness, rule?.match_kind ?? "unmapped", collected.asOf));
        statements.push(this.db.prepare(`INSERT INTO usage_daily
          (subject_id,usage_date,total_tokens,total_requests,source_rank,source_as_of,observed_at,metadata_json,created_at,updated_at)
          VALUES (?1,?2,?3,?4,?5,?6,?7,'{}',?7,?7)
          ON CONFLICT(subject_id,usage_date) DO UPDATE SET total_tokens=excluded.total_tokens,
            total_requests=excluded.total_requests,source_rank=excluded.source_rank,
            source_as_of=excluded.source_as_of,observed_at=excluded.observed_at,updated_at=excluded.updated_at`)
          .bind(subjectId, row.date, row.totalTokens, row.totalRequests ?? null, row.rank ?? null, collected.asOf, startedAt));
      }
      await batch(this.db, statements);
      await this.db.prepare(`UPDATE usage_sync_runs SET status='succeeded',row_count=?2,mapped_count=?3,
        open_count=?4,source_as_of=?5,finished_at=?6 WHERE id=?1`)
        .bind(runId, collected.rows.length, mapped, open, collected.asOf, new Date().toISOString()).run();
      return { dataset, rows: collected.rows.length, mapped, open, sourceAsOf: collected.asOf };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.db.prepare(`UPDATE usage_sync_runs SET status='failed',error_summary=?2,finished_at=?3 WHERE id=?1`)
        .bind(runId, message.slice(0, 1000), new Date().toISOString()).run();
      throw error;
    }
  }
}

function parseJsonRecord(value: string | null): Record<string, unknown> {
  try { const parsed = value ? JSON.parse(value) : {}; return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

export class UsageRepository {
  constructor(private readonly db: RegistryDatabase) {}

  async pageData(subjectType: UsageSubjectType, options: { openOnly?: boolean; days?: number } = {}): Promise<UsagePageData> {
    const openOnly = options.openOnly !== false;
    const days = Math.min(Math.max(Math.floor(options.days ?? 30), 7), 365);
    const openFilter = openOnly ? `AND us.openness_status IN ('open-source','open-weights','open-core','source-available')` : "";
    const [source, latest, counts, lastRun] = await Promise.all([
      this.db.prepare(`SELECT * FROM usage_sources WHERE id='openrouter' LIMIT 1`).first<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT MAX(ud.usage_date) AS usage_date, MAX(ud.source_as_of) AS source_as_of
        FROM usage_daily ud JOIN usage_subjects us ON us.id=ud.subject_id
        WHERE us.source_id='openrouter' AND us.subject_type=?1 ${openFilter}`).bind(subjectType).first<Record<string, string | null>>(),
      this.db.prepare(`SELECT COUNT(*) AS total_subjects,SUM(entity_id IS NOT NULL) AS mapped_subjects
        FROM usage_subjects WHERE source_id='openrouter' AND subject_type=?1`).bind(subjectType).first<Record<string, number>>(),
      this.db.prepare(`SELECT status,finished_at,error_summary FROM usage_sync_runs
        WHERE source_id='openrouter' AND dataset=?1 ORDER BY started_at DESC LIMIT 1`)
        .bind(subjectType === "model" ? "models" : "apps").first<Record<string, string | null>>()
    ]);
    const latestDate = latest?.usage_date ?? undefined;
    let snapshot: UsageSnapshotItem[] = [];
    let series: UsageTrendSeries[] = [];
    let historyDays = 0;
    if (latestDate) {
      const snapshotRows = await this.db.prepare(`SELECT
          COALESCE(us.entity_id,us.id) AS subject_key,MIN(us.id) AS subject_id,
          COALESCE(e.name,MIN(us.display_name)) AS display_name,e.slug AS entity_slug,
          COALESCE(e.openness_status,MIN(us.openness_status)) AS openness_status,
          printf('%lld',SUM(CAST(ud.total_tokens AS INTEGER))) AS total_tokens,
          SUM(ud.total_requests) AS total_requests,MIN(ud.source_rank) AS source_rank,COUNT(*) AS variants
        FROM usage_daily ud JOIN usage_subjects us ON us.id=ud.subject_id
        LEFT JOIN entities e ON e.id=us.entity_id
        WHERE us.source_id='openrouter' AND us.subject_type=?1 AND ud.usage_date=?2 ${openFilter}
        GROUP BY COALESCE(us.entity_id,us.id)
        ORDER BY SUM(CAST(ud.total_tokens AS INTEGER)) DESC LIMIT 25`)
        .bind(subjectType, latestDate).all<Record<string, string | number | null>>();
      snapshot = (snapshotRows.results ?? []).map((row) => ({
        subjectId: String(row.subject_id), displayName: String(row.display_name),
        entitySlug: typeof row.entity_slug === "string" ? row.entity_slug : undefined,
        opennessStatus: String(row.openness_status), totalTokens: String(row.total_tokens),
        totalRequests: typeof row.total_requests === "number" ? row.total_requests : undefined,
        rank: typeof row.source_rank === "number" ? row.source_rank : undefined,
        variants: Number(row.variants)
      }));
      const startDate = new Date(Date.parse(`${latestDate}T00:00:00Z`) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
      const trendRows = await this.db.prepare(`SELECT ud.usage_date,COALESCE(us.entity_id,us.id) AS subject_key,
          COALESCE(e.name,us.display_name) AS display_name,e.slug AS entity_slug,
          COALESCE(e.openness_status,us.openness_status) AS openness_status,ud.total_tokens
        FROM usage_daily ud JOIN usage_subjects us ON us.id=ud.subject_id LEFT JOIN entities e ON e.id=us.entity_id
        WHERE us.source_id='openrouter' AND us.subject_type=?1 AND ud.usage_date BETWEEN ?2 AND ?3 ${openFilter}
        ORDER BY ud.usage_date`).bind(subjectType, startDate, latestDate).all<Record<string, string | null>>();
      const grouped = new Map<string, UsageTrendSeries & { totals: Map<string, bigint> }>();
      const dateSet = new Set<string>();
      for (const row of trendRows.results ?? []) {
        const key = String(row.subject_key), date = String(row.usage_date), tokens = BigInt(String(row.total_tokens));
        dateSet.add(date);
        const current = grouped.get(key) ?? { key, displayName: String(row.display_name), entitySlug: row.entity_slug ?? undefined,
          opennessStatus: String(row.openness_status), points: [], windowTokens: "0", totals: new Map<string, bigint>() };
        current.totals.set(date, (current.totals.get(date) ?? 0n) + tokens);
        grouped.set(key, current);
      }
      historyDays = dateSet.size;
      series = [...grouped.values()].map((item) => {
        const total = [...item.totals.values()].reduce((sum, value) => sum + value, 0n);
        return { key: item.key, displayName: item.displayName, entitySlug: item.entitySlug,
          opennessStatus: item.opennessStatus, windowTokens: total.toString(),
          points: [...item.totals].map(([date, totalTokens]) => ({ date, totalTokens: totalTokens.toString() })).sort((a,b) => a.date.localeCompare(b.date)) };
      }).sort((a,b) => BigInt(b.windowTokens) > BigInt(a.windowTokens) ? 1 : -1).slice(0, 6);
    }
    return {
      sourceId: "openrouter", sourceName: String(source?.name ?? "OpenRouter"),
      sourceUrl: String(source?.source_url ?? "https://openrouter.ai/rankings"),
      metricScope: String(source?.metric_scope ?? "Public OpenRouter traffic"),
      licenseName: typeof source?.license_name === "string" ? source.license_name : undefined,
      attributionTemplate: typeof source?.attribution_template === "string" ? source.attribution_template : undefined,
      subjectType, openOnly, latestDate, sourceAsOf: latest?.source_as_of ?? undefined,
      snapshot, series, historyDays, mappedSubjects: Number(counts?.mapped_subjects ?? 0),
      totalSubjects: Number(counts?.total_subjects ?? 0),
      lastRun: lastRun ? { status: String(lastRun.status), finishedAt: lastRun.finished_at ?? undefined, error: lastRun.error_summary ?? undefined } : undefined
    };
  }
}

export function compactTokens(value: string | bigint): string {
  const tokens = typeof value === "bigint" ? value : BigInt(value);
  const units = [[1_000_000_000_000n,"T"],[1_000_000_000n,"B"],[1_000_000n,"M"],[1_000n,"K"]] as const;
  for (const [unit, suffix] of units) if (tokens >= unit) {
    const whole = Number(tokens / (unit / 10n)) / 10;
    return `${whole >= 100 ? Math.round(whole) : whole.toFixed(whole >= 10 ? 1 : 2).replace(/\.0+$/, "")} ${suffix}`;
  }
  return tokens.toString();
}

export function usageSourceMetadata(value: string | null): Record<string, unknown> { return parseJsonRecord(value); }

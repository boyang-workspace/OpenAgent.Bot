import identityMaps from "../../../content/knowledge/microduck-resource-ids.json";
import { RegistryRepository, type D1Statement, type RegistryDatabase } from "./repository";
import { buildKnowledgeDocument, type LegacyResourceIdentity } from "./knowledge-document";
import { entityDomains } from "./types";
import {
  claimFreshness, knowledgeDate, knowledgeId, knowledgeSchemaVersion, matchKnowledgeClaim,
  type KnowledgeClaim, type KnowledgeDocument, type KnowledgeEvidence, type KnowledgeInterface
} from "./knowledge-contract";

export class KnowledgeQueryError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
const bad = (message: string): never => { throw new KnowledgeQueryError(400, "invalid_query", message); };
const missing = (): never => { throw new KnowledgeQueryError(404, "not_found", "No public record matches this identifier."); };
const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).byteLength;
const encodeCursor = (value: unknown) => btoa(encodeURIComponent(JSON.stringify(value)));
function cursor(params: URLSearchParams, scope: string): Record<string, unknown> | null {
  if (!params.has("cursor")) return null;
  try {
    const raw = params.get("cursor")!;
    if (!raw || raw.length > 4096) return bad("Invalid cursor.");
    const value = JSON.parse(decodeURIComponent(atob(raw)));
    if (!value || typeof value !== "object" || Array.isArray(value) || value.scope !== scope) return bad("Cursor does not belong to this query.");
    return value;
  } catch { return bad("Invalid cursor."); }
}
function parameters(params: URLSearchParams, allowed: readonly string[]) {
  for (const [key, value] of params) {
    if (!allowed.includes(key)) bad(`Unsupported parameter: ${key}`);
    if (params.getAll(key).length !== 1 || !value.trim() || value.length > (key === "cursor" ? 4096 : 200)) bad(`Invalid or duplicate parameter: ${key}`);
  }
}
function choice<T extends string>(params: URLSearchParams, key: string, choices: readonly T[], fallback?: T): T | undefined {
  const value = params.get(key);
  if (value === null) return fallback;
  if (!choices.includes(value as T)) return bad(`Unsupported ${key}.`);
  return value as T;
}
function limit(params: URLSearchParams, fallback = 10): number {
  const value = params.get("limit") ?? String(fallback);
  if (!/^[1-9]\d?$/.test(value) || Number(value) > 20) return bad("limit must be an integer from 1 to 20.");
  return Number(value);
}
function scopeFor(kind: string, params: URLSearchParams) {
  return JSON.stringify([kind, [...params].filter(([key]) => !["cursor", "limit"].includes(key)).sort(([a], [b]) => a.localeCompare(b))]);
}

// A failed D1 result must not become an empty successful answer. This adapter
// also covers the existing repository's parallel dossier queries.
function checkedDatabase(db: RegistryDatabase): RegistryDatabase {
  const wrap = (original: D1Statement): D1Statement => ({
    bind: (...values) => wrap(original.bind(...values)),
    async all<T>() {
      const result = await original.all<T>();
      if (!result.success || !Array.isArray(result.results)) throw new Error("Knowledge storage read failed");
      return result;
    },
    first: <T>() => original.first<T>(),
    run: () => { throw new Error("Knowledge queries are read-only"); }
  });
  return { prepare: (sql) => wrap(db.prepare(sql)), batch: () => { throw new Error("Knowledge queries are read-only"); } };
}

class CompactEvidence {
  records: Record<string, KnowledgeEvidence> = {};
  private keys = new Map<string, string>();
  refs(evidence: KnowledgeEvidence[]) {
    return evidence.map((item) => {
      const key = JSON.stringify(item);
      let id = this.keys.get(key);
      if (!id) { id = `e${this.keys.size + 1}`; this.keys.set(key, id); this.records[id] = item; }
      return id;
    });
  }
  claim(claim: KnowledgeClaim, at: string) {
    const { evidence, alternatives, ...rest } = claim;
    return { ...rest, freshness: claimFreshness(claim, at), evidence: this.refs(evidence), ...(alternatives.length ? { alternatives: alternatives.map((item) => ({ value: item.value, evidence: this.refs(item.evidence) })) } : {}) };
  }
  interface(item: KnowledgeInterface, at: string) {
    const { transport, authentication, access, runtimes, ...rest } = item;
    return { ...rest, transport: this.claim(transport, at), authentication: this.claim(authentication, at), access: this.claim(access, at), runtimes: this.claim(runtimes, at) };
  }
}

export class KnowledgeQueryService {
  private db: RegistryDatabase;
  private registry: RegistryRepository;
  constructor(db: RegistryDatabase, private clock: () => string = () => new Date().toISOString()) {
    this.db = checkedDatabase(db);
    this.registry = new RegistryRepository(this.db);
  }
  private async document(slug: string) {
    const dossier = await this.registry.getEntityDossier(slug);
    if (!dossier) return missing();
    const maps = identityMaps as Record<string, LegacyResourceIdentity[]>;
    return buildKnowledgeDocument(dossier, { legacyResourceIds: maps[dossier.entity.id] });
  }

  async search(params: URLSearchParams) {
    parameters(params, ["interface", "access", "authentication", "verification", "require_fresh", "version_id", "domain", "project", "q", "limit", "cursor"]);
    const type = choice(params, "interface", ["cli", "api", "mcp", "sdk"] as const);
    if (!type) return bad("interface is required for discovery search. For a known project, use /api/knowledge/v1/project.json?slug=PROJECT&section=fields to discover fact values.");
    const access = choice(params, "access", ["read-only", "local-write-opt-in", "read-write"] as const);
    const authentication = choice(params, "authentication", ["none", "required", "optional"] as const);
    const domain = choice(params, "domain", entityDomains);
    const verification = choice(params, "verification", ["documented", "tested"] as const, "documented")!;
    const requireFresh = choice(params, "require_fresh", ["true", "false"] as const, "false") === "true";
    const pageSize = limit(params), at = this.clock(), scope = scopeFor("search", params), after = cursor(params, scope);
    if (after && (typeof after.entity !== "string" || typeof after.key !== "string")) return bad("Invalid search position.");
    const bindings: unknown[] = [type];
    const where = ["e.visibility = 'public'", "f.fact_key LIKE 'interfaces.%'", "json_extract(f.value_json, '$.type') = ?1"];
    const bind = (value: unknown) => { bindings.push(value); return `?${bindings.length}`; };
    // Match any assigned domain, not only the primary one. Taxonomy membership
    // is a discovery constraint, never evidence of runtime/hardware compatibility.
    if (domain) where.push(`EXISTS (SELECT 1 FROM entity_domains d WHERE d.entity_id=e.id AND d.domain=${bind(domain)})`);
    if (params.has("project")) where.push(`e.slug = ${bind(params.get("project"))}`);
    if (params.has("q")) where.push(`(instr(lower(e.name || ' ' || e.summary), lower(${bind(params.get("q"))})) > 0)`);
    if (after) where.push(`(f.entity_id, f.fact_key) > (${bind(after.entity)}, ${bind(after.key)})`);
    // Bounded work even when every candidate is unknown. Empty intermediate
    // pages may have a nextCursor; exhaustion is never a claim of global absence.
    const rows = (await this.db.prepare(`SELECT e.slug, f.entity_id, f.fact_key
      FROM current_facts f JOIN entities e ON e.id = f.entity_id
      WHERE ${where.join(" AND ")} ORDER BY f.entity_id, f.fact_key LIMIT 51`).bind(...bindings).all<{ slug: string; entity_id: string; fact_key: string }>()).results!;
    const cache = new Map<string, KnowledgeDocument>(), evidence = new CompactEvidence();
    const items = [], unknownReasons: Record<string, number> = {};
    let scanned = 0, unknown = 0;
    for (const row of rows.slice(0, 50)) {
      scanned++;
      let doc = cache.get(row.slug);
      if (!doc) { doc = await this.document(row.slug); cache.set(row.slug, doc); }
      // Compare constraints on one interface, never across different endpoints.
      const item = doc.interfaces.find((candidate) => `interfaces.${candidate.localId}` === row.fact_key);
      if (!item || item.type !== type) { unknown++; unknownReasons["invalid-interface"] = (unknownReasons["invalid-interface"] ?? 0) + 1; continue; }
      const options = { asOf: at, verification, requireFresh, versionId: params.get("version_id") ?? undefined };
      const constraints: Array<[string, KnowledgeClaim, string]> = [];
      if (access) constraints.push(["access", item.access, access]);
      if (authentication) constraints.push(["authentication", item.authentication, authentication]);
      // No field filter still requires a documented transport (or tested/fresh
      // transport if requested), not just an unverified index entry.
      if (!constraints.length) constraints.push(["transport", item.transport, item.transport.value ?? ""]);
      const decisions = constraints.map(([field, claim, expected]) => ({ field, result: matchKnowledgeClaim(claim, expected, options) }));
      if (decisions.every(({ result }) => result === "matched")) {
        items.push({ project: { id: doc.project.id, slug: doc.project.slug, name: doc.project.name }, interface: evidence.interface(item, at) });
      } else if (!decisions.some(({ result }) => result === "not-matched")) {
        unknown++;
        for (const { field, result } of decisions) if (result === "unknown") unknownReasons[field] = (unknownReasons[field] ?? 0) + 1;
      }
      if (items.length === pageSize) break;
    }
    const last = rows[scanned - 1], hasMore = rows.length > scanned;
    return {
      schemaVersion: knowledgeSchemaVersion, evaluatedAt: at, scope: "published-interface-declarations",
      accessInterpretation: "declared-capability-not-runtime-permission", consistency: "live-keyset",
      domainInterpretation: "registry-assignment-not-compatibility", domain: domain ?? null,
      items, evidence: evidence.records,
      coverage: { upstream: "unknown", scannedThisPage: scanned, unknownCandidatesThisPage: unknown, unknownReasons, exhausted: !hasMore },
      nextCursor: hasMore && last ? encodeCursor({ scope, entity: last.entity_id, key: last.fact_key }) : null
    };
  }

  async project(params: URLSearchParams) {
    parameters(params, ["slug", "section", "id", "fact_key", "limit", "cursor"]);
    const slug = params.get("slug");
    if (!slug) return bad("slug is required.");
    const section = choice(params, "section", ["overview", "interfaces", "resources", "fields", "facts", "openness"] as const, "overview")!;
    if (params.has("id") && !["interfaces", "resources"].includes(section)) return bad("id requires interfaces or resources.");
    if ((section === "facts") !== params.has("fact_key")) return bad("facts requires exactly one fact_key; other sections do not accept it.");
    if (section === "overview" && ["cursor", "limit"].some((key) => params.has(key))) return bad("overview is not paginated.");
    const pageSize = limit(params), scope = scopeFor("project", params), after = cursor(params, scope);
    const doc = await this.document(slug), at = this.clock(), evidence = new CompactEvidence();
    if (after && (after.snapshot !== doc.snapshotId || !Number.isInteger(after.offset) || Number(after.offset) < 0)) {
      throw new KnowledgeQueryError(409, "record_changed", "Record changed or cursor is invalid; restart pagination.");
    }
    const header = { schemaVersion: knowledgeSchemaVersion, evaluatedAt: at, snapshotId: doc.snapshotId, project: doc.project, section };
    if (section === "overview") return {
      ...header, coverage: "partial", counts: { interfaces: doc.interfaces.length, resources: doc.resources.length, facts: doc.facts.length, issues: doc.issues.length },
      sourceHealth: doc.sourceHealth.map(({ lastError, ...source }) => ({ ...source, syncError: lastError ? "present" : null })),
      history: { ...doc.history, recentChanges: undefined },
      unknowns: ["upstream-completeness", "runtime-compatibility", "point-in-time-reconstruction"],
      links: { sections: ["interfaces", "resources", "fields", "facts", "openness"], fields: `/api/knowledge/v1/project.json?slug=${encodeURIComponent(slug)}&section=fields&limit=20`, interfaces: `/api/knowledge/v1/project.json?slug=${encodeURIComponent(slug)}&section=interfaces`, resources: `/api/knowledge/v1/project.json?slug=${encodeURIComponent(slug)}&section=resources`, history: `/api/knowledge/v1/history.json?slug=${encodeURIComponent(slug)}` }
    };
    const all = section === "interfaces" ? doc.interfaces.map((item) => evidence.interface(item, at))
      : section === "resources" ? doc.resources.map(({ license, evidence: sources, ...item }) => ({ ...item, license: evidence.claim(license, at), evidence: evidence.refs(sources) }))
      : section === "openness" ? doc.openness.map((item) => ({ facet: item.facet, status: evidence.claim(item.status, at), terms: evidence.claim(item.terms, at) }))
      : section === "fields" ? doc.facts.map(({ key, claim }) => ({
        key, valueUrl: `/api/knowledge/v1/project.json?slug=${encodeURIComponent(slug)}&section=facts&fact_key=${encodeURIComponent(key)}`, status: claim.status, verification: claim.verification, freshness: claimFreshness(claim, at),
        valueType: claim.value === null ? "null" : Array.isArray(claim.value) ? "array" : typeof claim.value,
        evidence: evidence.refs(claim.evidence)
      }))
      : doc.facts.filter((item) => item.key === params.get("fact_key")).map((item) => ({ key: item.key, claim: evidence.claim(item.claim, at) }));
    const filtered = params.has("id") ? all.filter((item) => "localId" in item && item.localId === params.get("id")) : all;
    if ((params.has("id") || section === "facts") && !filtered.length) return missing();
    const offset = Number(after?.offset ?? 0);
    if (offset > filtered.length) return bad("Invalid section position.");
    const items = filtered.slice(offset, offset + pageSize);
    // Keep only evidence referenced by this page, not by omitted sections/items.
    const refs = new Set<string>();
    const collect = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      for (const [key, entry] of Object.entries(value)) {
        if (key === "evidence" && Array.isArray(entry)) entry.forEach((id) => { if (typeof id === "string") refs.add(id); });
        else if (entry && typeof entry === "object") collect(entry);
      }
    };
    collect(items);
    const versionIds = new Set(items.flatMap((item) => "versionId" in item && item.versionId ? [item.versionId] : []));
    const versions = doc.versions.filter((item) => versionIds.has(item.id)).map(({ evidence: sources, ...version }) => {
      const ids = evidence.refs(sources); ids.forEach((id) => refs.add(id)); return { ...version, evidence: ids };
    });
    return {
      ...header, coverage: "partial", accessInterpretation: "declared-capability-not-runtime-permission",
      ...(section === "fields" ? { claimInterpretation: "top-level-only; nested-null-values-remain-unknown" } : {}),
      items, versions, evidence: Object.fromEntries([...refs].map((id) => [id, evidence.records[id]])),
      totalInRecord: filtered.length, issues: doc.issues,
      nextCursor: offset + items.length < filtered.length ? encodeCursor({ scope, snapshot: doc.snapshotId, offset: offset + items.length }) : null
    };
  }

  async history(params: URLSearchParams) {
    parameters(params, ["slug", "since", "fact_key", "limit", "cursor"]);
    const slug = params.get("slug");
    if (!slug) return bad("slug is required.");
    const since = params.has("since") ? knowledgeDate(params.get("since")) : null;
    if (params.has("since") && !since) return bad("since must be an ISO timestamp with a timezone.");
    const pageSize = limit(params, 5), scope = scopeFor("history", params), after = cursor(params, scope);
    if (after && (!Number.isSafeInteger(after.horizon) || Number(after.horizon) < 0 || typeof after.time !== "number" || !Number.isFinite(after.time) || typeof after.id !== "string")) return bad("Invalid history position.");
    const project = await this.registry.getEntity(slug);
    if (!project) return missing();
    const horizon = after?.horizon ?? (await this.db.prepare("SELECT COALESCE(MAX(rowid),0) AS n FROM change_events WHERE entity_id=?1").bind(project.id).first<{ n: number }>())!.n;
    const bindings: unknown[] = [project.id, horizon];
    const where = ["c.entity_id = ?1", "c.rowid <= ?2"];
    const bind = (value: unknown) => { bindings.push(value); return `?${bindings.length}`; };
    if (since) where.push(`julianday(c.detected_at) >= julianday(${bind(since)})`);
    if (params.has("fact_key")) where.push(`c.fact_key = ${bind(params.get("fact_key"))}`);
    if (after) where.push(`(julianday(c.detected_at), c.id) < (${bind(after.time)}, ${bind(after.id)})`);
    type Row = { id: string; observation_id: string | null; fact_key: string; change_type: string; previous_value_json: string | null; next_value_json: string | null; detected_at: string; position_time: number; source_id: string; source_name: string; source_url: string | null; trust_tier: KnowledgeEvidence["sourceTrust"]; observed_at: string | null; correction_reason: string | null; publication_id: string | null; previous_observation_id: string | null; previous_source_id: string | null; previous_source_name: string | null; previous_trust_tier: KnowledgeEvidence["sourceTrust"]; previous_source_url: string | null; previous_observed_at: string | null };
    const rows = (await this.db.prepare(`SELECT c.*, julianday(c.detected_at) AS position_time, s.name AS source_name, s.trust_tier, o.observed_at,
      r.reason AS correction_reason, r.publication_id, r.previous_observation_id,
      old.source_id AS previous_source_id, ps.name AS previous_source_name, ps.trust_tier AS previous_trust_tier,
      old.source_url AS previous_source_url, old.observed_at AS previous_observed_at
      FROM change_events c JOIN sources s ON s.id=c.source_id LEFT JOIN observations o ON o.id=c.observation_id
      LEFT JOIN change_event_corrections r ON r.event_id=c.id
      LEFT JOIN observations old ON old.id=r.previous_observation_id LEFT JOIN sources ps ON ps.id=old.source_id
      WHERE ${where.join(" AND ")} ORDER BY julianday(c.detected_at) DESC, c.id DESC LIMIT ${bind(pageSize + 1)}`).bind(...bindings).all<Row>()).results!;
    const first = await this.db.prepare(`SELECT created_at FROM observations WHERE entity_id=?1 ${params.has("fact_key") ? "AND fact_key=?2" : ""} ORDER BY julianday(created_at),id LIMIT 1`).bind(...(params.has("fact_key") ? [project.id, params.get("fact_key")] : [project.id])).first<{ created_at: string }>();
    const evidence = new CompactEvidence();
    const value = (raw: string | null) => {
      const size = raw ? new TextEncoder().encode(raw).byteLength : 4;
      return { value: size > 4096 ? null : JSON.parse(raw ?? "null"), bytes: size, truncated: size > 4096 };
    };
    const items = rows.slice(0, pageSize).map((row) => ({
      id: row.id, observationId: row.observation_id, subjectId: knowledgeId("project", project.id), factKey: row.fact_key, kind: row.correction_reason ? "corrected" : row.change_type,
      previous: value(row.previous_value_json), next: value(row.next_value_json), recordedAt: knowledgeDate(row.detected_at), effectiveAt: null,
      evidence: evidence.refs([{ sourceId: row.source_id, sourceName: row.source_name, sourceTrust: row.trust_tier, url: row.source_url, observedAt: knowledgeDate(row.observed_at), publishedAt: null }]),
      ...(row.correction_reason ? { correction: { reason: row.correction_reason, publicationId: row.publication_id, previousObservationId: row.previous_observation_id,
        previousEvidence: evidence.refs([{ sourceId: row.previous_source_id!, sourceName: row.previous_source_name!, sourceTrust: row.previous_trust_tier, url: row.previous_source_url, observedAt: knowledgeDate(row.previous_observed_at), publishedAt: null }])
      } } : {})
    }));
    const last = rows[items.length - 1];
    return {
      schemaVersion: knowledgeSchemaVersion, projectId: knowledgeId("project", project.id), coverage: "partial", consistency: "append-window",
      pointInTime: "unavailable", timeBasis: "registry-detected-at", firstRecordedAt: knowledgeDate(first?.created_at), since, items, evidence: evidence.records,
      nextCursor: rows.length > pageSize ? encodeCursor({ scope, horizon, time: last.position_time, id: last.id }) : null
    };
  }
}

// Testable HTTP boundary shared by the three Astro routes. No writes, remote
// fetches, connector refreshes or executable tools exist on this surface.
export async function knowledgeResponse(request: Request, endpoint: "search" | "project" | "history", database: () => RegistryDatabase, clock?: () => string) {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (request.method !== "GET") return Response.json({ error: { code: "method_not_allowed", message: "GET only." } }, { status: 405, headers: { ...headers, Allow: "GET" } });
  try {
    const result = await new KnowledgeQueryService(database(), clock)[endpoint](new URL(request.url).searchParams);
    if (bytes(result) > 128 * 1024) throw new KnowledgeQueryError(413, "response_too_large", "Request a smaller section or limit.");
    return Response.json(result, { headers });
  } catch (error) {
    const known = error instanceof KnowledgeQueryError;
    return Response.json({ error: { code: known ? error.code : "knowledge_unavailable", message: known ? error.message : "Knowledge storage or projection unavailable; this is not an empty result." } }, { status: known ? error.status : 503, headers });
  }
}

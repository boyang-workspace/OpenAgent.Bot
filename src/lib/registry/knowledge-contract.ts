import { stableStringify } from "./observations";
import type { EntityDomain, EntityKind, SourceTrustTier } from "./types";

// This is the next machine contract, not a replacement for intake schema v1 or
// the public 2026-08-28 dossier. IDs describe identity; versions describe scope.
export const knowledgeSchemaVersion = "0.1.0" as const;
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type KnowledgeEvidence = {
  sourceId: string | null;
  sourceName: string;
  sourceTrust: SourceTrustTier | "unknown";
  url: string | null;
  observedAt: string | null;
  publishedAt: string | null;
};
export type KnowledgeClaim<T extends JsonValue = JsonValue> = {
  status: "known" | "unknown" | "conflicted" | "withdrawn";
  value: T | null;
  alternatives: Array<{ value: T; evidence: KnowledgeEvidence[] }>;
  evidence: KnowledgeEvidence[];
  verification: "documented" | "tested" | "unknown";
  test: { reportUrl: string; testedAt: string; versionId: string } | null;
  scope: { versionId: string | null; validFrom: string | null; validUntil: string | null };
  checkedAt: string | null;
  expiresAt: string | null;
};
export const knowledgeResourceKinds = ["documentation", "package", "repository", "policy-file", "simulation-assets", "dataset", "simulator", "product", "example"] as const;
export type KnowledgeVersion = {
  id: string;
  subjectId: string;
  label: string | null;
  sourceRevision: string | null;
  digests: Array<{ algorithm: "git-blob-sha1" | "sha256"; value: string }>;
  evidence: KnowledgeEvidence[];
};
export type KnowledgeResource = {
  id: string;
  localId: string;
  projectId: string;
  name: string;
  kind: typeof knowledgeResourceKinds[number];
  url: string;
  description: string | null;
  // Literal resource-specific terms; never an inferred SPDX/commercial-use grant.
  license: KnowledgeClaim<string>;
  versionId: string | null;
  evidence: KnowledgeEvidence[];
};
export type KnowledgeInterface = {
  id: string;
  localId: string;
  projectId: string;
  name: string;
  type: "cli" | "api" | "mcp" | "sdk";
  description: string | null;
  transport: KnowledgeClaim<string>;
  authentication: KnowledgeClaim<"none" | "required" | "optional">;
  access: KnowledgeClaim<"read-only" | "local-write-opt-in" | "read-write">;
  runtimes: KnowledgeClaim<string[]>;
  // Legacy URLs may be documentation, not a callable endpoint. Text is inert.
  referenceUrl: string | null;
  commandText: string | null;
  execution: "not-provided";
  versionId: string | null;
};
export type KnowledgeHistoryEvent = {
  id: string;
  subjectId: string;
  factKey: string;
  kind: "created" | "updated" | "removed" | "corrected" | "withdrawn" | "conflicted";
  previousValue: JsonValue;
  nextValue: JsonValue;
  recordedAt: string;
  effectiveAt: string | null;
  evidence: KnowledgeEvidence[];
};
export type KnowledgeDocument = {
  schemaVersion: typeof knowledgeSchemaVersion;
  snapshotId: string;
  project: {
    id: string;
    registryId: string;
    slug: string;
    name: string;
    artifactType: EntityKind;
    domains: EntityDomain[];
    summary: string;
    recordUrl: string;
  };
  facts: Array<{ key: string; claim: KnowledgeClaim }>;
  openness: Array<{ facet: string; status: KnowledgeClaim<string>; terms: KnowledgeClaim<string> }>;
  resources: KnowledgeResource[];
  interfaces: KnowledgeInterface[];
  versions: KnowledgeVersion[];
  sourceHealth: Array<{
    sourceId: string | null;
    locator: string;
    lastSuccessfulSyncAt: string | null;
    nextSyncAt: string | null;
    lastError: string | null;
  }>;
  relationships: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
    reviewStatus: "candidate" | "verified" | "rejected";
    compatibility: "unknown";
    evidence: KnowledgeEvidence[];
  }>;
  history: {
    coverage: "partial";
    pointInTime: "unavailable";
    observationCount: number;
    firstObservedAt: string | null;
    lastObservedAt: string | null;
    recentChanges: KnowledgeHistoryEvent[];
  };
  issues: Array<{ code: string; field: string; detail: string }>;
};

export class KnowledgeContractError extends Error {}

export function knowledgeId(kind: "project" | "resource" | "interface" | "relationship", ...parts: string[]): string {
  if (!parts.length || parts.some((part) => !part.trim())) throw new KnowledgeContractError("An explicit non-empty identity is required");
  return `urn:openagent:${kind}:${parts.map(encodeURIComponent).join(":")}`;
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype && Object.values(value).every(isJsonValue);
}

export function evidenceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}

// Accept legacy SQLite UTC timestamps, but never reinterpret local wall time.
export function knowledgeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? value.replace(" ", "T") + "Z" : value;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(normalized) || !Number.isFinite(Date.parse(normalized))) return null;
  // Date.parse rolls impossible dates such as February 30 into March.
  const [year, month, day] = normalized.slice(0, 10).split("-").map(Number);
  const calendar = new Date(`${normalized.slice(0, 10)}T00:00:00Z`);
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() + 1 !== month || calendar.getUTCDate() !== day) return null;
  return new Date(normalized).toISOString();
}

function attributed(evidence: KnowledgeEvidence[]): boolean {
  return evidence.some((item) => evidenceUrl(item.url) && knowledgeDate(item.observedAt) !== null);
}

function timestamp(value: string): number {
  const normalized = knowledgeDate(value);
  if (!normalized) throw new KnowledgeContractError("Invalid claim date");
  return Date.parse(normalized);
}

export function assertKnowledgeClaim(claim: KnowledgeClaim): void {
  if (!["known", "unknown", "conflicted", "withdrawn"].includes(claim.status) || !["documented", "tested", "unknown"].includes(claim.verification)) throw new KnowledgeContractError("Unsupported claim state");
  if (!isJsonValue(claim.value)) throw new KnowledgeContractError("Claim values must be JSON");
  if (claim.status === "known" && (claim.value === null || claim.value === "unknown" || !attributed(claim.evidence))) throw new KnowledgeContractError("Known claims require a value and dated evidence");
  if (claim.status !== "known" && claim.value !== null) throw new KnowledgeContractError("Unresolved or withdrawn claims cannot expose a selected value");
  if (claim.status === "conflicted" && (claim.alternatives.length < 2 || claim.alternatives.some((item) => !isJsonValue(item.value) || !attributed(item.evidence)) || new Set(claim.alternatives.map((item) => stableStringify(item.value))).size < 2)) throw new KnowledgeContractError("Conflicts require distinct attributed alternatives");
  if (claim.status !== "conflicted" && claim.alternatives.length) throw new KnowledgeContractError("Only conflicts have alternatives");
  if (claim.verification !== "unknown" && !attributed(claim.evidence)) throw new KnowledgeContractError("Verification requires dated evidence");
  if (claim.verification === "tested" && (!claim.test || !evidenceUrl(claim.test.reportUrl) || !knowledgeDate(claim.test.testedAt) || !claim.scope.versionId || claim.test.versionId !== claim.scope.versionId)) throw new KnowledgeContractError("Tested claims require a report for the exact version");
  if (claim.verification !== "tested" && claim.test !== null) throw new KnowledgeContractError("Test reports require tested verification");
  for (const date of [claim.checkedAt, claim.expiresAt, claim.scope.validFrom, claim.scope.validUntil]) {
    if (date !== null && !knowledgeDate(date)) throw new KnowledgeContractError("Invalid claim date");
  }
  if (claim.expiresAt && (!claim.checkedAt || timestamp(claim.expiresAt) <= timestamp(claim.checkedAt))) throw new KnowledgeContractError("Expiry requires an earlier check of this claim");
  if (claim.scope.validFrom && claim.scope.validUntil && timestamp(claim.scope.validUntil) <= timestamp(claim.scope.validFrom)) throw new KnowledgeContractError("Invalid effective interval");
}

export function knowledgeClaim<T extends JsonValue>(value: T | null, evidence: KnowledgeEvidence[] = [], options: Partial<Omit<KnowledgeClaim<T>, "value" | "evidence">> = {}): KnowledgeClaim<T> {
  const known = value !== null && value !== "unknown" && attributed(evidence);
  const claim: KnowledgeClaim<T> = {
    status: known ? "known" : "unknown", value: known ? value : null,
    evidence, verification: known ? "documented" : "unknown", alternatives: [], test: null,
    scope: { versionId: null, validFrom: null, validUntil: null }, checkedAt: null, expiresAt: null,
    ...options
  };
  assertKnowledgeClaim(claim);
  return claim;
}

export function claimFreshness(claim: KnowledgeClaim, asOf: string): "current" | "stale" | "unknown" {
  assertKnowledgeClaim(claim);
  const at = knowledgeDate(asOf);
  if (!at) throw new KnowledgeContractError("An explicit evaluation time is required");
  if (!claim.checkedAt || !claim.expiresAt || timestamp(claim.checkedAt) > timestamp(at)) return "unknown";
  return timestamp(at) >= timestamp(claim.expiresAt) ? "stale" : "current";
}

// Exact equality only. No semantic inference, permission grant or runtime probe.
export function matchKnowledgeClaim(claim: KnowledgeClaim, expected: JsonValue, options: { asOf: string; requireFresh?: boolean; versionId?: string; verification?: "documented" | "tested" }): "matched" | "not-matched" | "unknown" {
  if (Object.keys(options).some((key) => !["asOf", "requireFresh", "versionId", "verification"].includes(key)) ||
      (options.verification !== undefined && !["documented", "tested"].includes(options.verification)) ||
      (options.requireFresh !== undefined && typeof options.requireFresh !== "boolean") ||
      (options.versionId !== undefined && (typeof options.versionId !== "string" || !options.versionId.trim())) || !isJsonValue(expected)) {
    throw new KnowledgeContractError("Unsupported match constraint");
  }
  const freshness = claimFreshness(claim, options.asOf);
  const at = timestamp(options.asOf);
  if (claim.status !== "known" || claim.verification === "unknown" || freshness === "stale") return "unknown";
  if (options.requireFresh && freshness !== "current") return "unknown";
  if (options.versionId && claim.scope.versionId !== options.versionId) return "unknown";
  if (options.verification === "tested" && claim.verification !== "tested") return "unknown";
  if (!claim.evidence.some((item) => evidenceUrl(item.url) && knowledgeDate(item.observedAt) && timestamp(item.observedAt!) <= at)) return "unknown";
  if (claim.verification === "tested" && timestamp(claim.test!.testedAt) > at) return "unknown";
  if ((claim.scope.validFrom && at < timestamp(claim.scope.validFrom)) || (claim.scope.validUntil && at >= timestamp(claim.scope.validUntil))) return "unknown";
  return stableStringify(claim.value) === stableStringify(expected) ? "matched" : "not-matched";
}

import { factHash } from "./observations";
import type { RegistryDossier, RegistryFact } from "./types";
import {
  evidenceUrl, isJsonValue, knowledgeClaim, knowledgeDate, knowledgeId,
  knowledgeResourceKinds, knowledgeSchemaVersion, KnowledgeContractError,
  type JsonValue, type KnowledgeDocument, type KnowledgeEvidence, type KnowledgeHistoryEvent, type KnowledgeInterface, type KnowledgeVersion
} from "./knowledge-contract";

export type LegacyResourceIdentity = { factKey: string; name: string; id: string };
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): string | null => typeof value === "string" && value.trim() ? value : null;
const localId = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
const byId = <T extends { id: string }>(a: T, b: T) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

function factEvidence(fact: RegistryFact): KnowledgeEvidence[] {
  return [{
    sourceId: fact.sourceId ?? null, sourceName: fact.sourceName, sourceTrust: fact.sourceTrustTier,
    url: evidenceUrl(fact.sourceUrl) ? fact.sourceUrl : null,
    observedAt: knowledgeDate(fact.observedAt), publishedAt: null
  }];
}

// A pure, read-only projection. It neither fetches URLs nor executes commands,
// updates evidence dates, backfills history, or alters the legacy dossier.
export async function buildKnowledgeDocument(dossier: RegistryDossier, options: { legacyResourceIds?: readonly LegacyResourceIdentity[] } = {}): Promise<KnowledgeDocument> {
  const { entity } = dossier;
  const projectId = knowledgeId("project", entity.id);
  const issues: KnowledgeDocument["issues"] = [];
  const issue = (code: string, field: string, detail: string) => { issues.push({ code, field, detail }); };
  const identities = options.legacyResourceIds ?? [];
  const identityKeys = new Set<string>();
  for (const item of identities) {
    const key = JSON.stringify([item.factKey, item.name]);
    if (!localId(item.id) || !item.factKey.startsWith("resources.") || !item.name.trim() || identityKeys.has(key)) throw new KnowledgeContractError("Invalid or ambiguous legacy resource identity map");
    identityKeys.add(key);
  }
  const usedIdentities = new Set<LegacyResourceIdentity>();
  const resources: KnowledgeDocument["resources"] = [];
  const interfaces: KnowledgeDocument["interfaces"] = [];
  const versions: KnowledgeDocument["versions"] = [];
  const facts: KnowledgeDocument["facts"] = [];
  const seenFactKeys = new Set<string>();

  for (const fact of [...dossier.facts].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)) {
    if (seenFactKeys.has(fact.key)) throw new KnowledgeContractError(`Duplicate selected fact: ${fact.key}`);
    seenFactKeys.add(fact.key);
    const evidence = factEvidence(fact);
    const value = isJsonValue(fact.value) ? structuredClone(fact.value) : null;
    if (!isJsonValue(fact.value)) issue("invalid-fact-value", fact.key, "The legacy value is not JSON; no assertion was made.");
    const claim = knowledgeClaim(value, evidence);
    facts.push({ key: fact.key, claim });
    if (claim.status === "unknown" && value !== null && value !== "unknown") issue("missing-evidence", fact.key, "A dated source URL is required for a known claim.");

    if (fact.key.startsWith("resources.")) {
      for (const raw of Array.isArray(fact.value) ? fact.value : [fact.value]) {
        if (!object(raw) || !text(raw.name) || !evidenceUrl(raw.url) || !knowledgeResourceKinds.includes(raw.kind as typeof knowledgeResourceKinds[number])) {
          issue("invalid-resource", fact.key, "Resource requires a name, an HTTP(S) reference and a supported kind.");
          continue;
        }
        const identity = identities.find((item) => item.factKey === fact.key && item.name === raw.name);
        const key = raw.id ?? identity?.id;
        if (!localId(key)) {
          issue("missing-resource-id", fact.key, `${raw.name}: assign an explicit ID before machine publication.`);
          continue;
        }
        if (identity && raw.id !== undefined && identity.id !== raw.id) throw new KnowledgeContractError(`Resource identity conflicts with its legacy map: ${fact.key}`);
        if (identity) usedIdentities.add(identity);
        const id = knowledgeId("resource", entity.id, key);
        const digests: KnowledgeVersion["digests"] = [];
        if (raw.gitBlobSha !== undefined) {
          if (typeof raw.gitBlobSha !== "string" || !/^[a-f0-9]{40}$/.test(raw.gitBlobSha)) throw new KnowledgeContractError(`Invalid Git blob digest: ${fact.key}`);
          digests.push({ algorithm: "git-blob-sha1", value: raw.gitBlobSha });
        }
        const descriptor = { subjectId: id, label: text(raw.version), sourceRevision: text(raw.revision), digests };
        let versionId: string | null = null;
        if (descriptor.label || descriptor.sourceRevision || digests.length) {
          versionId = `${id}:version:${await factHash(descriptor)}`;
          versions.push({ id: versionId, ...descriptor, evidence });
        }
        resources.push({
          id, localId: key, projectId, name: String(raw.name), kind: raw.kind as typeof knowledgeResourceKinds[number],
          url: raw.url, description: text(raw.description), versionId, evidence,
          license: knowledgeClaim(text(raw.license), evidence, { scope: { versionId, validFrom: null, validUntil: null } })
        });
      }
    }

    if (fact.key.startsWith("interfaces.")) {
      const raw = fact.value;
      if (!object(raw) || !localId(raw.id) || !text(raw.name) || !["cli", "api", "mcp", "sdk"].includes(String(raw.type))) {
        issue("invalid-interface", fact.key, "Interface requires an explicit ID, name and supported type.");
        continue;
      }
      const verification = raw.verification === "documented" ? "documented" : "unknown";
      if (raw.verification === "tested") issue("unscoped-test", fact.key, "Legacy tested status has no version-scoped test report; verification remains unknown.");
      const supported = <T extends string>(value: unknown, choices: readonly T[]): T | null => {
        if (choices.includes(value as T)) return value as T;
        if (value !== "unknown" && value !== undefined) issue("unsupported-interface-value", fact.key, `Unsupported interface value: ${String(value)}`);
        return null;
      };
      const fieldClaim = <T extends JsonValue>(value: T | null) => knowledgeClaim(value, evidence, { verification: claim.status === "known" && value !== null ? verification : "unknown" });
      const runtimeNames = Array.isArray(raw.runtimes) && raw.runtimes.length > 0 && raw.runtimes.every((item) => text(item)) ? raw.runtimes as string[] : null;
      interfaces.push({
        id: knowledgeId("interface", entity.id, raw.id), localId: raw.id, projectId,
        name: String(raw.name), type: raw.type as KnowledgeInterface["type"], description: text(raw.description),
        transport: fieldClaim(text(raw.transport)),
        authentication: fieldClaim(supported(raw.authentication, ["none", "required", "optional"] as const)),
        access: fieldClaim(supported(raw.access, ["read-only", "local-write-opt-in", "read-write"] as const)),
        runtimes: fieldClaim(runtimeNames),
        referenceUrl: evidenceUrl(raw.url) ? raw.url : null, commandText: text(raw.command),
        execution: "not-provided", versionId: null
      });
    }
  }

  for (const identity of identities) {
    if (!usedIdentities.has(identity)) throw new KnowledgeContractError(`Unused legacy resource identity: ${identity.factKey} / ${identity.name}`);
  }
  for (const items of [resources, interfaces, versions]) {
    items.sort(byId);
    if (new Set(items.map((item) => item.id)).size !== items.length) throw new KnowledgeContractError("Duplicate machine identity; resources must not be silently merged");
  }

  const openness = ["code", "weights", "data", "hardware", "documentation", "governance"].map((name) => {
    const facet = dossier.opennessFacets.find((item) => item.facet === name);
    const evidence: KnowledgeEvidence[] = facet ? [{ sourceId: null, sourceName: facet.sourceName, sourceTrust: "unknown", url: evidenceUrl(facet.sourceUrl) ? facet.sourceUrl : null, observedAt: knowledgeDate(facet.observedAt), publishedAt: null }] : [];
    return { facet: name, status: knowledgeClaim(facet?.status ?? null, evidence), terms: knowledgeClaim(facet?.licenseOrTerms ?? null, evidence) };
  });
  const relationships: KnowledgeDocument["relationships"] = dossier.relationships.map((relationship) => {
    const relatedId = knowledgeId("project", relationship.entity.id);
    const evidence: KnowledgeEvidence[] = relationship.evidence.map((item) => ({ sourceId: null, sourceName: item.sourceName, sourceTrust: "unknown", url: evidenceUrl(item.sourceUrl) ? item.sourceUrl : null, observedAt: knowledgeDate(item.observedAt), publishedAt: null }));
    const hasEvidence = evidence.some((item) => item.url && item.observedAt);
    if (relationship.status === "verified" && !hasEvidence) issue("missing-relationship-evidence", relationship.id, "Verified relationship has no dated evidence; projected as a candidate.");
    return {
      id: knowledgeId("relationship", relationship.id), type: relationship.type,
      sourceId: relationship.direction === "outbound" ? projectId : relatedId,
      targetId: relationship.direction === "outbound" ? relatedId : projectId,
      reviewStatus: relationship.status === "verified" && !hasEvidence ? "candidate" : relationship.status,
      compatibility: "unknown", evidence
    };
  });
  relationships.sort(byId);
  const recentChanges = dossier.changes.map<KnowledgeHistoryEvent>((change) => {
    const recordedAt = knowledgeDate(change.detectedAt);
    if (!recordedAt || !isJsonValue(change.previousValue ?? null) || !isJsonValue(change.nextValue ?? null)) throw new KnowledgeContractError(`Invalid history event: ${change.id}`);
    return {
      id: change.id, subjectId: projectId, factKey: change.factKey, kind: change.changeType,
      previousValue: structuredClone(change.previousValue ?? null) as JsonValue,
      nextValue: structuredClone(change.nextValue ?? null) as JsonValue,
      recordedAt, effectiveAt: null,
      evidence: [{ sourceId: null, sourceName: change.sourceName, sourceTrust: "unknown", url: evidenceUrl(change.sourceUrl) ? change.sourceUrl : null, observedAt: null, publishedAt: null }]
    };
  }).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt) || byId(a, b));
  issues.sort((a, b) => `${a.field}:${a.code}:${a.detail}`.localeCompare(`${b.field}:${b.code}:${b.detail}`));
  const document: Omit<KnowledgeDocument, "snapshotId"> = {
    schemaVersion: knowledgeSchemaVersion,
    project: {
      id: projectId, registryId: entity.id, slug: entity.slug, name: entity.name,
      artifactType: entity.kind, domains: [...entity.domains].sort(), summary: entity.summary,
      recordUrl: `https://www.openagent.bot/project/${entity.slug}`
    },
    facts, openness, resources, interfaces, versions, relationships,
    sourceHealth: dossier.subscriptions.map((source) => ({
      sourceId: source.sourceId ?? null, locator: source.locator,
      lastSuccessfulSyncAt: knowledgeDate(source.lastSyncedAt), nextSyncAt: knowledgeDate(source.nextSyncAt), lastError: source.lastError ?? null
    })).sort((a, b) => `${a.sourceId}:${a.locator}`.localeCompare(`${b.sourceId}:${b.locator}`)),
    history: {
      coverage: "partial", pointInTime: "unavailable", observationCount: dossier.record.observationCount,
      firstObservedAt: knowledgeDate(dossier.record.firstObservationAt), lastObservedAt: knowledgeDate(dossier.record.lastObservationAt), recentChanges
    },
    issues
  };
  // This fingerprints the projection only. It is not a database snapshot, an
  // upstream software version, or a claim that all upstream history is known.
  return { ...document, snapshotId: `sha256:${await factHash(document)}` };
}

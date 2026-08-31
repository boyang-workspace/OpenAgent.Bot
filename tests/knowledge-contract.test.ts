import { describe, expect, it } from "vitest";
import { assertKnowledgeClaim, claimFreshness, knowledgeClaim, knowledgeDate, knowledgeId, matchKnowledgeClaim, type KnowledgeEvidence } from "../src/lib/registry/knowledge-contract";

const observedAt = "2026-08-28T00:00:00.000Z";
const at = { asOf: "2026-08-28T02:00:00.000Z" };
const evidence: KnowledgeEvidence[] = [{ sourceId: "official", sourceName: "Maintainer documentation", sourceTrust: "official", url: "https://example.com/docs", observedAt, publishedAt: null }];

describe("Knowledge v0.1 claim invariants", () => {
  it("requires explicit identities and prevents delimiter collisions", () => {
    expect(knowledgeId("resource", "a:b", "c")).not.toBe(knowledgeId("resource", "a", "b:c"));
    expect(knowledgeId("project", "stable_registry_id")).toBe("urn:openagent:project:stable_registry_id");
    expect(() => knowledgeId("project", "")).toThrow("identity");
  });

  it("keeps missing and un-attributed values unknown without losing false or zero", () => {
    for (const value of [null, "unknown"]) expect(knowledgeClaim(value, evidence).status).toBe("unknown");
    expect(knowledgeClaim("read-only").value).toBeNull();
    expect(knowledgeClaim(false, evidence)).toMatchObject({ status: "known", value: false });
    expect(knowledgeClaim(0, evidence)).toMatchObject({ status: "known", value: 0 });
    expect(() => knowledgeClaim(Number.NaN, evidence)).toThrow("JSON");
    expect(() => knowledgeClaim("yes", [], { status: "known" })).toThrow("dated evidence");
  });

  it("does not treat official evidence as testing or freshness", () => {
    const claim = knowledgeClaim("read-only", evidence);
    expect(claim.verification).toBe("documented");
    expect(claimFreshness(claim, at.asOf)).toBe("unknown");
    expect(matchKnowledgeClaim(claim, "read-only", at)).toBe("matched");
    expect(matchKnowledgeClaim(claim, "read-only", { ...at, requireFresh: true })).toBe("unknown");
    expect(matchKnowledgeClaim(claim, "read-only", { ...at, verification: "tested" })).toBe("unknown");
    expect(matchKnowledgeClaim(claim, "read-only", { ...at, versionId: "release-1" })).toBe("unknown");
    expect(matchKnowledgeClaim(claim, "read-write", at)).toBe("not-matched");
  });

  it("requires a version-bound test report to claim tested status", () => {
    expect(() => knowledgeClaim(true, evidence, { verification: "tested" })).toThrow("exact version");
    const scope = { versionId: "release-1", validFrom: null, validUntil: null };
    const test = { reportUrl: "https://example.com/test-report", testedAt: observedAt, versionId: "release-1" };
    const claim = knowledgeClaim(true, evidence, { verification: "tested", scope, test });
    expect(matchKnowledgeClaim(claim, true, { ...at, verification: "tested", versionId: "release-1" })).toBe("matched");
    expect(matchKnowledgeClaim(claim, true, { ...at, versionId: "release-2" })).toBe("unknown");
    expect(() => knowledgeClaim(true, evidence, { verification: "tested", scope, test: { ...test, versionId: "release-2" } })).toThrow("exact version");
    expect(matchKnowledgeClaim(knowledgeClaim(true, evidence, { verification: "tested", scope, test: { ...test, testedAt: "2026-08-29T00:00:00Z" } }), true, at)).toBe("unknown");
  });

  it("represents conflicts and withdrawals without a silently selected winner", () => {
    const conflict = knowledgeClaim<string>(null, evidence, { status: "conflicted", alternatives: [{ value: "MIT", evidence }, { value: "Apache-2.0", evidence }] });
    expect(matchKnowledgeClaim(conflict, "MIT", at)).toBe("unknown");
    expect(matchKnowledgeClaim(knowledgeClaim(null, evidence, { status: "withdrawn" }), true, at)).toBe("unknown");
    expect(() => knowledgeClaim("MIT", evidence, { status: "conflicted", alternatives: conflict.alternatives })).toThrow("selected value");
    expect(() => knowledgeClaim(null, evidence, { status: "conflicted", alternatives: [{ value: "MIT", evidence }, { value: "MIT", evidence }] })).toThrow("distinct");
    expect(() => knowledgeClaim(null, evidence, { status: "conflicted", alternatives: [{ value: "MIT", evidence }, { value: "Apache-2.0", evidence: [] }] })).toThrow("attributed");
  });

  it("requires a field-level check and expiry; expired claims cannot pass", () => {
    const claim = knowledgeClaim(true, evidence, { checkedAt: observedAt, expiresAt: "2026-08-29T00:00:00.000Z" });
    expect(claimFreshness(claim, at.asOf)).toBe("current");
    expect(matchKnowledgeClaim(claim, true, { ...at, requireFresh: true })).toBe("matched");
    expect(claimFreshness(claim, "2026-08-29T00:00:00Z")).toBe("stale");
    expect(matchKnowledgeClaim(claim, true, { asOf: "2026-08-29T00:00:00Z" })).toBe("unknown");
    expect(() => knowledgeClaim(true, evidence, { expiresAt: "2026-08-29T00:00:00Z" })).toThrow("earlier check");
    expect(() => knowledgeClaim(true, evidence, { checkedAt: observedAt, expiresAt: observedAt })).toThrow("earlier check");
  });

  it("does not manufacture historical validity from current evidence", () => {
    const claim = knowledgeClaim(true, evidence);
    expect(matchKnowledgeClaim(claim, true, { asOf: "2026-01-01T00:00:00Z" })).toBe("unknown");
    claim.scope.validUntil = at.asOf;
    expect(matchKnowledgeClaim(claim, true, at)).toBe("unknown");
    claim.scope.validFrom = "2026-09-01T00:00:00Z";
    expect(() => assertKnowledgeClaim(claim)).toThrow("interval");
  });

  it("normalizes SQLite UTC dates and rejects ambiguous or invalid dates", () => {
    expect(knowledgeDate("2026-08-28 01:00:00")).toBe("2026-08-28T01:00:00.000Z");
    expect(knowledgeDate("2026-08-28T09:00:00+08:00")).toBe("2026-08-28T01:00:00.000Z");
    expect(knowledgeDate("2026-08-28T01:00:00")).toBeNull();
    expect(knowledgeDate("yesterday")).toBeNull();
    expect(knowledgeDate("2026-02-30T00:00:00Z")).toBeNull();
    expect(() => matchKnowledgeClaim(knowledgeClaim(true, evidence), true, { asOf: "yesterday" })).toThrow("evaluation time");
    const claim = knowledgeClaim(true, [{ ...evidence[0], observedAt: "2026-08-28 00:00:00" }], { checkedAt: "2026-08-28 00:00:00", expiresAt: "2026-08-28 03:00:00" });
    expect(matchKnowledgeClaim(claim, true, { asOf: "2026-08-28 02:00:00", requireFresh: true })).toBe("matched");
    expect(claimFreshness(claim, "2026-08-28T02:00:00Z")).toBe("current");
  });

  it("rejects unsupported constraint values instead of silently relaxing them", () => {
    const claim = knowledgeClaim(true, evidence);
    for (const invalid of [{ verification: "safe" }, { versionId: "" }, { requireFresh: "yes" }, { imaginaryFilter: true }]) {
      expect(() => matchKnowledgeClaim(claim, true, { ...at, ...invalid } as Parameters<typeof matchKnowledgeClaim>[2])).toThrow("Unsupported match constraint");
    }
  });
});

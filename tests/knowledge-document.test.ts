import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildKnowledgeDocument, type LegacyResourceIdentity } from "../src/lib/registry/knowledge-document";
import { assertKnowledgeClaim, knowledgeId, matchKnowledgeClaim, type KnowledgeDocument } from "../src/lib/registry/knowledge-contract";
import { buildEntityDocument, buildEntityMarkdown } from "../src/lib/registry/documents";
import { RegistryRepository } from "../src/lib/registry/repository";
import { RegistryIntakeService } from "../src/lib/registry/intake";
import { RegistrySyncService } from "../src/lib/registry/sync";
import type { RegistryDossier } from "../src/lib/registry/types";
import { registryTestDatabase } from "./helpers/registry-database";

const { db, adapter } = registryTestDatabase();
const registry = new RegistryRepository(adapter);
const intake = new RegistryIntakeService(adapter);
const identityMaps = JSON.parse(readFileSync("content/knowledge/microduck-resource-ids.json", "utf8")) as Record<string, LegacyResourceIdentity[]>;
const dossiers = new Map<string, RegistryDossier>();
const documents = new Map<string, KnowledgeDocument>();
const at = { asOf: "2026-08-28T02:00:00.000Z" };
const sampleSlugs = ["vgpu", "opencode", "microduck", "microduck-runtime", "microduck-rl", "microduck-policies"];
const get = (slug: string) => documents.get(slug)!;
const copy = (slug: string) => structuredClone(dossiers.get(slug)!);
const options = (dossier: RegistryDossier) => ({ legacyResourceIds: identityMaps[dossier.entity.id] });

beforeAll(async () => {
  await new RegistrySyncService(adapter).registerSources();
  for (const slug of ["vgpu", "opencode"]) {
    const manifest = JSON.parse(readFileSync(`content/intake/${slug}.json`, "utf8"));
    const preview = await intake.preview(manifest);
    await intake.publish(manifest, preview.baseHash, preview.payloadHash, "local knowledge contract test");
  }
  for (const slug of sampleSlugs) {
    const dossier = (await registry.getEntityDossier(slug))!;
    dossiers.set(slug, dossier);
    documents.set(slug, await buildKnowledgeDocument(dossier, options(dossier)));
  }
});
afterAll(() => db.close());

describe("three representative Knowledge v0.1 samples", () => {
  it("validates every claim and scoped resource version from real intake/migration data", () => {
    for (const doc of documents.values()) {
      expect(doc.schemaVersion).toBe("0.1.0");
      expect(doc.snapshotId).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(doc.issues).toEqual([]);
      const claims = [...doc.facts.map((item) => item.claim), ...doc.resources.map((item) => item.license), ...doc.openness.flatMap((item) => [item.status, item.terms]), ...doc.interfaces.flatMap((item) => [item.authentication, item.access, item.transport, item.runtimes])];
      for (const claim of claims) expect(() => assertKnowledgeClaim(claim)).not.toThrow();
      for (const version of doc.versions) {
        expect(doc.resources.some((resource) => resource.id === version.subjectId && resource.versionId === version.id)).toBe(true);
        expect(version.evidence[0].url).toMatch(/^https:/);
      }
    }
  });

  it("separates vgpu's read-only hosted MCP from its write-capable local interfaces", () => {
    const doc = get("vgpu");
    expect(doc.project.artifactType).toBe("tool");
    expect(doc.interfaces).toHaveLength(5);
    const hosted = doc.interfaces.find((item) => item.localId === "mcp-http")!;
    const local = doc.interfaces.find((item) => item.localId === "mcp-local")!;
    expect(hosted.id).not.toBe(local.id);
    expect(matchKnowledgeClaim(hosted.access, "read-only", at)).toBe("matched");
    expect(matchKnowledgeClaim(hosted.authentication, "none", at)).toBe("matched");
    expect(matchKnowledgeClaim(local.access, "read-only", at)).toBe("not-matched");
    expect(local.access.value).toBe("local-write-opt-in");
    expect(matchKnowledgeClaim(hosted.access, "read-only", { ...at, verification: "tested" })).toBe("unknown");
    expect(doc.interfaces.find((item) => item.localId === "typescript")?.access.status).toBe("unknown");
    expect(doc.interfaces.every((item) => item.execution === "not-provided")).toBe(true);
  });

  it("preserves OpenCode's existing project identity, configurable permissions and unknown model minimum", () => {
    const doc = get("opencode");
    expect(doc.project.registryId).toBe("res_opencode");
    expect(doc.project.artifactType).toBe("agent");
    expect(doc.interfaces.map((item) => item.type).sort()).toEqual(["api", "cli"]);
    const cli = doc.interfaces.find((item) => item.type === "cli")!;
    expect(cli.commandText).toBe("opencode run --format json");
    expect(matchKnowledgeClaim(cli.authentication, "none", at)).toBe("unknown");
    expect(matchKnowledgeClaim(cli.access, "read-only", at)).toBe("not-matched");
    expect(doc.interfaces.find((item) => item.type === "api")?.authentication.value).toBe("optional");
    expect(doc.facts.find((item) => item.key === "software.model_configuration")?.claim.value).toMatchObject({ localModelsDocumented: true, minimumModelVersion: null });
    expect(doc.facts.find((item) => item.key === "policy.default_permissions")?.claim.value).toMatchObject({ mostTools: "allow" });
    expect(doc.versions.every((version) => version.sourceRevision === "15537a41d2a0514f7040e1c4128b7846cdc19ce0")).toBe(true);
    expect(doc.openness.find((item) => item.facet === "weights")?.status.status).toBe("unknown");
  });

  it("keeps Microduck hardware, software, policy files and simulation terms separate", () => {
    const robot = get("microduck"), policies = get("microduck-policies"), rl = get("microduck-rl");
    expect(robot.project.artifactType).toBe("robot");
    expect(robot.openness.find((item) => item.facet === "hardware")?.status.value).toBe("closed");
    expect(robot.openness.find((item) => item.facet === "code")?.status.value).toBe("open");
    expect(policies.project.artifactType).toBe("model");
    expect(policies.resources).toHaveLength(9);
    expect(policies.resources.every((item) => item.kind === "policy-file")).toBe(true);
    expect(policies.versions.every((item) => item.digests[0].algorithm === "git-blob-sha1")).toBe(true);
    expect(policies.resources[0].license.value).toContain("no separate weight license");
    expect(policies.openness.find((item) => item.facet === "weights")?.status.value).toBe("partial");
    expect(policies.openness.find((item) => item.facet === "data")?.status.status).toBe("unknown");
    expect(rl.resources[0].kind).toBe("simulation-assets");
    expect(rl.resources[0].license.value).toContain("version unspecified");
    expect(robot.relationships.length).toBeGreaterThan(0);
    expect(robot.relationships.every((item) => item.compatibility === "unknown")).toBe(true);
  });
});

describe("knowledge projection safety compatibility", () => {
  it("leaves the legacy JSON/Markdown and database unchanged", async () => {
    const rowCounts = db.prepare("SELECT (SELECT count(*) FROM entities) AS entities, (SELECT count(*) FROM observations) AS observations, (SELECT count(*) FROM intake_publications) AS publications").get();
    for (const slug of sampleSlugs) {
      const dossier = copy(slug), before = structuredClone(dossier);
      const json = buildEntityDocument(dossier), markdown = buildEntityMarkdown(dossier);
      await buildKnowledgeDocument(dossier, options(dossier));
      expect(dossier).toEqual(before);
      expect(buildEntityDocument(dossier)).toEqual(json);
      expect(buildEntityMarkdown(dossier)).toBe(markdown);
      expect(json.schemaVersion).toBe("2026-08-28");
    }
    expect(db.prepare("SELECT (SELECT count(*) FROM entities) AS entities, (SELECT count(*) FROM observations) AS observations, (SELECT count(*) FROM intake_publications) AS publications").get()).toEqual(rowCounts);
    expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
  });

  it("has deterministic fingerprints independent of fact query ordering", async () => {
    const dossier = copy("vgpu");
    expect(await buildKnowledgeDocument(dossier)).toEqual(get("vgpu"));
    dossier.facts.reverse();
    expect(await buildKnowledgeDocument(dossier)).toEqual(get("vgpu"));
    const fact = dossier.facts.find((item) => item.key === "interfaces.mcp-http")!;
    fact.observedAt = "2026-08-28T01:00:00.000Z";
    expect((await buildKnowledgeDocument(dossier)).snapshotId).not.toBe(get("vgpu").snapshotId);
  });

  it("keeps identities across slug, display-name, URL and version changes", async () => {
    const dossier = copy("microduck-policies");
    dossier.entity.slug = "renamed-microduck-policies";
    dossier.entity.name = "Renamed collection";
    const resource = (dossier.facts.find((item) => item.key === "resources.policies")!.value as Record<string, unknown>[])[0];
    resource.url = "https://example.com/another-snapshot";
    resource.revision = "new-reviewed-revision";
    const after = await buildKnowledgeDocument(dossier, options(dossier));
    expect(after.project.id).toBe(get("microduck-policies").project.id);
    expect(after.resources.map((item) => item.id)).toEqual(get("microduck-policies").resources.map((item) => item.id));
    expect(after.resources.find((item) => item.localId === "alpha-ground-pick")?.versionId).not.toBe(get("microduck-policies").resources.find((item) => item.localId === "alpha-ground-pick")?.versionId);
    expect(knowledgeId("interface", dossier.entity.id, "cli")).not.toBe(knowledgeId("resource", dossier.entity.id, "cli"));
  });

  it("surfaces missing or ambiguous legacy IDs instead of creating IDs from array positions", async () => {
    const dossier = copy("microduck-policies");
    const doc = await buildKnowledgeDocument(dossier);
    expect(doc.resources).toEqual([]);
    expect(doc.issues.filter((item) => item.code === "missing-resource-id")).toHaveLength(9);
    expect(doc.facts.find((item) => item.key === "resources.policies")).toBeDefined();
    const ids = structuredClone(identityMaps[dossier.entity.id]);
    ids[1].id = ids[0].id;
    await expect(buildKnowledgeDocument(dossier, { legacyResourceIds: ids })).rejects.toThrow("Duplicate machine identity");
    await expect(buildKnowledgeDocument(dossier, { legacyResourceIds: [{ ...ids[0], name: "renamed-without-review" }] })).rejects.toThrow("Unused legacy");
  });

  it("does not promote a legacy tested flag, source trust, repository sync or release to scoped verification", async () => {
    const dossier = copy("vgpu");
    (dossier.facts.find((item) => item.key === "interfaces.mcp-http")!.value as Record<string, unknown>).verification = "tested";
    dossier.entity.lastVerifiedAt = "2026-08-28T01:59:00Z";
    dossier.subscriptions[0].lastSyncedAt = "2026-08-28T01:59:00Z";
    dossier.subscriptions[0].lastError = "Source temporarily unavailable";
    const doc = await buildKnowledgeDocument(dossier);
    const access = doc.interfaces.find((item) => item.localId === "mcp-http")!.access;
    expect(access.verification).toBe("unknown");
    expect(access.checkedAt).toBeNull();
    expect(access.expiresAt).toBeNull();
    expect(access.scope.versionId).toBeNull();
    expect(doc.issues.some((item) => item.code === "unscoped-test")).toBe(true);
    expect(matchKnowledgeClaim(access, "read-only", at)).toBe("unknown");
    expect(doc.resources.find((item) => item.localId === "npm-vgpu")?.versionId).toBeNull();
    expect(doc.sourceHealth.some((source) => source.lastError === "Source temporarily unavailable")).toBe(true);
  });

  it("does not inherit a project license or make claims from a missing source URL", async () => {
    const dossier = copy("vgpu");
    const resource = dossier.facts.find((item) => item.key === "resources.npm-vgpu")!;
    delete (resource.value as Record<string, unknown>).license;
    const fact = dossier.facts.find((item) => item.key === "interfaces.mcp-http")!;
    delete fact.sourceUrl;
    const doc = await buildKnowledgeDocument(dossier);
    expect(doc.resources.find((item) => item.localId === "npm-vgpu")?.license.status).toBe("unknown");
    expect(doc.interfaces.find((item) => item.localId === "mcp-http")?.access.status).toBe("unknown");
    expect(doc.issues.some((item) => item.code === "missing-evidence")).toBe(true);
  });

  it("rejects bad digests and duplicate selected facts; invalid permissions remain unknown", async () => {
    let dossier = copy("vgpu");
    (dossier.facts.find((item) => item.key === "resources.source")!.value as Record<string, unknown>).gitBlobSha = "not-a-sha";
    await expect(buildKnowledgeDocument(dossier)).rejects.toThrow("Invalid Git blob");
    dossier = copy("vgpu"); dossier.facts.push(dossier.facts[0]);
    await expect(buildKnowledgeDocument(dossier)).rejects.toThrow("Duplicate selected fact");
    dossier = copy("vgpu");
    (dossier.facts.find((item) => item.key === "interfaces.mcp-http")!.value as Record<string, unknown>).access = "probably-safe";
    const doc = await buildKnowledgeDocument(dossier);
    expect(doc.interfaces.find((item) => item.localId === "mcp-http")?.access.status).toBe("unknown");
    expect(doc.issues.some((item) => item.code === "unsupported-interface-value")).toBe(true);
  });

  it("labels history as partial and detection time separately from effective time", () => {
    for (const doc of documents.values()) {
      expect(doc.history.coverage).toBe("partial");
      expect(doc.history.pointInTime).toBe("unavailable");
      expect(doc.history.recentChanges.every((event) => event.effectiveAt === null)).toBe(true);
      expect(doc.facts.every((item) => item.claim.evidence.every((source) => source.publishedAt === null))).toBe(true);
    }
  });

  it("does not verify an unsupported relationship or infer compatibility from it", async () => {
    const dossier = copy("microduck");
    dossier.relationships[0].evidence = [];
    const doc = await buildKnowledgeDocument(dossier, options(dossier));
    const relationship = doc.relationships.find((item) => item.id === knowledgeId("relationship", dossier.relationships[0].id))!;
    expect(relationship.reviewStatus).toBe("candidate");
    expect(relationship.compatibility).toBe("unknown");
    expect(doc.issues.some((item) => item.code === "missing-relationship-evidence")).toBe(true);
  });
});

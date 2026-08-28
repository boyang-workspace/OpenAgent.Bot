import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { RegistryRepository, type RegistryDatabase, type D1Statement } from "../src/lib/registry/repository";
import { entityResources, formatFactValue, relationshipLabel } from "../src/lib/registry/resources";
import { buildEntityDocument, buildEntityMarkdown } from "../src/lib/registry/documents";
import { factHash } from "../src/lib/registry/observations";
import type { RegistryFact } from "../src/lib/registry/types";

// Exercise the real migrations and SQL queries, including pre-existing records.
const db = new DatabaseSync(":memory:");
const migrations = readdirSync("migrations").filter((name) => name.endsWith(".sql")).sort();
let originalProfiles: unknown[] = [];
let originalEntityCount = 0;
for (const file of migrations) {
  if (file.startsWith("0013")) {
    originalProfiles = db.prepare("SELECT * FROM robotics_profiles ORDER BY entity_id").all();
    originalEntityCount = Number(db.prepare("SELECT count(*) AS n FROM entities").get()!.n);
  }
  db.exec(readFileSync(`migrations/${file}`, "utf8"));
}

const adapter: RegistryDatabase = {
  prepare(sql) {
    let bindings: Record<string, SQLInputValue> = {};
    const runQuery = () => db.prepare(sql).all(bindings);
    const statement: D1Statement = {
      bind(...values) { bindings = Object.fromEntries(values.map((v, i) => [String(i + 1), v as SQLInputValue])); return statement; },
      async all<T>() { return { success: true, results: runQuery() as T[] }; },
      async first<T>() { return (runQuery()[0] as T) ?? null; },
      async run() { db.prepare(sql).run(bindings); return { success: true }; }
    };
    return statement;
  },
  async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); }
};
const registry = new RegistryRepository(adapter);
afterAll(() => db.close());

describe("Microduck reviewed registry baseline", () => {
  it("preserves every previous robotics profile and adds only four entities", () => {
    expect(db.prepare("SELECT * FROM robotics_profiles WHERE entity_id NOT LIKE 'robotics_microduck%' ORDER BY entity_id").all()).toEqual(originalProfiles);
    expect(Number(db.prepare("SELECT count(*) AS n FROM entities").get()!.n)).toBe(originalEntityCount + 4);
    expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
  });

  it("separates the robot, runtime, training stack and policy collection", async () => {
    const result = await registry.listEntities({ q: "Microduck" });
    expect(result.total).toBe(4);
    expect(result.items.every((entity) => entity.domains.join() === "robotics")).toBe(true);
    const robot = await registry.getEntity("microduck");
    expect(robot?.kind).toBe("robot");
    expect(robot?.robotics?.formFactor).toBe("biped");
    expect(robot?.robotics?.metadata.dof).toBe(15);
    expect((await registry.getEntity("microduck-policies"))?.robotics?.modelType).toBe("policy-model");
    expect((await registry.listEntities({ q: "Microduck", kinds: ["dataset"] })).total).toBe(0);
  });

  it("filters across entity kinds by evidenced use case without changing domain", async () => {
    const result = await registry.listEntities({ q: "Microduck", useCase: "sim-to-real" });
    expect(result.total).toBe(4);
    expect(result.items[0].useCases?.find((item) => item.slug === "sim-to-real")?.sourceUrl).toMatch(/^https:/);
    expect((await registry.listEntities({ useCase: "robotics-education", domains: ["robotics"], roboticsLayers: ["platform"] })).items.map((item) => item.slug)).toEqual(["microduck"]);
    expect((await registry.listEntities({ useCase: "sim-to-real", domains: ["agent"] })).total).toBe(0);
    expect((await registry.listEntities({ useCase: "' OR 1=1 --" })).total).toBe(0);
    expect(await registry.listUseCases()).toHaveLength(4);
  });

  it("retains software, hardware and simulation licensing distinctions", async () => {
    const robot = (await registry.getEntityDossier("microduck"))!;
    expect(robot.entity.licenseSpdx).toBeUndefined();
    expect(robot.opennessFacets.find((facet) => facet.facet === "hardware")?.status).toBe("closed");
    expect(robot.opennessFacets.find((facet) => facet.facet === "code")?.status).toBe("open");
    const rl = (await registry.getEntityDossier("microduck-rl"))!;
    expect(rl.entity.licenseSpdx).toBe("Apache-2.0");
    expect(entityResources(rl.facts)[0].license).toContain("BY-SA-NC");
    expect(entityResources(rl.facts)[0].license).toContain("unspecified");
  });

  it("keeps pre-order claims dated and distinct from inventory", async () => {
    const robot = (await registry.getEntityDossier("microduck"))!;
    const offer = robot.facts.find((fact) => fact.key === "availability.offer")!;
    expect(offer.value).toMatchObject({ price: 399, currency: "USD", status: "preorder" });
    expect(offer.sourceUrl).toContain("press-kit");
    expect(offer.observedAt).toMatch(/^2026-08-28/);
  });

  it("has exactly two distinct daily repository subscriptions and no duplicate metrics", async () => {
    for (const slug of ["microduck", "microduck-policies"]) {
      const dossier = (await registry.getEntityDossier(slug))!;
      expect(dossier.entity.stars).toBeUndefined();
      expect(dossier.subscriptions).toHaveLength(0);
      expect(dossier.metricSnapshots).toHaveLength(0);
    }
    for (const slug of ["microduck-runtime", "microduck-rl"]) {
      const dossier = (await registry.getEntityDossier(slug))!;
      expect(dossier.entity.stars).toBeGreaterThan(0);
      expect(dossier.subscriptions).toHaveLength(1);
      expect(dossier.metricSnapshots).toHaveLength(4);
      const sub = dossier.subscriptions[0];
      expect(Date.parse(sub.nextSyncAt!) - Date.parse(sub.lastSyncedAt!)).toBe(86_400_000);
    }
  });

  it("publishes nine immutable policy resources with provenance, not nine projects", async () => {
    const policies = (await registry.getEntityDossier("microduck-policies"))!;
    const resources = entityResources(policies.facts);
    expect(resources).toHaveLength(9);
    expect(resources.every((resource) => resource.url.includes(resource.revision!) && resource.gitBlobSha?.length === 40 && resource.sizeBytes! > 0)).toBe(true);
    expect(policies.facts.find((fact) => fact.key === "policy.action_shape")?.value).toEqual([1, 14]);
    expect(buildEntityDocument(policies).resources).toHaveLength(9);
    expect(buildEntityDocument(policies).entity.useCases).toHaveLength(2);
    expect(buildEntityMarkdown(policies)).not.toContain("[object Object]");
    expect(buildEntityMarkdown(policies)).toContain("alpha_walking.onnx");
  });

  it("links resources in both directions with attributed evidence", async () => {
    const robot = (await registry.getEntityDossier("microduck"))!;
    expect(robot.relationships).toHaveLength(3);
    expect(robot.relationships.every((rel) => rel.status === "verified" && rel.evidence.length === 1)).toBe(true);
    expect(relationshipLabel(robot.relationships.find((rel) => rel.entity.slug === "microduck-runtime")!)).toBe("Powered by");
    expect(buildEntityMarkdown(robot)).toContain("Powered by: [Microduck Runtime]");
  });

  it("hashes every imported observation using the live sync canonicalization", async () => {
    const rows = db.prepare("SELECT value_json, value_hash FROM observations WHERE entity_id LIKE 'robotics_microduck%'").all();
    expect(rows.length).toBeGreaterThan(40);
    for (const row of rows) expect(await factHash(JSON.parse(String(row.value_json)))).toBe(row.value_hash);
  });
});

describe("resource rendering safeguards", () => {
  it("rejects malformed or executable resource URLs", () => {
    const fact = { key: "resources.files", value: [{ name: "bad", kind: "file", url: "javascript:alert(1)" }, null, { name: "good", kind: "file", url: "https://example.com/model" }], observedAt: "2026-08-28" } as RegistryFact;
    expect(entityResources([fact]).map((resource) => resource.name)).toEqual(["good"]);
    expect(formatFactValue({ shape: [1, 14] })).toBe('{"shape":[1,14]}');
  });
});

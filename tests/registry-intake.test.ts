import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RegistryIntakeService } from "../src/lib/registry/intake";
import { validateManifest, validateLocator } from "../src/lib/registry/intake-contract";
import { RegistrySyncService } from "../src/lib/registry/sync";
import { RegistryRepository, type RegistryDatabase, type D1Statement } from "../src/lib/registry/repository";
import { buildEntityDocument } from "../src/lib/registry/documents";
import { npmDownloadWindow } from "../src/lib/registry/package-connectors";

const manifest = () => JSON.parse(readFileSync("content/intake/vgpu.json", "utf8"));
let db: DatabaseSync, adapter: RegistryDatabase, intake: RegistryIntakeService;
beforeEach(async () => {
  db = new DatabaseSync(":memory:");
  for (const name of readdirSync("migrations").filter((n) => n.endsWith(".sql")).sort()) db.exec(readFileSync(`migrations/${name}`, "utf8"));
  adapter = {
    prepare(sql) {
      let bindings: Record<string, SQLInputValue> = {};
      const statement: D1Statement = {
        bind(...values) { bindings = Object.fromEntries(values.map((v,i) => [String(i+1), v as SQLInputValue])); return statement; },
        async all<T>() { return { success: true, results: db.prepare(sql).all(bindings) as T[] }; },
        async first<T>() { return (db.prepare(sql).all(bindings)[0] as T) ?? null; },
        async run() { db.prepare(sql).run(bindings); return { success: true }; }
      }; return statement;
    },
    async batch(statements) {
      db.exec("BEGIN");
      try { const result = []; for (const s of statements) result.push(await s.run()); db.exec("COMMIT"); return result; }
      catch (error) { db.exec("ROLLBACK"); throw error; }
    }
  };
  intake = new RegistryIntakeService(adapter);
  await new RegistrySyncService(adapter).registerSources();
});
afterEach(() => db.close());
const publish = async (m = manifest()) => { const p = await intake.preview(m); return intake.publish(m, p.baseHash, p.payloadHash, "test reviewer"); };
const count = (table: string) => Number(db.prepare(`SELECT count(*) AS n FROM ${table}`).get()!.n);

describe("reviewed intake", () => {
  it("previews without writes, publishes one tool, then becomes a true no-op", async () => {
    const before = count("entities"), observations = count("observations");
    const p = await intake.preview(manifest());
    expect(p.diff.length).toBeGreaterThan(15); expect(count("entities")).toBe(before); expect(count("observations")).toBe(observations);
    expect((await publish()).status).toBe("published");
    expect(count("entities")).toBe(before+1);
    const after = count("observations");
    expect((await intake.preview(manifest())).diff).toEqual([]);
    expect((await publish()).status).toBe("unchanged"); expect(count("observations")).toBe(after);
    const registry = new RegistryRepository(adapter);
    const dossier = (await registry.getEntityDossier("vgpu"))!;
    expect(dossier.entity.kind).toBe("tool"); expect(dossier.entity.domains).toEqual(["agent"]);
    expect(buildEntityDocument(dossier).interfaces).toHaveLength(5);
    expect(buildEntityDocument(dossier).interfaces[0].evidence.sourceId).toBe("vercel-labs");
    expect(db.prepare("SELECT primary_category,inclusion_status FROM catalog_profiles WHERE entity_id='registry_vgpu'").get()).toEqual({primary_category:"supporting-infrastructure",inclusion_status:"included"});
    expect((await registry.listEntities({ interfaceType: "mcp" })).items.map((e) => e.slug)).toEqual(["vgpu"]);
    expect((await registry.listEntities({ interfaceType: "' OR 1=1 --" })).total).toBe(0);
    expect((await registry.listEntities({ q: "Microduck" })).total).toBe(4);
    expect((await registry.getEntityDossier("microduck"))?.opennessFacets.find((f) => f.facet === "hardware")?.status).toBe("closed");
    expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
  });
  it("rejects stale previews and modified payloads before writes", async () => {
    const m = manifest(), preview = await intake.preview(m);
    await publish(); const total = count("intake_publications");
    await expect(intake.publish(m,preview.baseHash,preview.payloadHash,"test")).rejects.toThrow("stale");
    const fresh = await intake.preview(m); m.entity.summary = "Changed summary";
    await expect(intake.publish(m,fresh.baseHash,fresh.payloadHash,"test")).rejects.toThrow("stale");
    expect(count("intake_publications")).toBe(total);
  });
  it("restores a prior manifest as a new revision without deleting evidence", async () => {
    const original = await publish(), changed = manifest();
    changed.entity.summary = "Reviewed revised summary";
    changed.resources = changed.resources.slice(1);
    await publish(changed);
    const observations = count("observations");
    const revision = await intake.revision(original.publicationId!);
    const restored = await publish(revision.manifest);
    expect(restored.revision).toBe(3);
    expect(count("observations")).toBe(observations);
    expect((await intake.preview(manifest())).diff).toEqual([]);
    expect(db.prepare("SELECT count(*) AS n FROM change_events WHERE entity_id='registry_vgpu' AND change_type='removed'").get()!.n).toBe(1);
  });
  it("detects provenance-only edits and preserves immutable observations", async () => {
    await publish();
    const m = manifest(); m.facts[0].evidence.sourceUrl = "https://vgpu.sh/llms.txt";
    expect((await intake.preview(m)).diff.some((d) => d.field === m.facts[0].key)).toBe(true);
    await expect(publish(m)).rejects.toThrow("verification date");
    m.facts[0].evidence.observedAt = new Date().toISOString();
    await publish(m);
    expect((await intake.preview(m)).diff).toEqual([]);
  });
  it("rejects conflicting identities and vocabulary, while auditing reviewed source rebindings", async () => {
    await publish();
    let m = manifest(); m.entity.slug = "vgpu-copy";
    await expect(intake.preview(m)).rejects.toThrow("Canonical identity");
    m.entity.canonicalUrl = "https://example.com/vgpu";
    await expect(intake.preview(m)).rejects.toThrow("metric owner");
    m = manifest(); m.useCases[0].description = "A conflicting definition";
    await expect(intake.preview(m)).rejects.toThrow("canonical vocabulary");
    m = manifest(); m.subscriptions.find((s: any) => s.sourceId === "npm").locator = "another-package";
    const preview = await intake.preview(m);
    expect(preview.diff.some((change) => change.field === "subscriptions")).toBe(true);
    await intake.publish(m, preview.baseHash, preview.payloadHash, "test reviewer");
    expect(db.prepare("SELECT source_role,old_locator,new_locator,reason FROM source_binding_events WHERE entity_id='registry_vgpu' AND source_id='npm'").get()).toEqual({
      source_role: "package",
      old_locator: "vgpu",
      new_locator: "another-package",
      reason: "Reviewed source binding update"
    });
    expect(db.prepare("SELECT enabled,valid_until FROM source_subscriptions WHERE entity_id='registry_vgpu' AND source_id='npm' AND locator='vgpu'").get()).toMatchObject({ enabled: 0 });
    expect(db.prepare("SELECT enabled,valid_from,valid_until FROM source_subscriptions WHERE entity_id='registry_vgpu' AND source_id='npm' AND locator='another-package'").get()).toMatchObject({ enabled: 1, valid_until: null });
  });
  it("rolls back the entire D1 batch if any later statement fails", async () => {
    const baseBatch = adapter.batch.bind(adapter);
    adapter.batch = (statements) => baseBatch([...statements, adapter.prepare("INSERT INTO entity_interfaces(entity_id,interface_id,interface_type,verification_status) VALUES ('missing','broken','bad','unknown')")]);
    await expect(publish()).rejects.toThrow("rolled back");
    expect(count("intake_publications")).toBe(0);
    expect(db.prepare("SELECT id FROM entities WHERE slug='vgpu'").get()).toBeUndefined();
  });
  it("keeps curated review dates and license separate from automatic package updates", async () => {
    await publish();
    const before = db.prepare("SELECT last_verified_at,updated_at,license_spdx FROM entities WHERE slug='vgpu'").get();
    const result = await new RegistrySyncService(adapter).syncSubscriptions({ sourceId: "npm", locator: "vgpu", fetcher: (async (input) => {
      const url = String(input);
      return Response.json(url.includes("registry.npmjs.org") ? { name:"vgpu", "dist-tags":{latest:"0.3.1"},versions:{"0.3.1":{version:"0.3.1",license:"Different upstream claim"}},time:{"0.3.1":"2026-08-26T12:00:00Z"} } : {package:"vgpu",downloads:0,...npmDownloadWindow()});
    }) as typeof fetch });
    expect(result.processed).toBe(1); expect(result.errors).toEqual([]);
    expect(db.prepare("SELECT last_verified_at,updated_at,license_spdx FROM entities WHERE slug='vgpu'").get()).toEqual(before);
    const dossier = (await new RegistryRepository(adapter).getEntityDossier("vgpu"))!;
    expect(dossier.metricSnapshots).toMatchObject([{key:"npm_downloads_30d",value:0,sourceId:"npm"}]);
    expect(dossier.entity.downloads30d).toBeUndefined();
    expect(dossier.facts.find((f) => f.key === "npm.package")?.sourceId).toBe("npm");
    expect(db.prepare("SELECT version,release_kind,channel FROM project_releases WHERE entity_id='registry_vgpu'").get()).toEqual({version:"0.3.1",release_kind:"software",channel:"stable"});
    const oldFacts = db.prepare("SELECT * FROM current_facts WHERE entity_id='registry_vgpu' ORDER BY fact_key").all();
    db.exec("UPDATE source_subscriptions SET next_sync_at=NULL WHERE source_id='npm'");
    const failed = await new RegistrySyncService(adapter).syncSubscriptions({sourceId:"npm",fetcher:(async () => new Response("",{status:503})) as typeof fetch});
    expect(failed.errors).toHaveLength(1);
    expect(db.prepare("SELECT * FROM current_facts WHERE entity_id='registry_vgpu' ORDER BY fact_key").all()).toEqual(oldFacts);
    const sub = db.prepare("SELECT error_count,last_error,julianday(next_sync_at)>julianday('now') AS delayed FROM source_subscriptions WHERE source_id='npm'").get()!;
    expect(sub.error_count).toBe(1); expect(sub.delayed).toBe(1); expect(sub.last_error).toContain("retaining");
    expect((await new RegistrySyncService(adapter).syncSubscriptions({sourceId:"npm"})).processed).toBe(0);
  });
});
describe("manifest constraints", () => {
  it("validates the reviewed content package", () => expect(validateManifest(manifest()).entity.slug).toBe("vgpu"));
  it.each(["https://github.com/a/b","a/b/tree/main","a/../b","a;b/repo"])("rejects unsafe repo locator %s", (v) => expect(() => validateLocator("github",v)).toThrow());
  it("accepts scoped npm packages, rejects paths, future evidence, duplicate IDs and invalid counts", () => {
    expect(() => validateLocator("npm","@scope/package")).not.toThrow();
    expect(() => validateLocator("npm","../../etc")).toThrow();
    let m = manifest(); m.evidence.observedAt = "2099-01-01T00:00:00Z"; expect(() => validateManifest(m)).toThrow("future");
    m = manifest(); m.resources.push(m.resources[0]); expect(() => validateManifest(m)).toThrow("Duplicate");
    m = manifest(); m.facts.push({key:"spec.dof_count",value:-1,evidence:m.evidence}); expect(() => validateManifest(m)).toThrow("Counts");
    m = manifest(); m.facts[0].key="github.stars"; expect(() => validateManifest(m)).toThrow("namespace");
  });
});

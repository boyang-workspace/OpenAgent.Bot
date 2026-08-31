import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { registryTestDatabase } from "./helpers/registry-database";
import { RegistryIntakeService } from "../src/lib/registry/intake";
import { RegistrySyncService } from "../src/lib/registry/sync";
import { KnowledgeQueryService } from "../src/lib/registry/knowledge-query";
import { RegistryRepository } from "../src/lib/registry/repository";
import { buildKnowledgeDocument } from "../src/lib/registry/knowledge-document";

let context: ReturnType<typeof registryTestDatabase>, intake: RegistryIntakeService, query: KnowledgeQueryService;
const manifest = () => JSON.parse(readFileSync("content/intake/vgpu.json", "utf8"));
beforeEach(async () => { context = registryTestDatabase(); intake = new RegistryIntakeService(context.adapter); query = new KnowledgeQueryService(context.adapter); await new RegistrySyncService(context.adapter).registerSources(); });
afterEach(() => context.db.close());
const publish = async (m = manifest(), corrections: unknown = []) => { const p = await intake.preview(m, corrections); return intake.publish(m, p.baseHash, p.payloadHash, "private-reviewer", corrections); };
const current = (key: string) => context.db.prepare("SELECT * FROM current_facts WHERE entity_id='registry_vgpu' AND fact_key=?").get(key)!;
const history = (key: string) => query.history(new URLSearchParams({ slug: "vgpu", fact_key: key, limit: "20" }));
const correction = (key: string) => [{ factKey: key, previousObservationId: current(key).observation_id, reason: "Corrected a transcription error against the cited source." }];
const counts = () => Object.fromEntries(["observations", "current_facts", "change_events", "change_event_corrections", "intake_publications"].map(table => [table, context.db.prepare(`SELECT count(*) AS n FROM ${table}`).get()!.n]));

describe("recorded first-seen and explicit correction history", () => {
  it("records initial facts once with registry time, not the earlier source date", async () => {
    await publish(); const before = counts();
    const first = await history("curated.entity");
    expect(first.items).toHaveLength(1); expect(first.items[0].kind).toBe("created");
    expect(first.items[0].previous.value).toBeNull();
    expect(first.firstRecordedAt).toBe(first.items[0].recordedAt);
    expect(Date.parse(first.firstRecordedAt!)).toBeGreaterThan(Date.parse(manifest().evidence.observedAt));
    expect(first.pointInTime).toBe("unavailable");
    expect((await publish()).status).toBe("unchanged"); expect(counts()).toEqual(before);
    const since = await query.history(new URLSearchParams({ slug: "vgpu", fact_key: "curated.entity", since: "2099-01-01T00:00:00Z" }));
    expect(since.items).toEqual([]); expect(since.firstRecordedAt).toBe(first.firstRecordedAt);
  });
  it("publishes a correction atomically, retaining both observations and original evidence", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key;
    const old = { ...current(key) }, notes = correction(key);
    const original = context.db.prepare("SELECT * FROM observations WHERE id=?").get(old.observation_id);
    m.facts[0].value = { corrected: true, scope: "Synthetic test only" };
    expect((await intake.preview(m)).correctionTargets).toContainEqual({ factKey: key, previousObservationId: old.observation_id });
    const result = await publish(m, notes);
    const page = await history(key), event = page.items.find(item => item.kind === "corrected")!;
    expect(event.previous.value).toEqual(JSON.parse(String(old.value_json)));
    expect(event.next.value).toEqual(m.facts[0].value);
    expect(event.correction).toMatchObject({ reason: notes[0].reason, previousObservationId: old.observation_id, publicationId: result.publicationId });
    expect(event.observationId).toBe(current(key).observation_id);
    expect(event.correction!.previousEvidence.length).toBe(1);
    expect(context.db.prepare("SELECT * FROM observations WHERE id=?").get(old.observation_id)).toEqual(original);
    expect(JSON.stringify(page)).not.toContain("private-reviewer");
    expect(context.db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    const dossier = (await new RegistryRepository(context.adapter).getEntityDossier("vgpu"))!;
    // Preserve legacy enum/shape. The dedicated history API adds review metadata.
    expect((await buildKnowledgeDocument(dossier)).history.recentChanges.find(item => item.id === event.id)?.kind).toBe("updated");
  });
  it("allows explicitly reviewed provenance-only corrections without rewriting old URLs", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key, old = { ...current(key) }, notes = correction(key);
    m.facts[0].evidence.sourceUrl = "https://vgpu.sh/llms.txt";
    m.facts[0].evidence.observedAt = new Date().toISOString();
    await publish(m, notes);
    const page = await history(key), event = page.items.find(item => item.kind === "corrected")!;
    expect(event.previous.value).toEqual(event.next.value);
    expect(page.evidence[event.evidence[0]].url).toBe("https://vgpu.sh/llms.txt");
    expect(page.evidence[event.correction!.previousEvidence[0]].url).toBe(manifest().facts[0].evidence.sourceUrl);
    expect(current(key).observation_id).not.toBe(old.observation_id);
  });
  it("does not label ordinary updates as corrections", async () => {
    await publish(); const m = manifest(); m.entity.summary = "Ordinary changed declaration"; await publish(m);
    expect((await history("curated.entity")).items.map(item => item.kind).sort()).toEqual(["created", "updated"]);
  });
  it("rejects missing reasons, duplicate keys, wrong references, new or unchanged facts", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key, notes = correction(key);
    await expect(intake.preview(m, notes)).rejects.toThrow("changed fact");
    m.facts[0].value = "Changed declaration";
    await expect(intake.preview(m, [{ ...notes[0], reason: " " }])).rejects.toThrow("reason");
    await expect(intake.preview(m, [notes[0], notes[0]])).rejects.toThrow("Duplicate");
    await expect(intake.preview(m, [{ ...notes[0], previousObservationId: current("curated.entity").observation_id }])).rejects.toThrow("observation");
    m.facts.push({ key: "spec.new_fact", value: "new", evidence: m.evidence });
    await expect(intake.preview(m, [{ ...notes[0], factKey: "spec.new_fact" }])).rejects.toThrow("existing");
  });
  it("binds correction reasons into the reviewed payload hash and rejects replay", async () => {
    await publish(); const m = manifest(), notes = correction(m.facts[0].key); m.facts[0].value = "Changed declaration";
    const p = await intake.preview(m, notes), before = counts();
    await expect(intake.publish(m, p.baseHash, p.payloadHash, "test", [{ ...notes[0], reason: "Changed after review" }])).rejects.toThrow("stale");
    expect(counts()).toEqual(before);
    await intake.publish(m, p.baseHash, p.payloadHash, "test", notes);
    await expect(intake.publish(m, p.baseHash, p.payloadHash, "test", notes)).rejects.toThrow();
  });
  it("rolls back correction metadata, current facts and all history if the batch fails", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key, notes = correction(key), old = { ...current(key) }, before = counts(); m.facts[0].value = "Changed declaration";
    const batch = context.adapter.batch.bind(context.adapter);
    context.adapter.batch = statements => batch([...statements, context.adapter.prepare("INSERT INTO current_facts(entity_id) VALUES ('invalid')")]);
    await expect(publish(m, notes)).rejects.toThrow("rolled back");
    expect(counts()).toEqual(before); expect(current(key)).toEqual(old);
  });
  it("makes correction annotations immutable and keeps first-recorded time after removal", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key, notes = correction(key), first = (await history(key)).firstRecordedAt;
    m.facts[0].value = "Changed declaration"; await publish(m, notes);
    expect(() => context.db.exec("UPDATE change_event_corrections SET reason='rewrite'")).toThrow("immutable");
    expect(() => context.db.exec("DELETE FROM change_event_corrections")).toThrow("immutable");
    m.facts = m.facts.slice(1); await publish(m);
    const page = await history(key);
    expect(page.items.some(item => item.kind === "removed")).toBe(true); expect(page.firstRecordedAt).toBe(first);
  });
  it("detects a same-timestamp selection race inside the publication transaction", async () => {
    await publish(); const m = manifest(), key = m.facts[0].key, notes = correction(key), before = counts(); m.facts[0].value = "Reviewed replacement";
    const batch = context.adapter.batch.bind(context.adapter);
    context.adapter.batch = statements => {
      // A separate committed writer moves only the selected observation after
      // publish's re-preview. Entity timestamps deliberately remain identical.
      context.db.prepare(`INSERT INTO observations(id,entity_id,source_id,fact_key,value_json,value_hash,source_url,confidence,observed_at,created_at)
        SELECT 'obs-concurrent-fixture',entity_id,source_id,fact_key,value_json,value_hash,source_url,confidence,'2026-08-28T02:00:00Z',created_at FROM observations WHERE id=?`).run(notes[0].previousObservationId);
      context.db.prepare("UPDATE current_facts SET observation_id='obs-concurrent-fixture',observed_at='2026-08-28T02:00:00Z' WHERE entity_id='registry_vgpu' AND fact_key=?").run(key);
      return batch(statements);
    };
    await expect(publish(m, notes)).rejects.toThrow("rolled back");
    expect(current(key).observation_id).toBe("obs-concurrent-fixture");
    expect(counts()).toEqual({ ...before, observations: Number(before.observations) + 1 });
  });
});

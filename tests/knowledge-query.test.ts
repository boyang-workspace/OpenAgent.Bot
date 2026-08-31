import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prepareEvaluation, discoveryTasks, evaluationTime, addHistoryFixture, compactTasks } from "../evaluations/knowledge-agent-tasks";
import { knowledgeResponse } from "../src/lib/registry/knowledge-query";
import type { RegistryDatabase } from "../src/lib/registry/repository";

let context: Awaited<ReturnType<typeof prepareEvaluation>>;
beforeAll(async () => { context = await prepareEvaluation(); });
afterAll(() => context.db.close());
const request = (endpoint: "search" | "project" | "history", query: string, db?: RegistryDatabase, method = "GET") => knowledgeResponse(new Request(`https://test.invalid/api/knowledge/v1/${endpoint}.json?${query}`, { method }), endpoint, () => db ?? context.adapter, () => evaluationTime);
const search = async (query: string) => {
  const response = await request("search", query);
  expect(response.status).toBe(200);
  return response.json();
};

describe("strict read-only Knowledge HTTP surface", () => {
  it.each(discoveryTasks)("$id: $question", async (task) => {
    const result = await search(task.params);
    expect(result.items.map((item: any) => `${item.project.slug}/${item.interface.localId}`).sort()).toEqual(task.expected);
    expect(result.coverage.exhausted).toBe(true);
    expect(result.coverage.upstream).toBe("unknown");
    if (["Q4", "Q5", "Q6"].includes(task.id)) expect(result.coverage.unknownCandidatesThisPage).toBeGreaterThan(0);
  });

  it.each(["interface=mcp&authentication=requird", "interface=mcp&domain=unsupported", "interface=mcp&limit=0", "interface=mcp&limit=21", "interface=mcp&limit=1.5", "interface=mcp&require_fresh=yes", "interface=mcp&access=read-only&access=read-write", "interface=mcp&version_id=", "interface=mcp&cursor=garbage", "", "interface=MCP"])("rejects unsupported or ambiguous query: %s", async (query) => {
    expect((await request("search", query)).status).toBe(400);
  });

  it("matches one interface, keeps local-write opt-in distinct, and treats q literally", async () => {
    expect((await search("interface=mcp&access=local-write-opt-in&authentication=none")).items[0].interface.localId).toBe("mcp-local");
    expect((await search("interface=mcp&q=vgpu")).items).toHaveLength(2);
    expect((await search("interface=mcp&q=%25")).items).toHaveLength(0);
    expect((await search("interface=cli&project=opencode&version_id=not-known")).coverage.unknownCandidatesThisPage).toBe(1);
  });

  it("paginates matching interfaces and rejects cross-filter cursors", async () => {
    const first = await search("interface=cli&access=read-write&limit=1");
    expect(first.nextCursor).toBeTruthy();
    const suffix = `&cursor=${encodeURIComponent(first.nextCursor)}`;
    const second = await search(`interface=cli&access=read-write&limit=1${suffix}`);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].interface.id).not.toBe(first.items[0].interface.id);
    expect(second.nextCursor).toBeNull();
    expect((await request("search", `interface=mcp&access=read-write${suffix}`)).status).toBe(400);
  });

  it.each(compactTasks)("returns a small sourced task response for $slug", async (task) => {
    const response = await request("project", `slug=${task.slug}&${task.params}`);
    expect(response.status).toBe(200);
    const body = await response.text(), result = JSON.parse(body);
    expect(result.items).toHaveLength(1);
    expect(Object.keys(result.evidence).length).toBeGreaterThan(0);
    const fullSize = context.sizes.find((item) => item.slug === task.slug)!.knowledgeJsonBytes;
    expect(Buffer.byteLength(body)).toBeLessThan(fullSize / 2);
    for (const source of Object.values(result.evidence) as any[]) expect(source.observedAt).toBeTruthy();
    const claim = result.items[0].access ?? result.items[0].license;
    expect(claim.freshness).toBe("unknown");
    expect(claim.scope).toBeDefined();
    expect(claim.test).toBeNull();
    expect(claim.evidence.every((ref: string) => ref in result.evidence)).toBe(true);
  });

  it("keeps scoped digests without inheriting repository terms", async () => {
    const result = await (await request("project", "slug=microduck-policies&section=resources&id=alpha-walking")).json();
    expect(result.versions[0].id).toBe(result.items[0].versionId);
    expect(result.versions[0].digests[0].algorithm).toBe("git-blob-sha1");
    expect(result.items[0].license.scope.versionId).toBe(result.items[0].versionId);
    expect(result.items[0].license.value).not.toBe("Apache-2.0");
  });

  it("paginates sections and rejects a cursor after the record changes", async () => {
    const first = await (await request("project", "slug=vgpu&section=interfaces&limit=1")).json();
    const suffix = `&cursor=${encodeURIComponent(first.nextCursor)}`;
    const second = await (await request("project", `slug=vgpu&section=interfaces&limit=1${suffix}`)).json();
    expect(first.items[0].id).not.toBe(second.items[0].id);
    const original = context.db.prepare("SELECT summary FROM entities WHERE slug='vgpu'").get()!.summary;
    try {
      context.db.prepare("UPDATE entities SET summary='changed during pagination' WHERE slug='vgpu'").run();
      expect((await request("project", `slug=vgpu&section=interfaces&limit=1${suffix}`)).status).toBe(409);
    } finally { context.db.prepare("UPDATE entities SET summary=? WHERE slug='vgpu'").run(original); }
  });

  it("states missing coverage and rejects ambiguous field requests", async () => {
    const overview = await (await request("project", "slug=lerobot")).json();
    expect(overview.counts.interfaces).toBe(0);
    expect(overview.unknowns).toContain("upstream-completeness");
    for (const query of ["slug=vgpu&section=all", "slug=vgpu&section=facts", "slug=vgpu&fact_key=test", "slug=vgpu&section=overview&limit=1"]) expect((await request("project", query)).status).toBe(400);
    expect((await request("project", "slug=vgpu&section=interfaces&id=missing")).status).toBe(404);
    expect((await request("project", "slug=vgpu&section=facts&fact_key=software.category")).status).toBe(200);
  });

  it("hides nonpublic projects on all endpoints", async () => {
    try {
      context.db.prepare("UPDATE entities SET visibility='review' WHERE slug='vgpu'").run();
      expect((await search("interface=mcp")).items).toHaveLength(0);
      expect((await request("project", "slug=vgpu")).status).toBe(404);
      expect((await request("history", "slug=vgpu")).status).toBe(404);
    } finally { context.db.prepare("UPDATE entities SET visibility='public' WHERE slug='vgpu'").run(); }
  });

  it("returns failed reads as 503, not empty answers or leaked error details", async () => {
    const failed: RegistryDatabase = { prepare() { throw new Error("secret connection detail"); }, batch: context.adapter.batch };
    const falseResult: RegistryDatabase = { prepare(sql) {
      const statement = context.adapter.prepare(sql);
      statement.all = async () => ({ success: false, results: [] });
      return statement;
    }, batch: context.adapter.batch };
    for (const db of [failed, falseResult]) for (const endpoint of ["project", "search", "history"] as const) {
      const response = await request(endpoint, endpoint === "search" ? "interface=mcp" : "slug=vgpu", db);
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain("secret");
    }
    for (const endpoint of ["project", "search", "history"] as const) expect((await request(endpoint, "", failed, "POST")).status).toBe(405);
  });

  it("passes through empty bounded search pages without falsely exhausting the corpus", async () => {
    const manifest = JSON.parse(readFileSync("content/intake/vgpu.json", "utf8"));
    const raw = manifest.interfaces.find((item: any) => item.type === "mcp");
    const original = context.db.prepare("SELECT * FROM current_facts WHERE entity_id='registry_vgpu' AND fact_key='interfaces.mcp-http'").get()!;
    try {
      for (let n = 0; n < 51; n++) {
        const id = `a-test-${String(n).padStart(2, "0")}`;
        context.db.prepare("INSERT INTO current_facts (entity_id,fact_key,observation_id,source_id,value_json,value_hash,confidence,observed_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run("registry_vgpu", `interfaces.${id}`, original.observation_id, original.source_id, JSON.stringify({ ...raw, id, authentication: "unknown" }), "synthetic", 1, original.observed_at, original.updated_at);
      }
      const first = await search("interface=mcp&authentication=none");
      expect(first.items).toHaveLength(0);
      expect(first.coverage.scannedThisPage).toBe(50);
      expect(first.coverage.exhausted).toBe(false);
      const second = await search(`interface=mcp&authentication=none&cursor=${encodeURIComponent(first.nextCursor)}`);
      expect(second.items).toHaveLength(2);
      expect(second.coverage.exhausted).toBe(true);
    } finally { context.db.prepare("DELETE FROM current_facts WHERE entity_id='registry_vgpu' AND fact_key LIKE 'interfaces.a-test-%'").run(); }
  });

  it("retrieves the initial event and all 26 tied-time revisions without later appends", async () => {
    await addHistoryFixture(context.intake);
    context.db.prepare("UPDATE change_events SET detected_at='2026-08-28 02:00:00' WHERE entity_id='registry_vgpu'").run();
    const first = await (await request("history", "slug=vgpu&fact_key=curated.entity&limit=5")).json();
    const ids = first.items.map((item: any) => item.id);
    context.db.prepare("INSERT INTO change_events (id,entity_id,source_id,fact_key,change_type,previous_value_json,next_value_json,detected_at,created_at) SELECT 'late-history-fixture',entity_id,source_id,fact_key,change_type,previous_value_json,next_value_json,'2026-08-27 00:00:00',created_at FROM change_events WHERE entity_id='registry_vgpu' AND fact_key='curated.entity' LIMIT 1").run();
    let cursor = first.nextCursor;
    while (cursor) {
      const response = await request("history", `slug=vgpu&fact_key=curated.entity&limit=5&cursor=${encodeURIComponent(cursor)}`);
      expect(response.status).toBe(200);
      const page = await response.json();
      expect(page.pointInTime).toBe("unavailable");
      ids.push(...page.items.map((item: any) => item.id)); cursor = page.nextCursor;
      expect(ids.length).toBeLessThanOrEqual(27);
    }
    expect(ids).toHaveLength(27);
    expect(new Set(ids).size).toBe(27);
    expect(ids).not.toContain("late-history-fixture");
    expect(first.items.every((item: any) => item.effectiveAt === null && item.recordedAt === evaluationTime)).toBe(true);
    expect((await request("history", `slug=opencode&fact_key=curated.entity&cursor=${encodeURIComponent(first.nextCursor)}`)).status).toBe(400);
    expect((await request("history", "slug=vgpu&since=2026-08-28")).status).toBe(400);
    expect((await (await request("history", "slug=vgpu&since=2026-08-29T00%3A00%3A00Z")).json()).items).toHaveLength(0);
  });

  it("explicitly marks oversized event values", async () => {
    context.db.prepare("UPDATE change_events SET next_value_json=? WHERE id='late-history-fixture'").run(JSON.stringify("x".repeat(5000)));
    const first = await (await request("history", "slug=vgpu&fact_key=curated.entity&limit=20")).json();
    const second = await (await request("history", `slug=vgpu&fact_key=curated.entity&limit=20&cursor=${encodeURIComponent(first.nextCursor)}`)).json();
    const event = second.items.find((item: any) => item.id === "late-history-fixture");
    expect(event.next).toEqual({ value: null, bytes: 5002, truncated: true });
  });
});

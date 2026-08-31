import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { expansionTasks, expansionSlugs, expansionTime, prepareExpansion, runExpansionTask } from "../evaluations/knowledge-expansion";
import { knowledgeResponse } from "../src/lib/registry/knowledge-query";

let context: Awaited<ReturnType<typeof prepareExpansion>>;
beforeAll(async () => { context = await prepareExpansion(); });
afterAll(() => context.db.close());
const request = (endpoint: "search" | "project" | "history", query: string) => knowledgeResponse(new Request(`https://test.invalid/?${query}`), endpoint, () => context.adapter, () => expansionTime);

describe("source-grounded expansion cohort", () => {
  it.each(expansionTasks)("$id: $question", async task => {
    const result = await runExpansionTask(context, task);
    expect(result.passed, JSON.stringify({ error: "error" in result ? result.error : undefined, checks: result.checks })).toBe(true);
  });

  it("preserves existing project identities and historical metric series", async () => {
    const before = await prepareExpansion(false);
    try {
      const ids: string[] = [];
      for (const slug of expansionSlugs) {
        const old = (await before.registry.getEntity(slug))!, next = (await context.registry.getEntity(slug))!;
        expect(next.id).toBe(old.id); ids.push(old.id);
        expect(next.repositoryUrl).toBe(old.repositoryUrl);
        expect(next.domains).toEqual(old.domains);
        const sql = "SELECT id,entity_id,source_id,locator,enabled,last_synced_at,last_error FROM source_subscriptions WHERE entity_id=? ORDER BY id";
        expect(context.db.prepare(sql).all(old.id)).toEqual(before.db.prepare(sql).all(old.id));
      }
      for (const table of ["metric_snapshots", "entity_metrics_current"]) {
        const sql = `SELECT * FROM ${table} WHERE entity_id IN (${ids.map(() => "?").join(",")}) ORDER BY entity_id`;
        expect(context.db.prepare(sql).all(...ids)).toEqual(before.db.prepare(sql).all(...ids));
      }
    } finally { before.db.close(); }
  });

  it("keeps unknown credentials, artifact terms, freshness and hardware compatibility explicit", async () => {
    for (const slug of expansionSlugs) {
      const result = await (await request("project", `slug=${slug}&section=interfaces`)).json();
      for (const item of result.items) for (const field of ["access", "authentication", "transport", "runtimes"]) {
        expect(item[field].test).toBeNull();
        expect(item[field].checkedAt).toBeNull();
        expect(item[field].freshness).toBe("unknown");
        expect(item[field].verification).not.toBe("tested");
      }
    }
    const robot = (await context.registry.getEntityDossier("lerobot"))!;
    expect(robot.entity.robotics?.stackType).toBe("framework");
    const manifest = JSON.parse(readFileSync("content/intake/lerobot.json", "utf8"));
    expect(manifest.facts.find((f: any) => f.key === "policy.physical_execution").value.hardwareCompatibility).toBeNull();
    const sdk = await (await request("project", "slug=openhands&section=resources&id=sdk-repository")).json();
    expect(sdk.items[0].license.status).toBe("unknown");
    expect(sdk.items[0].versionId).toBeNull();
  });

  it("indexes fields without full values, deduplicates evidence and rejects ambiguous index queries", async () => {
    const first = await (await request("project", "slug=lerobot&section=fields&limit=1")).json();
    expect(first.items).toHaveLength(1);
    expect(first.items[0]).not.toHaveProperty("value");
    expect(first.items[0]).not.toHaveProperty("claim");
    expect(first.claimInterpretation).toBe("top-level-only; nested-null-values-remain-unknown");
    expect(Object.keys(first.evidence).sort()).toEqual([...new Set(first.items.flatMap((item: any) => item.evidence))].sort());
    const suffix = `&cursor=${encodeURIComponent(first.nextCursor)}`;
    const second = await (await request("project", `slug=lerobot&section=fields&limit=1${suffix}`)).json();
    expect(second.items[0].key).not.toBe(first.items[0].key);
    for (const query of ["slug=lerobot&section=fields&id=x", "slug=lerobot&section=fields&fact_key=software.runtime_requirements", `slug=langgraph&section=fields${suffix}`]) expect((await request("project", query)).status).toBe(400);
    const original = context.db.prepare("SELECT summary FROM entities WHERE slug='lerobot'").get()!.summary;
    try {
      context.db.prepare("UPDATE entities SET summary='synthetic index change' WHERE slug='lerobot'").run();
      expect((await request("project", `slug=lerobot&section=fields${suffix}`)).status).toBe(409);
    } finally { context.db.prepare("UPDATE entities SET summary=? WHERE slug='lerobot'").run(original); }
    expect((await (await request("project", "slug=lerobot")).json()).links.sections).toContain("fields");
  });

  it("applies strict domain membership without claiming compatibility or matching other domains", async () => {
    for (const domain of ["robot", "shared-infrastructure", "robotics&domain=agent", "robotics%27%20OR%201%3D1"]) expect((await request("search", `interface=cli&domain=${domain}`)).status).toBe(400);
    const result = await (await request("search", "interface=cli&domain=robotics&limit=1")).json();
    expect(result.domainInterpretation).toBe("registry-assignment-not-compatibility");
    expect(result.items[0].project.slug).toBe("lerobot");
    const suffix = `&cursor=${encodeURIComponent(result.nextCursor)}`;
    expect((await request("search", `interface=cli&domain=agent${suffix}`)).status).toBe(400);
    expect((await (await request("search", "interface=cli&domain=robotics&project=openhands")).json()).items).toEqual([]);
    try {
      context.db.prepare("UPDATE entities SET visibility='review' WHERE slug='lerobot'").run();
      expect((await (await request("search", "interface=cli&domain=robotics")).json()).items).toEqual([]);
      expect((await request("project", "slug=lerobot&section=fields")).status).toBe(404);
    } finally { context.db.prepare("UPDATE entities SET visibility='public' WHERE slug='lerobot'").run(); }
  });

  it("matches a secondary domain once without duplicating an interface", async () => {
    try {
      context.db.prepare("INSERT INTO entity_domains (entity_id,domain,is_primary,confidence,classification_method,review_status,created_at,updated_at) VALUES ('res_langgraph','robotics',0,1,'manual','verified',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)").run();
      const page = await (await request("search", "interface=sdk&domain=robotics")).json();
      expect(page.items.map((item: any) => item.project.slug).sort()).toEqual(["langgraph", "lerobot"]);
      expect(new Set(page.items.map((item: any) => item.interface.id)).size).toBe(page.items.length);
    } finally { context.db.prepare("DELETE FROM entity_domains WHERE entity_id='res_langgraph' AND domain='robotics'").run(); }
  });
});

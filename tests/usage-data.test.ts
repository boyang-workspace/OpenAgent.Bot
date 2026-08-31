import { describe, expect, it, vi } from "vitest";
import { registryTestDatabase } from "./helpers/registry-database";
import { UsageRepository, UsageSyncService, compactTokens } from "../src/lib/registry/usage";

describe("public usage history", () => {
  it("creates a release-history subscription for every enabled GitHub record", () => {
    const { db } = registryTestDatabase();
    const github = db.prepare("SELECT COUNT(*) AS count FROM source_subscriptions WHERE source_id='github' AND enabled=1").get() as { count: number };
    const releases = db.prepare("SELECT COUNT(*) AS count FROM history_subscriptions WHERE source_id='github-releases' AND enabled=1").get() as { count: number };
    expect(releases.count).toBe(github.count);
  });

  it("collects source-scoped model and app tokens while defaulting to confirmed open records", async () => {
    const { adapter } = registryTestDatabase();
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/rankings-daily")) return Response.json({
        data: [
          { date: "2026-08-28", model_permaslug: "deepseek/deepseek-r1-0528", total_tokens: "1200000000000" },
          { date: "2026-08-28", model_permaslug: "openai/gpt-5.6", total_tokens: "900000000000" },
          { date: "2026-08-28", model_permaslug: "other", total_tokens: "100000000" }
        ],
        meta: { as_of: "2026-08-29T02:00:00Z", start_date: "2026-08-28", end_date: "2026-08-28", version: "v1" }
      });
      if (url.pathname.endsWith("/app-rankings")) return Response.json({
        data: [
          { rank: 1, app_id: 10, app_name: "Cline", total_tokens: "800000000000", total_requests: 40 },
          { rank: 2, app_id: 11, app_name: "Closed App", total_tokens: "500000000000", total_requests: 20 }
        ],
        meta: { as_of: "2026-08-29T02:00:00Z", start_date: "2026-08-28", end_date: "2026-08-28", version: "v1" }
      });
      return new Response("not found", { status: 404 });
    }) as typeof fetch;
    const result = await new UsageSyncService(adapter, fetcher).syncOpenRouter({ apiKey: "test", startDate: "2026-08-28", endDate: "2026-08-28" });
    expect(result.results).toMatchObject([{ dataset: "models", rows: 3 }, { dataset: "apps", rows: 2 }]);

    const models = await new UsageRepository(adapter).pageData("model", { openOnly: true });
    expect(models.snapshot).toHaveLength(1);
    expect(models.snapshot[0]).toMatchObject({ displayName: "DeepSeek-R1", entitySlug: "deepseek-r1", totalTokens: "1200000000000" });
    const apps = await new UsageRepository(adapter).pageData("app", { openOnly: true });
    expect(apps.snapshot).toHaveLength(1);
    expect(apps.snapshot[0]).toMatchObject({ displayName: "Cline", entitySlug: "cline", totalRequests: 40 });
    const allModels = await new UsageRepository(adapter).pageData("model", { openOnly: false });
    expect(allModels.snapshot).toHaveLength(3);
  });

  it("preserves 64-bit token totals as strings", () => {
    expect(compactTokens("25200000000000")).toBe("25.2 T");
    expect(() => BigInt("25200000000000")).not.toThrow();
  });

  it("does not bind the service instance as native fetch this", async () => {
    const { adapter } = registryTestDatabase();
    const contexts: unknown[] = [];
    const nativeFetch = vi.spyOn(globalThis, "fetch").mockImplementation(function (this: unknown) {
      contexts.push(this);
      return Promise.resolve(Response.json({
        data: [{ date: "2026-08-28", model_permaslug: "deepseek/deepseek-r1", total_tokens: "42" }],
        meta: { as_of: "2026-08-29T02:00:00Z", start_date: "2026-08-28", end_date: "2026-08-28", version: "v1" }
      }));
    });
    try {
      await new UsageSyncService(adapter).syncOpenRouter({
        apiKey: "test",
        datasets: ["models"],
        startDate: "2026-08-28",
        endDate: "2026-08-28"
      });
    } finally {
      nativeFetch.mockRestore();
    }
    expect(contexts).toEqual([undefined]);
  });
});

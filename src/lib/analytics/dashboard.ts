import type { RegistryDatabase } from "@/lib/registry/repository";
import { AnalyticsEngineQuery, analyticsWindow } from "./query";
import { AnalyticsRepository } from "./repository";

export const analyticsViews = ["overview", "content", "acquisition", "agents", "search", "realtime", "health"] as const;
export type AnalyticsView = (typeof analyticsViews)[number];

type CacheEntry = { expiresAt: number; value: unknown };
const cache = new Map<string, CacheEntry>();

export async function analyticsDashboardData(db: RegistryDatabase, environment: Pick<Env, "CLOUDFLARE_ACCOUNT_ID" | "ANALYTICS_API_TOKEN">, view: AnalyticsView, requestedDays = 30): Promise<{ view: AnalyticsView; days: number; data: unknown; warning?: string }> {
  const days = analyticsWindow(requestedDays);
  const key = `${view}:${days}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as { view: AnalyticsView; days: number; data: unknown; warning?: string };
  const repository = new AnalyticsRepository(db);
  let data: unknown;
  let warning: string | undefined;
  if (view === "overview") data = await repository.overview(days);
  else if (view === "content") data = await repository.content(days);
  else if (view === "acquisition") data = await repository.acquisition(days);
  else if (view === "agents") data = await repository.agents(days);
  else if (view === "search") data = await repository.search(days);
  else if (view === "health") data = await repository.health();
  else {
    const query = new AnalyticsEngineQuery(environment.CLOUDFLARE_ACCOUNT_ID, environment.ANALYTICS_API_TOKEN);
    try {
      data = await query.run(`SELECT intDiv(toUInt32(timestamp), 300) * 300 AS time_bucket, blob2 AS actor_type, blob3 AS actor_name, blob4 AS path, blob8 AS referrer, SUM(_sample_interval) AS requests FROM openagent_events WHERE timestamp >= NOW() - INTERVAL '30' MINUTE AND blob1 = 'request' GROUP BY time_bucket, actor_type, actor_name, path, referrer ORDER BY time_bucket DESC, requests DESC LIMIT 100`);
    } catch (error) {
      data = [];
      warning = error instanceof Error ? error.message : "Analytics temporarily unavailable.";
    }
  }
  const result = { view, days, data, ...(warning ? { warning } : {}) };
  cache.set(key, { expiresAt: Date.now() + (view === "realtime" ? 20_000 : 120_000), value: result });
  return result;
}

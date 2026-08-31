import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authorizeAnalyticsRequest } from "@/lib/analytics/auth";
import { analyticsDashboardData, analyticsViews, type AnalyticsView } from "@/lib/analytics/dashboard";

export const GET: APIRoute = async ({ request, params }) => {
  if (!await authorizeAnalyticsRequest(request, env.ANALYTICS_ADMIN_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const view = params.view as AnalyticsView;
  if (!analyticsViews.includes(view)) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const result = await analyticsDashboardData(env.DB, env, view, Number(new URL(request.url).searchParams.get("days") ?? 30));
    return Response.json(result, { headers: { "Cache-Control": "private, max-age=60", "X-Robots-Tag": "noindex, nofollow" } });
  } catch (error) {
    return Response.json({ error: "Analytics temporarily unavailable.", detail: error instanceof Error ? error.message : undefined }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
};

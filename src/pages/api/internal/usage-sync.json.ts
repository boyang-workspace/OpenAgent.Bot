import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getRegistryDatabase } from "@/lib/registry/runtime";
import { UsageSyncService, type UsageDataset } from "@/lib/registry/usage";

export const POST: APIRoute = async ({ request, url }) => {
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!env.SYNC_TOKEN || received !== env.SYNC_TOKEN) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.OPENROUTER_API_KEY) return Response.json({
    status: "skipped",
    reason: "OPENROUTER_API_KEY is not configured",
    action: "Store a valid OpenRouter key as a Cloudflare Worker secret; never send it to the public endpoint."
  }, { headers: { "Cache-Control": "no-store" } });

  const requested = (url.searchParams.get("dataset") ?? "all").split(",");
  const datasets: UsageDataset[] = requested.includes("all") ? ["models", "apps"]
    : requested.filter((item): item is UsageDataset => item === "models" || item === "apps");
  if (!datasets.length) return Response.json({ error: "dataset must be models, apps or all" }, { status: 400 });

  try {
    const result = await new UsageSyncService(getRegistryDatabase()).syncOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
      datasets,
      startDate: url.searchParams.get("start_date") ?? undefined,
      endDate: url.searchParams.get("end_date") ?? undefined
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }
};

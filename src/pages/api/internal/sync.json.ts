import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getRegistryDatabase } from "@/lib/registry/runtime";
import { RegistrySyncService } from "@/lib/registry/sync";

export const POST: APIRoute = async ({ request, url }) => {
  const expected = env.SYNC_TOKEN;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || received !== expected) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sourceId = url.searchParams.get("source") ?? "github";
  const offsetInput = Number(url.searchParams.get("offset") ?? 0);
  const limitInput = Number(url.searchParams.get("limit") ?? 20);
  const offset = Number.isFinite(offsetInput) ? Math.max(Math.floor(offsetInput), 0) : 0;
  const limit = Number.isFinite(limitInput) ? Math.min(Math.max(Math.floor(limitInput), 1), 25) : 20;
  const sync = new RegistrySyncService(getRegistryDatabase());
  await sync.registerSources();
  // Scheduled GitHub Actions can provide their short-lived, repository-scoped
  // token after authenticating with SYNC_TOKEN. This avoids storing a broad,
  // long-lived GitHub credential in the Worker.
  const connectorToken = request.headers.get("x-github-token") ?? env.GITHUB_TOKEN;
  const result = await sync.syncSubscriptions({ sourceId, offset, limit, token: connectorToken, locator: url.searchParams.get("locator") ?? undefined });
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
};

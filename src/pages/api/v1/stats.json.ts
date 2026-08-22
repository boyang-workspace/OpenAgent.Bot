import type { APIRoute } from "astro";
import { getRegistry } from "@/lib/registry/runtime";

export const GET: APIRoute = async () => {
  const stats = await getRegistry().getStats();
  return Response.json({ apiVersion: "v1", stats }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
};

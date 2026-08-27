import type { APIRoute } from "astro";
import { buildEntityMarkdown } from "@/lib/registry/documents";
import { getRegistry } from "@/lib/registry/runtime";

export const GET: APIRoute = async ({ params }) => {
  const dossier = await getRegistry().getEntityDossier(params.slug ?? "");
  if (!dossier) return new Response("# Entity not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  return new Response(buildEntityMarkdown(dossier), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      Link: `<https://www.openagent.bot/project/${dossier.entity.slug}>; rel="canonical"`
    }
  });
};

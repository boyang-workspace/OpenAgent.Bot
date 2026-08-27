import type { APIRoute } from "astro";
import { buildEntityDocument } from "@/lib/registry/documents";
import { getRegistry } from "@/lib/registry/runtime";

export const GET: APIRoute = async ({ params }) => {
  const dossier = await getRegistry().getEntityDossier(params.slug ?? "");
  if (!dossier) return Response.json({ error: "Entity not found" }, { status: 404 });
  return Response.json(buildEntityDocument(dossier), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      Link: `<https://www.openagent.bot/project/${dossier.entity.slug}>; rel="canonical"`
    }
  });
};

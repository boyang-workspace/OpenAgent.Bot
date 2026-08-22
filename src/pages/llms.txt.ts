import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { getRegistry } from "@/lib/registry/runtime";

export const GET: APIRoute = async () => {
  let entities: Array<{ name: string; slug: string; summary: string }> = [];
  try {
    const result = await getRegistry().listEntities({ sort: "updated", limit: 100 });
    entities = result.items;
  } catch {}
  const lines = [
    `# ${site.name}`,
    "",
    "Open(Source) × Agent(s) × (Ro)Bot",
    site.description,
    "",
    "## Machine-readable endpoints",
    `- Entities: ${site.url}/api/v1/entities.json`,
    `- Statistics: ${site.url}/api/v1/stats.json`,
    `- Methodology: ${site.url}/methodology`,
    `- Source catalog: ${site.url}/sources`,
    "",
    "## Recently verified entities",
    ...entities.map((entity) => `- [${entity.name}](${site.url}/project/${entity.slug}): ${entity.summary}`)
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};

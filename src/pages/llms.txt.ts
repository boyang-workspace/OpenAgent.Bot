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
    "## Agent entry point (MCP) — preferred way for agents to discover and query OpenAgent",
    "OpenAgent ships a read-only MCP server so an agent can query attributed, evidence-backed facts directly instead of scraping pages.",
    `- Server command: \`node mcp/server.mjs\` (override source with OPENAGENT_API_BASE)`,
    `- Server manifest / catalog entry: ${site.url}/mcp/manifest.json`,
    "- Tools: search_entities (find projects by name/kind/openness), get_entity (full attributed dossier by slug), get_stats (registry totals).",
    "- Add it to Claude Code, Codex, OpenCode or Cline by pointing their MCP config at this command. Once added, the agent discovers OpenAgent on every session and queries it persistently.",
    "- Every fact returned by the registry carries a source, source URL and observation time. Unknown is returned as unknown; no capability is inferred from a repository license.",
    "",
    "## Knowledge v0.1 preview (read-only, partial coverage)",
    "For a known project, start with project.json?slug=PROJECT&section=fields&limit=20 and follow the relevant valueUrl. Overview contains navigation, not fact values. Discovery search requires interface.",
    `- API guide and supported parameters: ${site.url}/api`,
    `- Strict interface search: ${site.url}/api/knowledge/v1/search.json?interface=mcp&access=read-only&authentication=none`,
    `- Project overview: ${site.url}/api/knowledge/v1/project.json?slug=vgpu`,
    `- Discover field keys: ${site.url}/api/knowledge/v1/project.json?slug=lerobot&section=fields&limit=5`,
    `- Retrieve one discovered fact: ${site.url}/api/knowledge/v1/project.json?slug=lerobot&section=facts&fact_key=policy.physical_execution`,
    `- Domain-scoped discovery: ${site.url}/api/knowledge/v1/search.json?domain=robotics&interface=cli&access=read-write`,
    "- Domain membership is not compatibility. Field-index status describes only the top-level claim; nested nulls remain unknown.",
    `- One interface with evidence: ${site.url}/api/knowledge/v1/project.json?slug=vgpu&section=interfaces&id=mcp-http`,
    `- Recorded change history: ${site.url}/api/knowledge/v1/history.json?slug=vgpu&limit=5`,
    "Unsupported or duplicate parameters return 400. Follow nextCursor even when a search page is empty. Coverage is not global completeness.",
    "Access describes declared capability, not runtime permission. documented is not tested; freshness and version scope may be unknown. No commands or robot actions are executed.",
    "History uses registry detection time, not upstream publication time; firstRecordedAt is the earliest retained observation insertion time, not complete history. Explicit corrected events link old/new evidence and a review reason. Point-in-time reconstruction is unavailable.",
    "",
    "## Recently verified entities",
    ...entities.map((entity) => `- [${entity.name}](${site.url}/project/${entity.slug}): ${entity.summary}`)
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};

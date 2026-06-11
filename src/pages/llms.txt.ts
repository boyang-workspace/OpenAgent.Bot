import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { buildResourceDetailProfile } from "@/lib/content/resource-detail";
import { getPublishedResources, resourcePath } from "@/lib/content/resources";

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();
  const posts = await getPublishedBlogPosts();

  const lines: string[] = [
    `# ${site.name}`,
    "",
    site.description,
    "",
    `Site URL: ${site.url}`,
    "",
    "## Agent Capability Resolver",
    "",
    `- Stack Finder: ${site.url}/stack-finder`,
    `- Recommendations JSON: ${site.url}/recommendations/index.json`,
    `- Capabilities JSON: ${site.url}/capabilities/index.json`,
    `- Static recommendation API: ${site.url}/api/recommend.json`,
    "",
    "Each resource exposes a full JSON profile, Markdown brief, and compact agent decision packet at `/:category/:slug.agent.json`.",
    "",
    "## Resources",
    "",
    ...resources.map(
      (r) => {
        const detail = buildResourceDetailProfile(r);
        return `- [${r.identity.name} - ${r.identity.one_liner}](${site.url}${resourcePath(r)}) | agent_json: ${detail.agentPacket.machine_readable.agent_json_url}`;
      }
    ),
    "",
    "## Guides",
    "",
    ...posts.map(
      (p) => `- [${p.title}](${site.url}/blog/${p.slug})`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

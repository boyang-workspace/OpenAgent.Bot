import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getPublishedResources, resourcePath } from "@/lib/content/resources";
import { resourceCategoryLabel, resourceSummary } from "@/lib/content/resource-display";

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();
  const posts = await getPublishedBlogPosts();

  const index = {
    name: site.name,
    description: site.description,
    url: site.url,
    resources: resources.map((r) => ({
      name: r.identity.name,
      description: resourceSummary(r),
      category: resourceCategoryLabel(r),
      url: `${site.url}${resourcePath(r)}`,
      json_url: r.machine_readable.json_url,
      markdown_url: r.machine_readable.markdown_url,
      canonical_url: r.machine_readable.canonical_url,
      github_stars: r.facts.github_stars,
      license: r.facts.license,
      open_source: r.decision_signals.open_source,
    })),
    pillar_guides: [
      {
        title: "The Open-Source AI Agent Stack",
        summary:
          "A practical map of open-source AI agents, models, skills, memory systems, plugins, tools, and bots for builders choosing an agent stack.",
        url: `${site.url}/open-source-ai-agent-stack`,
        tags: ["agents", "models", "skills", "memory", "mcp", "evaluation"],
      },
    ],
    guides: posts.map((p) => ({
      title: p.title,
      summary: p.summary,
      url: `${site.url}/blog/${p.slug}`,
      published_at: p.publishedAt,
      tags: p.tags,
    })),
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getPublishedResources, resourcePath } from "@/lib/content/resources";
import {
  resourceCategoryLabel,
  resourceMeta,
  resourceSearchText,
  resourceSignals,
  resourceSummary,
  resourceTags
} from "@/lib/content/resource-display";

export async function GET() {
  const resources = await getPublishedResources();
  const posts = await getPublishedBlogPosts();

  const searchIndex = [
    {
      type: "guide",
      title: "The Open-Source AI Agent Stack",
      summary:
        "A practical map of open-source AI agents, models, skills, memory systems, plugins, tools, and bots for builders choosing an agent stack.",
      href: "/open-source-ai-agent-stack",
      category: "Pillar Guide",
      meta: ["Pillar guide", "Open-source AI agents"],
      signals: ["Agents", "Models", "Memory", "MCP"],
      tags: ["agents", "models", "skills", "memory", "mcp", "evaluation"],
      updatedAt: new Date().toISOString().slice(0, 10),
      searchable:
        "open-source ai agent stack agent frameworks open models skills memory systems plugins mcp tools evaluation coding agents browser agents local-first agents"
    },
    ...resources.map((resource) => ({
      type: "project",
      title: resource.identity.name,
      summary: resourceSummary(resource),
      href: resourcePath(resource),
      category: resourceCategoryLabel(resource),
      meta: resourceMeta(resource),
      signals: resourceSignals(resource, 4),
      tags: resourceTags(resource, 4),
      updatedAt: resource.timestamps.updated_at,
      searchable: resourceSearchText(resource)
    })),
    ...posts.map((post) => ({
      type: "blog",
      title: post.title,
      summary: post.summary,
      href: `/blog/${post.slug}`,
      category: "Guide",
      meta: ["Guide", post.publishedAt],
      signals: [],
      tags: post.tags,
      updatedAt: post.publishedAt,
      searchable: [post.title, post.summary, post.body, post.tags.join(" ")].join(" ").toLowerCase()
    }))
  ];

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}

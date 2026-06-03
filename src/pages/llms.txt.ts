import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { getPublishedBlogPosts } from "@/lib/content/blog";
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
    "## Resources",
    "",
    ...resources.map(
      (r) =>
        `- [${r.identity.name} - ${r.identity.one_liner}](${site.url}${resourcePath(r)})`
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

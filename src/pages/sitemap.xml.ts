import type { APIRoute } from "astro";
import { categories, site } from "@/config/site";
import { getPublishedBlogPosts } from "@/lib/content/blog";
import { getPublishedResources, resourcePath } from "@/lib/content/resources";

const staticPaths = ["/", "/blog", "/evaluations", "/about", "/manifesto", "/submit"];

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();
  const posts = await getPublishedBlogPosts();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...staticPaths.map((path) => ({ path, lastmod: today })),
    ...categories.map((category) => ({ path: `/${category.slug}`, lastmod: today })),
    ...resources.map((resource) => ({
      path: resourcePath(resource),
      lastmod: resource.timestamps.updated_at.slice(0, 10)
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.publishedAt.slice(0, 10)
    }))
  ];

  const xml = urls
    .map(({ path, lastmod }) => {
      const loc = new URL(path, site.url).toString();
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

import type { APIRoute } from "astro";
import { categories, site } from "@/config/site";
import { posts } from "@/data/posts";
import { getPublishedProjects, projectPath } from "@/lib/content/projects";

const staticPaths = ["/", "/blog", "/about", "/manifesto", "/submit"];

export const GET: APIRoute = async () => {
  const projects = await getPublishedProjects();
  const paths = [
    ...staticPaths,
    ...categories.map((category) => `/${category.slug}`),
    ...projects.map((project) => projectPath(project)),
    ...posts.map((post) => `/blog/${post.slug}`)
  ];

  const urls = paths
    .map((path) => {
      const loc = new URL(path, site.url).toString();
      return `<url><loc>${loc}</loc></url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

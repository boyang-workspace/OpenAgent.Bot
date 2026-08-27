import type { APIRoute } from "astro";
import { site } from "@/config/site";
import { getRegistry } from "@/lib/registry/runtime";

const staticPaths = [
  "/",
  "/database",
  "/changes",
  "/rankings",
  "/sources",
  "/methodology",
  "/api",
  "/about",
  "/open-source-ai-agents",
  "/open-source-robots",
  "/open-source-humanoid-robots",
  "/open-source-agent-frameworks",
  "/open-source-vla-models",
  "/compare/openclaw-vs-browser-use-vs-openhands",
  "/compare/langfuse-vs-mlflow",
  "/compare/openclaw-vs-openhands"
];

export const GET: APIRoute = async () => {
  let projects: Array<{ slug: string; updatedAt: string }> = [];
  try {
    const registry = getRegistry();
    let offset = 0;
    let total = 1;
    while (offset < total) {
      const result = await registry.listEntities({ limit: 100, offset });
      projects.push(...result.items.map(({ slug, updatedAt }) => ({ slug, updatedAt })));
      total = result.total;
      offset += result.items.length;
      if (result.items.length === 0) break;
    }
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...staticPaths.map((path) => ({ path, lastmod: today })),
    ...projects.map((project) => ({ path: `/project/${project.slug}`, lastmod: project.updatedAt.slice(0, 10) }))
  ];
  const xml = urls.map(({ path, lastmod }) => `<url><loc>${new URL(path, site.url)}</loc><lastmod>${lastmod}</lastmod></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
};

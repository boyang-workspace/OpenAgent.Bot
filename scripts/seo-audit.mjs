import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const reportRoot = resolve(projectRoot, "reports");
const baseArg = process.argv.find((value) => value.startsWith("--base="));
const base = baseArg ? new URL(baseArg.slice(7)).origin : undefined;
const redirectsText = await readFile(resolve(projectRoot, "public/_redirects"), "utf8");
const redirects = redirectsText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((line) => {
  const [source, destination, status] = line.split(/\s+/);
  return { source, destination, status: Number(status) };
});

const retiredRoutes = [
  { source: "/prototypes", destination: "", expectedStatus: 410, action: "gone", reason: "obsolete prototype surface" },
  { source: "/prototypes/example", destination: "", expectedStatus: 410, action: "gone", reason: "obsolete prototype route family" }
];
const normalizePath = (path) => path === "/" ? "/" : path.replace(/\/+$/, "") || "/";
const redirectSourcePaths = new Set(redirects.filter((rule) => !/[:*]/.test(rule.source)).map((rule) => normalizePath(rule.source)));
const redirectChains = redirects.filter((rule) => redirectSourcePaths.has(normalizePath(rule.destination.split("?")[0])));
const unsafeRedirects = redirects.filter((rule) => rule.status !== 301 || rule.source.startsWith("/admin") || (rule.destination === "/" && !["/home", "/home/"].includes(rule.source)));

const live = {
  canonicalUrls: 0,
  duplicateTitles: [],
  duplicateCanonicals: [],
  brokenCanonicals: [],
  noindexInSitemap: [],
  redirectIssues: [],
  retiredRouteIssues: [],
  invalidStructuredData: [],
  missingStructuredData: [],
  headingIssues: [],
  metadataIssues: [],
  parameterIndexationIssues: [],
  orphanPages: []
};
const actualStatuses = new Map();

function htmlValue(html, pattern) {
  return html.match(pattern)?.[1]?.replaceAll("&amp;", "&") ?? "";
}

function extractPage(html, url) {
  const title = htmlValue(html, /<title>([^<]*)<\/title>/i).trim();
  const description = htmlValue(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i).trim();
  const canonical = htmlValue(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i).trim();
  const robots = htmlValue(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i).toLowerCase();
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  const links = [...html.matchAll(/<a\b[^>]*\shref=["']([^"'#]+)["']/gi)].map((match) => {
    try { return new URL(match[1], url); } catch { return undefined; }
  }).filter(Boolean);
  const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim());
  return { title, description, canonical, robots, h1Count, links, jsonLd };
}

async function fetchManual(url) {
  return fetch(url, { redirect: "manual", headers: { "User-Agent": "OpenAgent-SEO-Audit/1.0" } });
}

function matchesRedirect(actualLocation, expectedDestination, origin) {
  if (!actualLocation) return false;
  const actual = new URL(actualLocation, origin);
  const expected = new URL(expectedDestination, origin);
  return normalizePath(actual.pathname) === normalizePath(expected.pathname) && actual.search === expected.search;
}

function isPaginationHub(url) {
  return normalizePath(url.pathname) === "/database" && url.searchParams.has("page") && [...url.searchParams.keys()].every((key) => key === "page");
}

if (base) {
  const sitemapResponse = await fetch(`${base}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const canonicalPaths = new Set(urls.map((url) => normalizePath(new URL(url).pathname)));
  const inbound = new Map(urls.map((url) => [normalizePath(new URL(url).pathname), new Set()]));
  const crawlHubs = new Set();
  const titleOwners = new Map();
  const canonicalOwners = new Map();
  live.canonicalUrls = urls.length;

  for (let offset = 0; offset < urls.length; offset += 12) {
    await Promise.all(urls.slice(offset, offset + 12).map(async (url) => {
      const response = await fetchManual(url);
      actualStatuses.set(new URL(url).pathname, response.status);
      if (response.status !== 200) {
        live.brokenCanonicals.push({ url, status: response.status });
        return;
      }
      const html = await response.text();
      const page = extractPage(html, url);
      const expected = new URL(url);
      let canonicalUrl;
      try { canonicalUrl = new URL(page.canonical); } catch {}
      if (!canonicalUrl || canonicalUrl.origin !== base || normalizePath(canonicalUrl.pathname) !== normalizePath(expected.pathname) || canonicalUrl.search) {
        live.brokenCanonicals.push({ url, canonical: page.canonical });
      }
      if (page.robots.includes("noindex")) live.noindexInSitemap.push(url);
      if (!page.title || !page.description) live.metadataIssues.push({ url, missing: [!page.title && "title", !page.description && "description"].filter(Boolean) });
      if (page.h1Count !== 1) live.headingIssues.push({ url, h1Count: page.h1Count });
      if (!page.jsonLd.length) live.missingStructuredData.push(url);
      page.jsonLd.forEach((raw, index) => {
        try {
          const parsed = JSON.parse(raw);
          if (JSON.stringify(parsed).match(/localhost|127\.0\.0\.1|\.workers\.dev/i)) live.invalidStructuredData.push({ url, index, reason: "development-hostname" });
        } catch (error) {
          live.invalidStructuredData.push({ url, index, reason: error instanceof Error ? error.message : "invalid-json" });
        }
      });
      if (titleOwners.has(page.title)) live.duplicateTitles.push([titleOwners.get(page.title), url]); else titleOwners.set(page.title, url);
      if (canonicalOwners.has(page.canonical)) live.duplicateCanonicals.push([canonicalOwners.get(page.canonical), url]); else canonicalOwners.set(page.canonical, url);
      for (const link of page.links) {
        const targetPath = normalizePath(link.pathname);
        if (link.origin === base && canonicalPaths.has(targetPath) && targetPath !== normalizePath(expected.pathname)) inbound.get(targetPath)?.add(normalizePath(expected.pathname));
        if (link.origin === base && isPaginationHub(link)) crawlHubs.add(link.toString());
      }
    }));
  }

  const hubQueue = [...crawlHubs];
  const visitedHubs = new Set();
  while (hubQueue.length && visitedHubs.size < 20) {
    const hubUrl = hubQueue.shift();
    if (!hubUrl || visitedHubs.has(hubUrl)) continue;
    visitedHubs.add(hubUrl);
    const response = await fetchManual(hubUrl);
    if (response.status !== 200) continue;
    const page = extractPage(await response.text(), hubUrl);
    for (const link of page.links) {
      const targetPath = normalizePath(link.pathname);
      if (link.origin === base && canonicalPaths.has(targetPath)) inbound.get(targetPath)?.add(normalizePath(new URL(hubUrl).pathname));
      if (link.origin === base && isPaginationHub(link) && !visitedHubs.has(link.toString())) hubQueue.push(link.toString());
    }
  }

  live.orphanPages = [...inbound.entries()].filter(([path, owners]) => path !== "/" && owners.size === 0).map(([path]) => `${base}${path}`);

  const exactRules = redirects.filter((rule) => !/[:*]/.test(rule.source));
  for (const rule of exactRules) {
    const response = await fetchManual(`${base}${rule.source}`);
    const location = response.headers.get("location");
    actualStatuses.set(rule.source, response.status);
    if (response.status !== rule.status || !matchesRedirect(location, rule.destination, base)) {
      live.redirectIssues.push({ legacyUrl: `${base}${rule.source}`, expectedStatus: rule.status, status: response.status, expectedLocation: rule.destination, location });
    } else {
      const targetResponse = await fetchManual(new URL(location, base));
      if (targetResponse.status >= 300 && targetResponse.status < 400) live.redirectIssues.push({ legacyUrl: `${base}${rule.source}`, reason: "redirect-chain", targetStatus: targetResponse.status, location });
    }
  }

  const projectSlug = urls.map((url) => new URL(url).pathname.match(/^\/project\/([a-z0-9-]+)$/)?.[1]).find(Boolean);
  if (projectSlug) {
    for (const family of ["agents", "agent", "models", "model", "bots", "bot", "robots", "robot", "tools", "tool", "skills", "plugins", "memory-systems"]) {
      const legacyUrl = `${base}/${family}/${projectSlug}`;
      const response = await fetchManual(legacyUrl);
      const location = response.headers.get("location");
      if (response.status !== 301 || !matchesRedirect(location, `/project/${projectSlug}`, base)) live.redirectIssues.push({ legacyUrl, status: response.status, location });
    }
  }

  const searchResponse = await fetchManual(`${base}/search?q=openclaw`);
  if (searchResponse.status !== 301 || !matchesRedirect(searchResponse.headers.get("location"), "/database?q=openclaw", base)) {
    live.redirectIssues.push({ legacyUrl: `${base}/search?q=openclaw`, status: searchResponse.status, location: searchResponse.headers.get("location") });
  }

  for (const route of retiredRoutes) {
    const response = await fetchManual(`${base}${route.source}`);
    actualStatuses.set(route.source, response.status);
    if (response.status !== route.expectedStatus) live.retiredRouteIssues.push({ url: `${base}${route.source}`, expectedStatus: route.expectedStatus, status: response.status });
  }

  for (const check of [
    { path: "/database?sort=activity", canonical: "/database" },
    { path: "/database?q=openclaw", canonical: "/database" },
    { path: "/compare?projects=openclaw,openhands", canonical: "/compare" },
    { path: "/changes?page=2", canonical: "/changes" },
    { path: "/usage?kind=app&days=7", canonical: "/usage" }
  ]) {
    const response = await fetchManual(`${base}${check.path}`);
    const page = extractPage(await response.text(), `${base}${check.path}`);
    const canonicalPath = (() => { try { return normalizePath(new URL(page.canonical).pathname); } catch { return ""; } })();
    if (response.status !== 200 || !page.robots.includes("noindex") || canonicalPath !== check.canonical) {
      live.parameterIndexationIssues.push({ url: `${base}${check.path}`, status: response.status, robots: page.robots, canonical: page.canonical });
    }
  }
}

const severeIssues = redirectChains.length + unsafeRedirects.length + live.brokenCanonicals.length + live.duplicateCanonicals.length + live.noindexInSitemap.length + live.redirectIssues.length + live.retiredRouteIssues.length + live.invalidStructuredData.length + live.missingStructuredData.length + live.headingIssues.length + live.metadataIssues.length + live.parameterIndexationIssues.length;
const report = {
  generatedAt: new Date().toISOString(),
  base: base ?? null,
  canonicalUrls: live.canonicalUrls,
  legacyRules: redirects.length,
  retiredRules: retiredRoutes.length,
  redirectChains,
  unsafeRedirects,
  ...live,
  warnings: live.duplicateTitles.length + live.orphanPages.length,
  severeIssues
};

await mkdir(reportRoot, { recursive: true });
await writeFile(resolve(reportRoot, "seo-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
const inventory = [
  ...redirects.map((rule) => ({ legacyUrl: rule.source, status: actualStatuses.get(rule.source) ?? rule.status, currentCanonical: rule.destination, action: "redirect", reason: /:slug|\*/.test(rule.source) ? "legacy route family" : "known legacy URL" })),
  ...retiredRoutes.map((route) => ({ legacyUrl: route.source, status: actualStatuses.get(route.source) ?? route.expectedStatus, currentCanonical: route.destination, action: route.action, reason: route.reason }))
];
const csv = ["legacy-url,status,current-canonical,action,reason", ...inventory.map((row) => [row.legacyUrl, row.status, row.currentCanonical, row.action, row.reason].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))].join("\n");
await writeFile(resolve(reportRoot, "seo-url-migration.csv"), `${csv}\n`);

const blogDirectory = resolve(projectRoot, "src/pages/blog");
const blogFiles = await readdir(blogDirectory).catch(() => []);
const blogInventory = blogFiles.filter((file) => file.endsWith(".astro")).map((file) => ({ url: `/blog/${file.replace(/\.astro$/, "")}`, action: file === "continue-vs-cursor.astro" ? "KEEP" : "REVIEW", reason: file === "continue-vs-cursor.astro" ? "distinct guide; no duplicated mutable metrics" : "manual traffic and quality review required" }));
const blogCsv = ["url,action,reason", ...blogInventory.map((row) => [row.url, row.action, row.reason].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))].join("\n");
await writeFile(resolve(reportRoot, "seo-blog-inventory.csv"), `${blogCsv}\n`);

console.log(`Canonical URLs: ${live.canonicalUrls || "source-only"}`);
console.log(`Legacy redirects: ${redirects.length}`);
console.log(`Retired routes: ${retiredRoutes.length}`);
console.log(`Redirect issues: ${redirectChains.length + unsafeRedirects.length + live.redirectIssues.length + live.retiredRouteIssues.length}`);
console.log(`Duplicate titles: ${live.duplicateTitles.length}`);
console.log(`Duplicate canonicals: ${live.duplicateCanonicals.length}`);
console.log(`Broken canonical pages: ${live.brokenCanonicals.length}`);
console.log(`Noindex URLs in sitemap: ${live.noindexInSitemap.length}`);
console.log(`Structured-data issues: ${live.invalidStructuredData.length + live.missingStructuredData.length}`);
console.log(`Heading/metadata issues: ${live.headingIssues.length + live.metadataIssues.length}`);
console.log(`Parameter indexation issues: ${live.parameterIndexationIssues.length}`);
console.log(`Orphan pages: ${live.orphanPages.length}`);
console.log(`Report: ${resolve(reportRoot, "seo-audit.json")}`);
if (severeIssues) process.exitCode = 1;

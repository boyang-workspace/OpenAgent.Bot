import { site } from "@/config/site";

const canonicalUrl = new URL(site.url);
const productHosts = new Set(["openagent.bot", "www.openagent.bot"]);
const legacyEntitySections = new Set([
  "agents",
  "models",
  "bots",
  "tools",
  "skills",
  "plugins",
  "memory-systems"
]);

const exactLegacyPaths = new Map([
  ["/open-source-agents", "/open-source-ai-agents"],
  ["/blog/openclaw-vs-browser-use-vs-openhands", "/compare/openclaw-vs-browser-use-vs-openhands"],
  ["/blog/langfuse-vs-mlflow", "/compare/langfuse-vs-mlflow"],
  ["/blog/openclaw-vs-openhands", "/compare/openclaw-vs-openhands"],
  ["/project/genesis-world", "/project/genesis"],
  ["/project/genesis-world.json", "/project/genesis.json"],
  ["/project/genesis-world.md", "/project/genesis.md"]
]);

export function canonicalPath(pathname: string): string {
  const normalized = pathname === "/" ? pathname : pathname.replace(/\/+$/, "") || "/";
  const exact = exactLegacyPaths.get(normalized);
  if (exact) return exact;

  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 2 && legacyEntitySections.has(segments[0])) {
    return `/project/${segments[1]}`;
  }

  return normalized;
}

export function canonicalRedirect(requestUrl: string | URL): URL | undefined {
  const url = new URL(requestUrl);
  if (!productHosts.has(url.hostname)) return undefined;

  let changed = false;
  const pathname = canonicalPath(url.pathname);
  if (pathname !== url.pathname) {
    url.pathname = pathname;
    changed = true;
  }

  if (url.protocol !== canonicalUrl.protocol || url.hostname !== canonicalUrl.hostname || url.port !== canonicalUrl.port) {
    url.protocol = canonicalUrl.protocol;
    url.hostname = canonicalUrl.hostname;
    url.port = canonicalUrl.port;
    changed = true;
  }

  return changed ? url : undefined;
}

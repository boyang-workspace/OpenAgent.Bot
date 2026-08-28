import type { EntityConnector, EntitySnapshot } from "./connectors";
import { validateLocator } from "./intake-contract";

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function date(value: unknown): value is string { return typeof value === "string" && Number.isFinite(Date.parse(value)); }

export const githubReleasesConnector: EntityConnector = {
  id: "github-releases",
  async fetchEntity(locator, context = {}): Promise<EntitySnapshot> {
    validateLocator("github-releases", locator);
    const fetcher = context.fetcher ?? fetch;
    const headers = { Accept: "application/vnd.github+json", "User-Agent": "OpenAgentBot-Registry/2.0", ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}) };
    const response = await fetcher(`https://api.github.com/repos/${locator}/releases/latest`, { headers, signal: AbortSignal.timeout(15_000) });
    const observedAt = new Date().toISOString();
    if (response.status === 404) {
      // A missing release is not the same as an inaccessible/deleted repository.
      const repo = await fetcher(`https://api.github.com/repos/${locator}`, { headers, signal: AbortSignal.timeout(15_000) });
      if (!repo.ok) throw new Error(`GitHub repository unavailable (${repo.status}); retaining previous release`);
      return { externalId: locator, locator, canonicalUrl: `https://github.com/${locator}/releases`, observedAt, facts: { "github_release.status": "No published stable release found" }, metrics: {} };
    }
    if (!response.ok) throw new Error(`GitHub releases ${response.status} for ${locator}`);
    const release = await response.json() as Record<string, unknown>;
    assert(typeof release.tag_name === "string" && date(release.published_at) && release.draft === false && release.prerelease === false, "Invalid stable release response");
    assert(typeof release.html_url === "string" && release.html_url.startsWith(`https://github.com/${locator}/releases/tag/`), "Unexpected release URL");
    return {
      externalId: String(release.id), locator, canonicalUrl: release.html_url, observedAt,
      facts: { "github_release.status": "Published stable release", "github_release.latest": { tag: release.tag_name, name: typeof release.name === "string" ? release.name : release.tag_name, publishedAt: release.published_at, url: release.html_url, repository: locator } },
      metrics: { last_release_at: release.published_at }
    };
  }
};

export function npmDownloadWindow(now = new Date()) {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return { start: new Date(midnight - 30 * 86_400_000).toISOString().slice(0,10), end: new Date(midnight - 86_400_000).toISOString().slice(0,10) };
}

export const npmConnector: EntityConnector = {
  id: "npm",
  async fetchEntity(locator, context = {}) {
    validateLocator("npm", locator);
    const fetcher = context.fetcher ?? fetch, encoded = encodeURIComponent(locator);
    const headers = { Accept: "application/json", "User-Agent": "OpenAgentBot-Registry/2.0" };
    const window = npmDownloadWindow();
    const [metadataResponse, downloadResponse] = await Promise.all([
      fetcher(`https://registry.npmjs.org/${encoded}`, { headers, signal: AbortSignal.timeout(15_000) }),
      fetcher(`https://api.npmjs.org/downloads/point/${window.start}:${window.end}/${encoded}`, { headers, signal: AbortSignal.timeout(15_000) })
    ]);
    if (!metadataResponse.ok || !downloadResponse.ok) throw new Error(`npm metadata/downloads ${metadataResponse.status}/${downloadResponse.status} for ${locator}; retaining previous data`);
    const metadata = await metadataResponse.json() as Record<string, any>;
    const downloads = await downloadResponse.json() as Record<string, any>;
    const version = metadata["dist-tags"]?.latest, pkg = metadata.versions?.[version];
    assert(metadata.name === locator && typeof version === "string" && pkg?.version === version && date(metadata.time?.[version]), "Invalid npm package/version response");
    assert(downloads.package === locator && Number.isInteger(downloads.downloads) && downloads.downloads >= 0 && downloads.start === window.start && downloads.end === window.end, "Invalid npm download count/window");
    const url = `https://www.npmjs.com/package/${locator}`;
    return {
      externalId: locator, locator, canonicalUrl: url, observedAt: new Date().toISOString(),
      facts: {
        "npm.package": { name: locator, version, publishedAt: metadata.time[version], license: typeof pkg.license === "string" ? pkg.license : null, deprecated: typeof pkg.deprecated === "string" ? pkg.deprecated : null, url },
        "npm.downloads": { package: locator, downloads: downloads.downloads, ...window, sourceUrl: `https://api.npmjs.org/downloads/point/${window.start}:${window.end}/${encoded}` }
      },
      // Keep package downloads separate from model downloads and repository stars.
      metrics: { npm_downloads_30d: downloads.downloads }
    };
  }
};

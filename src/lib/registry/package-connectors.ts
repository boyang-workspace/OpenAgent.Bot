import type { EntityConnector, EntitySnapshot, ReleaseSnapshot } from "./connectors";
import { validateLocator } from "./intake-contract";

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function date(value: unknown): value is string { return typeof value === "string" && Number.isFinite(Date.parse(value)); }

export const githubReleasesConnector: EntityConnector = {
  id: "github-releases",
  async fetchEntity(locator, context = {}): Promise<EntitySnapshot> {
    validateLocator("github-releases", locator);
    const fetcher = context.fetcher ?? fetch;
    const headers = { Accept: "application/vnd.github+json", "User-Agent": "OpenAgentBot-Registry/2.0", ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}) };
    const response = await fetcher(`https://api.github.com/repos/${locator}/releases?per_page=100&page=1`, { headers, signal: AbortSignal.timeout(20_000) });
    const observedAt = new Date().toISOString();
    if (!response.ok) throw new Error(`GitHub repository releases unavailable (${response.status}); retaining previous release history`);
    const payload = await response.json();
    assert(Array.isArray(payload), "Invalid GitHub release history response");
    const releases: ReleaseSnapshot[] = payload
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)))
      .filter((item) => item.draft === false && typeof item.tag_name === "string" && date(item.published_at)
        && typeof item.html_url === "string" && item.html_url.startsWith(`https://github.com/${locator}/releases/tag/`))
      .map((item) => ({
        upstreamId: String(item.id),
        version: String(item.tag_name),
        title: typeof item.name === "string" && item.name.trim() ? item.name : String(item.tag_name),
        url: String(item.html_url),
        publishedAt: String(item.published_at),
        channel: item.prerelease === true ? "prerelease" : "stable",
        notes: typeof item.body === "string" && item.body.trim() ? item.body.slice(0, 20_000) : undefined,
        metadata: {
          repository: locator,
          author: item.author && typeof item.author === "object" ? (item.author as Record<string, unknown>).login ?? null : null,
          assetCount: Array.isArray(item.assets) ? item.assets.length : 0,
          immutable: item.immutable === true
        }
      }));
    const stable = releases.find((item) => item.channel === "stable");
    const oldest = releases.at(-1);
    return {
      externalId: stable?.upstreamId ?? locator,
      locator,
      canonicalUrl: `https://github.com/${locator}/releases`,
      observedAt,
      facts: {
        "github_release.status": releases.length ? `${releases.length} published releases observed` : "No published GitHub release found",
        ...(stable ? { "github_release.latest": { tag: stable.version, name: stable.title, publishedAt: stable.publishedAt, url: stable.url, repository: locator } } : {}),
        "github_release.history": { count: releases.length, newestPublishedAt: releases[0]?.publishedAt ?? null, oldestPublishedAt: oldest?.publishedAt ?? null, pageLimit: 100 }
      },
      metrics: { last_release_at: stable?.publishedAt ?? null },
      releases
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

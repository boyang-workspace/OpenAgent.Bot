import type { DiscoveryCandidate } from "../../src/lib/content/schema";
import { discoveryKeywords } from "./constants";
import { extractGitHubRepoUrl } from "./utils";

type HnHit = {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  _highlightResult?: unknown;
};

type HnResponse = {
  hits: HnHit[];
};

export async function collectHackerNews(now = new Date()): Promise<DiscoveryCandidate[]> {
  const discoveredAt = now.toISOString();
  const since = Math.floor((now.getTime() - 14 * 24 * 60 * 60 * 1000) / 1000);
  const candidates: DiscoveryCandidate[] = [];

  for (const keyword of discoveryKeywords) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=8`;

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "openagent-bot-discovery" },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`HN request failed (${response.status})`);
      const data = (await response.json()) as HnResponse;

      for (const hit of data.hits ?? []) {
        const title = hit.title ?? hit.story_title;
        if (!title) continue;

        const storyUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const targetUrl = hit.url ?? hit.story_url ?? storyUrl;
        const rawText = `${title}\n${targetUrl}\n${JSON.stringify(hit._highlightResult ?? {})}`;

        candidates.push({
          id: `hackernews:${hit.objectID}`,
          source: "hackernews",
          title,
          url: storyUrl,
          repoUrl: extractGitHubRepoUrl(targetUrl),
          homepageUrl: targetUrl.startsWith("https://github.com/") ? undefined : targetUrl,
          description: title,
          rawText,
          discoveredAt,
          sourceMetrics: {
            hnPoints: hit.points ?? 0,
            hnComments: hit.num_comments ?? 0
          },
          sourceLinks: [storyUrl, targetUrl]
        });
      }
    } catch (error) {
      console.warn(`[discovery] Hacker News query skipped for "${keyword}": ${(error as Error).message}`);
    }
  }

  return candidates;
}

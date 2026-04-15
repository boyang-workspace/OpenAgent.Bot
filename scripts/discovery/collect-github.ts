import type { DiscoveryCandidate } from "../../src/lib/content/schema";
import { discoveryKeywords } from "./constants";
import { githubJson } from "./github";

type GitHubSearchItem = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  license?: { spdx_id?: string; key?: string; name?: string } | null;
};

type GitHubSearchResponse = {
  items: GitHubSearchItem[];
};

export async function collectGitHub(now = new Date()): Promise<DiscoveryCandidate[]> {
  const discoveredAt = now.toISOString();
  const candidates: DiscoveryCandidate[] = [];

  for (const keyword of discoveryKeywords) {
    const query = `${keyword} in:name,description pushed:>2025-01-01`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

    try {
      const data = await githubJson<GitHubSearchResponse>(url);
      for (const item of data.items ?? []) {
        const license = item.license?.spdx_id ?? item.license?.key ?? item.license?.name;
        const rawText = [
          item.description,
          `topics: ${(item.topics ?? []).join(", ")}`,
          license ? `license: ${license}` : undefined,
          `updated: ${item.updated_at}`
        ]
          .filter(Boolean)
          .join("\n");

        candidates.push({
          id: `github:${item.full_name}`,
          source: "github",
          title: item.name,
          url: item.html_url,
          repoUrl: item.html_url,
          homepageUrl: item.homepage || undefined,
          description: item.description ?? undefined,
          rawText,
          discoveredAt,
          sourceMetrics: {
            stars: item.stargazers_count,
            forks: item.forks_count
          },
          sourceLinks: [item.html_url]
        });
      }
    } catch (error) {
      console.warn(`[discovery] GitHub query skipped for "${keyword}": ${(error as Error).message}`);
    }
  }

  return candidates;
}

import type { DiscoveryCandidate } from "../../src/lib/content/schema";
import { githubJson, parseGitHubRepo } from "./github";

type GitHubRepo = {
  full_name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  license?: { spdx_id?: string; key?: string; name?: string } | null;
};

type GitHubReadme = {
  content?: string;
  encoding?: string;
  html_url?: string;
};

function decodeReadme(readme: GitHubReadme): string | undefined {
  if (!readme.content || readme.encoding !== "base64") return undefined;
  return Buffer.from(readme.content, "base64").toString("utf8").slice(0, 5000);
}

export async function enrichCandidate(candidate: DiscoveryCandidate): Promise<DiscoveryCandidate> {
  if (!candidate.repoUrl) return candidate;

  const repo = parseGitHubRepo(candidate.repoUrl);
  if (!repo) return candidate;

  try {
    const metadata = await githubJson<GitHubRepo>(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
    let readmeText: string | undefined;
    let readmeUrl: string | undefined;

    try {
      const readme = await githubJson<GitHubReadme>(`https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`);
      readmeText = decodeReadme(readme);
      readmeUrl = readme.html_url;
    } catch (error) {
      console.warn(`[discovery] README skipped for ${metadata.full_name}: ${(error as Error).message}`);
    }

    const license = metadata.license?.spdx_id ?? metadata.license?.key ?? metadata.license?.name;
    return {
      ...candidate,
      title: candidate.title || repo.repo,
      description: candidate.description ?? metadata.description ?? undefined,
      homepageUrl: candidate.homepageUrl ?? metadata.homepage ?? undefined,
      rawText: [
        candidate.rawText,
        metadata.description,
        `topics: ${(metadata.topics ?? []).join(", ")}`,
        license ? `license: ${license}` : undefined,
        `updated: ${metadata.updated_at}`,
        readmeText
      ]
        .filter(Boolean)
        .join("\n\n"),
      sourceMetrics: {
        ...candidate.sourceMetrics,
        stars: metadata.stargazers_count,
        forks: metadata.forks_count
      },
      sourceLinks: Array.from(new Set([...(candidate.sourceLinks ?? [candidate.url]), candidate.repoUrl, ...(readmeUrl ? [readmeUrl] : [])]))
    };
  } catch (error) {
    console.warn(`[discovery] Enrichment skipped for ${candidate.repoUrl}: ${(error as Error).message}`);
    return candidate;
  }
}

export async function enrichCandidates(candidates: DiscoveryCandidate[], limit = 20): Promise<DiscoveryCandidate[]> {
  const enriched: DiscoveryCandidate[] = [];

  for (const candidate of candidates.slice(0, limit)) {
    enriched.push(await enrichCandidate(candidate));
  }

  return [...enriched, ...candidates.slice(limit)];
}

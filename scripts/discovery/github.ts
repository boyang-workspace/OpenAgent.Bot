type GitHubHeaders = Record<string, string>;

export function githubHeaders(): GitHubHeaders {
  const headers: GitHubHeaders = {
    Accept: "application/vnd.github+json",
    "User-Agent": "openagent-bot-discovery"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export function parseGitHubRepo(repoUrl: string): { owner: string; repo: string } | undefined {
  const match = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/);
  if (!match) return undefined;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function githubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}) for ${url}`);
  }
  return (await response.json()) as T;
}

import { assertPublishable } from "./validation";
import type { Env, ProjectDraft, PublishPrResult } from "./types";

type GitHubRef = {
  object: {
    sha: string;
  };
};

type GitHubPr = {
  html_url: string;
  number: number;
};

type GitHubContentResponse = {
  commit: {
    sha: string;
  };
};

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function github<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const token = env.GITHUB_ADMIN_TOKEN;
  if (!token) throw new Error("GITHUB_ADMIN_TOKEN is not configured.");

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "openagent-bot-admin",
      "x-github-api-version": "2022-11-28",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function createPublishPr(env: Env, draft: ProjectDraft): Promise<PublishPrResult> {
  assertPublishable(draft.content);

  const repo = env.GITHUB_REPO ?? "boyang-workspace/OpenAgent.Bot";
  const baseBranch = env.GITHUB_BASE_BRANCH ?? "main";
  const branch = `admin/publish-project-${draft.slug}-${Date.now()}`;
  const filePath = `content/projects/published/${draft.slug}.json`;
  const content = `${JSON.stringify(draft.content, null, 2)}\n`;

  const baseRef = await github<GitHubRef>(env, `/repos/${repo}/git/ref/heads/${baseBranch}`);
  await github(env, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha
    })
  });

  const write = await github<GitHubContentResponse>(env, `/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Publish ${draft.title} profile`,
      content: encodeBase64(content),
      branch
    })
  });

  const pr = await github<GitHubPr>(env, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Publish ${draft.title} on OpenAgent.bot`,
      head: branch,
      base: baseBranch,
      body: [
        `Admin-generated publish PR for \`${draft.title}\`.`,
        "",
        `- Category: ${draft.category}`,
        `- Slug: ${draft.slug}`,
        `- Source: ${draft.submissionId ? `submission ${draft.submissionId}` : "admin draft"}`,
        "",
        "Review the generated project profile before merging. Merging this PR publishes the static page on the next Cloudflare Pages deploy."
      ].join("\n")
    })
  });

  return {
    url: pr.html_url,
    number: pr.number,
    branch,
    commitSha: write.commit.sha,
    filePath
  };
}

export function publishPreview(draft: ProjectDraft): { filePath: string; content: string; publicPath: string } {
  assertPublishable(draft.content);
  return {
    filePath: `content/projects/published/${draft.slug}.json`,
    content: `${JSON.stringify(draft.content, null, 2)}\n`,
    publicPath: `/${draft.category}/${draft.slug}`
  };
}

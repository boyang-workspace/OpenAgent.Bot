import { assertBlogPublishable } from "./blog-validation";
import type { BlogDraft, Env, PublishNowResult, PublishPrResult } from "./types";

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
  sha: string;
  commit: {
    sha: string;
  };
};

type GitHubContentFile = {
  type: "file";
  sha: string;
};

type GitHubMergeResponse = {
  sha: string;
  merged: boolean;
  message: string;
};

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function repoName(env: Env): string {
  return env.GITHUB_REPO ?? "boyang-workspace/OpenAgent.Bot";
}

function baseBranch(env: Env): string {
  return env.GITHUB_BASE_BRANCH ?? "main";
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

async function getFileSha(env: Env, filePath: string, ref = baseBranch(env)): Promise<string | undefined> {
  const repo = repoName(env);
  const file = await github<GitHubContentFile>(env, `/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`).catch(() => undefined);
  return file?.sha;
}

export function blogPublishPreview(draft: BlogDraft): { operation: string; filePath: string; content: string; publicPath: string } {
  assertBlogPublishable(draft);
  return {
    operation: "publish-blog",
    filePath: `content/blog/published/${draft.slug}.json`,
    content: `${JSON.stringify(draft.content, null, 2)}\n`,
    publicPath: `/blog/${draft.slug}`
  };
}

export async function createBlogPublishPr(env: Env, draft: BlogDraft): Promise<PublishPrResult> {
  const preview = blogPublishPreview(draft);
  const repo = repoName(env);
  const base = baseBranch(env);
  const branch = `admin/publish-blog-${draft.slug}-${Date.now()}`;
  const baseRef = await github<GitHubRef>(env, `/repos/${repo}/git/ref/heads/${base}`);

  await github(env, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha
    })
  });

  const existingSha = await getFileSha(env, preview.filePath, branch);
  const write = await github<GitHubContentResponse>(env, `/repos/${repo}/contents/${preview.filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Publish ${draft.title} blog post`,
      content: encodeBase64(preview.content),
      branch,
      ...(existingSha ? { sha: existingSha } : {})
    })
  });

  const pr = await github<GitHubPr>(env, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Publish ${draft.title} on OpenAgent.bot`,
      head: branch,
      base,
      body: [
        `Admin-generated blog publish PR for \`${draft.title}\`.`,
        "",
        `- Slug: ${draft.slug}`,
        `- Target keyword: ${draft.targetKeyword ?? "unknown"}`,
        `- Search intent: ${draft.searchIntent ?? "unknown"}`,
        "",
        "Review the generated article before merging. Merging this PR publishes the static blog page on the next Cloudflare Pages deploy."
      ].join("\n")
    })
  });

  return {
    url: pr.html_url,
    number: pr.number,
    branch,
    commitSha: write.commit.sha,
    filePath: preview.filePath
  };
}

export async function publishBlogNow(env: Env, draft: BlogDraft): Promise<PublishNowResult> {
  const preview = blogPublishPreview(draft);
  const repo = repoName(env);
  const base = baseBranch(env);
  const branch = `admin/publish-blog-${draft.slug}-${Date.now()}`;
  const baseRef = await github<GitHubRef>(env, `/repos/${repo}/git/ref/heads/${base}`);

  await github(env, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha
    })
  });

  const existingSha = await getFileSha(env, preview.filePath, branch);
  const write = await github<GitHubContentResponse>(env, `/repos/${repo}/contents/${preview.filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Publish ${draft.title} blog post`,
      content: encodeBase64(preview.content),
      branch,
      ...(existingSha ? { sha: existingSha } : {})
    })
  });

  const pr = await github<GitHubPr>(env, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Publish ${draft.title} on OpenAgent.bot`,
      head: branch,
      base,
      body: `Admin one-click blog publish for \`${draft.title}\`.`
    })
  });

  const merge = await github<GitHubMergeResponse>(env, `/repos/${repo}/pulls/${pr.number}/merge`, {
    method: "PUT",
    body: JSON.stringify({
      merge_method: "merge",
      commit_title: `Publish ${draft.title} blog post`
    })
  });

  await github(env, `/repos/${repo}/git/refs/heads/${branch}`, { method: "DELETE" }).catch(() => undefined);

  const liveUrl = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/blog/${draft.slug}`;
  return {
    url: pr.html_url,
    number: pr.number,
    branch,
    commitSha: write.commit.sha,
    filePath: preview.filePath,
    mergedAt: new Date().toISOString(),
    mergeCommitSha: merge.sha,
    liveUrl,
    deployed: await isBlogLive(env, draft)
  };
}

export async function isBlogLive(env: Env, draft: BlogDraft): Promise<boolean> {
  const url = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/blog/${draft.slug}?admin_check=${Date.now()}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { "cache-control": "no-cache" } }).catch(() => undefined);
    if (response?.ok) {
      const text = await response.text().catch(() => "");
      if (text.includes(draft.title)) return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

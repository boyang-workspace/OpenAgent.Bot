import { assertPublishable } from "./validation";
import type { Env, ProjectDraft, ProjectDraftContent, PublishedProject, PublishNowResult, PublishPrResult } from "./types";

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
  content?: string;
  encoding?: string;
  path?: string;
  sha: string;
  commit: {
    sha: string;
  };
};

type GitHubContentFile = {
  type: "file";
  name: string;
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
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

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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

export async function createPublishPr(env: Env, draft: ProjectDraft): Promise<PublishPrResult> {
  assertPublishable(draft.content);

  const repo = repoName(env);
  const base = baseBranch(env);
  const branch = `admin/publish-project-${draft.slug}-${Date.now()}`;
  const filePath = draft.sourceFilePath ?? `content/projects/published/${draft.slug}.json`;
  const content = `${JSON.stringify(draft.content, null, 2)}\n`;

  const baseRef = await github<GitHubRef>(env, `/repos/${repo}/git/ref/heads/${base}`);
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
      branch,
      ...(draft.sourceFilePath ? { sha: await getFileSha(env, filePath, branch) } : {})
    })
  });

  const pr = await github<GitHubPr>(env, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `Publish ${draft.title} on OpenAgent.bot`,
      head: branch,
      base,
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

export function publishPreview(draft: ProjectDraft): { operation: string; filePath: string; content: string; publicPath: string } {
  assertPublishable(draft.content);
  return {
    operation: draft.operation,
    filePath: draft.sourceFilePath ?? `content/projects/published/${draft.slug}.json`,
    content: `${JSON.stringify(draft.content, null, 2)}\n`,
    publicPath: `/${draft.category}/${draft.slug}`
  };
}

async function getFileSha(env: Env, filePath: string, ref = baseBranch(env)): Promise<string> {
  const repo = repoName(env);
  const file = await github<GitHubContentFile>(env, `/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
  return file.sha;
}

async function writeProjectFile(env: Env, draft: ProjectDraft, branch: string): Promise<GitHubContentResponse> {
  const repo = repoName(env);
  const preview = publishPreview(draft);
  const existingSha = draft.operation === "create" && !draft.sourceFilePath ? undefined : await getFileSha(env, preview.filePath, branch);

  return github<GitHubContentResponse>(env, `/repos/${repo}/contents/${preview.filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `${operationLabel(draft.operation)} ${draft.title} profile`,
      content: encodeBase64(preview.content),
      branch,
      ...(existingSha ? { sha: existingSha } : {})
    })
  });
}

function operationLabel(operation: ProjectDraft["operation"]): string {
  if (operation === "delete") return "Delete";
  if (operation === "archive") return "Archive";
  if (operation === "update") return "Update";
  return "Publish";
}

async function deleteProjectFile(env: Env, draft: ProjectDraft, branch: string): Promise<GitHubContentResponse> {
  const repo = repoName(env);
  const preview = publishPreview(draft);
  const existingSha = await getFileSha(env, preview.filePath, branch);

  return github<GitHubContentResponse>(env, `/repos/${repo}/contents/${preview.filePath}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: `Delete ${draft.title} profile`,
      sha: existingSha,
      branch
    })
  });
}

export async function listPublishedProjects(env: Env): Promise<PublishedProject[]> {
  const repo = repoName(env);
  const base = baseBranch(env);
  const files = await github<GitHubContentFile[]>(env, `/repos/${repo}/contents/content/projects/published?ref=${encodeURIComponent(base)}`);
  const projects = await Promise.all(
    files
      .filter((file) => file.type === "file" && file.name.endsWith(".json"))
      .map(async (file) => {
        const detail = await github<GitHubContentFile>(env, `/repos/${repo}/contents/${file.path}?ref=${encodeURIComponent(base)}`);
        const raw = decodeBase64(detail.content ?? "");
        const content = JSON.parse(raw) as ProjectDraftContent;
        return {
          ...content,
          filePath: file.path,
          sha: detail.sha,
          liveUrl: `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/${content.category}/${content.slug}`
        };
      })
  );

  return projects
    .filter((project) => project.status === "published")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title));
}

export async function getPublishedProject(env: Env, slug: string): Promise<PublishedProject | undefined> {
  const projects = await listPublishedProjects(env);
  return projects.find((project) => project.slug === slug);
}

export async function publishNow(env: Env, draft: ProjectDraft): Promise<PublishNowResult> {
  assertPublishable(draft.content);

  const repo = repoName(env);
  const base = baseBranch(env);
  const branch = `admin/${draft.operation}-project-${draft.slug}-${Date.now()}`;
  const baseRef = await github<GitHubRef>(env, `/repos/${repo}/git/ref/heads/${base}`);

  await github(env, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha
    })
  });

  const write = draft.operation === "delete" ? await deleteProjectFile(env, draft, branch) : await writeProjectFile(env, draft, branch);
  const pr = await github<GitHubPr>(env, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `${operationLabel(draft.operation)} ${draft.title} on OpenAgent.bot`,
      head: branch,
      base,
      body: [
        `Admin one-click ${draft.operation} for \`${draft.title}\`.`,
        "",
        `- Category: ${draft.category}`,
        `- Slug: ${draft.slug}`,
        `- Operation: ${draft.operation}`,
        "",
        "This PR was created and merged by the OpenAgent.bot admin workflow."
      ].join("\n")
    })
  });

  const merge = await github<GitHubMergeResponse>(env, `/repos/${repo}/pulls/${pr.number}/merge`, {
    method: "PUT",
    body: JSON.stringify({
      merge_method: "merge",
      commit_title: `${operationLabel(draft.operation)} ${draft.title} on OpenAgent.bot`
    })
  });

  await github(env, `/repos/${repo}/git/refs/heads/${branch}`, { method: "DELETE" }).catch(() => undefined);

  const liveUrl = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/${draft.category}/${draft.slug}`;
  return {
    url: pr.html_url,
    number: pr.number,
    branch,
    commitSha: write.commit.sha,
    filePath: publishPreview(draft).filePath,
    mergedAt: new Date().toISOString(),
    mergeCommitSha: merge.sha,
    liveUrl,
    deployed: await isLive(env, draft)
  };
}

export async function isLive(env: Env, draft: ProjectDraft): Promise<boolean> {
  const url = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/${draft.category}/${draft.slug}?admin_check=${Date.now()}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { "cache-control": "no-cache" } }).catch(() => undefined);
    if (draft.operation === "archive" || draft.operation === "delete") {
      if (response?.status === 404) return true;
    } else if (response?.ok) {
      const text = await response.text().catch(() => "");
      if (text.includes(draft.title)) return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

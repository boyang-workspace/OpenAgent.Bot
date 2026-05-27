import { parseBlogPost } from "./blog";
import type { BlogPost } from "../../data/posts";

export const blogTopicLanes = ["trend", "comparison", "evergreen"] as const;
export const blogTopicStatuses = ["new", "drafted", "ignored"] as const;
export const blogDraftStatuses = ["draft", "ready", "pr_created", "published", "rejected"] as const;
export const blogPublishStatuses = ["pending", "running", "merged", "deploying", "succeeded", "failed"] as const;

export type BlogTopicLane = (typeof blogTopicLanes)[number];
export type BlogTopicStatus = (typeof blogTopicStatuses)[number];
export type BlogDraftStatus = (typeof blogDraftStatuses)[number];
export type BlogPublishStatus = (typeof blogPublishStatuses)[number];

export type BlogTopic = {
  id: string;
  date: string;
  lane: BlogTopicLane;
  title: string;
  angle: string;
  primaryKeyword: string;
  searchIntent: string;
  sourceSignals: string[];
  score: number;
  status: BlogTopicStatus;
  createdAt: string;
  updatedAt: string;
};

export type BlogQualityReport = {
  passed: boolean;
  issues: string[];
  checkedAt: string;
};

export type BlogDraft = {
  id: string;
  topicId?: string;
  slug: string;
  title: string;
  status: BlogDraftStatus;
  content: BlogPost;
  targetKeyword?: string;
  searchIntent?: string;
  sourceLinks: string[];
  qualityReport: BlogQualityReport;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  commitSha?: string;
  publishStatus?: BlogPublishStatus;
  liveUrl?: string;
  lastPublishPreview?: unknown;
  lastError?: string;
  mergedAt?: string;
  mergeCommitSha?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogDraftInput = BlogPost & {
  targetKeyword?: string;
  searchIntent?: string;
  sourceLinks?: string[];
};

export function slugifyBlog(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function parseBlogDraftInput(input: unknown): BlogDraftInput {
  const post = parseBlogPost(input);
  const record = input as Record<string, unknown>;
  if (post.slug !== slugifyBlog(post.slug)) {
    throw new Error("Blog slug must be lowercase URL-safe text.");
  }
  if (!post.tags.length) throw new Error("Blog post must include at least one tag.");
  if (!post.seoTitle) throw new Error("Blog post must include seoTitle.");
  if (!post.seoDescription) throw new Error("Blog post must include seoDescription.");

  const sourceLinks = Array.isArray(record.sourceLinks)
    ? record.sourceLinks.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const targetKeyword = typeof record.targetKeyword === "string" ? record.targetKeyword.trim() : undefined;
  const searchIntent = typeof record.searchIntent === "string" ? record.searchIntent.trim() : undefined;

  return {
    ...post,
    targetKeyword,
    searchIntent,
    sourceLinks
  };
}

function countInternalLinks(body: string): number {
  const matches = body.match(/\]\(\/(?!\/)[^)]+\)/g);
  return new Set(matches ?? []).size;
}

function hasComparisonTable(body: string): boolean {
  return /\|[^|\n]+\|[^|\n]+\|\n\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?/.test(body) || /##\s+Comparison/i.test(body);
}

function hasFaq(body: string): boolean {
  return /##\s+FAQ/i.test(body) && /###\s+/.test(body);
}

export function qualityGateBlogDraft(input: BlogDraftInput | unknown): BlogQualityReport {
  const checkedAt = new Date().toISOString();
  const issues: string[] = [];
  let draft: BlogDraftInput;

  try {
    draft = parseBlogDraftInput(input);
  } catch (caught) {
    return {
      passed: false,
      issues: [caught instanceof Error ? caught.message : "Blog draft is malformed."],
      checkedAt
    };
  }

  if (!draft.targetKeyword) issues.push("Target keyword is required.");
  if (!draft.searchIntent) issues.push("Search intent is required.");
  if ((draft.sourceLinks?.length ?? 0) < 3) issues.push("At least 3 official/source links are required.");
  if (countInternalLinks(draft.body) < 3) issues.push("At least 3 internal OpenAgent links are required.");
  if (!hasComparisonTable(draft.body)) issues.push("A comparison table or structured comparison block is required.");
  if (!hasFaq(draft.body)) issues.push("FAQ section with questions is required.");

  for (const link of draft.sourceLinks ?? []) {
    if (!draft.body.includes(link)) {
      issues.push(`Source link is missing from article body: ${link}`);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    checkedAt
  };
}

export function publicBlogPostFromDraft(input: BlogDraftInput): BlogPost {
  return parseBlogPost({
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    publishedAt: input.publishedAt,
    tags: input.tags,
    author: input.author,
    body: input.body,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription
  });
}

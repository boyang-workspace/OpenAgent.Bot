import { parseBlogDraftInput, publicBlogPostFromDraft, qualityGateBlogDraft } from "../../src/lib/content/blog-automation";
import type { BlogDraft, BlogPostContent, BlogQualityReport, BlogReviewReport } from "./types";

export type BlogDraftPayload = {
  content: BlogPostContent;
  targetKeyword?: string;
  searchIntent?: string;
  sourceLinks: string[];
  qualityReport: BlogQualityReport;
};

export function parseBlogDraftPayload(input: Record<string, unknown>): BlogDraftPayload {
  const draft = parseBlogDraftInput(input);
  const qualityReport = qualityGateBlogDraft(draft);
  return {
    content: publicBlogPostFromDraft(draft),
    targetKeyword: draft.targetKeyword,
    searchIntent: draft.searchIntent,
    sourceLinks: draft.sourceLinks ?? [],
    qualityReport
  };
}

export function buildBlogReviewReport(
  qualityReport: BlogQualityReport,
  options: { approvedByHuman?: boolean; approvedAt?: string } = {}
): BlogReviewReport {
  const blockingIssues = [...qualityReport.issues];
  const warnings = qualityReport.passed ? ["Human editorial review still required before publishing."] : [];
  return {
    summary: qualityReport.passed
      ? "Draft passed the structural quality gate and is ready for editorial approval."
      : "Draft still has blocking issues that must be fixed before approval.",
    blockingIssues,
    warnings,
    checkedAt: qualityReport.checkedAt,
    approvedByHuman: Boolean(options.approvedByHuman),
    approvedAt: options.approvedAt
  };
}

export function assertBlogPublishable(draft: BlogDraft): void {
  if (draft.status !== "ready") {
    throw new Error("Only ready blog drafts can be published.");
  }
  if (!draft.approvedByHuman || !draft.approvedAt) {
    throw new Error("A human must approve the blog draft before publishing.");
  }
  if (!draft.qualityReport.passed) {
    throw new Error(`Blog draft failed quality gate: ${draft.qualityReport.issues.join(" ")}`);
  }
  const parsed = parseBlogDraftPayload({
    ...draft.content,
    targetKeyword: draft.targetKeyword,
    searchIntent: draft.searchIntent,
    sourceLinks: draft.sourceLinks
  });
  if (!parsed.qualityReport.passed) {
    throw new Error(`Blog draft failed quality gate: ${parsed.qualityReport.issues.join(" ")}`);
  }
}

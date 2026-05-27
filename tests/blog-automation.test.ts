import { describe, expect, it } from "vitest";
import { blogPublishPreview } from "../functions/_lib/blog-github";
import { assertBlogPublishable, buildBlogReviewReport } from "../functions/_lib/blog-validation";
import type { BlogDraft } from "../functions/_lib/types";
import { parseBlogDraftInput, qualityGateBlogDraft, slugifyBlog } from "../src/lib/content/blog-automation";

const goodDraft = {
  slug: "best-open-source-browser-agents",
  title: "Best Open-Source Browser Agents",
  summary: "A practical comparison of browser agents for workflow automation.",
  publishedAt: "2026-04-19",
  tags: ["agents", "open-source", "comparison"],
  author: "OpenAgent.bot Editors",
  seoTitle: "Best Open-Source Browser Agents | OpenAgent.bot",
  seoDescription: "Compare open-source browser agents for setup, workflow automation, and safety.",
  targetKeyword: "best open-source browser agents",
  searchIntent: "Readers want a practical comparison before choosing a browser agent.",
  sourceLinks: [
    "https://github.com/browser-use/browser-use",
    "https://github.com/OpenHands/OpenHands",
    "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
  ],
  body: [
    "**Browser agents need comparison by workflow, not demo quality.**",
    "## Quick recommendation",
    "| Need | Start with | Why |",
    "|---|---|---|",
    "| Browser automation | [Agents](/agents) | Compare agent projects |",
    "| Memory context | [Memory systems](/memory-systems) | Check context layers |",
    "| Skills | [Skills](/skills) | Package repeatable procedures |",
    "## Comparison criteria",
    "Compare setup path, action surface, and review controls before trying the workflow.",
    "## Source checks",
    "[browser-use](https://github.com/browser-use/browser-use), [OpenHands](https://github.com/OpenHands/OpenHands), and [Google guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) are primary checks.",
    "## FAQ",
    "### What should I compare first?",
    "Start with setup, action surface, and review controls."
  ].join("\n\n")
};

describe("blog automation", () => {
  it("normalizes blog slugs", () => {
    expect(slugifyBlog("OpenClaw vs browser-use!")).toBe("openclaw-vs-browser-use");
  });

  it("accepts a complete generated blog draft", () => {
    const parsed = parseBlogDraftInput(goodDraft);
    const report = qualityGateBlogDraft(parsed);

    expect(parsed.slug).toBe(goodDraft.slug);
    expect(report.passed).toBe(true);
    expect(report.issues).toEqual([]);
  });

  it("rejects thin drafts missing quality requirements", () => {
    const report = qualityGateBlogDraft({
      ...goodDraft,
      sourceLinks: ["https://github.com/browser-use/browser-use"],
      targetKeyword: "",
      body: "Short note without links or FAQ."
    });

    expect(report.passed).toBe(false);
    expect(report.issues).toContain("Target keyword is required.");
    expect(report.issues).toContain("At least 3 official/source links are required.");
    expect(report.issues).toContain("At least 3 internal OpenAgent links are required.");
    expect(report.issues).toContain("A comparison table or structured comparison block is required.");
    expect(report.issues).toContain("FAQ section with questions is required.");
  });

  it("builds a publish preview for blog drafts", () => {
    const draft: BlogDraft = {
      id: "draft_1",
      slug: goodDraft.slug,
      title: goodDraft.title,
      status: "ready",
      content: goodDraft,
      targetKeyword: goodDraft.targetKeyword,
      searchIntent: goodDraft.searchIntent,
      sourceLinks: goodDraft.sourceLinks,
      qualityReport: qualityGateBlogDraft(goodDraft),
      reviewReport: buildBlogReviewReport(qualityGateBlogDraft(goodDraft), {
        approvedByHuman: true,
        approvedAt: "2026-04-19T00:00:00.000Z"
      }),
      approvedByHuman: true,
      approvedAt: "2026-04-19T00:00:00.000Z",
      approvedByActor: "human",
      createdAt: "2026-04-19T00:00:00.000Z",
      updatedAt: "2026-04-19T00:00:00.000Z"
    };

    const preview = blogPublishPreview(draft);

    expect(preview.filePath).toBe("content/blog/published/best-open-source-browser-agents.json");
    expect(preview.publicPath).toBe("/blog/best-open-source-browser-agents");
    expect(preview.content).toContain(goodDraft.title);
  });

  it("requires human approval before publishing", () => {
    const draft: BlogDraft = {
      id: "draft_2",
      slug: goodDraft.slug,
      title: goodDraft.title,
      status: "ready",
      content: goodDraft,
      targetKeyword: goodDraft.targetKeyword,
      searchIntent: goodDraft.searchIntent,
      sourceLinks: goodDraft.sourceLinks,
      qualityReport: qualityGateBlogDraft(goodDraft),
      reviewReport: buildBlogReviewReport(qualityGateBlogDraft(goodDraft)),
      approvedByHuman: false,
      createdAt: "2026-04-19T00:00:00.000Z",
      updatedAt: "2026-04-19T00:00:00.000Z"
    };

    expect(() => assertBlogPublishable(draft)).toThrow("A human must approve the blog draft before publishing.");
  });
});

import { describe, expect, it } from "vitest";
import { assertPublishable, defaultDraftContent, parseDraftContent, slugify } from "../functions/_lib/validation";

describe("admin CMS validation", () => {
  it("creates stable slugs for admin publish files", () => {
    expect(slugify(" Browser Use: AI Agent! ")).toBe("browser-use-ai-agent");
  });

  it("builds a draft from a submission", () => {
    const draft = defaultDraftContent({
      projectName: "Browser Use",
      repoUrl: "https://github.com/browser-use/browser-use",
      homepageUrl: "https://browser-use.com",
      category: "skills",
      summary: "Open-source browser automation for AI agents."
    });

    expect(draft.slug).toBe("browser-use");
    expect(draft.sourceLinks).toContain("https://github.com/browser-use/browser-use");
    expect(draft.status).toBe("published");
  });

  it("normalizes editor input into publishable project JSON", () => {
    const content = parseDraftContent({
      slug: "Browser Use",
      title: "Browser Use",
      category: "skills",
      oneLiner: "Open-source browser automation for AI agents.",
      summary: "A practical browser automation toolkit.",
      whyItMatters: "Agents need reliable browser workflows.",
      bestFor: "Browser agents, QA automation",
      tags: "browser, agents",
      repoUrl: "https://github.com/browser-use/browser-use/",
      seoTitle: "Browser Use: Open-source browser automation",
      seoDescription: "A concise editorial profile of Browser Use for open-source AI builders.",
      shareTitle: "Browser Use on OpenAgent.bot",
      shareDescription: "Open-source browser automation for AI agents.",
      sourceLinks: ""
    });

    expect(content.slug).toBe("browser-use");
    expect(content.bestFor).toEqual(["Browser agents", "QA automation"]);
    expect(content.repoUrl).toBe("https://github.com/browser-use/browser-use");
    expect(() => assertPublishable(content)).not.toThrow();
  });

  it("blocks drafts without a source URL", () => {
    const content = parseDraftContent({
      slug: "no-source",
      title: "No Source",
      category: "tools",
      oneLiner: "A project without links.",
      summary: "A project without links.",
      whyItMatters: "It should not publish without evidence.",
      bestFor: "Testing",
      seoTitle: "No Source",
      seoDescription: "A draft without any source URL should fail publishing.",
      shareTitle: "No Source",
      shareDescription: "A project without links."
    });

    expect(() => assertPublishable(content)).toThrow(/repository URL or homepage URL/);
  });
});

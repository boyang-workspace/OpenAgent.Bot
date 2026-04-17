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
      tags: "browser, automation",
      repoUrl: "https://github.com/browser-use/browser-use/",
      seoTitle: "Browser Use: Open-source browser automation",
      seoDescription: "A concise editorial profile of Browser Use for open-source AI builders.",
      shareTitle: "Browser Use on OpenAgent.bot",
      shareDescription: "Open-source browser automation for AI agents.",
      sourceLinks: "",
      coreStrengths: JSON.stringify([
        {
          title: "Browser control",
          description: "Turns browser actions into repeatable agent steps.",
          whyItMatters: "Helpful when an agent needs to use websites rather than APIs."
        }
      ]),
      useCaseNotes: JSON.stringify([{ title: "QA automation", description: "Run browser tasks that need agent judgment." }]),
      compareNotes: JSON.stringify([{ title: "When to use it", summary: "Use it when browser operation is the workflow bottleneck." }]),
      gettingStarted: JSON.stringify([{ label: "GitHub", url: "https://github.com/browser-use/browser-use", type: "github" }]),
      thumbnailBrief: JSON.stringify({ visualMotif: "browser command blocks", avoid: ["noisy poster"] })
    });

    expect(content.slug).toBe("browser-use");
    expect(content.bestFor).toEqual(["Browser agents", "QA automation"]);
    expect(content.coreStrengths?.[0]?.title).toBe("Browser control");
    expect(content.gettingStarted?.[0]?.type).toBe("github");
    expect(content.repoUrl).toBe("https://github.com/browser-use/browser-use");
    expect(() => assertPublishable(content)).not.toThrow();
  });

  it("rejects malformed editorial JSON fields", () => {
    expect(() =>
      parseDraftContent({
        slug: "bad-editorial",
        title: "Bad Editorial",
        category: "tools",
        oneLiner: "A draft with malformed editorial JSON.",
        summary: "A draft with malformed editorial JSON.",
        whyItMatters: "It should fail before publishing.",
        bestFor: "Testing",
        tags: "tool, automation, open-source, developer-workflow",
        repoUrl: "https://github.com/example/example",
        seoTitle: "Bad Editorial",
        seoDescription: "A malformed editorial JSON payload should fail validation.",
        shareTitle: "Bad Editorial",
        shareDescription: "A malformed editorial JSON payload.",
        coreStrengths: "{not json"
      })
    ).toThrow(/valid JSON/);
  });

  it("rejects unsupported getting started link types", () => {
    expect(() =>
      parseDraftContent({
        slug: "bad-link-type",
        title: "Bad Link Type",
        category: "tools",
        oneLiner: "A draft with a bad getting started link type.",
        summary: "A draft with a bad getting started link type.",
        whyItMatters: "It should keep outbound links typed.",
        bestFor: "Testing",
        tags: "tool, automation, open-source, developer-workflow",
        repoUrl: "https://github.com/example/example",
        seoTitle: "Bad Link Type",
        seoDescription: "Unsupported getting started link types should fail validation.",
        shareTitle: "Bad Link Type",
        shareDescription: "Unsupported getting started link types.",
        gettingStarted: JSON.stringify([{ label: "Open", url: "https://example.com", type: "blog" }])
      })
    ).toThrow(/unsupported link type/);
  });

  it("rejects unsupported free-form tags", () => {
    expect(() =>
      parseDraftContent({
        slug: "made-up-tags",
        title: "Made Up Tags",
        category: "tools",
        oneLiner: "A draft with unsupported taxonomy tags.",
        summary: "A draft with unsupported taxonomy tags.",
        whyItMatters: "It should keep published tags controlled.",
        bestFor: "Testing",
        tags: "totally-random",
        repoUrl: "https://github.com/example/example",
        seoTitle: "Made Up Tags",
        seoDescription: "A draft with unsupported taxonomy tags should fail validation.",
        shareTitle: "Made Up Tags",
        shareDescription: "A draft with unsupported taxonomy tags."
      })
    ).toThrow(/unsupported tags/);
  });

  it("requires publishable drafts to satisfy Resource v1 tag groups", () => {
    const content = parseDraftContent({
      slug: "no-resource-tags",
      title: "No Resource Tags",
      category: "tools",
      oneLiner: "A draft without enough controlled taxonomy tags.",
      summary: "A draft without enough controlled taxonomy tags.",
      whyItMatters: "Published resource pages need stable tag groups.",
      bestFor: "Testing",
      repoUrl: "https://github.com/example/example",
      seoTitle: "No Resource Tags",
      seoDescription: "A draft without controlled tags should fail Resource v1 validation.",
      shareTitle: "No Resource Tags",
      shareDescription: "A draft without controlled tags."
    });

    expect(() => assertPublishable(content)).toThrow(/Resource v1/);
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

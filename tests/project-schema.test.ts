import { describe, expect, it } from "vitest";
import { parseOpenProject } from "../src/lib/content/schema";

describe("open project schema", () => {
  it("accepts a complete draft project", () => {
    const project = parseOpenProject({
      slug: "browser-use",
      title: "browser-use",
      oneLiner: "Open-source browser automation for AI agents.",
      summary: "browser-use helps agents inspect pages and complete web workflows.",
      whyItMatters: "Browser automation is one of the most useful agent capabilities.",
      bestFor: ["Agent builders", "Browser automation"],
      category: "agents",
      tags: ["browser", "automation"],
      repoUrl: "https://github.com/browser-use/browser-use",
      license: "MIT",
      sourceLinks: ["https://github.com/browser-use/browser-use"],
      seoTitle: "browser-use: Open-source browser automation for AI agents",
      seoDescription: "A concise editorial profile of browser-use for agent builders.",
      shareTitle: "browser-use on OpenAgent.bot",
      shareDescription: "Open-source browser automation for AI agents.",
      status: "draft",
      generatedAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15",
      openSourceStatus: "open-source",
      isFeatured: false,
      isSponsored: false
    });

    expect(project.slug).toBe("browser-use");
  });

  it("rejects invalid categories", () => {
    expect(() =>
      parseOpenProject({
        slug: "bad",
        title: "Bad",
        oneLiner: "Bad project",
        summary: "Bad project",
        whyItMatters: "Bad project",
        bestFor: ["Nobody"],
        category: "bad-category",
        tags: [],
        sourceLinks: [],
        seoTitle: "Bad",
        seoDescription: "Bad",
        shareTitle: "Bad",
        shareDescription: "Bad",
        status: "draft",
        generatedAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15",
        openSourceStatus: "unknown",
        isFeatured: false,
        isSponsored: false
      })
    ).toThrow();
  });
});

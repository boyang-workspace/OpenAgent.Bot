import { describe, expect, it } from "vitest";
import { buildTopicWarnings, generateDebugOutline, generateDraftFromTopic } from "../functions/_lib/blog-workbench";

describe("blog workbench helpers", () => {
  it("warns about duplicate topics without blocking manual overrides", () => {
    const warnings = buildTopicWarnings(
      {
        sourceType: "manual",
        manualOverride: true,
        title: "Open-source AI memory systems compared",
        primaryKeyword: "open-source AI memory systems"
      },
      [{ id: "peer-1", title: "Open-source AI memory systems compared", primaryKeyword: "open-source AI memory systems" }]
    );

    expect(warnings).toContain("Another topic already has the same title.");
    expect(warnings).toContain("Another topic already targets the same keyword.");
    expect(warnings).toContain("Manual override enabled. Duplicate warnings will not block draft generation.");
  });

  it("builds a deterministic outline from the active template", () => {
    const outline = generateDebugOutline(
      ["# Template", "- Quick recommendation", "- Comparison criteria", "- FAQ"].join("\n"),
      {
        title: "Local-first AI agents: what builders should evaluate",
        angle: "Explain local-first tradeoffs for builders.",
        primaryKeyword: "local-first AI agents"
      }
    );

    expect(outline.sections).toEqual(["Quick recommendation", "Comparison criteria", "FAQ"]);
  });

  it("keeps debug draft generation sandboxed to preview content", () => {
    const preview = generateDraftFromTopic(
      {
        title: "What MCP means for open AI workflows",
        date: "2026-04-23",
        lane: "evergreen",
        angle: "Explain MCP as a practical integration layer.",
        primaryKeyword: "MCP open AI workflows",
        searchIntent: "Readers want a practical MCP guide.",
        sourceSignals: ["https://example.com/mcp"]
      },
      ["# Template", "- Quick recommendation", "- FAQ"].join("\n")
    );

    expect(preview.slug).toBe("what-mcp-means-for-open-ai-workflows");
    expect(preview.body).toContain("## Quick recommendation");
    expect(preview.body).toContain("## FAQ");
    expect(preview.body).toContain("[source](https://example.com/mcp)");
  });
});

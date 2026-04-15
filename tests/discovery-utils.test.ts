import { describe, expect, it } from "vitest";
import { classifyCategory, extractGitHubRepoUrl, mergeCandidates, scoreCandidate, slugify } from "../scripts/discovery/utils";
import type { DiscoveryCandidate } from "../src/lib/content/schema";

const baseCandidate = {
  id: "github:example/tool",
  source: "github",
  title: "Example Agent Memory",
  url: "https://github.com/example/tool",
  repoUrl: "https://github.com/example/tool",
  description: "Open-source memory layer for AI agents",
  rawText: "Install this memory layer for LangGraph agents. MIT License.",
  discoveredAt: "2026-04-15T00:00:00.000Z",
  sourceMetrics: {
    stars: 1200,
    forks: 80,
    recentStars: 40
  }
} satisfies DiscoveryCandidate;

describe("discovery utilities", () => {
  it("creates stable slugs for project names", () => {
    expect(slugify("browser-use: AI Browser Agent!")).toBe("browser-use-ai-browser-agent");
    expect(slugify("  llama.cpp  ")).toBe("llama-cpp");
  });

  it("extracts normalized GitHub repo URLs from text", () => {
    expect(extractGitHubRepoUrl("Try https://github.com/browser-use/browser-use today")).toBe(
      "https://github.com/browser-use/browser-use"
    );
    expect(extractGitHubRepoUrl("No repo here")).toBeUndefined();
  });

  it("classifies memory, agent, model, skill, plugin, and tool candidates", () => {
    expect(classifyCategory("Agent memory layer", "Long-term context retrieval for AI agents")).toBe("memory-systems");
    expect(classifyCategory("Browser agent", "Automates web tasks")).toBe("agents");
    expect(classifyCategory("Open model runtime", "Local LLM inference")).toBe("models");
    expect(classifyCategory("MCP server", "Connectors and plugins")).toBe("plugins");
    expect(classifyCategory("Reusable AI skill", "Skill workflow for Codex")).toBe("skills");
    expect(classifyCategory("Open WebUI", "Self-hosted chat interface")).toBe("tools");
  });

  it("merges duplicate candidates from multiple sources by repo URL", () => {
    const merged = mergeCandidates([
      baseCandidate,
      {
        ...baseCandidate,
        id: "hackernews:123",
        source: "hackernews",
        url: "https://news.ycombinator.com/item?id=123",
        sourceMetrics: { hnPoints: 80, hnComments: 22 }
      }
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].sourceLinks).toEqual([
      "https://github.com/example/tool",
      "https://news.ycombinator.com/item?id=123"
    ]);
    expect(merged[0].sourceMetrics.hnPoints).toBe(80);
  });

  it("scores active open-source AI projects above the draft threshold", () => {
    const scored = scoreCandidate(baseCandidate);

    expect(scored.score).toBeGreaterThanOrEqual(75);
    expect(scored.reasons).toContain("repo and license signals");
    expect(scored.reasons).toContain("strong AI relevance");
  });
});

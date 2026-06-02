import { describe, expect, it } from "vitest";
import {
  formatResourceLabel,
  resourceCategoryLabel,
  resourceImage,
  resourceMeta,
  resourceSearchText,
  resourceSignals,
  resourceSummary,
  resourceTags
} from "../src/lib/content/resource-display";
import type { ResourceV1 } from "../src/lib/content/resource-schema";

const baseResource: ResourceV1 = {
  schema_version: "openagent.resource.v1",
  id: "res_test",
  slug: "test",
  status: "published",
  identity: {
    name: "Test",
    one_liner: "Test one-liner",
    short_description: "Test short description."
  },
  classification: {
    resource_type: "tool",
    primary_category: "tools"
  },
  positioning: {
    best_for: ["developers"],
    use_cases: ["testing"]
  },
  decision_signals: {
    open_source: true,
    local_first: true,
    self_hostable: true,
    supports_mcp: true,
    has_api: true
  },
  facts: {
    license: "MIT",
    github_stars: 12345,
    github_repo_full_name: "openagents/test",
    last_verified_at: "2026-06-02T00:00:00.000Z"
  },
  capabilities: {
    core_capabilities: ["automation"],
    integrations: ["github"]
  },
  links: { primary_url: "https://example.com", items: [] },
  media: {},
  tags: {
    category: ["tool"],
    capability: ["automation"],
    constraint: ["open-source"],
    scenario: ["testing"]
  },
  relationships: {},
  machine_readable: {
    canonical_url: "https://www.openagent.bot/tools/test",
    json_url: "https://www.openagent.bot/tools/test.json",
    markdown_url: "https://www.openagent.bot/tools/test.md"
  },
  timestamps: {
    created_at: "2026-06-02T00:00:00.000Z",
    updated_at: "2026-06-02T00:00:00.000Z"
  }
};

describe("resource display helpers", () => {
  it("uses category label for known slugs and falls back to formatted text", () => {
    expect(resourceCategoryLabel(baseResource)).toBe("Tools");
    const other: ResourceV1 = { ...baseResource, classification: { ...baseResource.classification, primary_category: "memory-systems" as ResourceV1["classification"]["primary_category"] } };
    expect(resourceCategoryLabel(other)).toBe("Memory Systems");
  });

  it("prefers one_liner for summary", () => {
    expect(resourceSummary(baseResource)).toBe("Test one-liner");
    const noOneLiner: ResourceV1 = { ...baseResource, identity: { ...baseResource.identity, one_liner: "" } };
    expect(resourceSummary(noOneLiner)).toBe("Test short description.");
  });

  it("falls back through media, then GitHub avatar, then category fallback", () => {
    const withThumb: ResourceV1 = { ...baseResource, media: { ...baseResource.media, thumbnail_url: "https://cdn.example.com/x.png" } };
    expect(resourceImage(withThumb)).toBe("https://cdn.example.com/x.png");
    const withOg: ResourceV1 = { ...baseResource, media: { ...baseResource.media, og_image_url: "https://cdn.example.com/y.png" } };
    expect(resourceImage(withOg)).toBe("https://cdn.example.com/y.png");
    expect(resourceImage(baseResource)).toBe("https://github.com/openagents.png");
    const noRepo: ResourceV1 = { ...baseResource, facts: {} };
    expect(resourceImage(noRepo)).toBe("/resource-fallbacks/tools.svg");
  });

  it("deduplicates tags, capabilities, and constraints", () => {
    const tags = resourceTags(baseResource, 5);
    expect(tags).toContain("automation");
    expect(new Set(tags).size).toBe(tags.length);
  });

  it("builds signals from decision_signals and dedupes", () => {
    const signals = resourceSignals(baseResource, 8);
    expect(signals).toContain("Open source");
    expect(signals).toContain("Local first");
    expect(signals).toContain("Self-hosted");
    expect(signals).toContain("MCP");
    expect(signals).toContain("API");
    expect(new Set(signals).size).toBe(signals.length);
  });

  it("builds meta array with available facts only", () => {
    const meta = resourceMeta(baseResource);
    expect(meta).toContain("Tools");
    expect(meta).toContain("MIT");
    expect(meta).toContain("12,345 stars");
    expect(meta[0]).toBe("Tools");
  });

  it("builds a lowercased searchable text blob", () => {
    const text = resourceSearchText(baseResource);
    expect(text).toContain("test");
    expect(text).toContain("test one-liner");
    expect(text).toContain("automation");
    expect(text).toContain("open-source");
    expect(text).toBe(text.toLowerCase());
  });

  it("formats slugs into human-readable labels", () => {
    expect(formatResourceLabel("memory_system")).toBe("memory system");
    expect(formatResourceLabel("mcp-inspector")).toBe("mcp inspector");
  });
});

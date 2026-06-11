import { describe, expect, it } from "vitest";
import { openProjectToResourceV1, resourceV1ToOpenProject } from "../src/lib/content/resource-converters";
import { parseResourceV1 } from "../src/lib/content/resource-schema";
import type { OpenProject } from "../src/lib/content/schema";

function buildProject(overrides: Partial<OpenProject> = {}): OpenProject {
  return {
    slug: "demo-tool",
    title: "Demo Tool",
    oneLiner: "A demo open-source developer tool for testing.",
    summary: "A demo open-source developer tool used by OpenAgent.bot tests.",
    whyItMatters: "Useful for verifying the adapter output.",
    bestFor: ["Teams validating the adapter"],
    notFor: ["End users looking for a polished product"],
    category: "tools",
    tags: ["tool", "self-hosted", "mcp"],
    repoUrl: "https://github.com/example/demo-tool",
    homepageUrl: "https://demo.example.com",
    docsUrl: "https://docs.demo.example.com",
    license: "MIT",
    maintainer: "Example",
    sourceLinks: ["https://github.com/example/demo-tool"],
    seoTitle: "Demo Tool: open-source developer tool",
    seoDescription: "Demo Tool profile for testing the OpenAgent.bot adapter.",
    shareTitle: "Demo Tool on OpenAgent.bot",
    shareDescription: "A demo open-source developer tool for testing.",
    status: "published",
    generatedAt: "2026-06-02T00:00:00.000Z",
    reviewedAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02",
    openSourceStatus: "open-source",
    isFeatured: false,
    isSponsored: false,
    sourceMetrics: { stars: 1234, forks: 56 },
    ...overrides
  };
}

describe("openProjectToResourceV1", () => {
  it("maps an editable project draft into a valid ResourceV1", () => {
    const project = buildProject();
    const resource = openProjectToResourceV1(project);

    expect(resource.schema_version).toBe("openagent.resource.v1");
    expect(resource.slug).toBe("demo-tool");
    expect(resource.classification.primary_category).toBe("tools");
    expect(resource.classification.resource_type).toBe("tool");
    expect(resource.decision_signals.open_source).toBe(true);
    expect(resource.facts.github_stars).toBe(1234);
    expect(resource.facts.github_repo_full_name).toBe("example/demo-tool");
    expect(resource.machine_readable.canonical_url).toBe("https://www.openagent.bot/tools/demo-tool");
    expect(resource.machine_readable.json_url).toBe("https://www.openagent.bot/tools/demo-tool.json");
    expect(resource.machine_readable.markdown_url).toBe("https://www.openagent.bot/tools/demo-tool.md");
  });

  it("treats source-available and unknown as non-open-source", () => {
    const sourceAvailable = openProjectToResourceV1(buildProject({ openSourceStatus: "source-available" }));
    const unknown = openProjectToResourceV1(buildProject({ openSourceStatus: "unknown" }));
    expect(sourceAvailable.decision_signals.open_source).toBe(false);
    expect(unknown.decision_signals.open_source).toBe(false);
    expect(sourceAvailable.facts.pricing_model).toBe("free");
    expect(unknown.facts.pricing_model).toBe("unknown");
  });

  it("falls back to a generated SEO article when none is provided", () => {
    const resource = openProjectToResourceV1(buildProject());
    expect(resource.editorial?.seo_article?.what_it_is).toContain("listed on OpenAgent.bot");
    expect(resource.editorial?.seo_article?.intro).toContain("demo open-source developer tool");
  });

  it("round-trips the editable project draft shape from ResourceV1", () => {
    const project = buildProject();
    const resource = parseResourceV1(openProjectToResourceV1(project));
    const draft = resourceV1ToOpenProject(resource);

    expect(draft.slug).toBe(project.slug);
    expect(draft.title).toBe(project.title);
    expect(draft.category).toBe(project.category);
    expect(draft.repoUrl).toBe(project.repoUrl);
    expect(draft.sourceMetrics?.stars).toBe(1234);
  });
});

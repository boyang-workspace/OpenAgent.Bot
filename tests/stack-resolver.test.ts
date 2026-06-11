import { describe, expect, it } from "vitest";
import { permissionSurface, resolveStack } from "../src/lib/recommendations/stack-resolver";
import type { ResourceV1 } from "../src/lib/content/resource-schema";

function resource(overrides: Partial<ResourceV1>): ResourceV1 {
  return {
    schema_version: "openagent.resource.v1",
    id: `res_${overrides.slug ?? "demo"}`,
    slug: overrides.slug ?? "demo",
    status: "published",
    identity: {
      name: overrides.identity?.name ?? "Demo",
      one_liner: overrides.identity?.one_liner ?? "Demo resource.",
      short_description: overrides.identity?.short_description
    },
    classification: overrides.classification ?? {
      resource_type: "agent",
      primary_category: "agents"
    },
    positioning: overrides.positioning ?? {
      best_for: ["Agent builders"],
      maturity: "active"
    },
    decision_signals: overrides.decision_signals ?? {
      open_source: true,
      self_hostable: true
    },
    facts: overrides.facts ?? {
      license: "MIT",
      github_stars: 1000,
      last_verified_at: "2026-06-01"
    },
    capabilities: overrides.capabilities ?? {
      core_capabilities: ["browser-automation"]
    },
    links: overrides.links ?? {
      primary_url: "https://github.com/example/demo",
      items: [{ type: "github", label: "GitHub", url: "https://github.com/example/demo" }]
    },
    media: overrides.media ?? {},
    tags: overrides.tags ?? {
      category: ["agent"],
      capability: ["browser-automation"],
      constraint: ["open-source", "self-hosted"],
      scenario: ["browser-agent"]
    },
    relationships: overrides.relationships ?? {},
    machine_readable: overrides.machine_readable ?? {
      canonical_url: "https://www.openagent.bot/agents/demo",
      json_url: "https://www.openagent.bot/agents/demo.json",
      markdown_url: "https://www.openagent.bot/agents/demo.md"
    },
    timestamps: overrides.timestamps ?? {
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z",
      published_at: "2026-06-01T00:00:00.000Z"
    },
    ...overrides
  };
}

describe("stack resolver", () => {
  it("recommends role-covered tools for a browser automation request", () => {
    const stack = resolveStack([
      resource({ slug: "browser-agent", identity: { name: "Browser Agent", one_liner: "Browser automation for agents." } }),
      resource({
        slug: "memory",
        identity: { name: "Memory", one_liner: "Memory for agents." },
        classification: { resource_type: "memory_system", primary_category: "memory-systems" },
        capabilities: { core_capabilities: ["memory"] },
        tags: { category: ["memory-system"], capability: ["memory"], constraint: ["open-source"], scenario: ["personal-memory"] }
      })
    ], { workflow: "browser-automation", constraints: ["open-source", "human-approval"] });

    expect(stack.id).toBe("browser-automation");
    expect(stack.recommended_tools.length).toBeGreaterThan(0);
    expect(stack.recommended_tools[0].reasons.length).toBeGreaterThan(0);
    expect(stack.first_test).toContain("website flow");
  });

  it("detects permission surfaces from resource metadata", () => {
    const surface = permissionSurface(resource({
      identity: { name: "Coding CLI", one_liner: "CLI coding agent with browser and memory." },
      tags: {
        category: ["agent"],
        capability: ["browser-automation", "memory"],
        constraint: ["open-source"],
        scenario: ["coding-agent"]
      }
    }));

    expect(surface).toContain("browser");
    expect(surface).toContain("shell/files");
    expect(surface).toContain("memory");
  });
});

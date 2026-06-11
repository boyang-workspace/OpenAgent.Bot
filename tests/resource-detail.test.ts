import { describe, expect, it } from "vitest";
import { buildResourceDetailProfile } from "../src/lib/content/resource-detail";
import { parseResourceV1, type ResourceV1 } from "../src/lib/content/resource-schema";

function resource(overrides: Partial<ResourceV1> = {}): ResourceV1 {
  return {
    schema_version: "openagent.resource.v1",
    id: "res_demo",
    slug: "demo",
    status: "published",
    identity: {
      name: "Demo Agent",
      one_liner: "Open-source browser and coding agent.",
      short_description: "Demo Agent helps builders automate browser and coding workflows."
    },
    classification: {
      resource_type: "agent",
      primary_category: "agents",
      subcategories: ["browser-automation", "coding-agent"]
    },
    positioning: {
      best_for: ["Agent builders"],
      not_for: ["Unsandboxed production work"],
      use_cases: ["browser-agent", "coding-agent"],
      maturity: "active"
    },
    decision_signals: {
      deployment_modes: ["self_hosted"],
      open_source: true,
      self_hostable: true,
      has_cli: true,
      supports_mcp: true
    },
    facts: {
      license: "MIT",
      github_repo_full_name: "example/demo",
      last_verified_at: "2026-06-11"
    },
    capabilities: {
      core_capabilities: ["browser-automation", "tool-calling"],
      interfaces: ["cli", "repo"]
    },
    links: {
      primary_url: "https://github.com/example/demo",
      items: [
        { type: "github", label: "GitHub", url: "https://github.com/example/demo" },
        { type: "docs", label: "Docs", url: "https://example.com/docs" }
      ]
    },
    media: {},
    tags: {
      category: ["agent"],
      capability: ["browser-automation", "tool-calling"],
      constraint: ["open-source", "self-hosted", "mcp-compatible"],
      scenario: ["browser-agent", "coding-agent"]
    },
    relationships: {},
    machine_readable: {
      canonical_url: "https://www.openagent.bot/agents/demo",
      json_url: "https://www.openagent.bot/agents/demo.json",
      markdown_url: "https://www.openagent.bot/agents/demo.md"
    },
    timestamps: {
      created_at: "2026-06-11T00:00:00.000Z",
      updated_at: "2026-06-11T00:00:00.000Z",
      published_at: "2026-06-11T00:00:00.000Z"
    },
    ...overrides
  };
}

describe("resource detail profile", () => {
  it("builds a compact agent decision packet", () => {
    const detail = buildResourceDetailProfile(resource());

    expect(detail.agentPacket.schema_version).toBe("openagent.agent_resource_packet.v1");
    expect(detail.agentPacket.machine_readable.agent_json_url).toBe("https://www.openagent.bot/agents/demo.agent.json");
    expect(detail.agentPacket.source_confidence).toBe("high");
    expect(detail.agentPacket.risk_level).toBe("elevated");
    expect(detail.agentPacket.recommended_workflows).toContain("Browser automation");
    expect(detail.fitMatrix[0].fit).toBe("strong");
  });

  it("honors explicit schema extensions over derived defaults", () => {
    const parsed = parseResourceV1({
      ...resource(),
      decision: {
        risk_level: "low",
        source_confidence: "medium",
        permission_surface: ["read-only"],
        recommended_workflows: ["Curated workflow"],
        avoid_workflows: ["High-risk workflow"],
        primary_actions: ["Read docs"]
      },
      evidence: {
        claims: [{ claim: "Curated claim.", status: "verified", source: "Docs" }],
        sources: [{ label: "Docs", url: "https://example.com/docs", type: "docs", note: "Primary setup docs." }],
        missing_checks: ["Check release cadence."],
        verified_at: "2026-06-11"
      },
      fit_matrix: [{ workflow: "Curated workflow", fit: "strong", reason: "Explicit fit.", required_checks: ["Run a smoke test."] }],
      setup: {
        links: [{ label: "Start here", url: "https://example.com/docs", type: "docs" }],
        commands: [{ label: "Clone", command: "git clone https://github.com/example/demo.git" }],
        first_workflow: "Run one sandbox task."
      },
      faq: [{ question: "Is this curated?", answer: "Yes." }]
    });

    const detail = buildResourceDetailProfile(parsed);

    expect(detail.agentPacket.risk_level).toBe("low");
    expect(detail.agentPacket.source_confidence).toBe("medium");
    expect(detail.agentPacket.recommended_workflows).toEqual(["Curated workflow"]);
    expect(detail.evidenceClaims[0].claim).toBe("Curated claim.");
    expect(detail.fitMatrix[0].workflow).toBe("Curated workflow");
    expect(detail.nextActions[0].label).toBe("Start here");
    expect(detail.faq[0].question).toBe("Is this curated?");
  });
});

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { openProjectToResourceV1 } from "../src/lib/content/resource-adapter";
import { getPublishedResources, resourceMarkdown } from "../src/lib/content/resources";
import { parseResourceV1, type ResourceV1 } from "../src/lib/content/resource-schema";
import { parseOpenProject } from "../src/lib/content/schema";

const validResource: ResourceV1 = {
  schema_version: "openagent.resource.v1",
  id: "res_langgraph",
  slug: "langgraph",
  status: "published",
  identity: {
    name: "LangGraph",
    one_liner: "Framework for building long-running, stateful agents with controllable workflows."
  },
  classification: {
    resource_type: "agent",
    primary_category: "agents"
  },
  positioning: {
    why_it_matters: "Useful when you need more control, persistence, and orchestration than a simple prompt chain can provide.",
    best_for: ["Developers building multi-step production agents"],
    not_for: ["Users looking for a no-code personal assistant"]
  },
  decision_signals: {
    deployment_modes: ["self_hosted", "cloud"],
    open_source: true,
    self_hostable: true,
    has_api: true
  },
  facts: {
    license: "MIT",
    pricing_model: "open_source",
    github_repo_full_name: "langchain-ai/langgraph",
    last_verified_at: "2026-04-17T00:00:00.000Z"
  },
  capabilities: {
    core_capabilities: ["workflow-orchestration", "tool-calling"],
    interfaces: ["api"]
  },
  links: {
    primary_url: "https://github.com/langchain-ai/langgraph",
    items: [{ type: "github", label: "GitHub", url: "https://github.com/langchain-ai/langgraph" }]
  },
  media: {
    thumbnail_brief: {
      resource_type: "agent",
      visual_motif: "flow graph with state checkpoints",
      background_style: "minimal editorial surface",
      title_overlay: "LangGraph",
      avoid: ["noisy poster layout"]
    }
  },
  tags: {
    category: ["agent", "open-source"],
    capability: ["workflow-orchestration"],
    constraint: ["open-source", "self-hosted"],
    scenario: ["coding-agent"]
  },
  relationships: {},
  machine_readable: {
    canonical_url: "https://www.openagent.bot/agents/langgraph",
    json_url: "https://www.openagent.bot/agents/langgraph.json",
    markdown_url: "https://www.openagent.bot/agents/langgraph.md"
  },
  editorial: {
    core_strengths: [
      {
        title: "Durable execution",
        description: "Long-running workflows can resume from checkpoints instead of restarting from scratch.",
        why_it_matters: "Useful for production agents that need control and recovery."
      }
    ],
    use_case_notes: [
      {
        title: "Research workflows",
        description: "Coordinate multi-step research flows where intermediate state needs to be retained."
      }
    ],
    compare_notes: [
      {
        title: "When to choose LangGraph",
        against: "simple chains",
        summary: "Choose it when state, branches, and resumability matter more than a single prompt chain."
      }
    ],
    getting_started: [
      {
        label: "Read the docs",
        url: "https://docs.langchain.com/langgraph",
        type: "docs"
      }
    ],
    seo_article: {
      intro: "LangGraph is an open-source framework for builders who need more structure than a prompt chain.",
      what_it_is: "It is a graph-based framework for stateful agent workflows.",
      why_it_matters: "It helps readers evaluate durable execution, state, and human review before choosing an agent stack.",
      use_cases: [{ title: "Production agents", description: "Coordinate multi-step workflows that need checkpointing." }],
      alternatives: [{ title: "When to choose LangGraph", summary: "Choose it when state and control matter.", against: "simple chains" }],
      getting_started: [{ label: "Read the docs", url: "https://docs.langchain.com/langgraph", type: "docs" }],
      faq: [{ question: "Is it open source?", answer: "The listed resource is treated as open-source based on its repository and license metadata." }]
    }
  },
  timestamps: {
    created_at: "2026-04-17T00:00:00.000Z",
    updated_at: "2026-04-17T00:00:00.000Z",
    published_at: "2026-04-17T00:00:00.000Z"
  }
};

describe("resource schema v1", () => {
  it("accepts a valid published resource", () => {
    const resource = parseResourceV1(validResource);

    expect(resource.schema_version).toBe("openagent.resource.v1");
    expect(resource.identity.name).toBe("LangGraph");
  });

  it("allows an incomplete draft shell", () => {
    const resource = parseResourceV1({
      schema_version: "openagent.resource.v1",
      id: "res_draft",
      slug: "draft",
      status: "draft"
    });

    expect(resource.status).toBe("draft");
    expect(resource.identity.name).toBe("Untitled");
  });

  it("rejects missing published required fields", () => {
    const invalid = structuredClone(validResource);
    delete (invalid as Partial<ResourceV1>).identity;

    expect(() => parseResourceV1(invalid)).toThrow(/identity/);
  });

  it("rejects illegal enum values", () => {
    const invalid = structuredClone(validResource) as unknown as { classification: { resource_type: string } };
    invalid.classification.resource_type = "directory";

    expect(() => parseResourceV1(invalid)).toThrow(/resource_type/);
  });

  it("rejects wild fields", () => {
    const invalid = { ...validResource, random_field: true };

    expect(() => parseResourceV1(invalid)).toThrow(/unknown field/);
  });

  it("rejects unknown controlled tags", () => {
    const invalid = structuredClone(validResource);
    invalid.tags.capability = ["made-up-tag"];

    expect(() => parseResourceV1(invalid)).toThrow(/unknown tag/);
  });

  it("rejects wild fields inside seo article", () => {
    const invalid = structuredClone(validResource);
    invalid.editorial!.seo_article = {
      intro: "Intro",
      made_up: "Nope"
    } as unknown as NonNullable<ResourceV1["editorial"]>["seo_article"];

    expect(() => parseResourceV1(invalid)).toThrow(/unknown field/);
  });

  it("converts all legacy published projects to ResourceV1", () => {
    const projectsDir = path.join(process.cwd(), "content/projects/published");
    const files = readdirSync(projectsDir).filter((file) => file.endsWith(".json"));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const raw = JSON.parse(readFileSync(path.join(projectsDir, file), "utf8"));
      const project = parseOpenProject(raw);
      const resource = parseResourceV1(openProjectToResourceV1(project, raw));

      expect(resource.schema_version).toBe("openagent.resource.v1");
      expect(resource.status).toBe("published");
      expect(resource.machine_readable.canonical_url).toContain(resource.slug);
    }
  });

  it("reads public resources through the ResourceV1 layer", async () => {
    const resources = await getPublishedResources();
    const gemma = resources.find((resource) => resource.slug === "gemma-4");

    expect(gemma?.schema_version).toBe("openagent.resource.v1");
    expect(resources.every((resource) => resource.status === "published")).toBe(true);
    expect(resourceMarkdown(gemma!).startsWith("# Gemma 4")).toBe(true);
    expect(resourceMarkdown(gemma!)).toContain("## What It Actually Does");
  });
});

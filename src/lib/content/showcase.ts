import type { ResourceLink, ResourceV1 } from "./resource-schema";
import { resourceCategoryLabel, resourceImage, resourceSignals, resourceTags } from "./resource-display";
import { resourcePath } from "./resources";

export type ShowcaseArchetype =
  | "platform-os"
  | "browser-automation"
  | "coding-agent"
  | "agent-framework"
  | "design-agent"
  | "model-lab"
  | "vision-model"
  | "memory-graph"
  | "memory-personal"
  | "skill-system"
  | "skill-library"
  | "evaluation-tool"
  | "connector-tool";

export type HeroVariant = "code" | "brand" | "stats";

export type ShowcaseTheme = {
  accent: string;
  accent2: string;
  accentSoft: string;
  ink: string;
  heroTint: string;
};

export type ShowcaseLink = {
  label: string;
  url: string;
  type: ResourceLink["type"];
};

export type ShowcaseFact = {
  label: string;
  value: string;
};

export type ShowcaseTextBlock = {
  title: string;
  body: string;
  note?: string;
};

export type ShowcasePairing = {
  name: string;
  href: string;
  label: string;
  reason: string;
};

export type ShowcaseProfile = {
  archetype: ShowcaseArchetype;
  archetypeLabel: string;
  categoryLabel: string;
  theme: ShowcaseTheme;
  heroVariant: HeroVariant;
  image: string;
  fallbackImage: string;
  officialHost?: string;
  primaryCta?: ShowcaseLink;
  secondaryCta?: ShowcaseLink;
  sourceLinks: ShowcaseLink[];
  facts: ShowcaseFact[];
  signals: string[];
  tags: string[];
  hero: {
    headline: string;
    deck: string;
    summary: string;
    proposition: string;
    visualTitle: string;
    visualSubtitle: string;
  };
  lens: string;
  firstTest: string;
  pillars: ShowcaseTextBlock[];
  workflow: ShowcaseTextBlock[];
  evaluation: ShowcaseTextBlock[];
  compare: ShowcaseTextBlock[];
  faq: ShowcaseTextBlock[];
  pairings: ShowcasePairing[];
  related: ResourceV1[];
  commandLines: string[];
  gettingStarted: ShowcaseLink[];
  integrations: string[];
  statsPromo: {
    stars?: string;
    forks?: string;
    language?: string;
    license?: string;
    maintainer?: string;
  };
};

type ShowcaseOptions = {
  allResources: ResourceV1[];
  related: ResourceV1[];
};

const slugArchetypes: Record<string, ShowcaseArchetype> = {
  openclaw: "platform-os",
  odysseus: "platform-os",
  "hermes-agent": "platform-os",
  "browser-use": "browser-automation",
  aider: "coding-agent",
  "claude-code": "coding-agent",
  "codex-cli": "coding-agent",
  "gemini-cli": "coding-agent",
  openhands: "coding-agent",
  "swe-agent": "coding-agent",
  langgraph: "agent-framework",
  autogen: "agent-framework",
  crewai: "agent-framework",
  smolagents: "agent-framework",
  "openai-agents-python": "agent-framework",
  "open-design": "design-agent",
  "qwen3-vl": "vision-model",
  "glm-ocr": "vision-model",
  graphiti: "memory-graph",
  cognee: "memory-graph",
  letta: "memory-personal",
  mem0: "memory-personal",
  memori: "memory-personal",
  gstack: "skill-system",
  gbrain: "skill-system",
  "ai-agents-skills": "skill-library",
  "hugging-face-skills": "skill-library",
  "react-native-agent-skills": "skill-library",
  "scientific-agent-skills": "skill-library",
  "agentic-commerce-skills": "skill-library",
  promptfoo: "evaluation-tool",
  ragas: "evaluation-tool",
  langfuse: "evaluation-tool",
  litellm: "connector-tool",
  fastmcp: "connector-tool",
  "mcp-inspector": "connector-tool",
  "model-context-protocol-python-sdk": "connector-tool",
  "model-context-protocol-typescript-sdk": "connector-tool"
};

const themes: Record<ShowcaseArchetype, ShowcaseTheme> = {
  "platform-os": { accent: "#2563eb", accent2: "#10b981", accentSoft: "#e8f1ff", ink: "#102033", heroTint: "#f6f9ff" },
  "browser-automation": { accent: "#0f8a7a", accent2: "#2563eb", accentSoft: "#e8f7f5", ink: "#10201d", heroTint: "#f5fbfa" },
  "coding-agent": { accent: "#3f4a5a", accent2: "#2563eb", accentSoft: "#edf1f6", ink: "#171b22", heroTint: "#f7f8fa" },
  "agent-framework": { accent: "#5d5fef", accent2: "#0f7ea8", accentSoft: "#eeeeff", ink: "#171733", heroTint: "#f8f8ff" },
  "design-agent": { accent: "#d14f7b", accent2: "#2563eb", accentSoft: "#fff0f5", ink: "#2d1620", heroTint: "#fff7fa" },
  "model-lab": { accent: "#0f7ea8", accent2: "#7c5c2e", accentSoft: "#e9f5fa", ink: "#10202a", heroTint: "#f5fafc" },
  "vision-model": { accent: "#7c3aed", accent2: "#0f8a7a", accentSoft: "#f1ebff", ink: "#211637", heroTint: "#fbf8ff" },
  "memory-graph": { accent: "#1f7a5f", accent2: "#6f5b28", accentSoft: "#eaf6f1", ink: "#14251f", heroTint: "#f6fbf8" },
  "memory-personal": { accent: "#2f6f9f", accent2: "#8a6d3b", accentSoft: "#eaf3fb", ink: "#142333", heroTint: "#f6f9fb" },
  "skill-system": { accent: "#263238", accent2: "#c27b28", accentSoft: "#f0f2f3", ink: "#15191c", heroTint: "#f8f8f7" },
  "skill-library": { accent: "#475569", accent2: "#0f8a7a", accentSoft: "#eef2f6", ink: "#17202a", heroTint: "#f7f9fb" },
  "evaluation-tool": { accent: "#8a4f18", accent2: "#2563eb", accentSoft: "#f8efe5", ink: "#2a1a10", heroTint: "#fcf8f3" },
  "connector-tool": { accent: "#4b5e7a", accent2: "#0f8a7a", accentSoft: "#edf2f7", ink: "#172231", heroTint: "#f7f9fb" }
};

const archetypeLabels: Record<ShowcaseArchetype, string> = {
  "platform-os": "Agent platform showcase",
  "browser-automation": "Browser automation showcase",
  "coding-agent": "Coding agent showcase",
  "agent-framework": "Agent framework showcase",
  "design-agent": "Design agent showcase",
  "model-lab": "Model lab showcase",
  "vision-model": "Vision model showcase",
  "memory-graph": "Memory graph showcase",
  "memory-personal": "Personal memory showcase",
  "skill-system": "Skill system showcase",
  "skill-library": "Skill library showcase",
  "evaluation-tool": "Evaluation tool showcase",
  "connector-tool": "Connector showcase"
};

const propositions: Record<ShowcaseArchetype, string> = {
  "platform-os": "A control plane for agents that need channels, tools, skills, execution, and safety boundaries.",
  "browser-automation": "A focused layer for turning websites into action surfaces that agents can inspect and operate.",
  "coding-agent": "A developer-facing agent surface for reading repos, editing files, running checks, and handing work back cleanly.",
  "agent-framework": "A builder framework for composing agents, tools, state, handoffs, and production control.",
  "design-agent": "A local-first creative agent surface for prototypes, interfaces, artifacts, and design-system work.",
  "model-lab": "An open model candidate to test against real workloads, serving constraints, and agent prompts.",
  "vision-model": "A multimodal model candidate for screenshots, documents, OCR, and visual agent workflows.",
  "memory-graph": "A structured memory layer for durable context, entity recall, graph retrieval, and changing knowledge.",
  "memory-personal": "A memory layer for personalization, assistant continuity, user facts, and scoped recall.",
  "skill-system": "A repeatable process layer that changes how agents plan, browse, verify, review, and ship.",
  "skill-library": "A reusable behavior pack for turning one-off prompting into inspectable procedures.",
  "evaluation-tool": "An operating tool for measuring prompts, traces, retrieval, regressions, and agent quality.",
  "connector-tool": "A connector or protocol layer for giving agents safer access to services, models, and tools."
};

const firstTests: Record<ShowcaseArchetype, string> = {
  "platform-os": "Run one narrow workflow through a sandboxed channel, then inspect permissions, logs, tool calls, and recovery behavior.",
  "browser-automation": "Pick one non-sensitive website task, run it twice, then compare action logs, browser state, retries, and failure points.",
  "coding-agent": "Ask it to make one small repository change, run the project checks, and review the exact diff before trusting larger tasks.",
  "agent-framework": "Build one two-step agent flow with a tool call, a state transition, and an observable failure path.",
  "design-agent": "Generate one real artifact from your own brief, then inspect editability, source files, and handoff quality.",
  "model-lab": "Run your own prompt set across reasoning, coding, latency, context length, and license constraints.",
  "vision-model": "Test screenshots or documents that match your real inputs, then inspect OCR accuracy, spatial reasoning, and serving cost.",
  "memory-graph": "Store a small changing knowledge set, ask repeated-session questions, then inspect what was retrieved and why.",
  "memory-personal": "Create, update, and delete a user preference, then verify scope, recall, correction, and export behavior.",
  "skill-system": "Run one skill end to end, then inspect invocation rules, required evidence, stop conditions, and recovery steps.",
  "skill-library": "Install or copy one skill, run a real workflow, and check whether the procedure improves consistency over a plain prompt.",
  "evaluation-tool": "Add one regression case to a real prompt or RAG workflow, then verify the result can run again in CI or review.",
  "connector-tool": "Connect one low-risk service or local server, then inspect auth scope, logs, schema clarity, and failure behavior."
};

function inferHeroVariant(_resource: ResourceV1, archetype: ShowcaseArchetype): HeroVariant {
  if (archetype === "model-lab" || archetype === "vision-model" || archetype === "memory-graph" || archetype === "memory-personal") return "stats";
  if (archetype === "coding-agent" || archetype === "evaluation-tool" || archetype === "connector-tool") return "code";
  return "brand";
}

function includesAny(text: string, tokens: string[]): boolean {
  return tokens.some((token) => text.includes(token));
}

function normalizedText(resource: ResourceV1): string {
  return [
    resource.slug,
    resource.identity.name,
    resource.identity.one_liner,
    resource.identity.short_description,
    resource.identity.long_description,
    resource.classification.primary_category,
    resource.classification.resource_type,
    ...(resource.classification.subcategories ?? []),
    ...(resource.positioning.use_cases ?? []),
    ...resource.tags.category,
    ...resource.tags.capability,
    ...resource.tags.constraint,
    ...resource.tags.scenario
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferArchetype(resource: ResourceV1): ShowcaseArchetype {
  if (slugArchetypes[resource.slug]) return slugArchetypes[resource.slug];

  const text = normalizedText(resource);
  if (resource.classification.primary_category === "models") {
    return includesAny(text, ["vision", "ocr", "vl", "multimodal", "document", "image"]) ? "vision-model" : "model-lab";
  }
  if (resource.classification.primary_category === "memory-systems") {
    return includesAny(text, ["graph", "rag", "knowledge", "entity"]) ? "memory-graph" : "memory-personal";
  }
  if (resource.classification.primary_category === "skills") {
    return includesAny(text, ["workflow", "planning", "qa", "memory", "context", "automation"]) ? "skill-system" : "skill-library";
  }
  if (resource.classification.primary_category === "agents") {
    if (includesAny(text, ["browser", "web action"])) return "browser-automation";
    if (includesAny(text, ["coding", "terminal", "repository", "git", "swe-bench", "cli"])) return "coding-agent";
    if (includesAny(text, ["framework", "multi-agent", "orchestration", "graph", "handoff"])) return "agent-framework";
    if (includesAny(text, ["design", "figma", "prototype"])) return "design-agent";
    return "platform-os";
  }
  if (includesAny(text, ["eval", "rag", "observability", "trace", "prompt", "testing"])) return "evaluation-tool";
  return "connector-tool";
}

function officialHost(resource: ResourceV1): string | undefined {
  const link = resource.links.items.find((item) => item.type === "homepage") ?? resource.links.items.find((item) => item.type === "docs");
  if (!link) return undefined;
  try {
    return new URL(link.url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function compactNumber(value: number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function sourceLink(resource: ResourceV1, type: ResourceLink["type"]): ShowcaseLink | undefined {
  const link = resource.links.items.find((item) => item.type === type);
  return link ? { label: link.label, url: link.url, type: link.type } : undefined;
}

function primaryLink(resource: ResourceV1): ShowcaseLink | undefined {
  const link =
    sourceLink(resource, "homepage") ??
    sourceLink(resource, "docs") ??
    sourceLink(resource, "github") ??
    (resource.links.items[0] ? { label: resource.links.items[0].label, url: resource.links.items[0].url, type: resource.links.items[0].type } : undefined);
  if (!link) return undefined;
  return {
    ...link,
    label: link.type === "github" ? "Open repository" : link.type === "docs" ? "Read docs" : "Visit official site"
  };
}

function secondaryLink(resource: ResourceV1): ShowcaseLink | undefined {
  const primary = primaryLink(resource);
  const candidates = [sourceLink(resource, "github"), sourceLink(resource, "docs"), sourceLink(resource, "homepage")].filter(
    (item): item is ShowcaseLink => Boolean(item)
  );
  const link = candidates.find((item) => item.url !== primary?.url);
  if (!link) return undefined;
  return {
    ...link,
    label: link.type === "github" ? "Open repository" : link.type === "docs" ? "Read docs" : link.label
  };
}

function sourceLinks(resource: ResourceV1): ShowcaseLink[] {
  return resource.links.items.slice(0, 8).map((link) => ({ label: link.label, url: link.url, type: link.type }));
}

function facts(resource: ResourceV1, categoryLabel: string): ShowcaseFact[] {
  return [
    { label: "Category", value: categoryLabel },
    { label: "License", value: resource.facts.license ?? "Check source" },
    resource.facts.github_stars !== undefined ? { label: "Stars", value: `${compactNumber(resource.facts.github_stars)} stars` } : undefined,
    resource.facts.github_forks !== undefined ? { label: "Forks", value: `${compactNumber(resource.facts.github_forks)} forks` } : undefined,
    resource.facts.primary_language ? { label: "Language", value: resource.facts.primary_language } : undefined,
    resource.facts.github_repo_full_name ? { label: "Repository", value: resource.facts.github_repo_full_name } : undefined,
    { label: "Verified", value: (resource.facts.last_verified_at ?? resource.timestamps.updated_at).slice(0, 10) }
  ].filter((item): item is ShowcaseFact => Boolean(item));
}

function defaultPillars(resource: ResourceV1, archetype: ShowcaseArchetype): ShowcaseTextBlock[] {
  const core = resource.editorial?.core_strengths?.slice(0, 3).map((item) => ({
    title: item.title,
    body: item.description,
    note: item.why_it_matters
  }));
  if (core?.length) return core;

  const capabilities = resource.capabilities.core_capabilities?.length ? resource.capabilities.core_capabilities : resourceTags(resource, 3);
  return capabilities.slice(0, 3).map((capability) => ({
    title: capability.replaceAll("-", " ").replaceAll("_", " "),
    body: `${resource.identity.name} is worth evaluating through this capability before you adopt it in a real workflow.`,
    note: propositions[archetype]
  }));
}

function workflow(resource: ResourceV1, archetype: ShowcaseArchetype): ShowcaseTextBlock[] {
  const useCases = resource.editorial?.use_case_notes?.slice(0, 4).map((item) => ({
    title: item.title,
    body: item.description
  }));
  if (useCases?.length) return useCases;

  return [
    { title: "Start from official sources", body: "Open the official website, docs, or repository before installing anything." },
    { title: "Run the smallest real workflow", body: firstTests[archetype] },
    { title: "Inspect what changed", body: "Check generated files, logs, permissions, traces, or memory objects before expanding scope." },
    { title: "Compare nearby options", body: "Use OpenAgent related resources to compare license, hosting, maturity, and operational fit." }
  ];
}

function evaluation(archetype: ShowcaseArchetype): ShowcaseTextBlock[] {
  const rows: Record<ShowcaseArchetype, ShowcaseTextBlock[]> = {
    "platform-os": [
      { title: "Action boundary", body: "Which channels, tools, browsers, files, APIs, or services can the agent reach?", note: "This defines the risk surface." },
      { title: "Control plane", body: "Can a human inspect, pause, approve, replay, or revoke agent actions?", note: "Action agents need auditability." },
      { title: "Extension model", body: "How do skills, tools, models, and integrations plug into the system?", note: "Platform value comes from composition." }
    ],
    "browser-automation": [
      { title: "Page state", body: "How does it read DOM, screenshots, navigation state, and authenticated sessions?", note: "Web tasks fail on messy pages." },
      { title: "Action trace", body: "Can you inspect clicks, inputs, waits, retries, and changed URLs?", note: "A trace makes failures debuggable." },
      { title: "Site drift", body: "What happens when layouts, consent dialogs, or login state change?", note: "Reliability lives in edge cases." }
    ],
    "coding-agent": [
      { title: "Repository map", body: "How well does it understand files, tests, dependencies, and project conventions?", note: "Context beats broad claims." },
      { title: "Diff discipline", body: "Does it produce small reviewable changes and explain what it touched?", note: "Reviewability is adoption fuel." },
      { title: "Check loop", body: "Can it run tests, type checks, linting, and recover from failures?", note: "The loop matters more than first draft output." }
    ],
    "agent-framework": [
      { title: "State model", body: "How are messages, tools, memory, human input, and long-running flows represented?", note: "Architecture choices surface later." },
      { title: "Tool safety", body: "Can tools be scoped, observed, retried, and guarded?", note: "Production agents need control." },
      { title: "Deployment path", body: "Can you move from prototype to hosted, self-hosted, or monitored operation?", note: "Framework fit is lifecycle fit." }
    ],
    "design-agent": [
      { title: "Artifact quality", body: "Does it create editable prototypes, images, decks, dashboards, or source files?", note: "Design agents need tangible output." },
      { title: "Brand control", body: "Can it preserve visual systems, assets, tone, and interaction intent?", note: "Generic output is easy; coherent output is hard." },
      { title: "Handoff", body: "Can developers or designers keep working from what it produced?", note: "The artifact must survive the demo." }
    ],
    "model-lab": [
      { title: "Workload fit", body: "Evaluate reasoning, coding, tool use, latency, context, and safety on your own prompts.", note: "Public rankings are only a starting point." },
      { title: "Serving path", body: "Check local inference, hosted API, self-hosting, quantization, and cost constraints.", note: "The best model may not fit your stack." },
      { title: "License and control", body: "Verify license, redistribution, commercial use, and data path before adoption.", note: "Open weights do not remove governance." }
    ],
    "vision-model": [
      { title: "Input realism", body: "Test the screenshots, scans, diagrams, or documents your workflow actually uses.", note: "Synthetic demos hide visual mess." },
      { title: "Structured output", body: "Check OCR, spatial reasoning, layout preservation, and confidence behavior.", note: "Visual agents need usable outputs." },
      { title: "Serving constraints", body: "Measure file sizes, latency, memory, batching, and deployment path.", note: "Vision can be operationally expensive." }
    ],
    "memory-graph": [
      { title: "Memory object", body: "Name the entities, facts, documents, events, or relationships the system stores.", note: "Memory quality starts with the object model." },
      { title: "Recall path", body: "Inspect retrieval, graph traversal, ranking, summaries, and stale fact handling.", note: "Useful memory must explain why it surfaced context." },
      { title: "Update control", body: "Test corrections, deletions, scopes, exports, and time-aware updates.", note: "Bad memory can be worse than no memory." }
    ],
    "memory-personal": [
      { title: "User control", body: "Check consent, scoping, deletion, export, and correction paths.", note: "Personal memory must stay user-owned." },
      { title: "Recall quality", body: "Test repeated sessions and changing preferences with real tasks.", note: "Continuity only helps when it is accurate." },
      { title: "Integration surface", body: "Inspect APIs, SDKs, storage, privacy boundaries, and self-hosting options.", note: "Memory becomes infrastructure." }
    ],
    "skill-system": [
      { title: "Invocation rule", body: "When should the agent use the skill, and when should it avoid it?", note: "A skill without a boundary becomes a prompt." },
      { title: "Procedure quality", body: "Look for steps, evidence, checks, stop conditions, and recovery behavior.", note: "Procedure is the product." },
      { title: "Adaptability", body: "Can the skill be edited, versioned, combined, and audited by a team?", note: "Reusable skills need maintenance." }
    ],
    "skill-library": [
      { title: "Coverage", body: "Which repeatable behaviors are packaged, and how specific are they?", note: "Broad libraries need clear selection." },
      { title: "Output contract", body: "Does each skill produce evidence, files, decisions, or structured outputs?", note: "Output contracts make skills useful." },
      { title: "Portability", body: "Can the skills work across agents, repos, tools, and team workflows?", note: "Portability determines shelf life." }
    ],
    "evaluation-tool": [
      { title: "Metric contract", body: "What does it measure, and what does a failing case actually mean?", note: "Metrics must map to decisions." },
      { title: "Dataset path", body: "Can teams create, version, review, and reuse realistic test cases?", note: "Good evals compound." },
      { title: "Operational loop", body: "Can results plug into CI, reviews, dashboards, or incident workflows?", note: "Evals matter when they run repeatedly." }
    ],
    "connector-tool": [
      { title: "Interface clarity", body: "Are schemas, tools, resources, auth, and errors easy for agents to inspect?", note: "Agents need predictable contracts." },
      { title: "Permission scope", body: "Can access be constrained and logged per service, server, or tool?", note: "Connectors sit on trust boundaries." },
      { title: "Ecosystem fit", body: "Check SDKs, language support, examples, and compatibility with your stack.", note: "A connector is useful only if it fits your loop." }
    ]
  };

  return rows[archetype];
}

function compare(resource: ResourceV1): ShowcaseTextBlock[] {
  const notes = resource.editorial?.compare_notes?.slice(0, 3).map((item) => ({
    title: item.against ? `${item.title} vs ${item.against}` : item.title,
    body: item.summary
  }));
  if (notes?.length) return notes;

  return [
    {
      title: `When to choose ${resource.identity.name}`,
      body: `Compare it with nearby ${resourceCategoryLabel(resource).toLowerCase()} by workflow fit, license, hosting model, and official implementation evidence.`
    }
  ];
}

function faq(resource: ResourceV1, archetype: ShowcaseArchetype): ShowcaseTextBlock[] {
  const items = resource.editorial?.seo_article?.faq?.slice(0, 6).map((item) => ({
    title: item.question,
    body: item.answer
  }));
  if (items?.length) return items;

  return [
    {
      title: `What should I check before using ${resource.identity.name}?`,
      body: firstTests[archetype]
    },
    {
      title: `Is ${resource.identity.name} open source?`,
      body: `${resource.identity.name} is listed on OpenAgent.bot with ${resource.facts.license ?? "source links available"} based on the current resource metadata. Re-check the official repository, docs, and license before production use.`
    }
  ];
}

function recommendedSkills(resource: ResourceV1, allResources: ResourceV1[]): ShowcasePairing[] {
  if (resource.classification.primary_category !== "agents") return [];
  const skillResources = allResources.filter((item) => item.classification.primary_category === "skills");
  const text = normalizedText(resource);
  const rules: Array<{ slug: string; match: string[]; reason: string }> = [
    {
      slug: "gstack",
      match: ["workflow-orchestration", "browser-automation", "tool-calling", "browser-agent", "mcp", "automation", "coding-agent"],
      reason: "Adds planning, browsing, QA, review, and shipping routines around the agent."
    },
    {
      slug: "gbrain",
      match: ["memory", "state-management", "context-retrieval", "personal-memory", "self-improving", "hermes-agent"],
      reason: "Useful when the agent needs durable project context, recall, and session continuity."
    },
    {
      slug: "ai-agents-skills",
      match: ["coding-agent", "terminal", "cli", "tool-calling", "agent-framework", "developer-workflow", "pair-programming"],
      reason: "A broad reusable-skill library for repo work, planning, and assistant procedures."
    },
    {
      slug: "scientific-agent-skills",
      match: ["research", "analysis", "evaluation", "benchmark", "trajectory", "multi-agent"],
      reason: "Best when the agent needs structured research, experiments, or evidence-heavy analysis."
    }
  ];

  return rules
    .map((rule) => {
      const skill = skillResources.find((item) => item.slug === rule.slug);
      if (!skill) return undefined;
      const score = rule.match.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0);
      if (score === 0) return undefined;
      return {
        name: skill.identity.name,
        href: resourcePath(skill),
        label: resourceCategoryLabel(skill),
        reason: rule.reason
      };
    })
    .filter((item): item is ShowcasePairing => Boolean(item))
    .slice(0, 4);
}

export function buildShowcaseProfile(resource: ResourceV1, options: ShowcaseOptions): ShowcaseProfile {
  const archetype = inferArchetype(resource);
  const categoryLabel = resourceCategoryLabel(resource);
  const summary = resource.identity.short_description ?? resource.identity.one_liner;
  const signals = resourceSignals(resource, 8);
  const tags = resourceTags(resource, 8).map((tag) => tag.replaceAll("-", " "));
  const host = officialHost(resource);

  const heroVariant = inferHeroVariant(resource, archetype);
  const commandLines = (resource.editorial?.command_line ?? []).map((c) => c.command);
  const gettingStarted = (resource.editorial?.getting_started ?? []).slice(0, 4).map((gs) => ({
    label: gs.label,
    url: gs.url,
    type: "homepage" as ResourceLink["type"]
  }));
  const integrations = resource.capabilities.integrations ?? [];
  const cm = compactNumber(resource.facts.github_stars);
  const cf = compactNumber(resource.facts.github_forks);

  return {
    archetype,
    archetypeLabel: archetypeLabels[archetype],
    categoryLabel,
    theme: themes[archetype],
    heroVariant,
    image: resourceImage(resource),
    fallbackImage: `/resource-fallbacks/${resource.classification.primary_category}.svg`,
    officialHost: host,
    primaryCta: primaryLink(resource),
    secondaryCta: secondaryLink(resource),
    sourceLinks: sourceLinks(resource),
    facts: facts(resource, categoryLabel),
    signals,
    tags,
    hero: {
      headline: resource.identity.name,
      deck: resource.identity.one_liner,
      summary,
      proposition: propositions[archetype],
      visualTitle: host ?? resource.facts.github_repo_full_name ?? resource.identity.name,
      visualSubtitle: resource.facts.license ? `${resource.facts.license} · ${categoryLabel}` : categoryLabel
    },
    lens: resource.positioning.why_it_matters ?? propositions[archetype],
    firstTest: firstTests[archetype],
    pillars: defaultPillars(resource, archetype),
    workflow: workflow(resource, archetype),
    evaluation: evaluation(archetype),
    compare: compare(resource),
    faq: faq(resource, archetype),
    pairings: recommendedSkills(resource, options.allResources),
    related: options.related,
    commandLines,
    gettingStarted,
    integrations,
    statsPromo: {
      stars: cm ? `${cm} stars` : undefined,
      forks: cf ? `${cf} forks` : undefined,
      language: resource.facts.primary_language,
      license: resource.facts.license,
      maintainer: resource.facts.github_repo_full_name
    }
  };
}

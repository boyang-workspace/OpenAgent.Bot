import type { ResourceV1 } from "../content/resource-schema";

export type RegistrySourceConfidence = "high" | "medium" | "low";

export type RegistryResourceType =
  | "model"
  | "software_agent"
  | "skill_pack"
  | "capability"
  | "connector"
  | "memory_system"
  | "evaluation_tool"
  | "developer_tool"
  | "channel_bot"
  | "robot"
  | "robotics_infrastructure"
  | "protocol"
  | "workflow"
  | "article";

export type RegistryCategory =
  | "models"
  | "agents"
  | "skills"
  | "capabilities"
  | "connectors"
  | "memory"
  | "evaluations"
  | "tools"
  | "channel-bots"
  | "robots"
  | "robotics"
  | "protocols"
  | "workflows"
  | "articles";

export type RegistryDefinition<T extends string> = {
  id: T;
  label: string;
  definition: string;
  includes: string[];
  excludes: string[];
};

export type RegistryPlacement = {
  resourceType: RegistryResourceType;
  category: RegistryCategory;
  reason: string;
};

export const registryResourceTypes: RegistryDefinition<RegistryResourceType>[] = [
  {
    id: "model",
    label: "Model",
    definition: "A model or model family used for inference, reasoning, coding, multimodal understanding, or local AI workloads.",
    includes: ["open-weight models", "local inference candidates", "OCR or VLM model families"],
    excludes: ["agent runtimes", "plugins", "hardware robots"]
  },
  {
    id: "software_agent",
    label: "Software Agent",
    definition: "A software runtime, framework, or application that plans, calls tools, edits files, browses, or executes workflows.",
    includes: ["coding agents", "browser agents", "agent frameworks", "workflow runtimes"],
    excludes: ["chat channel adapters", "physical robots", "pure model releases"]
  },
  {
    id: "skill_pack",
    label: "Skill Pack",
    definition: "An installable or reusable procedure pack that gives an agent a repeatable capability.",
    includes: ["SKILL.md collections", "agent playbooks", "domain skill packs"],
    excludes: ["abstract capability names", "agent runtimes"]
  },
  {
    id: "capability",
    label: "Capability",
    definition: "An abstract ability an agent or robot can require or provide, such as browser automation or memory recall.",
    includes: ["browser automation", "code editing", "robot locomotion", "memory recall"],
    excludes: ["specific tools", "articles", "marketing tags"]
  },
  {
    id: "connector",
    label: "Connector",
    definition: "A protocol server, plugin, or integration that lets agents access an external service or tool surface.",
    includes: ["MCP servers", "API connectors", "database connectors", "platform plugins"],
    excludes: ["standalone agent applications", "pure content guides"]
  },
  {
    id: "memory_system",
    label: "Memory System",
    definition: "A storage, recall, graph, or context layer that gives agents durable state or retrievable knowledge.",
    includes: ["agent memory", "RAG systems", "knowledge graphs", "state stores"],
    excludes: ["model context windows", "blog posts"]
  },
  {
    id: "evaluation_tool",
    label: "Evaluation Tool",
    definition: "A tool for traces, prompt tests, regression checks, RAG evaluation, observability, or safety review.",
    includes: ["prompt evaluators", "trace tools", "LLM observability", "RAG quality tools"],
    excludes: ["generic dashboards without AI evaluation use"]
  },
  {
    id: "developer_tool",
    label: "Developer Tool",
    definition: "A practical utility for building, testing, operating, or packaging AI products and agent workflows.",
    includes: ["CLIs", "local runtimes", "ops tools", "developer utilities"],
    excludes: ["agent runtimes", "models", "physical robots"]
  },
  {
    id: "channel_bot",
    label: "Channel Bot",
    definition: "A software bot that operates inside chat, support, voice, or messaging channels.",
    includes: ["Telegram bots", "Discord bots", "Slack bots", "WhatsApp bots", "support chat bots"],
    excludes: ["humanoid robots", "robot arms", "robotics simulators"]
  },
  {
    id: "robot",
    label: "Robot",
    definition: "A physical or embodied robot platform with sensors, actuators, motion, manipulation, or real-world embodiment.",
    includes: ["humanoids", "quadrupeds", "robot arms", "mobile robots", "embodied AI platforms"],
    excludes: ["Telegram bots", "Discord bots", "software-only support agents"]
  },
  {
    id: "robotics_infrastructure",
    label: "Robotics Infrastructure",
    definition: "A simulator, training system, VLA model, teleoperation stack, SDK, or reinforcement-learning tool for robots.",
    includes: ["simulation", "robot learning", "VLA models", "teleoperation", "robot SDKs"],
    excludes: ["chat bots", "generic agent frameworks without robotics use"]
  },
  {
    id: "protocol",
    label: "Protocol",
    definition: "A technical protocol or standard used for connecting models, agents, tools, or data sources.",
    includes: ["MCP", "agent communication protocols", "tool interface protocols"],
    excludes: ["one-off plugin implementations"]
  },
  {
    id: "workflow",
    label: "Workflow",
    definition: "A repeatable task pattern or stack composition that combines resources and capabilities.",
    includes: ["browser-agent stack", "local-first research agent", "coding-agent workflow"],
    excludes: ["single tools without a task pattern"]
  },
  {
    id: "article",
    label: "Article",
    definition: "A human-readable guide, comparison, or SEO page derived from database entities and evidence.",
    includes: ["guides", "comparison posts", "how-to articles"],
    excludes: ["canonical resource facts", "capability definitions"]
  }
];

export const registryCategories: RegistryDefinition<RegistryCategory>[] = [
  {
    id: "models",
    label: "Models",
    definition: "Model releases and inference candidates that can power agent or robotics workflows.",
    includes: ["open-weight LLMs", "VLMs", "OCR models", "local model runtimes"],
    excludes: ["agent frameworks", "MCP servers", "robots"]
  },
  {
    id: "agents",
    label: "Agents",
    definition: "Software agent runtimes and frameworks that perform tasks with tools, files, browser surfaces, or workflows.",
    includes: ["coding agents", "browser agents", "multi-agent frameworks"],
    excludes: ["chat channel bots", "physical robots"]
  },
  {
    id: "skills",
    label: "Skills",
    definition: "Reusable skill packs, playbooks, and agent procedures.",
    includes: ["SKILL.md packs", "domain playbooks", "agent procedure collections"],
    excludes: ["abstract capabilities", "software agent runtimes"]
  },
  {
    id: "capabilities",
    label: "Capabilities",
    definition: "The normalized capability dictionary used by agents to match tasks to resources.",
    includes: ["browser automation", "memory recall", "robot manipulation", "MCP integration"],
    excludes: ["specific project pages"]
  },
  {
    id: "connectors",
    label: "Connectors",
    definition: "MCP servers, plugins, integrations, and protocol adapters for giving agents controlled access to tools.",
    includes: ["MCP servers", "API connectors", "database connectors"],
    excludes: ["agent runtimes", "human-only articles"]
  },
  {
    id: "memory",
    label: "Memory",
    definition: "Agent memory, retrieval, graph, context, and state systems.",
    includes: ["personal memory", "RAG", "knowledge graphs", "state management"],
    excludes: ["model weights", "browser caches"]
  },
  {
    id: "evaluations",
    label: "Evaluations",
    definition: "Tools that test, trace, score, monitor, or audit agent and model behavior.",
    includes: ["prompt tests", "trace tooling", "observability", "RAG evaluation"],
    excludes: ["generic BI dashboards"]
  },
  {
    id: "tools",
    label: "Tools",
    definition: "Developer and operator utilities that support building AI products and agents.",
    includes: ["CLIs", "local utilities", "ops tools"],
    excludes: ["primary agent runtimes", "robots"]
  },
  {
    id: "channel-bots",
    label: "Channel Bots",
    definition: "Software bots that live in messaging, support, or voice channels.",
    includes: ["Telegram", "Discord", "Slack", "WhatsApp", "Matrix", "support chat"],
    excludes: ["humanoid robots", "robot arms", "robotics simulators"]
  },
  {
    id: "robots",
    label: "Robots",
    definition: "Physical or embodied robots and robot platforms, the category intended for Unitree-style and Optimus-style systems.",
    includes: ["humanoids", "quadrupeds", "robot arms", "mobile robots", "embodied hardware platforms"],
    excludes: ["chat bots", "support bots", "software-only messaging agents"]
  },
  {
    id: "robotics",
    label: "Robotics Infrastructure",
    definition: "Simulation, training, VLA, SDK, teleoperation, and policy infrastructure for embodied agents.",
    includes: ["simulators", "robot learning", "robot SDKs", "teleoperation", "VLA models"],
    excludes: ["channel bots", "generic agent frameworks"]
  },
  {
    id: "protocols",
    label: "Protocols",
    definition: "Open standards and protocols for connecting agents, tools, models, and data.",
    includes: ["MCP", "agent communication protocols", "tool protocols"],
    excludes: ["single proprietary app integrations"]
  },
  {
    id: "workflows",
    label: "Workflows",
    definition: "Task-oriented stack recipes that combine resources and capabilities.",
    includes: ["browser automation stack", "coding agent stack", "local research agent stack"],
    excludes: ["single-resource listings"]
  },
  {
    id: "articles",
    label: "Articles",
    definition: "Human-readable editorial and SEO surfaces generated from the registry.",
    includes: ["guides", "comparisons", "explainers"],
    excludes: ["canonical database facts"]
  }
];

const roboticsNeedles = [
  "robotics",
  "robot-arm",
  "robot arm",
  "robotic arm",
  "humanoid",
  "quadruped",
  "embodied",
  "vla",
  "lerobot",
  "teleoperation",
  "manipulation",
  "actuator",
  "robot-learning"
];

const roboticsInfrastructureNeedles = [
  "simulation",
  "simulator",
  "physics-engine",
  "training",
  "robot-learning",
  "reinforcement-learning",
  "teleoperation",
  "vla",
  "sdk"
];

const evaluationNeedles = ["evaluation", "observability", "trace", "promptfoo", "ragas", "langfuse", "mlflow", "future-agi"];

function searchableText(resource: ResourceV1): string {
  return [
    resource.slug,
    resource.identity.name,
    resource.identity.one_liner,
    resource.identity.short_description,
    resource.classification.primary_category,
    resource.classification.resource_type,
    ...(resource.classification.subcategories ?? []),
    ...(resource.capabilities.core_capabilities ?? []),
    ...(resource.capabilities.integrations ?? []),
    ...(resource.capabilities.interfaces ?? []),
    ...resource.tags.category,
    ...resource.tags.capability,
    ...resource.tags.constraint,
    ...resource.tags.scenario,
    ...(resource.positioning.use_cases ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function structuredSearchableText(resource: ResourceV1): string {
  return [
    resource.slug,
    resource.identity.name,
    resource.classification.primary_category,
    resource.classification.resource_type,
    ...(resource.classification.subcategories ?? []),
    ...(resource.capabilities.core_capabilities ?? []),
    ...resource.tags.category,
    ...resource.tags.capability,
    ...resource.tags.constraint,
    ...resource.tags.scenario,
    ...(resource.positioning.use_cases ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

export function isRoboticsResource(resource: ResourceV1): boolean {
  return includesAny(structuredSearchableText(resource), roboticsNeedles);
}

export function inferRegistryPlacement(resource: ResourceV1): RegistryPlacement {
  const text = searchableText(resource);
  const legacyCategory = resource.classification.primary_category;

  if (legacyCategory === "bots") {
    if (isRoboticsResource(resource)) {
      const isInfrastructure = includesAny(text, roboticsInfrastructureNeedles);
      return isInfrastructure
        ? { resourceType: "robotics_infrastructure", category: "robotics", reason: "Legacy bots record has robotics infrastructure signals." }
        : { resourceType: "robot", category: "robots", reason: "Legacy bots record has physical or embodied robot signals." };
    }
    return { resourceType: "channel_bot", category: "channel-bots", reason: "Legacy bots record is a messaging, support, or channel bot." };
  }

  if (legacyCategory === "agents") return { resourceType: "software_agent", category: "agents", reason: "Legacy agents category maps to software agent runtimes and frameworks." };
  if (legacyCategory === "models") return { resourceType: "model", category: "models", reason: "Legacy models category maps to model resources." };
  if (legacyCategory === "skills") return { resourceType: "skill_pack", category: "skills", reason: "Legacy skills category maps to reusable skill packs." };
  if (legacyCategory === "plugins") return { resourceType: "connector", category: "connectors", reason: "Legacy plugins category maps to connectors and protocol integrations." };
  if (legacyCategory === "memory-systems") return { resourceType: "memory_system", category: "memory", reason: "Legacy memory-systems category maps to memory systems." };
  if (legacyCategory === "protocols") return { resourceType: "protocol", category: "protocols", reason: "Legacy protocols category maps to protocol records." };
  if (legacyCategory === "workflows") return { resourceType: "workflow", category: "workflows", reason: "Legacy workflows category maps to stack recipes." };

  if (includesAny(text, evaluationNeedles)) {
    return { resourceType: "evaluation_tool", category: "evaluations", reason: "Tool record has evaluation, trace, or observability signals." };
  }

  return { resourceType: "developer_tool", category: "tools", reason: "Legacy tools category maps to developer and operator utilities." };
}

export function sourceConfidence(resource: ResourceV1): RegistrySourceConfidence {
  const hasOfficialSource = resource.links.items.some((link) => ["homepage", "github", "docs", "paper"].includes(link.type));
  const hasGithubFacts = Boolean(resource.facts.github_repo_full_name || resource.facts.github_stars !== undefined);
  const hasVerifiedDate = Boolean(resource.facts.last_verified_at);

  if (hasOfficialSource && hasGithubFacts && hasVerifiedDate) return "high";
  if (hasOfficialSource && hasVerifiedDate) return "medium";
  return "low";
}

export function dataQualityScore(resource: ResourceV1): number {
  const checks = [
    Boolean(resource.identity.name),
    Boolean(resource.identity.one_liner),
    Boolean(resource.facts.license),
    Boolean(resource.facts.last_verified_at),
    Boolean(resource.links.items.length),
    Boolean(resource.capabilities.core_capabilities?.length),
    Boolean(resource.positioning.best_for?.length),
    Boolean(resource.positioning.not_for?.length),
    Boolean(resource.editorial?.trust_note),
    Boolean(resource.editorial?.compare_notes?.length || resource.relationships.compare_with?.length)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

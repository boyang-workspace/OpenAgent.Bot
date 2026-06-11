import { resourcePath } from "@/lib/content/resources";
import type { PrimaryCategory, ResourceV1 } from "@/lib/content/resource-schema";

export type WorkflowId =
  | "browser-automation"
  | "coding-agent"
  | "research-agent"
  | "local-desktop"
  | "chatbot"
  | "memory-agent"
  | "evaluation"
  | "mcp-integration"
  | "embodied-agent";

export type EnvironmentId = "local-macos" | "self-hosted-server" | "cloud" | "team";
export type StageId = "prototype" | "production";
export type ConstraintId = "open-source" | "local-first" | "self-hostable" | "mcp" | "human-approval" | "no-shell" | "team-safe";

export type StackRequest = {
  workflow: WorkflowId;
  environment?: EnvironmentId;
  stage?: StageId;
  constraints?: ConstraintId[];
};

export type ScoreBreakdown = {
  adoption: number;
  maintenance: number;
  openness: number;
  safety: number;
  fit: number;
  total: number;
};

export type RecommendationRole = "runtime" | "browser" | "memory" | "skill" | "connector" | "evaluation" | "model" | "bot" | "supporting";

export type ResourceRecommendation = {
  slug: string;
  name: string;
  href: string;
  category: PrimaryCategory;
  role: RecommendationRole;
  score: ScoreBreakdown;
  fit_score: number;
  risk_level: "low" | "medium" | "high";
  permission_surface: string[];
  reasons: string[];
  cautions: string[];
  signals: string[];
};

export type StackRecommendation = {
  id: WorkflowId;
  title: string;
  summary: string;
  request: Required<StackRequest>;
  required_capabilities: string[];
  recommended_tools: ResourceRecommendation[];
  missing_capabilities: string[];
  risk_notes: string[];
  first_test: string;
  install_plan: string[];
  export_targets: string[];
};

type WorkflowProfile = {
  id: WorkflowId;
  title: string;
  summary: string;
  keywords: string[];
  requiredCapabilities: string[];
  preferredCategories: PrimaryCategory[];
  roles: RecommendationRole[];
  defaultConstraints: ConstraintId[];
  firstTest: string;
};

export const workflowProfiles: WorkflowProfile[] = [
  {
    id: "browser-automation",
    title: "Browser automation agent",
    summary: "Choose tools for agents that inspect websites, click through flows, fill forms, and collect browser evidence.",
    keywords: ["browser", "browser-agent", "browser-automation", "automation", "web", "qa"],
    requiredCapabilities: ["browser_automation", "structured_extraction", "screenshot_capture", "human_review"],
    preferredCategories: ["agents", "skills", "plugins", "tools"],
    roles: ["runtime", "browser", "skill", "evaluation"],
    defaultConstraints: ["open-source", "human-approval"],
    firstTest: "Run one low-risk website flow twice, then compare logs, screenshots, retries, and the exact actions taken."
  },
  {
    id: "coding-agent",
    title: "Coding agent stack",
    summary: "Choose an agent runtime and guardrails for reading repositories, editing files, running checks, and handing back diffs.",
    keywords: ["coding-agent", "developer-workflow", "terminal", "cli", "repository", "git", "swe"],
    requiredCapabilities: ["repo_inspection", "file_editing", "test_execution", "diff_review", "human_approval"],
    preferredCategories: ["agents", "skills", "tools"],
    roles: ["runtime", "skill", "evaluation"],
    defaultConstraints: ["open-source", "human-approval"],
    firstTest: "Ask the agent to make one small repository change in a sandbox branch, run checks, and review the final diff."
  },
  {
    id: "research-agent",
    title: "Research and report agent",
    summary: "Choose tools for gathering web evidence, maintaining context, and producing repeatable reports.",
    keywords: ["research", "content-workflow", "browser", "memory", "context-retrieval", "workflow"],
    requiredCapabilities: ["web_research", "source_capture", "local_memory", "markdown_report", "verification"],
    preferredCategories: ["agents", "skills", "memory-systems", "tools"],
    roles: ["runtime", "browser", "memory", "skill", "evaluation"],
    defaultConstraints: ["open-source", "human-approval"],
    firstTest: "Monitor three public sources and generate one cited report with source links, timestamps, and a review checklist."
  },
  {
    id: "local-desktop",
    title: "Local desktop assistant",
    summary: "Choose local-first tools for a desktop agent that can use files, shell, browser, and user-owned memory under review.",
    keywords: ["local-ai", "local-first", "self-hosted", "developer-workflow", "memory", "cli"],
    requiredCapabilities: ["local_runtime", "file_access", "browser_access", "approval_gate", "local_memory"],
    preferredCategories: ["agents", "memory-systems", "skills", "models"],
    roles: ["runtime", "memory", "skill", "model"],
    defaultConstraints: ["open-source", "local-first", "human-approval"],
    firstTest: "Run one repeatable local task with non-sensitive files and verify every file, shell, and browser action is reviewable."
  },
  {
    id: "chatbot",
    title: "Channel bot or support agent",
    summary: "Choose bot frameworks and connectors for Discord, Telegram, Slack, WhatsApp, Matrix, or self-hosted support channels.",
    keywords: ["bot", "chatbot", "messaging", "support-bot", "team-chat", "chat-ui"],
    requiredCapabilities: ["channel_adapter", "message_routing", "credential_boundary", "logs", "handoff"],
    preferredCategories: ["bots", "memory-systems", "plugins", "tools"],
    roles: ["bot", "memory", "connector", "evaluation"],
    defaultConstraints: ["open-source", "team-safe"],
    firstTest: "Deploy to one private test channel, send ten representative messages, and inspect permissions, logs, and failure handling."
  },
  {
    id: "memory-agent",
    title: "Memory-enabled agent",
    summary: "Choose a memory layer for personalization, durable context, graph recall, and repeated-session behavior.",
    keywords: ["memory", "personal-memory", "context-retrieval", "state", "state-management", "rag", "graph"],
    requiredCapabilities: ["store_memory", "retrieve_context", "update_memory", "delete_or_scope_memory", "inspect_recall"],
    preferredCategories: ["memory-systems", "agents", "skills", "tools"],
    roles: ["memory", "runtime", "skill", "evaluation"],
    defaultConstraints: ["open-source", "self-hostable", "human-approval"],
    firstTest: "Create, retrieve, correct, and delete a small set of memories, then inspect why each memory was recalled."
  },
  {
    id: "evaluation",
    title: "Agent evaluation and observability",
    summary: "Choose tools for prompt tests, regression checks, traces, RAG evaluation, and operational monitoring.",
    keywords: ["evaluation", "eval", "observability", "trace", "testing", "benchmark", "rag"],
    requiredCapabilities: ["test_cases", "trace_capture", "regression_checks", "quality_metrics", "ci_or_review_loop"],
    preferredCategories: ["tools", "agents", "skills"],
    roles: ["evaluation", "runtime", "skill"],
    defaultConstraints: ["open-source", "team-safe"],
    firstTest: "Add five real failure cases and verify the evaluation can run again after a model, prompt, or retrieval change."
  },
  {
    id: "mcp-integration",
    title: "MCP and connector stack",
    summary: "Choose protocol tooling and connectors for giving agents controlled access to services, repos, databases, and APIs.",
    keywords: ["mcp", "protocol", "plugin", "connector", "api-first", "tool-calling"],
    requiredCapabilities: ["tool_schema", "auth_scope", "connector_runtime", "client_compatibility", "risk_review"],
    preferredCategories: ["plugins", "tools", "agents", "skills"],
    roles: ["connector", "runtime", "skill", "evaluation"],
    defaultConstraints: ["open-source", "mcp", "team-safe"],
    firstTest: "Connect one low-risk service, inspect the tool schema and auth scope, then verify logs and failure behavior."
  },
  {
    id: "embodied-agent",
    title: "Embodied agent and robotics stack",
    summary: "Choose robotics skills, simulators, SDKs, and vision-action candidates without making robotics the main site narrative.",
    keywords: ["robotics", "robotics-agent", "robot", "simulation", "embodied", "vision"],
    requiredCapabilities: ["simulation", "robot_sdk", "perception", "motion_or_action_layer", "hardware_safety_review"],
    preferredCategories: ["bots", "skills", "models", "tools"],
    roles: ["bot", "skill", "model", "evaluation"],
    defaultConstraints: ["open-source", "human-approval", "team-safe"],
    firstTest: "Start in simulation or a non-destructive demo routine, then document hardware assumptions and safety boundaries."
  }
];

const workflowById = new Map(workflowProfiles.map((profile) => [profile.id, profile]));

export function normalizeStackRequest(input: Partial<StackRequest> = {}): Required<StackRequest> {
  const workflow = workflowById.has(input.workflow as WorkflowId) ? (input.workflow as WorkflowId) : "browser-automation";
  const profile = workflowById.get(workflow)!;
  return {
    workflow,
    environment: input.environment ?? "local-macos",
    stage: input.stage ?? "prototype",
    constraints: input.constraints?.length ? input.constraints : profile.defaultConstraints
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function textBlob(resource: ResourceV1): string {
  return [
    resource.slug,
    resource.identity.name,
    resource.identity.one_liner,
    resource.identity.short_description,
    resource.classification.primary_category,
    resource.classification.resource_type,
    ...(resource.classification.subcategories ?? []),
    ...(resource.positioning.best_for ?? []),
    ...(resource.positioning.not_for ?? []),
    ...(resource.positioning.use_cases ?? []),
    ...(resource.capabilities.core_capabilities ?? []),
    ...(resource.capabilities.integrations ?? []),
    ...resource.tags.category,
    ...resource.tags.capability,
    ...resource.tags.constraint,
    ...resource.tags.scenario
  ]
    .join(" ")
    .toLowerCase();
}

function daysSince(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.max(0, Math.round((Date.now() - parsed) / 86_400_000));
}

function adoptionScore(resource: ResourceV1): number {
  const stars = resource.facts.github_stars ?? 0;
  const forks = resource.facts.github_forks ?? 0;
  const starScore = stars ? Math.min(80, Math.log10(stars + 1) * 18) : 20;
  const forkScore = forks ? Math.min(20, Math.log10(forks + 1) * 6) : 0;
  return clamp(starScore + forkScore);
}

function maintenanceScore(resource: ResourceV1): number {
  const age = daysSince(resource.facts.github_last_commit_at ?? resource.facts.last_verified_at ?? resource.timestamps.updated_at);
  if (age === undefined) return 45;
  if (age <= 30) return 95;
  if (age <= 90) return 82;
  if (age <= 180) return 68;
  if (age <= 365) return 52;
  return 35;
}

function opennessScore(resource: ResourceV1, request: Required<StackRequest>): number {
  let score = resource.decision_signals.open_source ? 58 : 20;
  if (resource.facts.license) score += 12;
  if (resource.decision_signals.self_hostable) score += 12;
  if (resource.decision_signals.local_first) score += 10;
  if (request.constraints.includes("open-source") && !resource.decision_signals.open_source) score -= 30;
  if (request.constraints.includes("local-first") && !resource.decision_signals.local_first) score -= 14;
  if (request.constraints.includes("self-hostable") && !resource.decision_signals.self_hostable) score -= 10;
  return clamp(score);
}

export function permissionSurface(resource: ResourceV1): string[] {
  const text = textBlob(resource);
  const surface = [
    text.includes("browser") ? "browser" : undefined,
    text.includes("terminal") || text.includes("cli") || text.includes("shell") || text.includes("coding") ? "shell/files" : undefined,
    text.includes("memory") || text.includes("rag") || text.includes("context") ? "memory" : undefined,
    text.includes("messaging") || text.includes("chatbot") || resource.classification.primary_category === "bots" ? "messages" : undefined,
    text.includes("mcp") || text.includes("connector") || text.includes("api") ? "external services" : undefined,
    text.includes("robot") || text.includes("robotics") ? "hardware" : undefined
  ].filter((value): value is string => Boolean(value));
  return Array.from(new Set(surface));
}

function safetyScore(resource: ResourceV1, request: Required<StackRequest>): number {
  const surface = permissionSurface(resource);
  let score = 86 - surface.length * 8;
  if (surface.includes("hardware")) score -= 18;
  if (surface.includes("shell/files")) score -= 12;
  if (surface.includes("browser")) score -= 8;
  if (request.constraints.includes("human-approval")) score += 10;
  if (request.constraints.includes("no-shell") && surface.includes("shell/files")) score -= 35;
  if (request.constraints.includes("team-safe") && surface.includes("external services")) score -= 8;
  return clamp(score);
}

function fitScore(resource: ResourceV1, request: Required<StackRequest>, profile: WorkflowProfile): number {
  const text = textBlob(resource);
  let score = profile.preferredCategories.includes(resource.classification.primary_category) ? 28 : 4;
  score += profile.keywords.filter((keyword) => text.includes(keyword)).length * 12;
  if (request.constraints.includes("mcp") && resource.decision_signals.supports_mcp) score += 18;
  if (request.constraints.includes("local-first") && resource.decision_signals.local_first) score += 14;
  if (request.constraints.includes("self-hostable") && resource.decision_signals.self_hostable) score += 12;
  if (request.environment === "cloud" && resource.decision_signals.deployment_modes?.includes("cloud")) score += 8;
  if (request.environment !== "cloud" && resource.decision_signals.self_hostable) score += 8;
  if (request.stage === "production" && resource.positioning.maturity === "experimental") score -= 22;
  return clamp(score);
}

function roleFor(resource: ResourceV1, profile: WorkflowProfile): RecommendationRole {
  const category = resource.classification.primary_category;
  const text = textBlob(resource);
  if (category === "memory-systems") return "memory";
  if (category === "plugins" || text.includes("mcp") || text.includes("connector")) return "connector";
  if (category === "tools" && (text.includes("eval") || text.includes("observability") || text.includes("trace") || text.includes("benchmark"))) return "evaluation";
  if (category === "models") return "model";
  if (category === "bots") return "bot";
  if (category === "skills") return "skill";
  if (text.includes("browser") && profile.id === "browser-automation") return "browser";
  if (category === "agents") return "runtime";
  return "supporting";
}

function riskLevel(score: number): ResourceRecommendation["risk_level"] {
  if (score >= 74) return "low";
  if (score >= 48) return "medium";
  return "high";
}

function signalLabels(resource: ResourceV1): string[] {
  return [
    resource.decision_signals.open_source ? "Open source" : undefined,
    resource.decision_signals.local_first ? "Local first" : undefined,
    resource.decision_signals.self_hostable ? "Self-hostable" : undefined,
    resource.decision_signals.supports_mcp ? "MCP" : undefined,
    resource.decision_signals.has_cli ? "CLI" : undefined,
    resource.decision_signals.has_api ? "API" : undefined,
    resource.facts.license,
    resource.facts.last_verified_at ? `Verified ${resource.facts.last_verified_at.slice(0, 10)}` : undefined
  ].filter((value): value is string => Boolean(value));
}

function recommendationFor(resource: ResourceV1, request: Required<StackRequest>, profile: WorkflowProfile): ResourceRecommendation {
  const score = {
    adoption: adoptionScore(resource),
    maintenance: maintenanceScore(resource),
    openness: opennessScore(resource, request),
    safety: safetyScore(resource, request),
    fit: fitScore(resource, request, profile),
    total: 0
  };
  score.total = clamp(score.fit * 0.42 + score.openness * 0.18 + score.safety * 0.18 + score.maintenance * 0.14 + score.adoption * 0.08);

  const surface = permissionSurface(resource);
  const reasons = [
    profile.preferredCategories.includes(resource.classification.primary_category)
      ? `Fits the ${profile.title.toLowerCase()} category mix.`
      : undefined,
    resource.decision_signals.open_source ? "Open-source signal is present." : undefined,
    request.constraints.includes("mcp") && resource.decision_signals.supports_mcp ? "Matches the MCP constraint." : undefined,
    request.constraints.includes("local-first") && resource.decision_signals.local_first ? "Matches the local-first constraint." : undefined,
    resource.facts.github_stars ? `${resource.facts.github_stars.toLocaleString("en-US")} GitHub stars provide adoption signal.` : undefined,
    resource.positioning.best_for?.[0] ? `Best for: ${resource.positioning.best_for[0]}` : undefined
  ].filter((value): value is string => Boolean(value));

  const cautions = [
    !resource.facts.last_verified_at ? "No explicit last verified date in the resource record." : undefined,
    surface.includes("browser") ? "Browser workflows can break when target sites change." : undefined,
    surface.includes("shell/files") ? "File and shell access should stay behind review gates." : undefined,
    surface.includes("memory") ? "Memory systems need deletion, scoping, and stale-context checks." : undefined,
    surface.includes("messages") ? "Messaging bots can expose private conversations if permissions are too broad." : undefined,
    surface.includes("hardware") ? "Robotics tools need simulation and hardware safety review before real-world use." : undefined,
    request.stage === "production" && resource.positioning.maturity === "experimental" ? "Marked experimental for a production request." : undefined
  ].filter((value): value is string => Boolean(value));

  return {
    slug: resource.slug,
    name: resource.identity.name,
    href: resourcePath(resource),
    category: resource.classification.primary_category,
    role: roleFor(resource, profile),
    score,
    fit_score: score.total,
    risk_level: riskLevel(score.safety),
    permission_surface: surface,
    reasons: reasons.slice(0, 4),
    cautions: cautions.slice(0, 4),
    signals: signalLabels(resource).slice(0, 6)
  };
}

function selectRoleCoverage(recommendations: ResourceRecommendation[], profile: WorkflowProfile): ResourceRecommendation[] {
  const selected = new Map<string, ResourceRecommendation>();
  for (const role of profile.roles) {
    const candidate = recommendations.find((item) => item.role === role && !selected.has(item.slug));
    if (candidate) selected.set(candidate.slug, candidate);
  }
  for (const candidate of recommendations) {
    if (selected.size >= 8) break;
    if (!selected.has(candidate.slug)) selected.set(candidate.slug, candidate);
  }
  return Array.from(selected.values());
}

export function resolveStack(resources: ResourceV1[], input: Partial<StackRequest> = {}): StackRecommendation {
  const request = normalizeStackRequest(input);
  const profile = workflowById.get(request.workflow)!;
  const recommendations = resources
    .map((resource) => recommendationFor(resource, request, profile))
    .filter((item) => item.fit_score >= 34)
    .sort((a, b) => b.fit_score - a.fit_score || a.name.localeCompare(b.name));
  const selected = selectRoleCoverage(recommendations, profile);
  const coveredText = selected.flatMap((item) => [item.role, ...item.permission_surface, ...item.signals]).join(" ").toLowerCase();
  const missing = profile.requiredCapabilities.filter((capability) => !coveredText.includes(capability.split("_")[0]));

  return {
    id: profile.id,
    title: profile.title,
    summary: profile.summary,
    request,
    required_capabilities: profile.requiredCapabilities,
    recommended_tools: selected,
    missing_capabilities: missing.slice(0, 4),
    risk_notes: Array.from(new Set(selected.flatMap((item) => item.cautions))).slice(0, 6),
    first_test: profile.firstTest,
    install_plan: [
      "Pick the top runtime or primary tool first.",
      "Add only the connector, memory, or skill layer required by the first test.",
      "Run the first test in a sandbox with reviewable logs and source links.",
      "Promote to production only after permission scope, rollback, and maintenance checks are documented."
    ],
    export_targets: ["AGENTS.md", "CLAUDE.md", "Codex prompt", "JSON registry"]
  };
}

export function buildStackRecommendations(resources: ResourceV1[]): StackRecommendation[] {
  return workflowProfiles.map((profile) => resolveStack(resources, { workflow: profile.id }));
}

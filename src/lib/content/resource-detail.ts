import { site } from "@/config/site";
import { permissionSurface } from "@/lib/recommendations/stack-resolver";
import { formatResourceLabel, resourceCategoryLabel } from "./resource-display";
import type { ResourceLink, ResourceV1 } from "./resource-schema";

export type RiskLevel = "low" | "moderate" | "elevated" | "unknown";
export type SourceConfidence = "high" | "medium" | "low";
export type FitLevel = "strong" | "partial" | "weak" | "unknown";

export type DetailSource = {
  label: string;
  url: string;
  type: ResourceLink["type"];
  note: string;
};

export type EvidenceClaim = {
  claim: string;
  status: "verified" | "inferred" | "needs_review";
  source: string;
};

export type FitMatrixRow = {
  workflow: string;
  fit: FitLevel;
  reason: string;
  required_checks: string[];
};

export type DetailFaqItem = {
  question: string;
  answer: string;
};

export type NextAction = {
  label: string;
  url?: string;
  command?: string;
  note: string;
};

export type AgentDecisionPacket = {
  schema_version: "openagent.agent_resource_packet.v1";
  id: string;
  slug: string;
  name: string;
  canonical_url: string;
  category: string;
  resource_type: string;
  summary: string;
  capabilities: string[];
  constraints: string[];
  scenarios: string[];
  deployment_modes: string[];
  interfaces: string[];
  integrations: string[];
  permission_surface: string[];
  risk_level: RiskLevel;
  source_confidence: SourceConfidence;
  recommended_workflows: string[];
  avoid_when: string[];
  primary_actions: string[];
  evidence_urls: string[];
  last_verified_at?: string;
  machine_readable: {
    json_url: string;
    markdown_url: string;
    agent_json_url: string;
  };
};

export type ResourceDetailProfile = {
  agentPacket: AgentDecisionPacket;
  sourceConfidence: SourceConfidence;
  riskLevel: RiskLevel;
  permissionSurface: string[];
  evidenceSources: DetailSource[];
  evidenceClaims: EvidenceClaim[];
  missingChecks: string[];
  fitMatrix: FitMatrixRow[];
  whatItIs: string;
  howItWorks: string;
  whyItMatters: string;
  inputsOutputs: {
    inputs: string[];
    outputs: string[];
  };
  nextActions: NextAction[];
  faq: DetailFaqItem[];
  related: ResourceV1[];
};

type DetailOptions = {
  related?: ResourceV1[];
};

const workflowRules: Array<{
  id: string;
  label: string;
  tokens: string[];
  check: string;
}> = [
  {
    id: "coding-agent",
    label: "Coding agent workflow",
    tokens: ["coding", "code", "repository", "repo", "terminal", "cli", "swe", "developer-workflow", "pair-programming"],
    check: "Run a small repository change and inspect the diff, tests, and rollback path."
  },
  {
    id: "browser-automation",
    label: "Browser automation",
    tokens: ["browser", "web", "dom", "playwright", "automation", "form", "website"],
    check: "Run one non-sensitive website task and inspect clicks, waits, retries, and changed URLs."
  },
  {
    id: "local-ai",
    label: "Local or private AI stack",
    tokens: ["local", "local-first", "self-hosted", "self_hosted", "offline", "desktop", "open-weight", "ollama"],
    check: "Verify hardware requirements, data path, storage, and whether all calls stay in your environment."
  },
  {
    id: "memory-rag",
    label: "Memory or RAG workflow",
    tokens: ["memory", "rag", "retrieval", "knowledge", "graph", "context", "state", "recall"],
    check: "Create, update, retrieve, correct, and delete memory or retrieval objects with real data."
  },
  {
    id: "evaluation-observability",
    label: "Evaluation and observability",
    tokens: ["eval", "evaluation", "observability", "trace", "prompt", "test", "benchmark", "regression"],
    check: "Add one repeatable test case and confirm results can run again in review or CI."
  },
  {
    id: "connector-protocol",
    label: "Connector or protocol layer",
    tokens: ["mcp", "connector", "plugin", "protocol", "sdk", "api", "server", "integration"],
    check: "Connect one low-risk service, then inspect schemas, auth scope, errors, and logs."
  },
  {
    id: "skill-workflow",
    label: "Reusable skill workflow",
    tokens: ["skill", "playbook", "procedure", "workflow", "prompt", "agent-skill", "repeatable"],
    check: "Run one skill end to end and check whether it produces evidence or structured output."
  },
  {
    id: "robotics-embodied",
    label: "Robotics or embodied agent workflow",
    tokens: ["robot", "robotics", "humanoid", "quadruped", "embodied", "actuator", "simulation", "teleoperation", "vla"],
    check: "Separate simulator claims from hardware claims and verify safety boundaries before real-world operation."
  }
];

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function corpus(resource: ResourceV1): string {
  return [
    resource.slug,
    resource.identity.name,
    resource.identity.one_liner,
    resource.identity.short_description,
    resource.identity.long_description,
    resource.classification.resource_type,
    resource.classification.primary_category,
    ...(resource.classification.subcategories ?? []),
    ...(resource.positioning.best_for ?? []),
    ...(resource.positioning.not_for ?? []),
    ...(resource.positioning.use_cases ?? []),
    ...(resource.capabilities.core_capabilities ?? []),
    ...(resource.capabilities.integrations ?? []),
    ...(resource.capabilities.interfaces ?? []),
    ...resource.tags.category,
    ...resource.tags.capability,
    ...resource.tags.constraint,
    ...resource.tags.scenario
  ]
    .join(" ")
    .toLowerCase();
}

function tokenScore(text: string, tokens: string[]): number {
  return tokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
}

function agentJsonUrl(resource: ResourceV1): string {
  return `${site.url}/${resource.classification.primary_category}/${resource.slug}.agent.json`;
}

function riskLevel(resource: ResourceV1, permissions: string[]): RiskLevel {
  if (resource.decision?.risk_level) return resource.decision.risk_level;
  const text = corpus(resource);
  if (!resource.facts.last_verified_at && resource.links.items.length === 0) return "unknown";
  if (tokenScore(text, ["robot", "robotics", "humanoid", "quadruped", "embodied", "credential", "authenticated"]) > 0) return "elevated";
  if (permissions.some((item) => ["shell/files", "browser", "network"].includes(item))) return permissions.length > 1 ? "elevated" : "moderate";
  if (resource.decision_signals.supports_mcp || resource.decision_signals.has_api || resource.decision_signals.has_cli) return "moderate";
  return "low";
}

function sourceConfidence(resource: ResourceV1): SourceConfidence {
  if (resource.decision?.source_confidence) return resource.decision.source_confidence;
  const hasRepo = Boolean(resource.facts.github_repo_full_name || resource.links.items.some((link) => link.type === "github"));
  const hasDocs = resource.links.items.some((link) => link.type === "docs" || link.type === "homepage");
  const hasVerification = Boolean(resource.facts.last_verified_at);
  if (hasVerification && hasRepo && hasDocs) return "high";
  if ((hasRepo || hasDocs) && (hasVerification || resource.facts.license)) return "medium";
  return "low";
}

function evidenceSources(resource: ResourceV1): DetailSource[] {
  const explicit = resource.evidence?.sources?.map((source) => ({
    label: source.label,
    url: source.url,
    type: source.type ?? "homepage",
    note: source.note ?? "Curated evidence source for this resource profile."
  }));
  if (explicit?.length) return explicit;

  return resource.links.items.slice(0, 8).map((link) => ({
    label: link.label,
    url: link.url,
    type: link.type,
    note:
      link.type === "github"
        ? "Repository source for code, license, issues, releases, and implementation details."
        : link.type === "docs"
          ? "Documentation source for setup, API shape, and operational behavior."
          : link.type === "paper"
            ? "Research source for model, method, or benchmark claims."
            : "Official or project-controlled source for this resource profile."
  }));
}

function evidenceClaims(resource: ResourceV1): EvidenceClaim[] {
  if (resource.evidence?.claims?.length) {
    return resource.evidence.claims.map((claim) => ({
      claim: claim.claim,
      status: claim.status,
      source: claim.source ?? "OpenAgent evidence metadata."
    }));
  }
  const deployment = resource.decision_signals.deployment_modes?.map(formatResourceLabel).join(", ");
  return [
    {
      claim: resource.decision_signals.open_source
        ? `${resource.identity.name} is listed as open source.`
        : `${resource.identity.name} is not currently marked as open source in OpenAgent metadata.`,
      status: resource.facts.license || resource.facts.github_repo_full_name ? "verified" : "needs_review",
      source: resource.facts.license ? `License metadata: ${resource.facts.license}` : "Check official source links."
    },
    resource.facts.github_repo_full_name
      ? {
          claim: `${resource.identity.name} has a recorded GitHub repository: ${resource.facts.github_repo_full_name}.`,
          status: "verified",
          source: "Resource facts and GitHub source link."
        }
      : undefined,
    deployment
      ? {
          claim: `${resource.identity.name} supports these recorded deployment modes: ${deployment}.`,
          status: "inferred",
          source: "OpenAgent decision signal metadata."
        }
      : undefined,
    resource.capabilities.core_capabilities?.length
      ? {
          claim: `${resource.identity.name} is tagged with ${resource.capabilities.core_capabilities.slice(0, 5).map(formatResourceLabel).join(", ")} capabilities.`,
          status: "inferred",
          source: "OpenAgent capability taxonomy."
        }
      : undefined
  ].filter((item): item is EvidenceClaim => Boolean(item));
}

function missingChecks(resource: ResourceV1): string[] {
  if (resource.evidence?.missing_checks?.length) return resource.evidence.missing_checks;
  return [
    resource.facts.license ? undefined : "License has not been recorded.",
    resource.facts.github_repo_full_name ? undefined : "GitHub repository has not been recorded.",
    resource.links.items.some((link) => link.type === "docs") ? undefined : "Dedicated docs link is missing.",
    resource.facts.github_last_commit_at ? undefined : "Repository freshness has not been recorded.",
    resource.facts.last_verified_at ? undefined : "Last verification date is missing."
  ].filter((item): item is string => Boolean(item));
}

function fitMatrix(resource: ResourceV1): FitMatrixRow[] {
  if (resource.fit_matrix?.length) {
    return resource.fit_matrix.map((row) => ({
      workflow: row.workflow,
      fit: row.fit,
      reason: row.reason,
      required_checks: row.required_checks ?? ["Confirm official docs, current maintenance, license, and runtime constraints before production use."]
    }));
  }
  const text = corpus(resource);
  return workflowRules
    .map((rule) => {
      const score = tokenScore(text, rule.tokens);
      const fit: FitLevel = score >= 2 ? "strong" : score === 1 ? "partial" : "weak";
      return {
        workflow: rule.label,
        fit,
        reason:
          fit === "strong"
            ? `${resource.identity.name} has multiple signals for ${rule.label.toLowerCase()}, including matching tags, capabilities, category, or positioning.`
            : fit === "partial"
              ? `${resource.identity.name} has at least one signal for ${rule.label.toLowerCase()}, but should be checked against a real task before adoption.`
              : `${resource.identity.name} is not primarily positioned for ${rule.label.toLowerCase()} in the current metadata.`,
        required_checks: [
          rule.check,
          "Confirm official docs, current maintenance, license, and runtime constraints before production use."
        ]
      };
    })
    .sort((a, b) => {
      const rank: Record<FitLevel, number> = { strong: 3, partial: 2, weak: 1, unknown: 0 };
      return rank[b.fit] - rank[a.fit] || a.workflow.localeCompare(b.workflow);
    })
    .slice(0, 6);
}

function whatItIs(resource: ResourceV1): string {
  return (
    resource.editorial?.seo_article?.what_it_is ??
    resource.identity.long_description ??
    `${resource.identity.name} is a ${formatResourceLabel(resource.classification.resource_type)} in the ${resourceCategoryLabel(resource).toLowerCase()} category. ${resource.identity.short_description ?? resource.identity.one_liner}`
  );
}

function howItWorks(resource: ResourceV1): string {
  const interfaces = resource.capabilities.interfaces?.map(formatResourceLabel).join(", ");
  const integrations = resource.capabilities.integrations?.map(formatResourceLabel).join(", ");
  return (
    resource.editorial?.seo_article?.how_it_works ??
    `Evaluate ${resource.identity.name} by starting from the official sources, checking ${interfaces ? `its ${interfaces} interface surface` : "its interface surface"}, and running one narrow workflow before expanding scope.${integrations ? ` Recorded integrations include ${integrations}.` : ""}`
  );
}

function whyItMatters(resource: ResourceV1): string {
  return (
    resource.editorial?.seo_article?.why_it_matters ??
    resource.positioning.why_it_matters ??
    `${resource.identity.name} matters when builders need a clearer way to choose tools by workflow fit, constraints, source quality, and operational risk rather than by category labels alone.`
  );
}

function inputsOutputs(resource: ResourceV1): ResourceDetailProfile["inputsOutputs"] {
  const text = corpus(resource);
  const inputs = unique([
    text.includes("browser") ? "Web pages, DOM state, screenshots, forms, or browser sessions" : undefined,
    text.includes("coding") || text.includes("repo") || text.includes("terminal") ? "Repositories, files, issues, terminal output, and test results" : undefined,
    text.includes("memory") || text.includes("rag") ? "Documents, user facts, entities, context, or retrieval queries" : undefined,
    text.includes("mcp") || text.includes("api") ? "Tool schemas, API requests, service resources, and auth scopes" : undefined,
    text.includes("model") || resource.classification.primary_category === "models" ? "Prompts, messages, documents, images, or model inputs" : undefined,
    "Official setup instructions and a small real workflow"
  ]);
  const outputs = unique([
    text.includes("browser") ? "Action traces, changed pages, extracted data, or completed browser steps" : undefined,
    text.includes("coding") || text.includes("repo") ? "Diffs, commits, explanations, test results, or review notes" : undefined,
    text.includes("memory") || text.includes("rag") ? "Retrieved context, memory updates, graph relations, or citations" : undefined,
    text.includes("eval") || text.includes("observability") ? "Scores, traces, regression results, dashboards, or failure cases" : undefined,
    "A decision on whether this resource fits the target workflow"
  ]);
  return { inputs, outputs };
}

function nextActions(resource: ResourceV1): NextAction[] {
  const setupLinks = resource.setup?.links?.map((link) => ({
    label: link.label,
    url: link.url,
    note: "Curated setup link from the resource profile."
  })) ?? [];
  const setupCommands = resource.setup?.commands?.map((item) => ({
    label: item.label,
    command: item.command,
    note: item.description ?? "Curated setup command from the resource profile."
  })) ?? [];
  const sourceActions = resource.links.items.slice(0, 3).map((link) => ({
    label: link.type === "github" ? "Inspect repository" : link.type === "docs" ? "Read setup docs" : `Open ${link.label}`,
    url: link.url,
    note:
      link.type === "github"
        ? "Check license, recent activity, issues, examples, and security-sensitive code paths."
        : link.type === "docs"
          ? "Use docs as the source of truth for installation and supported interfaces."
          : "Start from the official source before adopting third-party instructions."
  }));
  const commandActions = (resource.editorial?.command_line ?? []).slice(0, 2).map((item) => ({
    label: item.label,
    command: item.command,
    note: item.description ?? "Run only after checking the official source and local environment assumptions."
  }));
  return [...setupLinks, ...setupCommands, ...sourceActions, ...commandActions].slice(0, 5);
}

function faq(resource: ResourceV1, risk: RiskLevel, confidence: SourceConfidence): DetailFaqItem[] {
  if (resource.faq?.length) return resource.faq.slice(0, 8);
  const explicit = resource.editorial?.seo_article?.faq;
  if (explicit?.length) return explicit.slice(0, 6);

  const category = resourceCategoryLabel(resource).toLowerCase();
  return [
    {
      question: `What is ${resource.identity.name} used for?`,
      answer: `${resource.identity.name} is used as a ${formatResourceLabel(resource.classification.resource_type)} for ${category} workflows. The most relevant recorded capabilities are ${unique(resource.capabilities.core_capabilities ?? resource.tags.capability).slice(0, 4).map(formatResourceLabel).join(", ") || "listed in the OpenAgent resource metadata"}.`
    },
    {
      question: `Is ${resource.identity.name} open source?`,
      answer: resource.decision_signals.open_source
        ? `${resource.identity.name} is listed as open source${resource.facts.license ? ` with ${resource.facts.license} license metadata` : ""}. Re-check the official repository or source link before production use.`
        : `${resource.identity.name} is not currently marked as open source in OpenAgent metadata. Check official links for current licensing.`
    },
    {
      question: `Can agents use ${resource.identity.name} directly?`,
      answer: `${resource.identity.name} has recorded interfaces such as ${(resource.capabilities.interfaces ?? ["official source links"]).map(formatResourceLabel).join(", ")}. Agents should prefer the JSON or Markdown profile first, then follow official docs for real execution.`
    },
    {
      question: `What should I check before production use?`,
      answer: `Check source confidence (${confidence}), risk level (${risk}), license, maintenance freshness, permission surface, required credentials, and whether the first workflow succeeds in a sandbox.`
    }
  ];
}

function recommendedWorkflows(matrix: FitMatrixRow[], resource: ResourceV1): string[] {
  if (resource.decision?.recommended_workflows?.length) return resource.decision.recommended_workflows.slice(0, 6);
  const strong = matrix.filter((row) => row.fit === "strong").map((row) => row.workflow);
  if (strong.length) return strong.slice(0, 4);
  return unique([...(resource.positioning.use_cases ?? []), ...resource.tags.scenario]).slice(0, 4).map(formatResourceLabel);
}

function agentPacket(resource: ResourceV1, detail: Omit<ResourceDetailProfile, "agentPacket">): AgentDecisionPacket {
  return {
    schema_version: "openagent.agent_resource_packet.v1",
    id: resource.id,
    slug: resource.slug,
    name: resource.identity.name,
    canonical_url: resource.machine_readable.canonical_url,
    category: resource.classification.primary_category,
    resource_type: resource.classification.resource_type,
    summary: resource.identity.short_description ?? resource.identity.one_liner,
    capabilities: unique([...(resource.capabilities.core_capabilities ?? []), ...resource.tags.capability]),
    constraints: unique(resource.tags.constraint),
    scenarios: unique([...(resource.positioning.use_cases ?? []), ...resource.tags.scenario]),
    deployment_modes: resource.decision_signals.deployment_modes ?? [],
    interfaces: resource.capabilities.interfaces ?? [],
    integrations: resource.capabilities.integrations ?? [],
    permission_surface: detail.permissionSurface,
    risk_level: detail.riskLevel,
    source_confidence: detail.sourceConfidence,
    recommended_workflows: recommendedWorkflows(detail.fitMatrix, resource),
    avoid_when: resource.decision?.avoid_workflows ?? resource.positioning.not_for ?? ["Production adoption without checking source links, maintenance, permissions, and failure recovery."],
    primary_actions: resource.decision?.primary_actions ?? detail.nextActions.map((action) => action.label),
    evidence_urls: detail.evidenceSources.map((source) => source.url),
    last_verified_at: resource.facts.last_verified_at,
    machine_readable: {
      json_url: resource.machine_readable.json_url,
      markdown_url: resource.machine_readable.markdown_url,
      agent_json_url: agentJsonUrl(resource)
    }
  };
}

export function buildResourceDetailProfile(resource: ResourceV1, options: DetailOptions = {}): ResourceDetailProfile {
  const permissions = permissionSurface(resource);
  const explicitPermissions = unique([...(resource.decision?.permission_surface ?? []), ...permissions]);
  const risk = riskLevel(resource, permissions);
  const confidence = sourceConfidence(resource);
  const detailWithoutPacket = {
    sourceConfidence: confidence,
    riskLevel: risk,
    permissionSurface: explicitPermissions,
    evidenceSources: evidenceSources(resource),
    evidenceClaims: evidenceClaims(resource),
    missingChecks: missingChecks(resource),
    fitMatrix: fitMatrix(resource),
    whatItIs: whatItIs(resource),
    howItWorks: howItWorks(resource),
    whyItMatters: whyItMatters(resource),
    inputsOutputs: inputsOutputs(resource),
    nextActions: nextActions(resource),
    faq: faq(resource, risk, confidence),
    related: options.related ?? []
  };

  return {
    agentPacket: agentPacket(resource, detailWithoutPacket),
    ...detailWithoutPacket
  };
}

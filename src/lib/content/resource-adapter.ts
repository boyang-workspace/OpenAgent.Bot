import type { CategorySlug, OpenProject, OpenSourceStatus } from "./schema";
import { taxonomy, type DeploymentMode, type ResourceLink, type ResourceType, type ResourceV1 } from "./resource-schema";

const canonicalBaseUrl = "https://www.openagent.bot";

const categoryToResourceType: Record<CategorySlug, ResourceType> = {
  models: "model",
  agents: "agent",
  "memory-systems": "memory_system",
  skills: "skill",
  plugins: "plugin",
  tools: "tool"
};

const categoryTags: Record<CategorySlug, string> = {
  models: "model",
  agents: "agent",
  "memory-systems": "memory-system",
  skills: "skill",
  plugins: "plugin",
  tools: "tool"
};

const tagAliases: Record<string, string> = {
  "agent-framework": "agent-framework",
  automation: "automation",
  browser: "browser",
  "browser-automation": "browser-automation",
  "chat-ui": "chat-ui",
  connectors: "connectors",
  inference: "inference",
  "local-ai": "local-inference",
  "local-inference": "local-inference",
  mcp: "mcp",
  memory: "memory",
  ollama: "ollama",
  plugin: "plugin",
  protocol: "protocol",
  rag: "rag",
  "self-hosted": "self-hosted",
  state: "state",
  "state-management": "state-management",
  workflow: "workflow",
  "workflow-orchestration": "workflow-orchestration"
};

function uniq(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function limit(values: string[], max = 5): string[] {
  return values.slice(0, max);
}

function toIsoDateTime(value: string | undefined): string {
  if (!value) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00.000Z`;
  return value;
}

function githubFullName(repoUrl: string | undefined): string | undefined {
  if (!repoUrl) return undefined;
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com") return undefined;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return undefined;
    return `${owner}/${repo}`;
  } catch {
    return undefined;
  }
}

function linkTypeForUrl(url: string, fallback: ResourceLink["type"]): ResourceLink["type"] {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com") return "github";
    if (parsed.hostname.includes("huggingface.co")) return "huggingface";
    if (parsed.hostname.includes("npmjs.com")) return "npm";
    if (parsed.hostname.includes("pypi.org")) return "pypi";
    if (parsed.hostname.includes("docker.com")) return "docker";
    return fallback;
  } catch {
    return fallback;
  }
}

function makeLinks(project: OpenProject): ResourceV1["links"] {
  const links: ResourceLink[] = [];
  const seen = new Set<string>();
  const addLink = (type: ResourceLink["type"], label: string, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    links.push({ type: linkTypeForUrl(url, type), label, url });
  };

  addLink("github", "GitHub", project.repoUrl);
  addLink("homepage", "Homepage", project.homepageUrl);
  addLink("docs", "Docs", project.docsUrl);
  addLink("demo", "Demo", project.demoUrl);
  for (const sourceLink of project.sourceLinks) {
    addLink(linkTypeForUrl(sourceLink, "homepage"), "Source", sourceLink);
  }

  const primaryUrl = project.repoUrl ?? project.homepageUrl ?? project.sourceLinks[0] ?? `${canonicalBaseUrl}/${project.category}/${project.slug}`;
  return { primary_url: primaryUrl, items: links.length ? links : [{ type: "homepage", label: "Source", url: primaryUrl }] };
}

function mapCapabilities(project: OpenProject): string[] {
  const normalized = project.tags.map((tag) => tagAliases[tag] ?? tag).filter((tag) => (taxonomy.capability as readonly string[]).includes(tag));
  if (project.category === "agents") normalized.push("workflow-orchestration");
  if (project.category === "memory-systems") normalized.push("memory");
  if (project.category === "models") normalized.push("local-inference");
  return limit(uniq(normalized));
}

function mapConstraints(project: OpenProject): string[] {
  const tags = new Set(project.tags);
  const values: string[] = [];
  if (project.openSourceStatus === "open-source") values.push("open-source");
  if (project.openSourceStatus === "source-available") values.push("source-available");
  if (tags.has("self-hosted")) values.push("self-hosted");
  if (tags.has("local-ai") || tags.has("ollama")) values.push("local-first");
  if (tags.has("mcp")) values.push("mcp-compatible");
  if (tags.has("docker")) values.push("docker");
  if (tags.has("open-weights")) values.push("open-weights");
  return limit(uniq(values.length ? values : ["open-source"]));
}

function mapScenarios(project: OpenProject): string[] {
  const tags = new Set(project.tags);
  const values: string[] = [];
  if (tags.has("browser") || tags.has("browser-automation")) values.push("browser-agent");
  if (tags.has("local-ai") || tags.has("ollama")) values.push("local-ai");
  if (tags.has("self-hosted") || project.category === "tools") values.push("self-hosted-ai");
  if (project.category === "agents" || project.category === "skills" || project.category === "plugins") values.push("developer-workflow");
  if (project.category === "memory-systems") values.push("personal-memory");
  return limit(uniq(values.length ? values : ["developer-workflow"]));
}

function deploymentModes(project: OpenProject): DeploymentMode[] {
  const tags = new Set(project.tags);
  const values: DeploymentMode[] = [];
  if (tags.has("local-ai") || tags.has("ollama")) values.push("local");
  if (tags.has("self-hosted") || project.category === "tools") values.push("self_hosted");
  if (project.homepageUrl) values.push("cloud");
  return limit(uniq(values), 3) as DeploymentMode[];
}

function pricingModel(status: OpenSourceStatus): ResourceV1["facts"]["pricing_model"] {
  if (status === "open-source") return "open_source";
  if (status === "unknown") return "unknown";
  return "free";
}

type ProjectRawFields = {
  lastVerifiedAt?: string;
};

export function openProjectToResourceV1(project: OpenProject, raw: ProjectRawFields = {}): ResourceV1 {
  const canonicalUrl = `${canonicalBaseUrl}/${project.category}/${project.slug}`;
  const capabilities = mapCapabilities(project);
  const constraintTags = mapConstraints(project);
  const scenarioTags = mapScenarios(project);
  const categoryTag = categoryTags[project.category];
  const createdAt = toIsoDateTime(project.generatedAt);
  const updatedAt = toIsoDateTime(project.updatedAt);
  const publishedAt = project.status === "published" ? toIsoDateTime(project.reviewedAt ?? project.generatedAt) : undefined;

  return {
    schema_version: "openagent.resource.v1",
    id: `res_${project.slug.replaceAll("-", "_")}`,
    slug: project.slug,
    status: project.status,
    identity: {
      name: project.title,
      one_liner: project.oneLiner,
      short_description: project.summary
    },
    classification: {
      resource_type: categoryToResourceType[project.category],
      primary_category: project.category,
      subcategories: limit(project.tags.filter((tag) => tag !== categoryTag && tag !== "open-source"), 5)
    },
    positioning: {
      why_it_matters: project.whyItMatters,
      best_for: project.bestFor,
      not_for: project.notFor,
      use_cases: scenarioTags,
      target_audience: project.category === "models" ? ["developer", "researcher"] : ["developer", "agent_builder"],
      maturity: "active"
    },
    decision_signals: {
      deployment_modes: deploymentModes(project),
      open_source: project.openSourceStatus === "open-source",
      local_first: constraintTags.includes("local-first"),
      self_hostable: constraintTags.includes("self-hosted"),
      has_api: project.tags.includes("api") || project.tags.includes("protocol"),
      has_gui: project.tags.includes("chat-ui"),
      supports_mcp: constraintTags.includes("mcp-compatible"),
      supports_docker: constraintTags.includes("docker")
    },
    facts: {
      license: project.license,
      pricing_model: pricingModel(project.openSourceStatus),
      github_stars: project.sourceMetrics?.stars,
      github_forks: project.sourceMetrics?.forks,
      github_repo_full_name: githubFullName(project.repoUrl),
      last_verified_at: raw.lastVerifiedAt ?? project.reviewedAt ?? project.updatedAt
    },
    capabilities: {
      core_capabilities: capabilities,
      integrations: project.worksWith,
      interfaces: uniq([project.repoUrl ? "repo" : undefined, project.docsUrl ? "docs" : undefined, project.demoUrl ? "demo" : undefined, project.tags.includes("chat-ui") ? "ui" : undefined])
    },
    links: makeLinks(project),
    media: {
      thumbnail_url: project.coverImage,
      og_image_url: project.coverImage
    },
    tags: {
      category: limit(uniq([categoryTag, project.openSourceStatus === "open-source" ? "open-source" : undefined])),
      capability: capabilities,
      constraint: constraintTags,
      scenario: scenarioTags
    },
    relationships: {},
    machine_readable: {
      canonical_url: canonicalUrl,
      json_url: `${canonicalUrl}.json`,
      markdown_url: `${canonicalUrl}.md`
    },
    seo: {
      title: project.seoTitle,
      description: project.seoDescription
    },
    editorial: {
      featured_reason: project.featuredReason,
      trust_note: raw.lastVerifiedAt || project.reviewedAt ? "Verified from source links and project metadata." : undefined
    },
    timestamps: {
      created_at: createdAt,
      updated_at: updatedAt,
      published_at: publishedAt
    }
  };
}

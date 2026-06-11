import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildResourceDetailProfile } from "./resource-detail";
import { parseResourceV1, type PrimaryCategory, type ResourceV1 } from "./resource-schema";

function fileSystemRootDir(): string | undefined {
  const metaUrl = typeof import.meta !== "undefined" ? import.meta.url : undefined;
  if (!metaUrl || !metaUrl.startsWith("file:")) return undefined;
  return path.resolve(path.dirname(fileURLToPath(metaUrl)), "../../../");
}

const rootDir = fileSystemRootDir();
const publishedResourcesDir = rootDir ? path.join(rootDir, "content/resources/published") : undefined;

async function readResourceDir(dir: string): Promise<ResourceV1[]> {
  const files = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const resources = await Promise.all(
    files
      .filter((file) => file.isFile() && file.name.endsWith(".json"))
      .map(async (file) => {
        const raw = await readFile(path.join(dir, file.name), "utf8");
        return parseResourceV1(JSON.parse(raw));
      })
  );

  return resources.sort(
    (a, b) => b.timestamps.updated_at.localeCompare(a.timestamps.updated_at) || a.identity.name.localeCompare(b.identity.name)
  );
}

export async function getPublishedResources(): Promise<ResourceV1[]> {
  const resources = publishedResourcesDir ? await readResourceDir(publishedResourcesDir) : [];
  return resources.filter((resource) => resource.status === "published");
}

export async function getResourcesByCategory(category: PrimaryCategory): Promise<ResourceV1[]> {
  const resources = await getPublishedResources();
  return resources.filter((resource) => resource.classification.primary_category === category);
}

export async function getResourceBySlug(category: PrimaryCategory, slug: string): Promise<ResourceV1 | undefined> {
  const resources = await getPublishedResources();
  return resources.find((resource) => resource.classification.primary_category === category && resource.slug === slug);
}

export async function getRelatedResources(resource: ResourceV1): Promise<ResourceV1[]> {
  const resources = await getPublishedResources();
  const relatedSlugs = new Set([
    ...(resource.relationships.similar_resources ?? []),
    ...(resource.relationships.alternatives ?? []),
    ...(resource.relationships.compare_with ?? [])
  ]);

  const explicit = resources.filter((candidate) => relatedSlugs.has(candidate.slug) && candidate.slug !== resource.slug);
  const sameCategory = resources.filter(
    (candidate) => candidate.slug !== resource.slug && candidate.classification.primary_category === resource.classification.primary_category && !relatedSlugs.has(candidate.slug)
  );

  return [...explicit, ...sameCategory].slice(0, 3);
}

export function resourcePath(resource: ResourceV1): string {
  return `/${resource.classification.primary_category}/${resource.slug}`;
}

function listBlock(title: string, values: string[] | undefined): string[] {
  if (!values?.length) return [];
  return ["", `## ${title}`, ...values.map((value) => `- ${value}`)];
}

function titledListBlock(title: string, values: Array<{ title: string; description?: string; summary?: string; why_it_matters?: string; against?: string }> | undefined): string[] {
  if (!values?.length) return [];
  return [
    "",
    `## ${title}`,
    ...values.flatMap((value) => [
      `- ${value.title}${value.against ? ` vs ${value.against}` : ""}: ${value.description ?? value.summary ?? ""}`,
      ...(value.why_it_matters ? [`  - Why it matters: ${value.why_it_matters}`] : [])
    ])
  ];
}

function seoArticleBlock(resource: ResourceV1): string[] {
  const article = resource.editorial?.seo_article;
  if (!article) return [];
  return [
    "",
    "## Guide",
    ...(article.intro ? [article.intro, ""] : []),
    ...(article.what_it_is ? ["### What it is", article.what_it_is, ""] : []),
    ...(article.why_it_matters ? ["### Why it matters", article.why_it_matters, ""] : []),
    ...(article.how_it_works ? ["### How it works", article.how_it_works, ""] : []),
    ...titledListBlock("Use Cases", article.use_cases),
    ...titledListBlock("Alternatives", article.alternatives),
    ...(article.getting_started?.length
      ? ["", "### Getting Started", ...article.getting_started.map((link) => `- ${link.label}: ${link.url}`)]
      : []),
    ...(article.faq?.length ? ["", "### FAQ", ...article.faq.flatMap((item) => [`- ${item.question}`, `  - ${item.answer}`])] : [])
  ];
}

function commandLineBlock(resource: ResourceV1): string[] {
  const commands = resource.editorial?.command_line;
  if (!commands?.length) return [];
  return [
    "",
    "## Command Line",
    ...commands.flatMap((item) => [
      `### ${item.label}`,
      ...(item.description ? [item.description, ""] : []),
      "```bash",
      item.command,
      "```"
    ])
  ];
}

export function resourceMarkdown(resource: ResourceV1): string {
  const detail = buildResourceDetailProfile(resource);
  const facts = [
    `- Category: ${resource.classification.primary_category}`,
    `- Resource type: ${resource.classification.resource_type}`,
    `- Open source: ${resource.decision_signals.open_source ? "yes" : "no"}`,
    `- License: ${resource.facts.license ?? "unknown"}`,
    `- Last verified: ${resource.facts.last_verified_at ?? "unknown"}`,
    ...(resource.facts.github_repo_full_name ? [`- GitHub repo: ${resource.facts.github_repo_full_name}`] : []),
    ...(resource.facts.github_stars !== undefined ? [`- GitHub stars: ${resource.facts.github_stars}`] : [])
  ];
  const packet = detail.agentPacket;

  const lines = [
    `# ${resource.identity.name}`,
    "",
    resource.identity.one_liner,
    "",
    "## Agent Decision Summary",
    `- Risk level: ${packet.risk_level}`,
    `- Source confidence: ${packet.source_confidence}`,
    `- Recommended workflows: ${packet.recommended_workflows.length ? packet.recommended_workflows.join(", ") : "verify with first workflow"}`,
    `- Permission surface: ${packet.permission_surface.length ? packet.permission_surface.join(", ") : "low explicit permission surface in metadata"}`,
    `- Agent JSON: ${packet.machine_readable.agent_json_url}`,
    "",
    ...(resource.identity.short_description ? ["## Summary", resource.identity.short_description, ""] : []),
    ...seoArticleBlock(resource),
    "## What It Does",
    detail.whatItIs,
    "",
    "## How To Evaluate",
    detail.howItWorks,
    "",
    ...(resource.positioning.why_it_matters ? ["## Why It Matters", resource.positioning.why_it_matters, ""] : []),
    ...listBlock("Best For", resource.positioning.best_for),
    ...listBlock("Not For", resource.positioning.not_for),
    ...titledListBlock("What It Actually Does", resource.editorial?.core_strengths),
    ...titledListBlock("Typical Use Cases", resource.editorial?.use_case_notes),
    ...titledListBlock("How It Compares", resource.editorial?.compare_notes),
    "",
    "## Fit Matrix",
    ...detail.fitMatrix.map((row) => `- ${row.workflow}: ${row.fit}. ${row.reason} Required check: ${row.required_checks[0]}`),
    "",
    "## Evidence",
    ...detail.evidenceClaims.map((claim) => `- ${claim.status}: ${claim.claim} Source: ${claim.source}`),
    ...(detail.missingChecks.length ? ["", "## Missing Checks", ...detail.missingChecks.map((check) => `- ${check}`)] : []),
    "",
    "## Next Actions",
    ...detail.nextActions.map((action) => `- ${action.label}: ${action.url ?? action.command ?? action.note}`),
    ...commandLineBlock(resource),
    "",
    "## Facts",
    ...facts,
    ...listBlock("Capabilities", resource.capabilities.core_capabilities),
    ...listBlock("Structured Use Case Tags", resource.positioning.use_cases),
    ...(resource.editorial?.getting_started?.length
      ? ["", "## Getting Started", ...resource.editorial.getting_started.map((link) => `- ${link.label}: ${link.url}`)]
      : []),
    "",
    "## Links",
    ...resource.links.items.map((link) => `- ${link.label}: ${link.url}`),
    "",
    "## Structured Outputs",
    `- JSON: ${resource.machine_readable.json_url}`,
    `- Markdown: ${resource.machine_readable.markdown_url}`,
    `- Agent JSON: ${packet.machine_readable.agent_json_url}`,
    `- Canonical: ${resource.machine_readable.canonical_url}`
  ];

  return `${lines.join("\n")}\n`;
}

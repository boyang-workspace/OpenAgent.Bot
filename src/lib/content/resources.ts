import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseResourceV1, type PrimaryCategory, type ResourceV1 } from "./resource-schema";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const publishedResourcesDir = path.join(rootDir, "content/resources/published");

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
  const resources = await readResourceDir(publishedResourcesDir);
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

export function resourcePath(resource: ResourceV1): string {
  return `/${resource.classification.primary_category}/${resource.slug}`;
}

function listBlock(title: string, values: string[] | undefined): string[] {
  if (!values?.length) return [];
  return ["", `## ${title}`, ...values.map((value) => `- ${value}`)];
}

export function resourceMarkdown(resource: ResourceV1): string {
  const facts = [
    `- Category: ${resource.classification.primary_category}`,
    `- Resource type: ${resource.classification.resource_type}`,
    `- Open source: ${resource.decision_signals.open_source ? "yes" : "no"}`,
    `- License: ${resource.facts.license ?? "unknown"}`,
    `- Pricing: ${resource.facts.pricing_model ?? "unknown"}`,
    `- Last verified: ${resource.facts.last_verified_at ?? "unknown"}`,
    ...(resource.facts.github_repo_full_name ? [`- GitHub repo: ${resource.facts.github_repo_full_name}`] : []),
    ...(resource.facts.github_stars !== undefined ? [`- GitHub stars: ${resource.facts.github_stars}`] : [])
  ];

  const lines = [
    `# ${resource.identity.name}`,
    "",
    resource.identity.one_liner,
    "",
    ...(resource.identity.short_description ? ["## Summary", resource.identity.short_description, ""] : []),
    ...(resource.positioning.why_it_matters ? ["## Why It Matters", resource.positioning.why_it_matters, ""] : []),
    ...listBlock("Best For", resource.positioning.best_for),
    ...listBlock("Not For", resource.positioning.not_for),
    "",
    "## Facts",
    ...facts,
    ...listBlock("Capabilities", resource.capabilities.core_capabilities),
    ...listBlock("Use Cases", resource.positioning.use_cases),
    "",
    "## Links",
    ...resource.links.items.map((link) => `- ${link.label}: ${link.url}`),
    "",
    "## Agent-readable",
    `- JSON: ${resource.machine_readable.json_url}`,
    `- Markdown: ${resource.machine_readable.markdown_url}`,
    `- Canonical: ${resource.machine_readable.canonical_url}`
  ];

  return `${lines.join("\n")}\n`;
}

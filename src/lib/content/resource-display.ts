import { categories } from "@/config/site";
import type { ResourceV1 } from "./resource-schema";

const categoryLabels = new Map<string, string>(categories.map((category) => [category.slug, category.label]));

export function formatResourceLabel(value: string): string {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

export function resourceCategoryLabel(resource: ResourceV1): string {
  return categoryLabels.get(resource.classification.primary_category) ?? formatResourceLabel(resource.classification.primary_category);
}

export function resourceSummary(resource: ResourceV1): string {
  return resource.identity.one_liner || resource.identity.short_description || "";
}

export function resourceImage(resource: ResourceV1): string {
  if (resource.media.thumbnail_url) return resource.media.thumbnail_url;
  if (resource.media.og_image_url) return resource.media.og_image_url;
  if (resource.facts.github_repo_full_name) {
    return `https://opengraph.githubassets.com/openagent-bot/${resource.facts.github_repo_full_name}`;
  }
  return `/resource-fallbacks/${resource.classification.primary_category}.svg`;
}

export function resourceTags(resource: ResourceV1, limit = 3): string[] {
  return Array.from(new Set([...resource.tags.capability, ...resource.tags.constraint, ...resource.tags.scenario])).slice(0, limit);
}

export function resourceSignals(resource: ResourceV1, limit = 3): string[] {
  const signals = [
    resource.decision_signals.open_source ? "Open source" : undefined,
    resource.decision_signals.local_first ? "Local first" : undefined,
    resource.decision_signals.self_hostable ? "Self-hosted" : undefined,
    resource.decision_signals.supports_mcp ? "MCP" : undefined,
    resource.decision_signals.supports_docker ? "Docker" : undefined,
    resource.decision_signals.has_api ? "API" : undefined,
    resource.decision_signals.has_cli ? "CLI" : undefined,
    resource.decision_signals.has_gui ? "GUI" : undefined
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(signals)).slice(0, limit);
}

export function resourceMeta(resource: ResourceV1): string[] {
  const meta = [
    resourceCategoryLabel(resource),
    resource.facts.license,
    resource.facts.github_stars !== undefined ? `${resource.facts.github_stars.toLocaleString("en-US")} stars` : undefined,
    resource.facts.last_verified_at ? `Verified ${resource.facts.last_verified_at.slice(0, 10)}` : undefined
  ];

  return meta.filter((value): value is string => Boolean(value));
}

export function resourceSearchText(resource: ResourceV1): string {
  return [
    resource.identity.name,
    resource.identity.one_liner,
    resource.identity.short_description,
    resource.positioning.why_it_matters,
    resource.classification.primary_category,
    resource.classification.resource_type,
    resource.facts.license,
    resource.facts.github_repo_full_name,
    resourceTags(resource, 12).join(" "),
    resourceSignals(resource, 8).join(" "),
    resource.positioning.best_for?.join(" "),
    resource.capabilities.core_capabilities?.join(" "),
    resource.capabilities.integrations?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

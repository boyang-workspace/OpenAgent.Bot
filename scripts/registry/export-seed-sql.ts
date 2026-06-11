import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseResourceV1, type ResourceLink, type ResourceV1 } from "../../src/lib/content/resource-schema";
import {
  dataQualityScore,
  inferRegistryPlacement,
  registryCategories,
  registryResourceTypes,
  sourceConfidence,
  type RegistrySourceConfidence
} from "../../src/lib/registry/ontology";

const publishedResourcesDir = path.join(process.cwd(), "content/resources/published");
const defaultOutputPath = path.join(process.cwd(), "output/resource-registry-seed.sql");

type ExportOptions = {
  out?: string;
  stdout: boolean;
  includeDeletes: boolean;
};

const deploymentDefinitions = [
  ["local", "Local", "Runs on a local machine or local network."],
  ["self_hosted", "Self-hosted", "Can run on user-controlled infrastructure."],
  ["cloud", "Cloud", "Runs as a managed or hosted cloud service."],
  ["hybrid", "Hybrid", "Uses a mix of local, self-hosted, and cloud execution."]
] as const;

function parseArgs(argv: string[]): ExportOptions {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    out: valueAfter("--out"),
    stdout: argv.includes("--stdout"),
    includeDeletes: !argv.includes("--append")
  };
}

function sqlString(value: string | undefined | null): string {
  if (value === undefined || value === null) return "NULL";
  return `'${value.replaceAll("'", "''")}'`;
}

function sqlNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "NULL";
  return String(value);
}

function sqlBoolean(value: boolean | undefined): string {
  return value ? "1" : "0";
}

function sqlJson(value: unknown): string {
  return sqlString(JSON.stringify(value));
}

function idPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function labelFromId(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => (["ai", "api", "cli", "gui", "mcp", "rag", "sdk", "ui", "vla"].includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}

function insertOrReplace(table: string, columns: string[], values: string[]): string {
  return `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
}

function sourceUrl(resource: ResourceV1): string | undefined {
  return resource.links.items.find((link) => link.type === "github")?.url ?? resource.links.items.find((link) => link.type === "docs")?.url ?? resource.links.primary_url;
}

function factRows(resource: ResourceV1, generatedAt: string, confidence: RegistrySourceConfidence): string[] {
  const facts: Array<[string, unknown]> = [
    ["license", resource.facts.license],
    ["pricing_model", resource.facts.pricing_model],
    ["github_stars", resource.facts.github_stars],
    ["github_forks", resource.facts.github_forks],
    ["github_repo_full_name", resource.facts.github_repo_full_name],
    ["github_last_commit_at", resource.facts.github_last_commit_at],
    ["last_verified_at", resource.facts.last_verified_at],
    ["open_source", resource.decision_signals.open_source],
    ["local_first", resource.decision_signals.local_first],
    ["self_hostable", resource.decision_signals.self_hostable],
    ["supports_mcp", resource.decision_signals.supports_mcp],
    ["supports_docker", resource.decision_signals.supports_docker],
    ["registry_placement", inferRegistryPlacement(resource)]
  ];

  return facts
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) =>
      insertOrReplace(
        "registry_fact_observations",
        ["id", "resource_id", "fact_key", "fact_value_json", "source_url", "source_type", "confidence", "observed_at", "created_at"],
        [
          sqlString(`fact_${resource.slug}_${idPart(key)}`),
          sqlString(resource.id),
          sqlString(key),
          sqlJson(value),
          sqlString(sourceUrl(resource)),
          sqlString("resource_v1"),
          sqlString(confidence),
          sqlString(resource.facts.last_verified_at ?? generatedAt),
          sqlString(generatedAt)
        ]
      )
    );
}

function linkRows(resource: ResourceV1, generatedAt: string): string[] {
  const rows: Array<ResourceLink & { isPrimary: boolean }> = resource.links.items.map((link) => ({
    ...link,
    isPrimary: link.url === resource.links.primary_url
  }));

  if (!rows.some((link) => link.url === resource.links.primary_url)) {
    rows.unshift({ type: "homepage", label: "Primary", url: resource.links.primary_url, isPrimary: true });
  }

  return rows.map((link, index) =>
    insertOrReplace(
      "registry_links",
      ["id", "resource_id", "link_type", "label", "url", "is_primary", "created_at", "updated_at"],
      [sqlString(`link_${resource.slug}_${index}`), sqlString(resource.id), sqlString(link.type), sqlString(link.label), sqlString(link.url), sqlBoolean(link.isPrimary), sqlString(generatedAt), sqlString(generatedAt)]
    )
  );
}

function relationshipRows(resource: ResourceV1, slugToId: Map<string, string>, generatedAt: string): string[] {
  const relationships: Array<[string, string[] | undefined]> = [
    ["similar", resource.relationships.similar_resources],
    ["alternative", resource.relationships.alternatives],
    ["integrates_with", resource.relationships.integrates_with],
    ["compares_to", resource.relationships.compare_with]
  ];
  const rows: string[] = [];

  for (const [type, targets] of relationships) {
    for (const targetSlug of targets ?? []) {
      rows.push(
        insertOrReplace(
          "registry_relationships",
          ["id", "source_resource_id", "target_resource_id", "target_slug", "relationship_type", "evidence_json", "confidence", "created_at", "updated_at"],
          [
            sqlString(`rel_${resource.slug}_${type}_${targetSlug}`),
            sqlString(resource.id),
            sqlString(slugToId.get(targetSlug)),
            sqlString(targetSlug),
            sqlString(type),
            sqlJson({ source: "resource.relationships" }),
            sqlString("medium"),
            sqlString(generatedAt),
            sqlString(generatedAt)
          ]
        )
      );
    }
  }

  return rows;
}

function robotSpecRow(resource: ResourceV1, generatedAt: string): string | undefined {
  const placement = inferRegistryPlacement(resource);
  if (placement.category !== "robots" && placement.category !== "robotics") return undefined;
  const text = [
    resource.slug,
    resource.identity.name,
    resource.identity.one_liner,
    ...(resource.classification.subcategories ?? []),
    ...(resource.capabilities.core_capabilities ?? [])
  ]
    .join(" ")
    .toLowerCase();
  const embodimentType = text.includes("humanoid") ? "humanoid" : text.includes("robot-arm") || text.includes("arm") ? "robot_arm" : text.includes("simulation") || text.includes("physics") ? "simulator" : "embodied_system";
  const simulationSupport = text.includes("simulation") || text.includes("physics") || text.includes("training") ? "explicit" : "unknown";

  return insertOrReplace(
    "registry_robot_specs",
    [
      "resource_id",
      "embodiment_type",
      "form_factor",
      "mobility",
      "manipulation",
      "sensors_json",
      "actuators_json",
      "autonomy_level",
      "sdk_json",
      "simulation_support",
      "availability",
      "safety_notes",
      "spec_confidence",
      "created_at",
      "updated_at"
    ],
    [
      sqlString(resource.id),
      sqlString(embodimentType),
      sqlString(embodimentType),
      sqlString(undefined),
      sqlString(text.includes("arm") || text.includes("manipulation") ? "explicit" : undefined),
      sqlJson([]),
      sqlJson([]),
      sqlString(undefined),
      sqlJson((resource.capabilities.interfaces ?? []).filter((item) => item.includes("sdk") || item.includes("api"))),
      sqlString(simulationSupport),
      sqlString(undefined),
      sqlString("Needs source-backed hardware, safety, and deployment review before high-confidence recommendation."),
      sqlString("low"),
      sqlString(generatedAt),
      sqlString(generatedAt)
    ]
  );
}

export async function loadPublishedResources(dir = publishedResourcesDir): Promise<ResourceV1[]> {
  const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort();
  const resources = await Promise.all(
    files.map(async (file) => {
      const raw = JSON.parse(await readFile(path.join(dir, file), "utf8"));
      return parseResourceV1(raw);
    })
  );
  return resources;
}

export function buildRegistrySeedSql(resources: ResourceV1[], generatedAt = new Date().toISOString(), includeDeletes = true): string {
  const lines: string[] = [
    "-- Generated by scripts/registry/export-seed-sql.ts",
    `-- Generated at ${generatedAt}`,
    "PRAGMA foreign_keys = ON;",
    "BEGIN TRANSACTION;"
  ];

  if (includeDeletes) {
    lines.push(
      "DELETE FROM registry_articles;",
      "DELETE FROM registry_robot_specs;",
      "DELETE FROM registry_relationships;",
      "DELETE FROM registry_fact_observations;",
      "DELETE FROM registry_links;",
      "DELETE FROM registry_resource_deployment_modes;",
      "DELETE FROM registry_deployment_modes;",
      "DELETE FROM registry_resource_interfaces;",
      "DELETE FROM registry_interfaces;",
      "DELETE FROM registry_resource_integrations;",
      "DELETE FROM registry_integrations;",
      "DELETE FROM registry_resource_capabilities;",
      "DELETE FROM registry_capabilities;",
      "DELETE FROM registry_resources;",
      "DELETE FROM registry_categories;",
      "DELETE FROM registry_resource_types;"
    );
  }

  registryResourceTypes.forEach((type) => {
    lines.push(
      insertOrReplace(
        "registry_resource_types",
        ["id", "label", "definition", "includes_json", "excludes_json", "created_at", "updated_at"],
        [sqlString(type.id), sqlString(type.label), sqlString(type.definition), sqlJson(type.includes), sqlJson(type.excludes), sqlString(generatedAt), sqlString(generatedAt)]
      )
    );
  });

  registryCategories.forEach((category, index) => {
    lines.push(
      insertOrReplace(
        "registry_categories",
        ["id", "label", "definition", "includes_json", "excludes_json", "display_order", "created_at", "updated_at"],
        [sqlString(category.id), sqlString(category.label), sqlString(category.definition), sqlJson(category.includes), sqlJson(category.excludes), String(index + 1), sqlString(generatedAt), sqlString(generatedAt)]
      )
    );
  });

  deploymentDefinitions.forEach(([id, label, definition]) => {
    lines.push(insertOrReplace("registry_deployment_modes", ["id", "label", "definition", "created_at", "updated_at"], [sqlString(id), sqlString(label), sqlString(definition), sqlString(generatedAt), sqlString(generatedAt)]));
  });

  const capabilityIds = new Set<string>();
  const integrationIds = new Set<string>();
  const interfaceIds = new Set<string>();
  const slugToId = new Map(resources.map((resource) => [resource.slug, resource.id]));

  resources.forEach((resource) => {
    resource.capabilities.core_capabilities?.forEach((capability) => capabilityIds.add(capability));
    resource.capabilities.integrations?.forEach((integration) => integrationIds.add(integration));
    resource.capabilities.interfaces?.forEach((interfaceId) => interfaceIds.add(interfaceId));
  });

  Array.from(capabilityIds)
    .sort()
    .forEach((capability) => {
      lines.push(
        insertOrReplace(
          "registry_capabilities",
          ["id", "label", "definition", "normalized_group", "created_at", "updated_at"],
          [sqlString(capability), sqlString(labelFromId(capability)), sqlString("Derived from current ResourceV1 capability tags. Needs ontology review."), sqlString(undefined), sqlString(generatedAt), sqlString(generatedAt)]
        )
      );
    });

  Array.from(integrationIds)
    .sort()
    .forEach((integration) => {
      lines.push(
        insertOrReplace(
          "registry_integrations",
          ["id", "label", "definition", "created_at", "updated_at"],
          [sqlString(integration), sqlString(labelFromId(integration)), sqlString("Derived from current ResourceV1 integration tags. Needs ontology review."), sqlString(generatedAt), sqlString(generatedAt)]
        )
      );
    });

  Array.from(interfaceIds)
    .sort()
    .forEach((interfaceId) => {
      lines.push(
        insertOrReplace(
          "registry_interfaces",
          ["id", "label", "definition", "created_at", "updated_at"],
          [sqlString(interfaceId), sqlString(labelFromId(interfaceId)), sqlString("Derived from current ResourceV1 interface data. Needs normalization."), sqlString(generatedAt), sqlString(generatedAt)]
        )
      );
    });

  resources.forEach((resource) => {
    const placement = inferRegistryPlacement(resource);
    const confidence = sourceConfidence(resource);
    lines.push(
      insertOrReplace(
        "registry_resources",
        [
          "id",
          "slug",
          "name",
          "short_name",
          "canonical_type",
          "primary_category",
          "legacy_category",
          "legacy_resource_type",
          "one_liner",
          "short_description",
          "status",
          "open_source",
          "license",
          "pricing_model",
          "source_confidence",
          "data_quality_score",
          "record_json",
          "created_at",
          "updated_at",
          "published_at",
          "last_verified_at"
        ],
        [
          sqlString(resource.id),
          sqlString(resource.slug),
          sqlString(resource.identity.name),
          sqlString(resource.identity.short_name),
          sqlString(placement.resourceType),
          sqlString(placement.category),
          sqlString(resource.classification.primary_category),
          sqlString(resource.classification.resource_type),
          sqlString(resource.identity.one_liner),
          sqlString(resource.identity.short_description),
          sqlString(resource.status),
          sqlBoolean(resource.decision_signals.open_source),
          sqlString(resource.facts.license),
          sqlString(resource.facts.pricing_model),
          sqlString(confidence),
          sqlNumber(dataQualityScore(resource)),
          sqlJson(resource),
          sqlString(resource.timestamps.created_at),
          sqlString(resource.timestamps.updated_at),
          sqlString(resource.timestamps.published_at),
          sqlString(resource.facts.last_verified_at)
        ]
      )
    );

    resource.capabilities.core_capabilities?.forEach((capability) => {
      lines.push(
        insertOrReplace(
          "registry_resource_capabilities",
          ["resource_id", "capability_id", "source", "confidence", "created_at"],
          [sqlString(resource.id), sqlString(capability), sqlString("resource_v1"), sqlString("medium"), sqlString(generatedAt)]
        )
      );
    });

    resource.capabilities.integrations?.forEach((integration) => {
      lines.push(
        insertOrReplace(
          "registry_resource_integrations",
          ["resource_id", "integration_id", "source", "confidence", "created_at"],
          [sqlString(resource.id), sqlString(integration), sqlString("resource_v1"), sqlString("medium"), sqlString(generatedAt)]
        )
      );
    });

    resource.capabilities.interfaces?.forEach((interfaceId) => {
      lines.push(
        insertOrReplace(
          "registry_resource_interfaces",
          ["resource_id", "interface_id", "source", "confidence", "created_at"],
          [sqlString(resource.id), sqlString(interfaceId), sqlString("resource_v1"), sqlString("low"), sqlString(generatedAt)]
        )
      );
    });

    resource.decision_signals.deployment_modes?.forEach((deploymentMode) => {
      lines.push(
        insertOrReplace(
          "registry_resource_deployment_modes",
          ["resource_id", "deployment_mode_id", "source", "confidence", "created_at"],
          [sqlString(resource.id), sqlString(deploymentMode), sqlString("resource_v1"), sqlString("medium"), sqlString(generatedAt)]
        )
      );
    });

    lines.push(...linkRows(resource, generatedAt));
    lines.push(...factRows(resource, generatedAt, confidence));
    lines.push(...relationshipRows(resource, slugToId, generatedAt));
    const robotSpec = robotSpecRow(resource, generatedAt);
    if (robotSpec) lines.push(robotSpec);
  });

  lines.push("COMMIT;", "");
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const resources = await loadPublishedResources();
  const sql = buildRegistrySeedSql(resources, new Date().toISOString(), options.includeDeletes);

  if (options.stdout) {
    console.log(sql);
    return;
  }

  const outPath = options.out ? path.resolve(options.out) : defaultOutputPath;
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, sql);
  console.log(`[registry] wrote ${outPath}`);
  console.log(`[registry] resources: ${resources.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

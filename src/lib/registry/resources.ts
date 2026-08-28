import type { RegistryFact, RegistryRelationship } from "./types";

// Resources reuse the observation ledger: each manifest keeps its own provenance,
// review date and change history instead of becoming a second source of truth.
export type RegistryResource = {
  name: string;
  kind: string;
  url: string;
  description?: string;
  license?: string;
  revision?: string;
  gitBlobSha?: string;
  sizeBytes?: number;
  sourceUrl?: string;
  observedAt: string;
};

function httpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

export function entityResources(facts: RegistryFact[]): RegistryResource[] {
  return facts.filter((fact) => fact.key.startsWith("resources.")).flatMap((fact) => {
    const items = Array.isArray(fact.value) ? fact.value : [fact.value];
    return items.flatMap((item) => {
      if (!item || typeof item !== "object" || typeof item.name !== "string" || !httpUrl(item.url) || typeof item.kind !== "string") return [];
      return [{
        name: item.name, kind: item.kind, url: item.url,
        description: typeof item.description === "string" ? item.description : undefined,
        license: typeof item.license === "string" ? item.license : undefined,
        revision: typeof item.revision === "string" ? item.revision : undefined,
        gitBlobSha: typeof item.gitBlobSha === "string" ? item.gitBlobSha : undefined,
        sizeBytes: typeof item.sizeBytes === "number" ? item.sizeBytes : undefined,
        sourceUrl: httpUrl(fact.sourceUrl) ? fact.sourceUrl : undefined,
        observedAt: fact.observedAt
      }];
    });
  });
}

export function relationshipLabel(relationship: Pick<RegistryRelationship, "type" | "direction">): string {
  const labels: Record<string, [string, string]> = {
    "powers": ["Powers", "Powered by"], "runs-on": ["Runs on", "Runs"],
    "uses-model": ["Uses model", "Used by"], "depends-on": ["Depends on", "Used by"],
    "integrates-with": ["Integrates with", "Integrates with"], "implements": ["Implements", "Implemented by"],
    "fork-of": ["Fork of", "Forked by"], "successor-of": ["Successor of", "Succeeded by"],
    "alternative-to": ["Alternative to", "Alternative to"], "manufactured-by": ["Manufactured by", "Manufactures"]
  };
  return labels[relationship.type]?.[relationship.direction === "inbound" ? 1 : 0] ?? relationship.type;
}

export function formatFactValue(value: unknown): string {
  if (value === null || value === undefined) return "Unknown";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

import { domainLabel, roboticsLayerLabel } from "./domains";
import { calendarDate, label } from "./format";
import type { RegistryDossier } from "./types";
import { entityResources, formatFactValue, relationshipLabel } from "./resources";

export const entityDocumentVersion = "2026-08-28";

export function buildEntityDocument(dossier: RegistryDossier) {
  const { entity } = dossier;
  return {
    schemaVersion: entityDocumentVersion,
    canonicalUrl: `https://www.openagent.bot/project/${entity.slug}`,
    entity: {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      field: entity.primaryDomain ?? null,
      fields: entity.domains,
      useCases: entity.useCases ?? [],
      artifactType: entity.kind,
      robotics: entity.robotics ?? null,
      lifecycle: entity.lifecycle,
      summary: entity.summary,
      description: entity.description ?? null,
      organization: entity.organization ?? null,
      country: entity.country ?? null,
      opennessStatus: entity.opennessStatus,
      licenseSpdx: entity.licenseSpdx ?? null,
      urls: {
        canonical: entity.canonicalUrl ?? null,
        repository: entity.repositoryUrl ?? null,
        documentation: entity.documentationUrl ?? null
      },
      metrics: {
        stars: entity.stars ?? null,
        forks: entity.forks ?? null,
        watchers: entity.watchers ?? null,
        downloads30d: entity.downloads30d ?? null,
        openIssues: entity.openIssues ?? null
      },
      dates: {
        firstSeen: entity.firstSeenAt,
        lastSeen: entity.lastSeenAt,
        lastVerified: entity.lastVerifiedAt ?? null,
        lastCommit: entity.lastCommitAt ?? null,
        lastRelease: entity.lastReleaseAt ?? null
      }
    },
    classification: dossier.domainAssignments,
    openness: dossier.opennessFacets,
    facts: dossier.facts,
    resources: entityResources(dossier.facts),
    relationships: dossier.relationships,
    changes: dossier.changes,
    sources: dossier.subscriptions,
    record: dossier.record
  };
}

function markdownValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(formatFactValue).join(", ") || "Unknown";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "Unknown";
  return formatFactValue(value).replaceAll("\n", " ");
}

export function buildEntityMarkdown(dossier: RegistryDossier): string {
  const { entity } = dossier;
  const field = entity.primaryDomain ? domainLabel(entity.primaryDomain) : "Unknown";
  const roboticsClassification = entity.robotics
    ? `Robotics layer: ${roboticsLayerLabel(entity.robotics.layer)}\nRobotics subtype: ${label(entity.robotics.formFactor ?? entity.robotics.modelType ?? entity.robotics.stackType ?? "other")}\n`
    : "";
  const facts = dossier.facts.length
    ? dossier.facts.map((fact) => `- ${label(fact.key.replaceAll("_", "-"))}: ${markdownValue(fact.value)} — ${fact.sourceName}, ${calendarDate(fact.observedAt)}${fact.sourceUrl ? ` (${fact.sourceUrl})` : ""}`).join("\n")
    : "- No current attributed facts.";
  const openness = dossier.opennessFacets.length
    ? dossier.opennessFacets.map((facet) => `- ${label(facet.facet)}: ${label(facet.status)}${facet.licenseOrTerms ? ` — ${facet.licenseOrTerms}` : ""}${facet.sourceUrl ? ` (${facet.sourceUrl})` : ""}`).join("\n")
    : `- Overall: ${label(entity.opennessStatus)}${entity.licenseSpdx ? ` — ${entity.licenseSpdx}` : ""}`;
  const relationships = dossier.relationships.length
    ? dossier.relationships.map((relationship) => `- ${relationshipLabel(relationship)}: [${relationship.entity.name}](https://www.openagent.bot/project/${relationship.entity.slug}) — ${label(relationship.status)}, ${Math.round(relationship.confidence * 100)}% confidence`).join("\n")
    : "- No evidenced relationships are currently published.";
  const sources = dossier.subscriptions.length
    ? dossier.subscriptions.map((source) => `- ${source.sourceName} (${label(source.sourceTrustTier)}): ${source.locator}`).join("\n")
    : "- No active entity subscriptions.";
  const changes = dossier.changes.length
    ? dossier.changes.slice(0, 10).map((change) => `- ${calendarDate(change.detectedAt)}: ${label(change.factKey.replaceAll("_", "-"))} ${change.changeType} — ${change.sourceName}`).join("\n")
    : "- No verified changes after the current baseline.";

  return `# ${entity.name}

Canonical: https://www.openagent.bot/project/${entity.slug}
Field: ${field}
Use cases: ${(entity.useCases ?? []).map((item) => item.name).join(", ") || "Not classified"}
${roboticsClassification}Artifact type: ${label(entity.kind)}
Status: ${label(entity.lifecycle)}
Openness: ${label(entity.opennessStatus)}
Last verified: ${calendarDate(entity.lastVerifiedAt)}

## Summary

${entity.description ?? entity.summary}

## Technical facts

${facts}

## Open passport

${openness}

## Compatibility and relationships

${relationships}

## Evidence sources

${sources}

## Recent changes

${changes}

## Registry record

- Observations: ${dossier.record.observationCount}
- Metric snapshots: ${dossier.record.metricSnapshotCount}
- First indexed: ${calendarDate(entity.firstSeenAt)}
- Last observed: ${calendarDate(dossier.record.lastObservationAt)}
`;
}

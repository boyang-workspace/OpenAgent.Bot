import type { RegistryDossier, RegistryEntity } from "@/lib/registry/types";

export type IndexabilityDecision = { indexable: boolean; reasons: string[] };

const uiStateParameters = new Set([
  "category",
  "compare",
  "days",
  "domain",
  "filter",
  "freshness",
  "interface",
  "items",
  "kind",
  "layer",
  "license",
  "openness",
  "page",
  "projects",
  "q",
  "selected",
  "scope",
  "sort",
  "use_case",
  "view"
]);

/**
 * Query strings used as temporary database/filter state must not create a
 * second indexable URL. Tracking parameters such as `utm_source` and `ref`
 * are left to the page canonical instead of forcing noindex.
 */
export function queryStateIndexability(searchParams: URLSearchParams): IndexabilityDecision {
  const stateParameters = [...searchParams.keys()].filter((parameter) => uiStateParameters.has(parameter));
  return stateParameters.length
    ? { indexable: false, reasons: stateParameters.map((parameter) => `ui-state:${parameter}`) }
    : { indexable: true, reasons: [] };
}

export function projectIndexability(entity: RegistryEntity, evidenceRecords = entity.evidenceRecords ?? 0, sourceCount = entity.sourceCount ?? 0): IndexabilityDecision {
  const reasons: string[] = [];
  if (!entity.summary.trim()) reasons.push("missing-summary");
  if (evidenceRecords < 1) reasons.push("missing-evidence");
  if (sourceCount < 1) reasons.push("missing-source");
  return { indexable: reasons.length === 0, reasons };
}

export function landingIndexability(total: number): IndexabilityDecision {
  return total >= 2 ? { indexable: true, reasons: [] } : { indexable: false, reasons: [total === 0 ? "empty" : "thin"] };
}

export function compareIndexability(dossiers: RegistryDossier[]): IndexabilityDecision {
  const reasons: string[] = [];
  if (dossiers.length < 2) reasons.push("fewer-than-two-entities");
  if (dossiers.some((item) => item.record.observationCount < 1)) reasons.push("insufficient-evidence");
  const comparableFields = dossiers.length < 2 ? 0 : [
    dossiers.every((item) => Boolean(item.entity.kind)),
    dossiers.every((item) => Boolean(item.entity.opennessStatus)),
    dossiers.every((item) => Boolean(item.entity.licenseSpdx)),
    dossiers.every((item) => item.entity.stars !== undefined),
    dossiers.every((item) => Boolean(item.entity.lastVerifiedAt)),
    dossiers.every((item) => item.record.observationCount > 0)
  ].filter(Boolean).length;
  if (comparableFields < 5) reasons.push("fewer-than-five-comparable-fields");
  return { indexable: reasons.length === 0, reasons };
}

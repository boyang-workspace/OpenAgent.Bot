import { calendarDate, relativeDate } from "./format";
import type { RegistryDossier } from "./types";

export type SystemScorecardRow = {
  label: string;
  value: string;
  detail: string;
  status: "available" | "partial" | "unknown";
};

/**
 * Produces a decision-oriented summary from attributed registry data. It never
 * assigns a composite score or infers an unrecorded capability.
 */
export function buildSystemScorecard(dossier: RegistryDossier): SystemScorecardRow[] {
  const { entity, record, subscriptions, opennessFacets, relationships, facts, metricSnapshots } = dossier;
  const activityDate = entity.lastCommitAt ?? entity.lastReleaseAt ?? entity.lastVerifiedAt;
  const evaluationFacts = facts.filter((fact) => /benchmark|evaluation|performance|reliability/i.test(fact.key));
  const interfaceFacts = facts.filter((fact) => /interface|protocol|runtime|compatib/i.test(fact.key));
  const openFacets = opennessFacets.filter((facet) => facet.status === "open").length;

  return [
    {
      label: "Evidence",
      value: record.observationCount ? `${record.observationCount} observations` : "Not recorded",
      detail: record.firstObservationAt ? `Tracked since ${calendarDate(record.firstObservationAt)}` : "No dated observation is available.",
      status: record.observationCount && subscriptions.length ? "available" : "partial"
    },
    {
      label: "Activity",
      value: activityDate ? relativeDate(activityDate) : "Not recorded",
      detail: metricSnapshots.length ? `${metricSnapshots.length} metric snapshots in this record` : "No metric history in this record.",
      status: activityDate ? "available" : "unknown"
    },
    {
      label: "Openness",
      value: opennessFacets.length ? `${openFacets}/${opennessFacets.length} facets open` : "Not reviewed",
      detail: opennessFacets.length ? "Facet-level status, not a blanket openness claim." : "No facet-level evidence is available.",
      status: opennessFacets.length ? "available" : "unknown"
    },
    {
      label: "Compatibility",
      value: interfaceFacts.length || relationships.length ? "Documented signals" : "Not recorded",
      detail: interfaceFacts.length || relationships.length
        ? `${interfaceFacts.length} interface/protocol facts · ${relationships.length} reviewed relationships`
        : "No compatibility claim is inferred from repository metadata.",
      status: interfaceFacts.length || relationships.length ? "partial" : "unknown"
    },
    {
      label: "Evaluation",
      value: evaluationFacts.length ? "Documented results" : "Not recorded",
      detail: evaluationFacts.length
        ? `${evaluationFacts.length} attributed evaluation or performance facts`
        : "Absence does not mean the system was not evaluated.",
      status: evaluationFacts.length ? "partial" : "unknown"
    }
  ];
}

export function changeSignal(factKey: string): "Activity" | "Release" | "Openness" | "Compatibility" | "Record" {
  if (/release/i.test(factKey)) return "Release";
  if (/stars|forks|issues|commit|downloads|contributors/i.test(factKey)) return "Activity";
  if (/license|open|weights|hardware|governance/i.test(factKey)) return "Openness";
  if (/interface|protocol|runtime|compatib|depend/i.test(factKey)) return "Compatibility";
  return "Record";
}

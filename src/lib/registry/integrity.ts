import type { OpennessStatus, RegistryLicenseScope, RegistryOpennessFacet } from "./types";

type DerivationInput = {
  claimed: OpennessStatus;
  facets: Array<Pick<RegistryOpennessFacet, "facet" | "status">>;
  licenses?: Array<Pick<RegistryLicenseScope, "status">>;
};

export type IntegrityIssue = {
  code: "OPENNESS_CONTRADICTION" | "MIXED_LICENSE_MISMATCH" | "MISSING_PRIMARY_SOURCE" | "STALE_EVIDENCE";
  severity: "warning" | "error";
  message: string;
};

export function deriveOpennessStatus({ claimed, facets, licenses = [] }: DerivationInput): OpennessStatus {
  const code = facets.find((facet) => facet.facet === "code")?.status;
  const weights = facets.find((facet) => facet.facet === "weights")?.status;
  const hasOpenLicense = licenses.some((license) => license.status === "open");
  const hasRestrictedLicense = licenses.some((license) => license.status === "restricted");

  if (hasOpenLicense && hasRestrictedLicense) return "open-core";
  if (claimed === "open-source" && code !== "open") return "unknown";
  if (claimed === "open-weights" && weights !== "open" && weights !== "partial") return "unknown";
  if (claimed === "open-core" && code !== "open" && code !== "partial" && !hasOpenLicense) return "unknown";
  if (claimed === "source-available" && code === "closed") return "closed";
  return claimed;
}

export function validateEntityIntegrity(input: DerivationInput & { hasPrimarySource: boolean; staleEvidence?: boolean }): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const derived = deriveOpennessStatus(input);
  if (derived !== input.claimed) {
    issues.push({
      code: "OPENNESS_CONTRADICTION",
      severity: "error",
      message: `Claimed openness ${input.claimed} is not supported by facet-level evidence; derived status is ${derived}.`
    });
  }
  if (input.licenses?.some((item) => item.status === "open") && input.licenses.some((item) => item.status === "restricted") && input.claimed !== "open-core") {
    issues.push({ code: "MIXED_LICENSE_MISMATCH", severity: "error", message: "Open and restricted license scopes require an open-core classification." });
  }
  if (!input.hasPrimarySource) issues.push({ code: "MISSING_PRIMARY_SOURCE", severity: "error", message: "No active primary source is registered." });
  if (input.staleEvidence) issues.push({ code: "STALE_EVIDENCE", severity: "warning", message: "The newest evidence is older than the configured freshness window." });
  return issues;
}

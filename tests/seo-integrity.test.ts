import { describe, expect, it } from "vitest";
import { deriveOpennessStatus, validateEntityIntegrity } from "../src/lib/registry/integrity";
import { compareIndexability, landingIndexability, projectIndexability, queryStateIndexability } from "../src/lib/seo/indexability";

describe("SEO and registry integrity gates", () => {
  it("does not publish unsupported open-source claims", () => {
    expect(deriveOpennessStatus({ claimed: "open-source", facets: [{ facet: "code", status: "unknown" }] })).toBe("unknown");
    expect(validateEntityIntegrity({ claimed: "open-source", facets: [{ facet: "code", status: "closed" }], hasPrimarySource: true })).toEqual(expect.arrayContaining([expect.objectContaining({ code: "OPENNESS_CONTRADICTION", severity: "error" })]));
  });

  it("derives open-core when license scopes mix open and restricted terms", () => {
    const facets = [{ facet: "code" as const, status: "open" as const }];
    const licenses = [{ status: "open" as const }, { status: "restricted" as const }];
    expect(deriveOpennessStatus({ claimed: "open-source", facets, licenses })).toBe("open-core");
    expect(validateEntityIntegrity({ claimed: "open-source", facets, licenses, hasPrimarySource: true }).map((issue) => issue.code)).toContain("MIXED_LICENSE_MISMATCH");
  });

  it("noindexes thin entities, landings and comparisons", () => {
    const entity = { summary: "", evidenceRecords: 0, sourceCount: 0 } as Parameters<typeof projectIndexability>[0];
    expect(projectIndexability(entity)).toEqual({ indexable: false, reasons: ["missing-summary", "missing-evidence", "missing-source"] });
    expect(landingIndexability(1)).toEqual({ indexable: false, reasons: ["thin"] });
    expect(compareIndexability([])).toMatchObject({ indexable: false });
  });

  it("noindexes UI query state without penalizing attribution parameters", () => {
    expect(queryStateIndexability(new URLSearchParams("sort=stars&license=MIT"))).toEqual({
      indexable: false,
      reasons: ["ui-state:sort", "ui-state:license"]
    });
    expect(queryStateIndexability(new URLSearchParams("utm_source=x&ref=launch"))).toEqual({ indexable: true, reasons: [] });
  });
});

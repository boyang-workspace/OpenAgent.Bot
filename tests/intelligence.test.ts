import { describe, expect, it } from "vitest";
import { buildSystemScorecard, changeSignal } from "../src/lib/registry/intelligence";
import type { RegistryDossier } from "../src/lib/registry/types";

const dossier = {
  entity: { kind: "agent", name: "Example", slug: "example", id: "entity_example", domains: ["agent"], summary: "Example", lifecycle: "active", opennessStatus: "open-source", firstSeenAt: "2026-01-01T00:00:00Z", lastSeenAt: "2026-01-01T00:00:00Z", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", lastCommitAt: "2026-08-27T00:00:00Z" },
  domainAssignments: [], facts: [], opennessFacets: [], changes: [], relationships: [], subscriptions: [], metricSnapshots: [],
  record: { observationCount: 0, metricSnapshotCount: 0 }
} satisfies RegistryDossier;

describe("system intelligence summaries", () => {
  it("keeps missing evaluation and compatibility data visibly unknown", () => {
    const rows = buildSystemScorecard(dossier);
    expect(rows.find((row) => row.label === "Evaluation")).toMatchObject({ value: "Not recorded", status: "unknown" });
    expect(rows.find((row) => row.label === "Compatibility")).toMatchObject({ value: "Not recorded", status: "unknown" });
  });

  it("classifies observed facts without inventing a market signal", () => {
    expect(changeSignal("github_release.latest")).toBe("Release");
    expect(changeSignal("github.stars")).toBe("Activity");
    expect(changeSignal("license.spdx")).toBe("Openness");
    expect(changeSignal("summary")).toBe("Record");
  });
});

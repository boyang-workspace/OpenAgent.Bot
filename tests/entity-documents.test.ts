import { describe, expect, it } from "vitest";
import { buildEntityDocument, buildEntityMarkdown } from "../src/lib/registry/documents";
import type { RegistryDossier } from "../src/lib/registry/types";

const dossier = {
  entity: {
    id: "robotics_openarm", slug: "openarm", name: "OpenArm", kind: "robot",
    domains: ["robotics"], primaryDomain: "robotics", summary: "Open robot arm",
    lifecycle: "active", opennessStatus: "open-source", firstSeenAt: "2026-08-22T00:00:00Z",
    lastSeenAt: "2026-08-26T00:00:00Z", lastVerifiedAt: "2026-08-26T00:00:00Z",
    createdAt: "2026-08-22T00:00:00Z", updatedAt: "2026-08-26T00:00:00Z"
  },
  domainAssignments: [], facts: [], opennessFacets: [], changes: [], relationships: [], subscriptions: [], metricSnapshots: [],
  record: { observationCount: 2, metricSnapshotCount: 3 }
} satisfies RegistryDossier;

describe("machine-readable entity documents", () => {
  it("builds a stable JSON document from the dossier", () => {
    const document = buildEntityDocument(dossier);
    expect(document.canonicalUrl).toBe("https://www.openagent.bot/project/openarm");
    expect(document.entity.field).toBe("robotics");
    expect(document.entity.artifactType).toBe("robot");
  });

  it("builds compact Markdown from the same dossier", () => {
    const markdown = buildEntityMarkdown(dossier);
    expect(markdown).toContain("# OpenArm");
    expect(markdown).toContain("Field: Robotics");
    expect(markdown).toContain("No evidenced relationships are currently published.");
  });
});

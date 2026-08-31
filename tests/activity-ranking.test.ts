import { describe, expect, it } from "vitest";
import { lifecycleFromActivity, rankByActivity } from "../src/lib/registry/activity";
import type { RegistryEntity } from "../src/lib/registry/types";

function entity(name: string, values: Partial<RegistryEntity>): RegistryEntity {
  return {
    id: name, slug: name, kind: "agent", domains: ["agent"], name, summary: name,
    lifecycle: "active", opennessStatus: "open-source", firstSeenAt: "2025-01-01T00:00:00Z",
    lastSeenAt: "2025-01-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z", ...values
  };
}

describe("category activity ordering", () => {
  it("orders by the freshest qualifying signal and exposes the signal", () => {
    const rows = rankByActivity([
      entity("older", { lastCommitAt: "2026-08-01T00:00:00Z", stars: 1000 }),
      entity("newer", { lastReleaseAt: "2026-08-20T00:00:00Z", stars: 2 })
    ], "agent", new Date("2026-08-29T00:00:00Z"));
    expect(rows.map((row) => row.entity.name)).toEqual(["newer", "older"]);
    expect(rows[0]).toMatchObject({ rank: 1, signal: "release", ageDays: 9, state: "active" });
  });

  it("uses category-specific lifecycle windows", () => {
    const sample = entity("stable", {});
    expect(lifecycleFromActivity(sample, "agent", 120)).toBe("cooling");
    expect(lifecycleFromActivity(sample, "robot-hardware", 120)).toBe("active");
    expect(lifecycleFromActivity(sample, "robot-hardware", 800)).toBe("dormant");
  });

  it("honours an official archive state regardless of recency", () => {
    expect(lifecycleFromActivity(entity("archived", { lifecycle: "archived" }), "agent", 1)).toBe("archived");
  });

  it("does not treat an internal record update as project activity", () => {
    const [row] = rankByActivity([entity("unobserved", { updatedAt: "2026-08-29T00:00:00Z" })], "agent", new Date("2026-08-29T00:00:00Z"));
    expect(row).toMatchObject({ signal: "unknown", score: 0, state: "unknown" });
  });
});

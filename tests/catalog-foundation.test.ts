import { describe, expect, it } from "vitest";
import { CatalogRepository } from "../src/lib/registry/catalog";
import { registryTestDatabase } from "./helpers/registry-database";

describe("catalogue foundation", () => {
  it("backfills every entity into one explicit catalogue category", () => {
    const { db } = registryTestDatabase();
    const entities = db.prepare("SELECT COUNT(*) AS count FROM entities").get() as { count: number };
    const profiles = db.prepare("SELECT COUNT(*) AS count FROM catalog_profiles").get() as { count: number };
    expect(profiles.count).toBe(entities.count);
  });

  it("keeps robot intelligence and physical platforms in different categories", () => {
    const { db } = registryTestDatabase();
    const statement = db.prepare(`SELECT cp.primary_category FROM catalog_profiles cp
      JOIN entities e ON e.id = cp.entity_id WHERE e.slug = ?`);
    const model = statement.get("isaac-gr00t") as { primary_category: string } | undefined;
    const hardware = statement.get("openarm") as { primary_category: string } | undefined;
    expect(model?.primary_category).toBe("robot-model");
    expect(hardware?.primary_category).toBe("robot-hardware");
  });

  it("seeds one collecting activity definition for each primary leaderboard", () => {
    const { db } = registryTestDatabase();
    const rows = db.prepare(`SELECT category, family, status FROM ranking_definitions
      WHERE category != 'all' ORDER BY category`).all() as Array<{ category: string; family: string; status: string }>;
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.family === "activity" && row.status === "collecting")).toBe(true);
  });

  it("loads attributed catalogue detail without inventing missing records", async () => {
    const { adapter } = registryTestDatabase();
    const detail = await new CatalogRepository(adapter).getDetail("robotics_openarm");
    expect(detail.profile?.category).toBe("robot-hardware");
    expect(detail.releases).toEqual([]);
    expect(detail.papers).toEqual([]);
    expect(detail.evaluations).toEqual([]);
    expect(detail.lifecycle).toBeUndefined();
  });
});

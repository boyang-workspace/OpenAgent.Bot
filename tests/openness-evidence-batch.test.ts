import { describe, expect, it } from "vitest";
import { RegistryRepository } from "../src/lib/registry/repository";
import { registryTestDatabase } from "./helpers/registry-database";

describe("verified code-openness batch", () => {
  it("publishes only reviewed code facets and keeps non-code licenses unresolved", async () => {
    const { db, adapter } = registryTestDatabase();
    try {
      const scopes = db.prepare("SELECT COUNT(*) AS count FROM entity_license_scopes WHERE id LIKE 'verify_20260831_%' AND id NOT LIKE 'verify_20260831_b2_%' AND id NOT LIKE 'verify_20260831_b3_%'").get() as { count: number };
      const facets = db.prepare("SELECT COUNT(*) AS count FROM openness_facets WHERE facet='code' AND entity_id IN (SELECT entity_id FROM entity_license_scopes WHERE id LIKE 'verify_20260831_%' AND id NOT LIKE 'verify_20260831_b2_%' AND id NOT LIKE 'verify_20260831_b3_%')").get() as { count: number };
      expect(scopes.count).toBe(29);
      expect(facets.count).toBe(29);
      expect(db.prepare("SELECT COUNT(*) AS count FROM entity_license_scopes WHERE id LIKE 'verify_20260831_%' AND id NOT LIKE 'verify_20260831_b2_%' AND id NOT LIKE 'verify_20260831_b3_%' AND (status!='open' OR source_url NOT LIKE 'https://github.com/%')").get()).toEqual({ count: 0 });

      const registry = new RegistryRepository(adapter);
      expect((await registry.getEntity("cline"))?.opennessStatus).toBe("open-source");
      expect((await registry.getEntity("autogen"))?.opennessStatus).toBe("open-source");
    } finally { db.close(); }
  });

  it("publishes the second reviewed batch while keeping ROS 2 unresolved", async () => {
    const { db, adapter } = registryTestDatabase();
    try {
      expect(db.prepare("SELECT COUNT(*) AS count FROM entity_license_scopes WHERE id LIKE 'verify_20260831_b2_%'").get()).toEqual({ count: 29 });
      expect(db.prepare("SELECT COUNT(*) AS count FROM openness_facets WHERE facet='code' AND entity_id IN (SELECT entity_id FROM entity_license_scopes WHERE id LIKE 'verify_20260831_b2_%')").get()).toEqual({ count: 29 });
      expect(db.prepare("SELECT scope,path,license_identifier,status FROM entity_license_scopes WHERE entity_id='res_autogen'").get()).toEqual({ scope: "repository code", path: "LICENSE-CODE", license_identifier: "MIT", status: "open" });
      expect(db.prepare("SELECT license_spdx FROM entities WHERE id='res_autogen'").get()).toEqual({ license_spdx: "MIT" });
      expect(db.prepare("SELECT value_json FROM current_facts WHERE entity_id='res_autogen' AND fact_key='license_spdx'").get()).toEqual({ value_json: '"MIT"' });
      expect(db.prepare("SELECT COUNT(*) AS count FROM openness_facets WHERE entity_id='robotics_ros2' AND facet='code'").get()).toEqual({ count: 0 });
      expect((await new RegistryRepository(adapter).getEntity("ros-2"))?.opennessStatus).toBe("unknown");
    } finally { db.close(); }
  });

  it("preserves the old MetaGPT binding and fixes projected official URLs", () => {
    const { db } = registryTestDatabase();
    try {
      const bindings = db.prepare("SELECT locator,enabled,valid_until FROM source_subscriptions WHERE entity_id='res_metagpt' AND source_id='github' ORDER BY enabled").all() as Array<{ locator: string; enabled: number; valid_until: string | null }>;
      expect(bindings).toEqual([
        expect.objectContaining({ locator: "geekan/MetaGPT", enabled: 0, valid_until: "2026-08-31T00:53:36.158Z" }),
        expect.objectContaining({ locator: "FoundationAgents/MetaGPT", enabled: 1, valid_until: null })
      ]);
      expect(db.prepare("SELECT repository_url,canonical_url,documentation_url FROM entities WHERE id='res_metagpt'").get()).toEqual({
        repository_url: "https://github.com/FoundationAgents/MetaGPT",
        canonical_url: "https://atoms.dev/",
        documentation_url: "https://docs.deepwisdom.ai/main/en/"
      });
      expect(db.prepare("SELECT license_spdx FROM entities WHERE id='res_kilo_code'").get()).toEqual({ license_spdx: "MIT" });
      expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    } finally { db.close(); }
  });

  it("preserves the old Goose binding and records the official repository move", () => {
    const { db } = registryTestDatabase();
    try {
      const bindings = db.prepare("SELECT locator,enabled,valid_until FROM source_subscriptions WHERE entity_id='res_goose' AND source_id='github' ORDER BY enabled").all() as Array<{ locator: string; enabled: number; valid_until: string | null }>;
      expect(bindings).toEqual([
        expect.objectContaining({ locator: "block/goose", enabled: 0, valid_until: "2026-08-31T00:38:34.659Z" }),
        expect.objectContaining({ locator: "aaif-goose/goose", enabled: 1, valid_until: null })
      ]);
      expect(db.prepare("SELECT old_locator,new_locator FROM source_binding_events WHERE id='binding_res_goose_github_20260831'").get()).toEqual({ old_locator: "block/goose", new_locator: "aaif-goose/goose" });
      expect(db.prepare("SELECT repository_url,canonical_url,documentation_url FROM entities WHERE id='res_goose'").get()).toEqual({ repository_url: "https://github.com/aaif-goose/goose", canonical_url: "https://goose-docs.ai/", documentation_url: "https://goose-docs.ai/" });
      expect(db.prepare("SELECT COUNT(*) AS count FROM change_events WHERE id LIKE 'change_goose_%_20260831'").get()).toEqual({ count: 3 });
      expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    } finally { db.close(); }
  });

  it("publishes the third batch and derives Tabby as open-core", async () => {
    const { db, adapter } = registryTestDatabase();
    try {
      expect(db.prepare("SELECT COUNT(*) AS count FROM entity_license_scopes WHERE id LIKE 'verify_20260831_b3_%'").get()).toEqual({ count: 29 });
      expect(db.prepare("SELECT COUNT(*) AS count FROM openness_facets WHERE entity_id IN (SELECT entity_id FROM entity_license_scopes WHERE id LIKE 'verify_20260831_b3_%') AND facet='code'").get()).toEqual({ count: 28 });
      expect((await new RegistryRepository(adapter).getEntity("tabby"))?.opennessStatus).toBe("open-core");
      expect(db.prepare("SELECT scope,status FROM entity_license_scopes WHERE entity_id='res_tabby' ORDER BY status").all()).toEqual([
        { scope: "open-source core", status: "open" },
        { scope: "enterprise directory", status: "restricted" }
      ]);
      expect(db.prepare("SELECT COUNT(*) AS count FROM openness_facets WHERE entity_id IN ('robotics_ros2','res_ai_agents_skills') AND facet='code'").get()).toEqual({ count: 0 });
    } finally { db.close(); }
  });

  it("moves third-batch source bindings without discarding history", () => {
    const { db } = registryTestDatabase();
    try {
      expect(db.prepare("SELECT locator FROM source_subscriptions WHERE entity_id='res_github_mcp_server' AND source_id='github' AND enabled=1").get()).toEqual({ locator: "github/github-mcp-server" });
      expect(db.prepare("SELECT locator FROM source_subscriptions WHERE entity_id='res_memori' AND source_id='github' AND enabled=1").get()).toEqual({ locator: "MemoriLabs/Memori" });
      expect(db.prepare("SELECT repository_url,license_spdx FROM entities WHERE id='res_odysseus'").get()).toEqual({ repository_url: "https://github.com/odysseus-dev/odysseus", license_spdx: "AGPL-3.0" });
      expect(db.prepare("SELECT repository_url FROM entities WHERE id='res_antigravity_awesome_skills'").get()).toEqual({ repository_url: "https://github.com/sickn33/agentic-awesome-skills" });
      expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    } finally { db.close(); }
  });
});

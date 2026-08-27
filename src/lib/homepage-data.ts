import { getRegistry } from "@/lib/registry/runtime";
import type { RegistryChange, RegistryEntity, RegistryStats } from "@/lib/registry/types";

export type HomepageData = {
  agents: RegistryEntity[];
  robotPlatforms: RegistryEntity[];
  robotIntelligence: RegistryEntity[];
  roboticsStack: RegistryEntity[];
  changes: RegistryChange[];
  stats: RegistryStats;
};

const emptyStats: RegistryStats = {
  entities: 0,
  agents: 0,
  robots: 0,
  infrastructure: 0,
  robotPlatforms: 0,
  robotIntelligence: 0,
  roboticsStack: 0,
  models: 0,
  tools: 0,
  sources: 0,
  liveSources: 0,
  observations: 0,
  metricEntities: 0,
  changes30d: 0
};

export async function getHomepageData(): Promise<HomepageData> {
  try {
    const registry = getRegistry();
    const [agentResult, platformResult, intelligenceResult, stackResult, changes, stats] = await Promise.all([
      registry.listEntities({
        domains: ["agent"],
        kinds: ["agent", "agent-framework"],
        openness: ["open-source", "open-core", "source-available"],
        sort: "stars",
        limit: 8
      }),
      registry.listEntities({
        domains: ["robotics"],
        roboticsLayers: ["platform"],
        openness: ["open-source", "open-core", "source-available"],
        sort: "stars",
        limit: 6
      }),
      registry.listEntities({
        domains: ["robotics"],
        roboticsLayers: ["intelligence"],
        openness: ["open-source", "open-weights", "open-core", "source-available"],
        sort: "stars",
        limit: 6
      }),
      registry.listEntities({
        domains: ["robotics"],
        roboticsLayers: ["stack"],
        openness: ["open-source", "open-core", "source-available"],
        sort: "stars",
        limit: 6
      }),
      registry.listChanges(10),
      registry.getStats()
    ]);

    return {
      agents: agentResult.items,
      robotPlatforms: platformResult.items,
      robotIntelligence: intelligenceResult.items,
      roboticsStack: stackResult.items,
      changes,
      stats
    };
  } catch {
    return {
      agents: [],
      robotPlatforms: [],
      robotIntelligence: [],
      roboticsStack: [],
      changes: [],
      stats: emptyStats
    };
  }
}

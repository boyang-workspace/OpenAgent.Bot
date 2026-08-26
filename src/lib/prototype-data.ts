import { getRegistry } from "@/lib/registry/runtime";
import type { RegistryChange, RegistryEntity, RegistryStats } from "@/lib/registry/types";

export type HomepagePrototypeData = {
  agents: RegistryEntity[];
  robots: RegistryEntity[];
  changes: RegistryChange[];
  stats: RegistryStats;
  agentCount: number;
  robotCount: number;
  ready: boolean;
};

const emptyStats: RegistryStats = {
  entities: 0,
  agents: 0,
  robots: 0,
  models: 0,
  tools: 0,
  sources: 0,
  liveSources: 0,
  observations: 0,
  metricEntities: 0,
  changes30d: 0
};

export async function getHomepagePrototypeData(): Promise<HomepagePrototypeData> {
  try {
    const registry = getRegistry();
    const [agentResult, robotResult, changes, stats] = await Promise.all([
      registry.listEntities({
        kinds: ["agent", "agent-framework"],
        openness: ["open-source", "open-core", "source-available"],
        sort: "stars",
        limit: 8
      }),
      registry.listEntities({
        kinds: ["robot", "robotics-framework", "hardware", "simulator"],
        openness: ["open-source", "open-core", "source-available"],
        sort: "stars",
        limit: 8
      }),
      registry.listChanges(10),
      registry.getStats()
    ]);

    return {
      agents: agentResult.items,
      robots: robotResult.items,
      changes,
      stats,
      agentCount: agentResult.total,
      robotCount: robotResult.total,
      ready: true
    };
  } catch {
    return {
      agents: [],
      robots: [],
      changes: [],
      stats: emptyStats,
      agentCount: 0,
      robotCount: 0,
      ready: false
    };
  }
}

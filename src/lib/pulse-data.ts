import { getRegistry } from "@/lib/registry/runtime";
import type { RegistryChange, RegistryEntity, RegistryStats } from "@/lib/registry/types";

export type PulseData = {
  changes: RegistryChange[];
  active: RegistryEntity[];
  stats: RegistryStats;
};

const emptyStats: RegistryStats = {
  entities: 0, agents: 0, robots: 0, infrastructure: 0, robotPlatforms: 0,
  robotIntelligence: 0, roboticsStack: 0, models: 0, tools: 0, sources: 0,
  liveSources: 0, observations: 0, metricEntities: 0, changes30d: 0
};

export async function getPulseData(): Promise<PulseData> {
  try {
    const registry = getRegistry();
    const [changes, active, stats] = await Promise.all([
      registry.listChanges(40),
      registry.listEntities({ sort: "activity", limit: 12 }).then((result) => result.items),
      registry.getStats()
    ]);
    return { changes, active, stats };
  } catch {
    return { changes: [], active: [], stats: emptyStats };
  }
}

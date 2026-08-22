import { getRegistry } from "./runtime";
import type { EntityQuery, RegistryEntity } from "./types";

export type RegistryLandingData = {
  entities: RegistryEntity[];
  total: number;
};

export async function getRegistryLanding(query: EntityQuery): Promise<RegistryLandingData> {
  try {
    const result = await getRegistry().listEntities({ ...query, limit: 50, offset: 0 });
    return { entities: result.items, total: result.total };
  } catch {
    return { entities: [], total: 0 };
  }
}

import { env } from "cloudflare:workers";
import { RegistryRepository, type RegistryDatabase } from "./repository";
import { CatalogRepository } from "./catalog";
import { UsageRepository } from "./usage";

export function getRegistry(): RegistryRepository {
  return new RegistryRepository(env.DB as unknown as RegistryDatabase);
}

export function getRegistryDatabase(): RegistryDatabase {
  return env.DB as unknown as RegistryDatabase;
}

export function getCatalog(): CatalogRepository {
  return new CatalogRepository(env.DB as unknown as RegistryDatabase);
}

export function getUsage(): UsageRepository {
  return new UsageRepository(env.DB as unknown as RegistryDatabase);
}

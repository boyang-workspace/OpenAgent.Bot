import { env } from "cloudflare:workers";
import { RegistryRepository, type RegistryDatabase } from "./repository";

export function getRegistry(): RegistryRepository {
  return new RegistryRepository(env.DB as unknown as RegistryDatabase);
}

export function getRegistryDatabase(): RegistryDatabase {
  return env.DB as unknown as RegistryDatabase;
}

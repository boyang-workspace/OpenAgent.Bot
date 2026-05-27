import type { DiscoveryCandidate } from "../../src/lib/content/schema";

export async function collectX(): Promise<DiscoveryCandidate[]> {
  if (!process.env.X_BEARER_TOKEN) {
    console.warn("[discovery] X_BEARER_TOKEN is not set; skipping X source.");
    return [];
  }

  console.warn("[discovery] X collector is reserved for a later PR.");
  return [];
}

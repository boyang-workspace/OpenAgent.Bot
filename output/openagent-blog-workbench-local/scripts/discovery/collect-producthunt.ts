import type { DiscoveryCandidate } from "../../src/lib/content/schema";

export async function collectProductHunt(): Promise<DiscoveryCandidate[]> {
  if (!process.env.PRODUCTHUNT_TOKEN) {
    console.warn("[discovery] PRODUCTHUNT_TOKEN is not set; skipping Product Hunt source.");
    return [];
  }

  console.warn("[discovery] Product Hunt collector is reserved for a later PR.");
  return [];
}

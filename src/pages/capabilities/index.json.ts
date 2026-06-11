import type { APIRoute } from "astro";
import { getPublishedResources } from "@/lib/content/resources";
import { workflowProfiles } from "@/lib/recommendations/stack-resolver";

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();
  const capabilityMap = new Map<string, Set<string>>();

  for (const resource of resources) {
    for (const capability of resource.capabilities.core_capabilities ?? []) {
      if (!capabilityMap.has(capability)) capabilityMap.set(capability, new Set());
      capabilityMap.get(capability)!.add(resource.slug);
    }
    for (const capability of resource.tags.capability) {
      if (!capabilityMap.has(capability)) capabilityMap.set(capability, new Set());
      capabilityMap.get(capability)!.add(resource.slug);
    }
  }

  const capabilities = Array.from(capabilityMap.entries())
    .map(([id, slugs]) => ({
      id,
      resources: Array.from(slugs).sort()
    }))
    .sort((a, b) => b.resources.length - a.resources.length || a.id.localeCompare(b.id));

  return new Response(
    JSON.stringify(
      {
        schema_version: "openagent.capabilities.v1",
        generated_at: new Date().toISOString(),
        capabilities,
        workflows: workflowProfiles.map((profile) => ({
          id: profile.id,
          required_capabilities: profile.requiredCapabilities
        }))
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
};

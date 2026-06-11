import type { APIRoute } from "astro";
import { getPublishedResources } from "@/lib/content/resources";
import { buildStackRecommendations, workflowProfiles } from "@/lib/recommendations/stack-resolver";

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();
  const recommendations = buildStackRecommendations(resources);

  return new Response(
    JSON.stringify(
      {
        schema_version: "openagent.recommendations.v1",
        generated_at: new Date().toISOString(),
        workflows: workflowProfiles.map((profile) => ({
          id: profile.id,
          title: profile.title,
          summary: profile.summary,
          required_capabilities: profile.requiredCapabilities,
          default_constraints: profile.defaultConstraints
        })),
        recommendations
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

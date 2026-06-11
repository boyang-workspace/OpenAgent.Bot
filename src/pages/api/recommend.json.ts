import type { APIRoute } from "astro";
import { getPublishedResources } from "@/lib/content/resources";
import { buildStackRecommendations } from "@/lib/recommendations/stack-resolver";

export const GET: APIRoute = async () => {
  const resources = await getPublishedResources();

  return new Response(
    JSON.stringify(
      {
        schema_version: "openagent.api.recommend.v1",
        note: "Static resolver output. Use workflow ids from recommendations to select the stack that matches your task.",
        examples: [
          "/recommendations/index.json",
          "/api/recommend.json#workflow=browser-automation",
          "/api/recommend.json#workflow=coding-agent&constraint=local-first"
        ],
        recommendations: buildStackRecommendations(resources)
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

import type { APIRoute } from "astro";
import { getPublishedResources } from "@/lib/content/resources";
import { buildStackRecommendations, parseStackSearchParams, resolveStack } from "@/lib/recommendations/stack-resolver";

export const GET: APIRoute = async ({ request }) => {
  const resources = await getPublishedResources();
  const url = new URL(request.url);
  const parsedRequest = parseStackSearchParams(url.searchParams);
  const hasQuery = Boolean(parsedRequest.workflow || parsedRequest.environment || parsedRequest.stage || parsedRequest.constraints?.length);
  const recommendations = hasQuery ? [resolveStack(resources, parsedRequest)] : buildStackRecommendations(resources);

  return new Response(
    JSON.stringify(
      {
        schema_version: "openagent.api.recommend.v1",
        note: "Static resolver output. Use query parameters to select the stack that matches your task.",
        examples: [
          "/recommendations/index.json",
          "/api/recommend.json?workflow=browser-automation",
          "/api/recommend.json?workflow=coding-agent&constraint=local-first"
        ],
        query: hasQuery ? recommendations[0].request : undefined,
        recommendation: hasQuery ? recommendations[0] : undefined,
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

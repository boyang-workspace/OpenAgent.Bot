import type { APIRoute } from "astro";
import { buildResourceDetailProfile } from "@/lib/content/resource-detail";
import { getPublishedResources } from "@/lib/content/resources";

export async function getStaticPaths() {
  const resources = await getPublishedResources();

  return resources.map((resource) => ({
    params: { category: resource.classification.primary_category, slug: resource.slug },
    props: { resource }
  }));
}

export const GET: APIRoute = ({ props }) => {
  const detail = buildResourceDetailProfile(props.resource);

  return new Response(JSON.stringify(detail.agentPacket, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};

import type { APIRoute } from "astro";
import { getPublishedResources } from "@/lib/content/resources";

export async function getStaticPaths() {
  const resources = await getPublishedResources();

  return resources.map((resource) => ({
    params: { category: resource.classification.primary_category, slug: resource.slug },
    props: { resource }
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props.resource, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

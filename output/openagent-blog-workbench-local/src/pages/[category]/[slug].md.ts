import type { APIRoute } from "astro";
import { getPublishedResources, resourceMarkdown } from "@/lib/content/resources";

export async function getStaticPaths() {
  const resources = await getPublishedResources();

  return resources.map((resource) => ({
    params: { category: resource.classification.primary_category, slug: resource.slug },
    props: { resource }
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(resourceMarkdown(props.resource), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
};

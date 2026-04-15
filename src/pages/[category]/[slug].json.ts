import type { APIRoute } from "astro";
import { getPublishedProjects } from "@/lib/content/projects";

export async function getStaticPaths() {
  const projects = await getPublishedProjects();

  return projects.map((project) => ({
    params: { category: project.category, slug: project.slug },
    props: { project }
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props.project, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

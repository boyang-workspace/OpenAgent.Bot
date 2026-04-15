import type { APIRoute } from "astro";
import { getPublishedProjects, projectMarkdown } from "@/lib/content/projects";

export async function getStaticPaths() {
  const projects = await getPublishedProjects();

  return projects.map((project) => ({
    params: { category: project.category, slug: project.slug },
    props: { project }
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(projectMarkdown(props.project), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
};

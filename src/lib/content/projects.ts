import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseOpenProject, type CategorySlug, type OpenProject } from "./schema";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const publishedDir = path.join(rootDir, "content/projects/published");
const draftsDir = path.join(rootDir, "content/projects/drafts");

async function readProjectDir(dir: string): Promise<OpenProject[]> {
  const files = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const projects = await Promise.all(
    files
      .filter((file) => file.isFile() && file.name.endsWith(".json"))
      .map(async (file) => {
        const raw = await readFile(path.join(dir, file.name), "utf8");
        return parseOpenProject(JSON.parse(raw));
      })
  );

  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title));
}

export async function getPublishedProjects(): Promise<OpenProject[]> {
  const projects = await readProjectDir(publishedDir);
  return projects.filter((project) => project.status === "published");
}

export async function getDraftProjects(): Promise<OpenProject[]> {
  const projects = await readProjectDir(draftsDir);
  return projects.filter((project) => project.status === "draft");
}

export async function getProjectsByCategory(category: CategorySlug): Promise<OpenProject[]> {
  const projects = await getPublishedProjects();
  return projects.filter((project) => project.category === category);
}

export async function getProjectBySlug(category: CategorySlug, slug: string): Promise<OpenProject | undefined> {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.category === category && project.slug === slug);
}

export async function getRelatedProjects(project: OpenProject): Promise<OpenProject[]> {
  const projects = await getPublishedProjects();
  return projects
    .filter((candidate) => candidate.slug !== project.slug && candidate.category === project.category)
    .slice(0, 3);
}

export function projectPath(project: OpenProject): string {
  return `/${project.category}/${project.slug}`;
}

export function projectMarkdown(project: OpenProject): string {
  const lines = [
    `# ${project.title}`,
    "",
    project.oneLiner,
    "",
    "## Summary",
    project.summary,
    "",
    "## Why It Matters",
    project.whyItMatters,
    "",
    "## Best For",
    ...project.bestFor.map((item) => `- ${item}`),
    "",
    ...(project.notFor?.length ? ["## Not For", ...project.notFor.map((item) => `- ${item}`), ""] : []),
    "## Facts",
    `- Category: ${project.category}`,
    `- License: ${project.license ?? "unknown"}`,
    `- Open-source status: ${project.openSourceStatus}`,
    `- Last verified: ${project.updatedAt ?? "unknown"}`,
    ...(project.repoUrl ? [`- Repository: ${project.repoUrl}`] : []),
    ...(project.homepageUrl ? [`- Homepage: ${project.homepageUrl}`] : []),
    ...(project.installCommand ? [`- Install or try: \`${project.installCommand}\``] : []),
    "",
    "## Source Links",
    ...project.sourceLinks.map((link) => `- ${link}`)
  ];

  return `${lines.join("\n")}\n`;
}

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseOpenProject } from "../../src/lib/content/schema";
import { openProjectToResourceV1 } from "../../src/lib/content/resource-adapter";
import { parseResourceV1, type ResourceV1 } from "../../src/lib/content/resource-schema";

const rootDir = process.cwd();
const projectsDir = path.join(rootDir, "content/projects/published");
const resourcesDir = path.join(rootDir, "content/resources/published");
const shouldWrite = process.argv.includes("--write");

type RawProjectFields = {
  lastVerifiedAt?: string;
};

async function loadProjects(): Promise<ResourceV1[]> {
  const files = await readdir(projectsDir, { withFileTypes: true }).catch(() => []);
  const resources: ResourceV1[] = [];

  for (const file of files.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))) {
    const raw = await readFile(path.join(projectsDir, file.name), "utf8");
    const parsedJson = JSON.parse(raw) as RawProjectFields;
    const project = parseOpenProject(parsedJson);
    const resource = parseResourceV1(openProjectToResourceV1(project, parsedJson));
    resources.push(resource);
  }

  return resources.sort((a, b) => a.slug.localeCompare(b.slug));
}

async function main(): Promise<void> {
  const resources = await loadProjects();

  if (shouldWrite) {
    await mkdir(resourcesDir, { recursive: true });
    await Promise.all(
      resources.map((resource) =>
        writeFile(path.join(resourcesDir, `${resource.slug}.json`), `${JSON.stringify(resource, null, 2)}\n`, "utf8")
      )
    );
  }

  console.log(`${shouldWrite ? "Wrote" : "Dry-run converted"} ${resources.length} resources.`);
  for (const resource of resources) {
    console.log(
      `- ${resource.slug}: ${resource.classification.resource_type} / ${resource.classification.primary_category} / ${resource.status}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

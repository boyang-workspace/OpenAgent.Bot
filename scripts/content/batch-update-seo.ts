import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectsDir = path.resolve("content/projects/published");

const categoryLabels: Record<string, string> = {
  agents: "AI Agent",
  models: "AI Model",
  "memory-systems": "Memory System",
  skills: "Skill System",
  plugins: "Plugin/Extension",
  tools: "Tool/Utility",
};

const categoryDescriptions: Record<string, string> = {
  agents: "AI agent",
  models: "open-source model",
  "memory-systems": "memory system",
  skills: "skill system",
  plugins: "plugin",
  tools: "tool",
};

function improveSeoTitle(name: string, oneLiner: string, category: string): string {
  const cat = categoryLabels[category] ?? "Resource";
  const short = oneLiner.length > 80 ? oneLiner.slice(0, 77) + "..." : oneLiner;
  return `${name}: ${cat} — ${short}`;
}

function improveSeoDescription(name: string, oneLiner: string, category: string): string {
  const cat = categoryDescriptions[category] ?? "resource";
  return `${name} is an open-source ${cat}. ${oneLiner}. 了解 ${name} 是什么、适合谁、怎么用。包含官方链接、开源状态和替代方案。`;
}

async function main() {
  const files = await readdir(projectsDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  let updated = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(projectsDir, file);
    const raw = await readFile(filePath, "utf8");
    const project = JSON.parse(raw);

    const name = project.title ?? project.slug ?? "";
    const oneLiner = project.oneLiner ?? "";
    const category = project.category ?? "tools";
    const oldTitle = project.seoTitle ?? "";
    const oldDesc = project.seoDescription ?? "";

    const newTitle = improveSeoTitle(name, oneLiner, category);
    const newDesc = improveSeoDescription(name, oneLiner, category);

    if (oldTitle !== newTitle || oldDesc !== newDesc) {
      project.seoTitle = newTitle;
      project.seoDescription = newDesc;
      await writeFile(filePath, JSON.stringify(project, null, 2) + "\n", "utf8");
      updated++;
      console.log(`  ✓ ${file}: "${oldTitle}" → "${newTitle}"`);
    } else {
      console.log(`  - ${file}: unchanged`);
    }
  }

  console.log(`\nUpdated ${updated}/${jsonFiles.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

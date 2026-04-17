import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseBlogPost } from "../../src/lib/content/blog";
import { slugify } from "../../scripts/discovery/utils";

type Options = {
  title: string;
  topic?: string;
  tags: string[];
  dryRun: boolean;
};

function parseArgs(argv: string[]): Options {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const title = valueAfter("--title");
  if (!title) throw new Error("--title is required.");
  return {
    title,
    topic: valueAfter("--topic"),
    tags: (valueAfter("--tags") ?? "open-source,ai,editorial")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    dryRun: argv.includes("--dry-run")
  };
}

function bodyFor(options: Options): string {
  const topic = options.topic ?? options.title;
  return [
    `${topic} sits in the part of open AI where builders need more than a launch announcement. A useful OpenAgent article should explain what the project is, why it matters, who should care, and what a reader should inspect before trying it.`,
    "",
    `For ${options.title}, the first editorial pass should separate verified source facts from interpretation. The final article should cite official links, explain the practical use case, and compare the project with nearby alternatives instead of repeating marketing copy.`,
    "",
    "Before publishing, review the source links, add concrete examples, and replace this preparation draft with a sharper article."
  ].join("\n\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date().toISOString().slice(0, 10);
  const slug = slugify(options.title);
  const post = parseBlogPost({
    slug,
    title: options.title,
    summary: options.topic ?? `Editorial draft for ${options.title}.`,
    publishedAt: now,
    tags: options.tags,
    author: "OpenAgent.bot Editors",
    body: bodyFor(options),
    seoTitle: `${options.title} | OpenAgent.bot`,
    seoDescription: (options.topic ?? `An OpenAgent editorial draft about ${options.title}.`).slice(0, 160)
  });

  if (options.dryRun) {
    console.log(JSON.stringify(post, null, 2));
    return;
  }

  await mkdir("content/blog/drafts", { recursive: true });
  const filePath = path.join("content/blog/drafts", `${post.slug}.json`);
  await writeFile(filePath, `${JSON.stringify(post, null, 2)}\n`);
  console.log(`[blog] wrote ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

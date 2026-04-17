import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { posts as legacyPosts, type BlogPost } from "@/data/posts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const publishedBlogDir = path.join(rootDir, "content/blog/published");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string, fallback = ""): string {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArrayField(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function parseBlogPost(input: unknown): BlogPost {
  if (!isRecord(input)) throw new Error("Blog post must be an object.");
  return {
    slug: stringField(input, "slug"),
    title: stringField(input, "title"),
    summary: stringField(input, "summary"),
    publishedAt: stringField(input, "publishedAt"),
    tags: stringArrayField(input, "tags"),
    author: stringField(input, "author", "OpenAgent.bot Editors"),
    body: stringField(input, "body"),
    seoTitle: stringField(input, "seoTitle") || undefined,
    seoDescription: stringField(input, "seoDescription") || undefined
  };
}

async function readPublishedBlogFiles(): Promise<BlogPost[]> {
  const files = await readdir(publishedBlogDir, { withFileTypes: true }).catch(() => []);
  const posts = await Promise.all(
    files
      .filter((file) => file.isFile() && file.name.endsWith(".json"))
      .map(async (file) => {
        const raw = await readFile(path.join(publishedBlogDir, file.name), "utf8");
        return parseBlogPost(JSON.parse(raw));
      })
  );
  return posts;
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const filePosts = await readPublishedBlogFiles();
  return [...filePosts, ...legacyPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.slug === slug);
}

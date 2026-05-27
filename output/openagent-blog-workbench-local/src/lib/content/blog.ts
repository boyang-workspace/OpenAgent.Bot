import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { posts as legacyPosts, type BlogPost } from "../../data/posts";

function fileSystemRootDir(): string | undefined {
  const metaUrl = typeof import.meta !== "undefined" ? import.meta.url : undefined;
  if (!metaUrl || !metaUrl.startsWith("file:")) return undefined;
  return path.resolve(path.dirname(fileURLToPath(metaUrl)), "../../../");
}

const rootDir = fileSystemRootDir();
const publishedBlogDir = rootDir ? path.join(rootDir, "content/blog/published") : undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string, fallback = ""): string {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requiredStringField(record: Record<string, unknown>, key: string): string {
  const value = stringField(record, key);
  if (!value) throw new Error(`Blog post field "${key}" must be a non-empty string.`);
  return value;
}

function stringArrayField(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function bodyField(record: Record<string, unknown>): string {
  const value = record.body;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).join("\n");
  }
  return stringField(record, "body");
}

export function parseBlogPost(input: unknown): BlogPost {
  if (!isRecord(input)) throw new Error("Blog post must be an object.");
  return {
    slug: requiredStringField(input, "slug"),
    title: requiredStringField(input, "title"),
    summary: requiredStringField(input, "summary"),
    publishedAt: requiredStringField(input, "publishedAt"),
    tags: stringArrayField(input, "tags"),
    author: stringField(input, "author", "OpenAgent.bot Editors"),
    body: requiredStringField({ body: bodyField(input) }, "body"),
    seoTitle: stringField(input, "seoTitle") || undefined,
    seoDescription: stringField(input, "seoDescription") || undefined
  };
}

async function readPublishedBlogFiles(): Promise<BlogPost[]> {
  if (!publishedBlogDir) return [];
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

import type { CategorySlug, ProjectDraftContent } from "./types";
import { isControlledTag } from "../../src/lib/content/taxonomy";
import { openProjectToResourceV1 } from "../../src/lib/content/resource-adapter";
import { linkTypes, parseResourceV1 } from "../../src/lib/content/resource-schema";

export const categories = ["models", "agents", "memory-systems", "skills", "plugins", "tools"] as const;

export function isCategory(value: unknown): value is CategorySlug {
  return typeof value === "string" && (categories as readonly string[]).includes(value);
}

export function stringField(input: Record<string, unknown>, key: string, options: { required?: boolean; max?: number } = {}): string | undefined {
  const value = input[key];
  if (value === undefined || value === null) {
    if (options.required) throw new Error(`${key} is required.`);
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${key} must be a string.`);
  }

  const trimmed = value.trim();
  if (options.required && !trimmed) throw new Error(`${key} is required.`);
  if (options.max && trimmed.length > options.max) throw new Error(`${key} must be ${options.max} characters or fewer.`);
  return trimmed || undefined;
}

export function booleanField(input: Record<string, unknown>, key: string): boolean {
  const value = input[key];
  return typeof value === "boolean" ? value : false;
}

export function stringArrayField(input: Record<string, unknown>, key: string): string[] {
  const value = input[key];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function controlledTagsField(input: Record<string, unknown>, key: string): string[] {
  const values = stringArrayField(input, key);
  const unknown = values.filter((value) => !isControlledTag(value));
  if (unknown.length) {
    throw new Error(`${key} contains unsupported tags: ${unknown.join(", ")}.`);
  }
  return values;
}

function jsonValueField(input: Record<string, unknown>, key: string): unknown {
  const value = input[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${key} must be valid JSON.`);
  }
}

function recordArrayField(input: Record<string, unknown>, key: string): Record<string, unknown>[] | undefined {
  const value = jsonValueField(input, key);
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "object" || item === null || Array.isArray(item))) {
    throw new Error(`${key} must be a JSON array of objects.`);
  }
  return value as Record<string, unknown>[];
}

function coreStrengthsField(input: Record<string, unknown>): ProjectDraftContent["coreStrengths"] {
  return recordArrayField(input, "coreStrengths")?.map((item, index) => ({
    title: stringField(item, "title", { required: true, max: 80 }) ?? `Strength ${index + 1}`,
    description: stringField(item, "description", { required: true, max: 420 }) ?? "",
    whyItMatters: stringField(item, "whyItMatters", { max: 420 })
  }));
}

function useCaseNotesField(input: Record<string, unknown>): ProjectDraftContent["useCaseNotes"] {
  return recordArrayField(input, "useCaseNotes")?.map((item, index) => ({
    title: stringField(item, "title", { required: true, max: 80 }) ?? `Use case ${index + 1}`,
    description: stringField(item, "description", { required: true, max: 420 }) ?? ""
  }));
}

function compareNotesField(input: Record<string, unknown>): ProjectDraftContent["compareNotes"] {
  return recordArrayField(input, "compareNotes")?.map((item, index) => ({
    title: stringField(item, "title", { required: true, max: 100 }) ?? `Comparison ${index + 1}`,
    summary: stringField(item, "summary", { required: true, max: 520 }) ?? "",
    against: stringField(item, "against", { max: 80 })
  }));
}

function gettingStartedField(input: Record<string, unknown>): ProjectDraftContent["gettingStarted"] {
  return recordArrayField(input, "gettingStarted")?.map((item) => {
    const type = stringField(item, "type", { required: true, max: 40 }) ?? "homepage";
    if (!(linkTypes as readonly string[]).includes(type)) {
      throw new Error(`gettingStarted contains unsupported link type: ${type}.`);
    }
    return {
      label: stringField(item, "label", { required: true, max: 80 }) ?? "Open",
      url: validUrl(stringField(item, "url", { required: true, max: 500 }), "gettingStarted.url", true)!,
      type
    };
  });
}

function seoArticleField(input: Record<string, unknown>): ProjectDraftContent["seoArticle"] {
  const value = jsonValueField(input, "seoArticle");
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("seoArticle must be a JSON object.");
  }
  const record = value as Record<string, unknown>;
  return {
    intro: stringField(record, "intro", { max: 1200 }),
    whatItIs: stringField(record, "whatItIs", { max: 1600 }),
    whyItMatters: stringField(record, "whyItMatters", { max: 1600 }),
    howItWorks: stringField(record, "howItWorks", { max: 1600 }),
    useCases: recordArrayField(record, "useCases")?.map((item, index) => ({
      title: stringField(item, "title", { required: true, max: 100 }) ?? `Use case ${index + 1}`,
      description: stringField(item, "description", { required: true, max: 600 }) ?? ""
    })),
    alternatives: recordArrayField(record, "alternatives")?.map((item, index) => ({
      title: stringField(item, "title", { required: true, max: 120 }) ?? `Alternative ${index + 1}`,
      summary: stringField(item, "summary", { required: true, max: 700 }) ?? "",
      against: stringField(item, "against", { max: 100 })
    })),
    gettingStarted: recordArrayField(record, "gettingStarted")?.map((item) => {
      const type = stringField(item, "type", { required: true, max: 40 }) ?? "homepage";
      if (!(linkTypes as readonly string[]).includes(type)) {
        throw new Error(`seoArticle.gettingStarted contains unsupported link type: ${type}.`);
      }
      return {
        label: stringField(item, "label", { required: true, max: 80 }) ?? "Open",
        url: validUrl(stringField(item, "url", { required: true, max: 500 }), "seoArticle.gettingStarted.url", true)!,
        type
      };
    }),
    faq: recordArrayField(record, "faq")?.map((item, index) => ({
      question: stringField(item, "question", { required: true, max: 180 }) ?? `Question ${index + 1}`,
      answer: stringField(item, "answer", { required: true, max: 900 }) ?? ""
    }))
  };
}

function thumbnailBriefField(input: Record<string, unknown>): ProjectDraftContent["thumbnailBrief"] {
  const value = jsonValueField(input, "thumbnailBrief");
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("thumbnailBrief must be a JSON object.");
  }
  const record = value as Record<string, unknown>;
  return {
    resourceType: stringField(record, "resourceType", { max: 80 }),
    visualMotif: stringField(record, "visualMotif", { max: 240 }),
    backgroundStyle: stringField(record, "backgroundStyle", { max: 240 }),
    titleOverlay: stringField(record, "titleOverlay", { max: 120 }),
    subtitle: stringField(record, "subtitle", { max: 180 }),
    priorityAssets: stringArrayField(record, "priorityAssets"),
    avoid: stringArrayField(record, "avoid")
  };
}

export function validUrl(value: string | undefined, key: string, required = false): string | undefined {
  if (!value) {
    if (required) throw new Error(`${key} is required.`);
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL.`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${key} must start with http:// or https://.`);
  }

  return url.toString().replace(/\/$/, "");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function defaultDraftContent(input: {
  projectName: string;
  repoUrl: string;
  homepageUrl?: string;
  category: CategorySlug;
  summary: string;
}): ProjectDraftContent {
  const now = new Date().toISOString();
  const slug = slugify(input.projectName);
  const sourceLinks = [input.repoUrl, input.homepageUrl].filter((value): value is string => Boolean(value));

  return {
    slug,
    title: input.projectName,
    oneLiner: input.summary.slice(0, 140),
    summary: input.summary,
    whyItMatters: input.summary,
    bestFor: ["Open-source AI builders"],
    category: input.category,
    tags: [],
    repoUrl: input.repoUrl,
    homepageUrl: input.homepageUrl,
    sourceLinks,
    seoTitle: `${input.projectName}: Open-source AI project profile`,
    seoDescription: `A concise editorial profile of ${input.projectName}, including what it does, source links, category, and related open-source AI resources.`,
    shareTitle: `${input.projectName} on OpenAgent.bot`,
    shareDescription: input.summary.slice(0, 160),
    status: "published",
    generatedAt: now,
    reviewedAt: now,
    updatedAt: now.slice(0, 10),
    openSourceStatus: "unknown",
    isFeatured: false,
    isSponsored: false
  };
}

export function parseDraftContent(input: Record<string, unknown>): ProjectDraftContent {
  const title = stringField(input, "title", { required: true, max: 120 })!;
  const category = input.category;
  if (!isCategory(category)) throw new Error("category must be a supported category.");

  const repoUrl = validUrl(stringField(input, "repoUrl", { max: 300 }), "repoUrl");
  const homepageUrl = validUrl(stringField(input, "homepageUrl", { max: 300 }), "homepageUrl");
  const sourceLinks = stringArrayField(input, "sourceLinks");
  const slug = slugify(stringField(input, "slug", { required: true, max: 90 })!);
  if (!slug) throw new Error("slug must contain letters or numbers.");

  return {
    slug,
    title,
    oneLiner: stringField(input, "oneLiner", { required: true, max: 180 })!,
    summary: stringField(input, "summary", { required: true, max: 1200 })!,
    whyItMatters: stringField(input, "whyItMatters", { required: true, max: 1200 })!,
    bestFor: stringArrayField(input, "bestFor"),
    notFor: stringArrayField(input, "notFor"),
    category,
    tags: controlledTagsField(input, "tags"),
    repoUrl,
    homepageUrl,
    docsUrl: validUrl(stringField(input, "docsUrl", { max: 300 }), "docsUrl"),
    demoUrl: validUrl(stringField(input, "demoUrl", { max: 300 }), "demoUrl"),
    license: stringField(input, "license", { max: 80 }),
    maintainer: stringField(input, "maintainer", { max: 120 }),
    installCommand: stringField(input, "installCommand", { max: 240 }),
    worksWith: stringArrayField(input, "worksWith"),
    sourceLinks: sourceLinks.length ? sourceLinks : [repoUrl, homepageUrl].filter((value): value is string => Boolean(value)),
    seoTitle: stringField(input, "seoTitle", { required: true, max: 80 })!,
    seoDescription: stringField(input, "seoDescription", { required: true, max: 180 })!,
    shareTitle: stringField(input, "shareTitle", { required: true, max: 120 })!,
    shareDescription: stringField(input, "shareDescription", { required: true, max: 180 })!,
    status: "published",
    generatedAt: stringField(input, "generatedAt", { max: 40 }) ?? new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    updatedAt: stringField(input, "updatedAt", { max: 40 }) ?? new Date().toISOString().slice(0, 10),
    openSourceStatus: parseOpenSourceStatus(input.openSourceStatus),
    isFeatured: booleanField(input, "isFeatured"),
    isSponsored: booleanField(input, "isSponsored"),
    featuredReason: stringField(input, "featuredReason", { max: 240 }),
    coverImage: validUrl(stringField(input, "coverImage", { max: 500 }), "coverImage"),
    coreStrengths: coreStrengthsField(input),
    useCaseNotes: useCaseNotesField(input),
    compareNotes: compareNotesField(input),
    gettingStarted: gettingStartedField(input),
    seoArticle: seoArticleField(input),
    thumbnailBrief: thumbnailBriefField(input),
    noindex: booleanField(input, "noindex")
  };
}

function parseOpenSourceStatus(value: unknown): ProjectDraftContent["openSourceStatus"] {
  if (value === "open-source" || value === "open-core" || value === "source-available" || value === "unknown") {
    return value;
  }
  return "unknown";
}

export function assertPublishable(content: ProjectDraftContent): void {
  const missing = [
    ["slug", content.slug],
    ["title", content.title],
    ["oneLiner", content.oneLiner],
    ["summary", content.summary],
    ["whyItMatters", content.whyItMatters],
    ["seoTitle", content.seoTitle],
    ["seoDescription", content.seoDescription]
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Draft is missing required fields: ${missing.map(([key]) => key).join(", ")}.`);
  }

  if (!content.repoUrl && !content.homepageUrl) {
    throw new Error("Draft needs at least a repository URL or homepage URL.");
  }

  if (!content.sourceLinks.length) {
    throw new Error("Draft needs at least one source link.");
  }

  try {
    parseResourceV1(openProjectToResourceV1(content));
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "resource schema validation failed.";
    throw new Error(`Draft is not valid Resource v1 content: ${message}`);
  }
}

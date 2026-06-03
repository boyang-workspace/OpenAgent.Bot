import { readdir } from "node:fs/promises";
import path from "node:path";
import type { OpenProjectDraft, OpenProjectPublished } from "../../src/lib/content/schema";
import { parseOpenProject } from "../../src/lib/content/schema";
import { discoveryDirs, discoveryThresholds } from "./constants";
import { writeJson } from "./io";
import type { ScoredCandidate } from "./utils";
import { slugify } from "./utils";

const KNOWN_LICENSES = ["mit", "apache", "bsd", "gpl", "lgpl", "mpl", "unlicense", "cc0", "cc-by"];

function firstSentence(value: string): string {
  const sentence = value.split(/(?<=[.!?])\s+/)[0]?.trim();
  return sentence || value.slice(0, 160).trim();
}

function inferLicense(candidate: ScoredCandidate): string | undefined {
  const text = `${candidate.description ?? ""}\n${candidate.rawText ?? ""}`;
  const match = text.match(/license:\s*([A-Za-z0-9_. -]+)/i);
  return match?.[1]?.trim();
}

function inferMaintainer(candidate: ScoredCandidate): string | undefined {
  const match = candidate.repoUrl?.match(/github\.com\/([^/]+)\//);
  return match?.[1];
}

function isKnownLicense(license: string | undefined): boolean {
  if (!license) return false;
  const lower = license.toLowerCase();
  return KNOWN_LICENSES.some((known) => lower.includes(known));
}

function meetsAutoPublishGates(candidate: ScoredCandidate, license: string | undefined): boolean {
  const text = `${candidate.title} ${candidate.description ?? ""}`.toLowerCase();

  const exclusionPatterns = [
    /awesome/i, /curated/i, /collection/i, /list of/i,
    /system.?prompts?/i, /prompt.?collection/i,
    /awesome.*list/i, /awesome.*ai/i,
    /FULL [A-Z]/  // title starts with "FULL" — list of other tools
  ];
  const isCuratedList = exclusionPatterns.some((p) => p.test(text));

  return (
    !isCuratedList &&
    candidate.score >= discoveryThresholds.autoPublish &&
    !!candidate.repoUrl &&
    isKnownLicense(license) &&
    (candidate.sourceMetrics?.stars ?? 0) >= 20000
  );
}

function draftFromCandidate(candidate: ScoredCandidate, generatedAt: string): OpenProjectDraft | OpenProjectPublished {
  const slug = slugify(candidate.title);
  const license = inferLicense(candidate);
  const oneLiner = firstSentence(candidate.description ?? `${candidate.title} is an open AI project discovered by OpenAgent.bot.`);
  const categoryLabel = candidate.category.replace("-", " ");
  const autoPublish = meetsAutoPublishGates(candidate, license);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const base = {
    slug,
    title: candidate.title,
    oneLiner,
    summary: candidate.description ?? `${candidate.title} appears to be relevant to open AI builders. Review the source links before publishing this profile.`,
    whyItMatters: autoPublish
      ? `${candidate.title} is an open-source ${categoryLabel} project with ${candidate.sourceMetrics?.stars ?? 0}+ stars. Automatically published by OpenAgent.bot discovery pipeline.`
      : `${candidate.title} showed enough open AI signals to merit editorial review. The draft should be checked for real use cases, current maintenance, and source accuracy before publishing.`,
    bestFor: [`Builders evaluating ${categoryLabel}`, "Open-source AI discovery"],
    notFor: autoPublish ? [] : ["Production adoption without manual verification"],
    category: candidate.category,
    tags: Array.from(new Set([candidate.category, "open-source", "ai", ...candidate.reasons.slice(0, 2).map((reason) => slugify(reason))])).slice(0, 6),
    repoUrl: candidate.repoUrl,
    homepageUrl: candidate.homepageUrl,
    license,
    maintainer: inferMaintainer(candidate),
    worksWith: [categoryLabel],
    sourceLinks: candidate.sourceLinks,
    seoTitle: `${candidate.title}: Open-source ${categoryLabel} for AI builders`.slice(0, 68),
    seoDescription: `A concise editorial profile of ${candidate.title}, including what it does, who it is best for, license, repo, and related open-source AI resources.`.slice(0, 160),
    shareTitle: `${candidate.title} on OpenAgent.bot`,
    shareDescription: oneLiner.slice(0, 160),
    generatedAt,
    updatedAt: today,
    openSourceStatus: candidate.repoUrl ? (license ? "open-source" : "unknown") : "unknown",
    isFeatured: false,
    isSponsored: false,
    coverImage: candidate.repoUrl ? `https://opengraph.githubassets.com/openagentbot/${candidate.repoUrl.replace("https://github.com/", "")}` : undefined,
    sourceMetrics: candidate.sourceMetrics
  };

  if (autoPublish) {
    return {
      ...base,
      status: "published" as const,
      reviewedAt: today,
      noindex: false
    } as OpenProjectPublished;
  }

  return {
    ...base,
    status: "draft" as const,
    noindex: true
  } as OpenProjectDraft;
}

async function existingSlugs(dir: string): Promise<Set<string>> {
  const files = await readdir(dir).catch(() => []);
  return new Set(files.filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")));
}

export async function generateDrafts(candidates: ScoredCandidate[], options: { dryRun?: boolean; generatedAt?: string } = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const publishedSlugs = await existingSlugs(discoveryDirs.published);
  const alreadyDraftSlugs = await existingSlugs(discoveryDirs.drafts);
  const written: OpenProjectDraft[] = [];
  const published: Array<{ slug: string; title: string }> = [];
  const skipped: Array<{ title: string; reason: string }> = [];

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[discovery] OPENAI_API_KEY is not set; using structured fallback drafts only.");
  }

  for (const candidate of candidates) {
    const raw = draftFromCandidate(candidate, generatedAt);
    const project = parseOpenProject(raw) as OpenProjectDraft | OpenProjectPublished;

    if (publishedSlugs.has(project.slug)) {
      skipped.push({ title: project.title, reason: "already published" });
      continue;
    }

    if (raw.status === "published") {
      const filePath = path.join(discoveryDirs.published, `${project.slug}.json`);
      published.push({ slug: project.slug, title: project.title });
      if (!options.dryRun) {
        await writeJson(filePath, project);
      }
      continue;
    }

    const filePath = path.join(discoveryDirs.drafts, `${project.slug}.json`);
    if (alreadyDraftSlugs.has(project.slug)) {
      skipped.push({ title: project.title, reason: "draft already exists" });
      continue;
    }

    written.push(project as OpenProjectDraft);
    if (!options.dryRun) {
      await writeJson(filePath, project);
    }
  }

  return { written, published, skipped };
}

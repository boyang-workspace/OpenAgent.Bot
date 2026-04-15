import { readdir } from "node:fs/promises";
import path from "node:path";
import type { OpenProjectDraft } from "../../src/lib/content/schema";
import { parseOpenProject } from "../../src/lib/content/schema";
import { discoveryDirs } from "./constants";
import { fileExists, writeJson } from "./io";
import type { ScoredCandidate } from "./utils";
import { slugify } from "./utils";

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

function draftFromCandidate(candidate: ScoredCandidate, generatedAt: string): OpenProjectDraft {
  const slug = slugify(candidate.title);
  const license = inferLicense(candidate);
  const oneLiner = firstSentence(candidate.description ?? `${candidate.title} is an open AI project discovered by OpenAgent.bot.`);
  const categoryLabel = candidate.category.replace("-", " ");

  return {
    slug,
    title: candidate.title,
    oneLiner,
    summary: candidate.description ?? `${candidate.title} appears to be relevant to open AI builders. Review the source links before publishing this profile.`,
    whyItMatters: `${candidate.title} showed enough open AI signals to merit editorial review. The draft should be checked for real use cases, current maintenance, and source accuracy before publishing.`,
    bestFor: [`Builders evaluating ${categoryLabel}`, "Open-source AI discovery", "Editorial review"],
    notFor: ["Production adoption without manual verification"],
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
    status: "draft",
    generatedAt,
    updatedAt: generatedAt.slice(0, 10),
    openSourceStatus: candidate.repoUrl ? (license ? "open-source" : "unknown") : "unknown",
    isFeatured: false,
    isSponsored: false,
    coverImage: candidate.repoUrl ? `https://opengraph.githubassets.com/openagentbot/${candidate.repoUrl.replace("https://github.com/", "")}` : undefined,
    sourceMetrics: candidate.sourceMetrics,
    noindex: true
  };
}

async function existingSlugs(dir: string): Promise<Set<string>> {
  const files = await readdir(dir).catch(() => []);
  return new Set(files.filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")));
}

export async function generateDrafts(candidates: ScoredCandidate[], options: { dryRun?: boolean; generatedAt?: string } = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const publishedSlugs = await existingSlugs(discoveryDirs.published);
  const written: OpenProjectDraft[] = [];
  const skipped: Array<{ title: string; reason: string }> = [];

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[discovery] OPENAI_API_KEY is not set; using structured fallback drafts only.");
  }

  for (const candidate of candidates) {
    const draft = parseOpenProject(draftFromCandidate(candidate, generatedAt)) as OpenProjectDraft;
    const filePath = path.join(discoveryDirs.drafts, `${draft.slug}.json`);

    if (publishedSlugs.has(draft.slug)) {
      skipped.push({ title: draft.title, reason: "already published" });
      continue;
    }

    if (await fileExists(filePath)) {
      skipped.push({ title: draft.title, reason: "draft already exists" });
      continue;
    }

    written.push(draft);
    if (!options.dryRun) {
      await writeJson(filePath, draft);
    }
  }

  return { written, skipped };
}

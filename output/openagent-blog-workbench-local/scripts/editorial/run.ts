import type { CategorySlug, DiscoveryCandidate, ProjectCompareNote, ProjectCoreStrength, ProjectGettingStarted, ProjectSeoArticle, ProjectUseCaseNote } from "../../src/lib/content/schema";
import { collectGitHub } from "../discovery/collect-github";
import { collectHackerNews } from "../discovery/collect-hackernews";
import { enrichCandidate, enrichCandidates } from "../discovery/enrich";
import { parseGitHubRepo } from "../discovery/github";
import { mergeCandidates, scoreCandidate, slugify, type ScoredCandidate } from "../discovery/utils";

type RunOptions = {
  dryRun: boolean;
  repoUrl?: string;
  keyword?: string;
  limit: number;
  importUrl?: string;
};

type EditorialDraft = {
  slug: string;
  title: string;
  oneLiner: string;
  summary: string;
  whyItMatters: string;
  bestFor: string[];
  notFor: string[];
  category: CategorySlug;
  tags: string[];
  repoUrl?: string;
  homepageUrl?: string;
  license?: string;
  maintainer?: string;
  worksWith: string[];
  sourceLinks: string[];
  seoTitle: string;
  seoDescription: string;
  shareTitle: string;
  shareDescription: string;
  status: "published";
  generatedAt: string;
  reviewedAt: string;
  updatedAt: string;
  openSourceStatus: "open-source" | "unknown";
  isFeatured: boolean;
  isSponsored: boolean;
  coreStrengths: ProjectCoreStrength[];
  useCaseNotes: ProjectUseCaseNote[];
  compareNotes: ProjectCompareNote[];
  gettingStarted: ProjectGettingStarted[];
  seoArticle: ProjectSeoArticle;
  sourceMetrics: ScoredCandidate["sourceMetrics"];
  noindex: boolean;
};

function parseArgs(argv: string[]): RunOptions {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    dryRun: argv.includes("--dry-run"),
    repoUrl: valueAfter("--repo"),
    keyword: valueAfter("--keyword"),
    limit: Number(valueAfter("--limit") ?? 3),
    importUrl: valueAfter("--import-url") ?? process.env.OPENAGENT_ADMIN_IMPORT_URL
  };
}

function firstSentence(value: string): string {
  return value.split(/(?<=[.!?])\s+/)[0]?.trim() || value.slice(0, 160).trim();
}

function categoryTag(category: CategorySlug): string {
  return {
    models: "model",
    agents: "agent",
    "memory-systems": "memory-system",
    skills: "skill",
    plugins: "plugin",
    tools: "tool"
  }[category];
}

function capabilityTags(candidate: ScoredCandidate): string[] {
  const text = `${candidate.title} ${candidate.description ?? ""} ${candidate.rawText ?? ""}`.toLowerCase();
  const tags = new Set<string>();
  if (/browser/.test(text)) tags.add("browser-automation");
  if (/mcp|protocol/.test(text)) tags.add("mcp");
  if (/memory|context|rag/.test(text)) tags.add("memory");
  if (/agent|workflow|orchestration/.test(text)) tags.add("workflow-orchestration");
  if (/model|inference|llm|local ai/.test(text)) tags.add("local-inference");
  if (/api|server/.test(text)) tags.add("api-first");
  if (/cli/.test(text)) tags.add("automation");
  if (candidate.category === "tools") tags.add("automation");
  return Array.from(tags).slice(0, 3);
}

function flatTags(candidate: ScoredCandidate): string[] {
  const category = categoryTag(candidate.category);
  const capabilities = capabilityTags(candidate).filter((tag) => tag !== "api-first");
  const constraints = new Set<string>(["open-source"]);
  const scenarios = new Set<string>(["developer-workflow"]);
  const text = `${candidate.title} ${candidate.description ?? ""} ${candidate.rawText ?? ""}`.toLowerCase();

  if (/local|edge|on-device/.test(text)) {
    constraints.add("local-first");
    scenarios.add("local-ai");
  }
  if (/docker|container/.test(text)) constraints.add("docker");
  if (/self-host|self host/.test(text)) {
    constraints.add("self-hosted");
    scenarios.add("self-hosted-ai");
  }
  if (/browser/.test(text)) scenarios.add("browser-agent");
  if (/research|paper/.test(text)) scenarios.add("research");
  if (/coding|developer/.test(text)) scenarios.add("coding-agent");

  return Array.from(new Set([category, "open-source", ...capabilities, ...constraints, ...scenarios])).slice(0, 14);
}

function licenseFrom(candidate: ScoredCandidate): string | undefined {
  const match = `${candidate.rawText ?? ""}`.match(/license:\s*([A-Za-z0-9_. -]+)/i);
  return match?.[1]?.trim();
}

function maintainerFrom(repoUrl: string | undefined): string | undefined {
  return repoUrl ? parseGitHubRepo(repoUrl)?.owner : undefined;
}

function gettingStarted(candidate: ScoredCandidate): ProjectGettingStarted[] {
  const links: ProjectGettingStarted[] = [];
  if (candidate.repoUrl) links.push({ label: "Review the repository", url: candidate.repoUrl, type: "github" });
  if (candidate.homepageUrl) links.push({ label: "Open the homepage", url: candidate.homepageUrl, type: "homepage" });
  for (const link of candidate.sourceLinks) {
    if (!links.some((item) => item.url === link)) links.push({ label: "Check source context", url: link, type: "homepage" });
  }
  return links.slice(0, 5);
}

function coreStrengths(candidate: ScoredCandidate): ProjectCoreStrength[] {
  const categoryLabel = candidate.category.replaceAll("-", " ");
  const capabilities = capabilityTags(candidate).filter((tag) => tag !== "api-first");
  const readable = (value: string) => value.replaceAll("-", " ");
  const base = capabilities.length ? capabilities : ["workflow-orchestration", "automation", "tool-calling"];
  return base.slice(0, 3).map((capability) => ({
    title: readable(capability).replace(/^\w/, (char) => char.toUpperCase()),
    description: `${candidate.title} appears to expose ${readable(capability)} value for builders evaluating ${categoryLabel} resources.`,
    whyItMatters: "This should be verified against the official repository and docs before publishing, but it gives the reviewer a concrete decision angle."
  }));
}

function useCaseNotes(candidate: ScoredCandidate): ProjectUseCaseNote[] {
  const categoryLabel = candidate.category.replaceAll("-", " ");
  return [
    {
      title: `Evaluating ${categoryLabel}`,
      description: `Use this draft to decide whether ${candidate.title} deserves a full OpenAgent profile and where it fits in the directory.`
    },
    {
      title: "Open-source AI research",
      description: "Useful when comparing active repositories, source links, and practical project signals before choosing what to try."
    },
    {
      title: "Builder shortlist",
      description: "A candidate for readers who want a concise decision page before leaving for GitHub, docs, or a demo."
    }
  ];
}

function compareNotes(candidate: ScoredCandidate): ProjectCompareNote[] {
  return [
    {
      title: `When to choose ${candidate.title}`,
      against: `other ${candidate.category.replaceAll("-", " ")}`,
      summary: "Choose it only if the official sources confirm the deployment model, license, maintenance activity, and integration surface match the reader's use case."
    }
  ];
}

function seoArticle(candidate: ScoredCandidate, useCases: ProjectUseCaseNote[], comparisons: ProjectCompareNote[], nextSteps: ProjectGettingStarted[]): ProjectSeoArticle {
  const description = candidate.description ?? `${candidate.title} is an open AI resource discovered by OpenAgent.bot.`;
  return {
    intro: `${candidate.title} is a candidate open AI resource for builders tracking ${candidate.category.replaceAll("-", " ")} projects. This draft separates verified source signals from editorial judgment so it can be reviewed before publication.`,
    whatItIs: firstSentence(description),
    whyItMatters: `${candidate.title} surfaced enough open-source AI signals to merit review: ${candidate.reasons.join(", ") || "repository activity, source links, and category relevance"}. The published page should help readers decide whether it is worth trying before they leave for the official sources.`,
    howItWorks: "Start by validating the GitHub repository, README, license, recent activity, and official links. Then refine this article with concrete examples from the docs or demo before marking the draft ready.",
    useCases,
    alternatives: comparisons,
    gettingStarted: nextSteps,
    faq: [
      {
        question: `Is ${candidate.title} already verified by OpenAgent?`,
        answer: "Not yet. This is an imported editorial draft and should be reviewed against official sources before publishing."
      },
      {
        question: "Will this publish automatically?",
        answer: "No. OpenAgent imports this as a draft only; publication still requires Admin review and a GitHub-backed publish action."
      }
    ]
  };
}

function draftFromCandidate(candidate: ScoredCandidate): EditorialDraft {
  const now = new Date().toISOString();
  const nextSteps = gettingStarted(candidate);
  const strengths = coreStrengths(candidate);
  const useCases = useCaseNotes(candidate);
  const comparisons = compareNotes(candidate);
  const license = licenseFrom(candidate);
  const oneLiner = firstSentence(candidate.description ?? `${candidate.title} is an open AI resource for editorial review.`);

  return {
    slug: slugify(candidate.title),
    title: candidate.title,
    oneLiner,
    summary: candidate.description ?? `${candidate.title} appears relevant to open AI builders. Review official sources before publishing.`,
    whyItMatters: `${candidate.title} showed enough open AI discovery signals to become an editorial draft. Verify source accuracy, maintenance, and real use cases before publishing.`,
    bestFor: ["Open-source AI builders", `Readers evaluating ${candidate.category.replaceAll("-", " ")}`, "Editorial review"],
    notFor: ["Production adoption without manual source verification"],
    category: candidate.category,
    tags: flatTags(candidate),
    repoUrl: candidate.repoUrl,
    homepageUrl: candidate.homepageUrl,
    license,
    maintainer: maintainerFrom(candidate.repoUrl),
    worksWith: [candidate.category.replaceAll("-", " ")],
    sourceLinks: candidate.sourceLinks,
    seoTitle: `${candidate.title}: Open-source ${candidate.category.replaceAll("-", " ")} profile`.slice(0, 80),
    seoDescription: `Editorial draft for ${candidate.title}, with source links, facts, use cases, comparisons, and open-source AI review notes.`.slice(0, 180),
    shareTitle: `${candidate.title} on OpenAgent.bot`,
    shareDescription: oneLiner.slice(0, 180),
    status: "published",
    generatedAt: now,
    reviewedAt: now,
    updatedAt: now.slice(0, 10),
    openSourceStatus: candidate.repoUrl && license ? "open-source" : "unknown",
    isFeatured: false,
    isSponsored: false,
    coreStrengths: strengths,
    useCaseNotes: useCases,
    compareNotes: comparisons,
    gettingStarted: nextSteps,
    seoArticle: seoArticle(candidate, useCases, comparisons, nextSteps),
    sourceMetrics: candidate.sourceMetrics,
    noindex: true
  };
}

function qualityIssues(draft: EditorialDraft): string[] {
  const issues: string[] = [];
  if (!draft.sourceLinks.length) issues.push("missing source links");
  if (draft.coreStrengths.length < 3) issues.push("fewer than 3 core strengths");
  if (draft.useCaseNotes.length < 3) issues.push("fewer than 3 use cases");
  if (draft.compareNotes.length < 1) issues.push("missing compare note");
  if (!draft.seoArticle.intro || !draft.seoArticle.whatItIs || !draft.seoArticle.whyItMatters) issues.push("thin SEO article");
  return issues;
}

async function candidatesFor(options: RunOptions): Promise<ScoredCandidate[]> {
  const now = new Date();
  if (options.repoUrl) {
    const repo = parseGitHubRepo(options.repoUrl);
    if (!repo) throw new Error("--repo must be a GitHub repository URL.");
    const candidate: DiscoveryCandidate = {
      id: `manual:${repo.owner}/${repo.repo}`,
      source: "github",
      title: repo.repo,
      url: options.repoUrl,
      repoUrl: options.repoUrl,
      discoveredAt: now.toISOString(),
      sourceMetrics: {},
      sourceLinks: [options.repoUrl]
    };
    return [scoreCandidate(await enrichCandidate(candidate))];
  }

  const collected = [
    ...(await collectGitHub(now, options.keyword ? [options.keyword] : undefined)),
    ...(await collectHackerNews(now))
  ];
  return (await enrichCandidates(mergeCandidates(collected), 12)).map(scoreCandidate).sort((a, b) => b.score - a.score);
}

async function importDraft(importUrl: string, draft: EditorialDraft) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-openagent-actor": "codex"
  };
  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
  }
  if (process.env.OPENAGENT_ADMIN_IMPORT_TOKEN) {
    headers.Authorization = `Bearer ${process.env.OPENAGENT_ADMIN_IMPORT_TOKEN}`;
  }

  const response = await fetch(importUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ source: "codex_editorial_run", content: draft })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? `Import failed with ${response.status}.`);
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const candidates = await candidatesFor(options);
  const drafts = candidates.slice(0, Math.max(1, options.limit)).map(draftFromCandidate);
  const accepted = drafts.filter((draft) => qualityIssues(draft).length === 0);
  const rejected = drafts.filter((draft) => qualityIssues(draft).length > 0);

  console.log(`[editorial] candidates=${candidates.length} accepted=${accepted.length} rejected=${rejected.length}${options.dryRun ? " dry-run" : ""}`);

  if (options.dryRun) {
    console.log(JSON.stringify({ accepted, rejected: rejected.map((draft) => ({ slug: draft.slug, issues: qualityIssues(draft) })) }, null, 2));
    return;
  }

  if (!options.importUrl) {
    throw new Error("Set OPENAGENT_ADMIN_IMPORT_URL or pass --import-url. Use --dry-run to preview without importing.");
  }

  for (const draft of accepted) {
    const result = await importDraft(options.importUrl, draft);
    console.log(`[editorial] imported ${draft.slug}${result.duplicate ? " (duplicate)" : ""}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

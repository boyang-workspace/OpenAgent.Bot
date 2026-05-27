import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPublishedResources, resourcePath } from "../../src/lib/content/resources";
import { qualityGateBlogDraft, slugifyBlog, type BlogDraftInput } from "../../src/lib/content/blog-automation";
import { collectGitHub } from "../discovery/collect-github";
import { collectHackerNews } from "../discovery/collect-hackernews";
import { enrichCandidates } from "../discovery/enrich";
import { mergeCandidates, scoreCandidate, todayString, type ScoredCandidate } from "../discovery/utils";

type Options = {
  dryRun: boolean;
  date: string;
  limit: number;
  lane?: "trend" | "comparison" | "evergreen";
  importUrl?: string;
};

type DailyTopic = {
  id: string;
  date: string;
  lane: "trend" | "comparison" | "evergreen";
  title: string;
  angle: string;
  primaryKeyword: string;
  searchIntent: string;
  sourceSignals: string[];
  score: number;
  status: "new" | "drafted" | "ignored";
};

function parseArgs(argv: string[]): Options {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const lane = valueAfter("--topic-lane");
  return {
    dryRun: argv.includes("--dry-run"),
    date: valueAfter("--date") ?? todayString(),
    limit: Number(valueAfter("--limit") ?? 1),
    lane: lane === "trend" || lane === "comparison" || lane === "evergreen" ? lane : undefined,
    importUrl: valueAfter("--import-url") ?? process.env.OPENAGENT_BLOG_IMPORT_URL
  };
}

async function publishedBlogSlugs(): Promise<Set<string>> {
  const dir = "content/blog/published";
  const files = await readdir(dir).catch(() => []);
  return new Set(files.filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")));
}

async function topicSlugs(): Promise<Set<string>> {
  const dir = "content/blog/topics";
  const files = await readdir(dir).catch(() => []);
  const slugs = new Set<string>();
  for (const file of files.filter((item) => item.endsWith(".json"))) {
    const raw = await readFile(path.join(dir, file), "utf8").catch(() => "");
    if (!raw) continue;
    const data = JSON.parse(raw) as { topics?: DailyTopic[] };
    for (const topic of data.topics ?? []) slugs.add(slugifyBlog(topic.title));
  }
  return slugs;
}

function comparisonTopics(resources: Awaited<ReturnType<typeof getPublishedResources>>, date: string): DailyTopic[] {
  const agents = resources.filter((resource) => resource.classification.primary_category === "agents").slice(0, 3);
  const memory = resources.filter((resource) => resource.classification.primary_category === "memory-systems").slice(0, 3);
  const pairs = [
    {
      title: "Best open-source browser agents for workflow automation",
      angle: "Compare browser-agent projects by setup path, action surface, safety controls, and OpenAgent fit.",
      primaryKeyword: "best open-source browser agents",
      resources: agents
    },
    {
      title: "Open-source AI memory systems compared",
      angle: "Help builders compare open memory systems for context, retrieval, and agent workflows.",
      primaryKeyword: "open-source AI memory systems",
      resources: memory
    },
    {
      title: "OpenClaw alternatives for open-source action agents",
      angle: "Compare action-agent projects for browser workflows, coding tasks, and broader automation.",
      primaryKeyword: "OpenClaw alternatives",
      resources: agents
    }
  ];

  return pairs.map((item, index) => ({
    id: `${date}:comparison:${slugifyBlog(item.title)}`,
    date,
    lane: "comparison",
    title: item.title,
    angle: item.angle,
    primaryKeyword: item.primaryKeyword,
    searchIntent: `Readers want a practical comparison for ${item.primaryKeyword}, with direct next steps and source links.`,
    sourceSignals: item.resources.map(resourcePath),
    score: 94 - index,
    status: "new"
  }));
}

function evergreenTopics(date: string): DailyTopic[] {
  return [
    ["How to choose an open-source AI agent stack", "Explain how builders should combine models, tools, memory, skills, and browser action.", "open-source AI agent stack"],
    ["What MCP means for open AI workflows", "Explain MCP as a practical integration layer for open agent builders.", "MCP open AI workflows"],
    ["Local-first AI agents: what builders should evaluate", "Explain when local-first agents matter and how to evaluate privacy, setup, and reliability.", "local-first AI agents"]
  ].map(([title, angle, primaryKeyword], index) => ({
    id: `${date}:evergreen:${slugifyBlog(title)}`,
    date,
    lane: "evergreen" as const,
    title,
    angle,
    primaryKeyword,
    searchIntent: `Readers want a durable guide to ${primaryKeyword}, with criteria and OpenAgent resources.`,
    sourceSignals: ["/agents", "/models", "/memory-systems", "/skills"],
    score: 82 - index,
    status: "new" as const
  }));
}

function trendTopics(candidates: ScoredCandidate[], date: string): DailyTopic[] {
  return candidates.slice(0, 6).map((candidate) => ({
    id: `${date}:trend:${slugifyBlog(candidate.title)}`,
    date,
    lane: "trend",
    title: `${candidate.title}: should open-source AI builders care?`,
    angle: `Explain what ${candidate.title} appears to do, why it surfaced in discovery, and what to verify before adopting it.`,
    primaryKeyword: `${candidate.title} open-source ${candidate.category.replaceAll("-", " ")}`,
    searchIntent: `Readers want to know whether ${candidate.title} is relevant, trustworthy, and worth testing.`,
    sourceSignals: candidate.sourceLinks,
    score: candidate.score,
    status: "new"
  }));
}

function draftFromTopic(topic: DailyTopic, resources: Awaited<ReturnType<typeof getPublishedResources>>): BlogDraftInput {
  const related = resources.slice(0, 5);
  const internalLinks = ["/agents", "/memory-systems", "/skills", ...related.map(resourcePath)].slice(0, 5);
  const sourceLinks = Array.from(
    new Set([
      ...topic.sourceSignals.filter((link) => link.startsWith("http")),
      "https://github.com/trending?spoken_language_code=en",
      "https://news.ycombinator.com/",
      "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
    ])
  ).slice(0, 3);

  const body = [
    `**${topic.title} deserves a decision-oriented read, not a launch-summary skim.** If you are searching for ${topic.primaryKeyword}, the useful question is whether the project or category fits a real workflow, has enough source evidence, and gives you a safe first test.`,
    topic.angle,
    "## Quick recommendation",
    "| Need | Start with | Why |",
    "|---|---|---|",
    `| A category overview | [OpenAgent agents](${internalLinks[0]}) | Compare action-agent projects before picking one |`,
    `| Context and memory options | [OpenAgent memory systems](${internalLinks[1]}) | Check how open memory layers fit agent workflows |`,
    `| Reusable workflow packaging | [OpenAgent skills](${internalLinks[2]}) | Look for repeatable procedures instead of one-off demos |`,
    "## Comparison criteria",
    "| Criteria | What to verify | Why it matters |",
    "|---|---|---|",
    "| Source activity | Repository, releases, docs, issues | Popularity alone does not prove usefulness |",
    "| Setup path | Install steps, examples, local requirements | A good first test should be narrow and reproducible |",
    "| Action surface | Browser, code, memory, tools, protocols | The surface determines the risk model |",
    "| Review loop | Logs, permissions, human approval | Draft-first review prevents unsupported claims |",
    "## Source-grounded checks",
    `Start with primary sources: [GitHub Trending](${sourceLinks[0]}), [Hacker News](${sourceLinks[1]}), and [Google helpful content guidance](${sourceLinks[2]}). Treat discovery heat as a reason to investigate, not as a recommendation by itself.`,
    "## Related OpenAgent resources",
    ...internalLinks.map((link) => `- [Review ${link.replace("/", "") || "OpenAgent"}](${link})`),
    "## What to do next",
    "Pick one narrow workflow, test it with a sandbox account or throwaway repository, and write down failure cases before expanding access. That habit matters more than picking the loudest project of the day.",
    "## FAQ",
    `### What is the search intent behind ${topic.primaryKeyword}?`,
    "The reader is trying to decide what to test, what to ignore, and which claims require verification.",
    "### Should this article publish automatically?",
    "No. This is an automation-generated draft. It should be reviewed against official sources before publishing.",
    "### How many source links are enough?",
    "Use at least three primary or high-signal sources, and make sure each important claim has a visible source path.",
    "### How does OpenAgent fit into the workflow?",
    "OpenAgent gives builders category pages, resource profiles, and internal comparisons so discovery can turn into a practical shortlist."
  ].join("\n\n");

  return {
    slug: slugifyBlog(topic.title),
    title: topic.title,
    summary: topic.angle,
    publishedAt: topic.date,
    tags: [topic.lane, "open-source", "ai-agents"],
    author: "OpenAgent.bot Editors",
    body,
    seoTitle: `${topic.title} | OpenAgent.bot`.slice(0, 80),
    seoDescription: topic.searchIntent.slice(0, 180),
    targetKeyword: topic.primaryKeyword,
    searchIntent: topic.searchIntent,
    sourceLinks
  };
}

async function importDraft(importUrl: string, draft: BlogDraftInput) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-openagent-actor": "automation"
  };
  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
  }
  if (process.env.OPENAGENT_ADMIN_IMPORT_TOKEN) {
    headers.Authorization = `Bearer ${process.env.OPENAGENT_ADMIN_IMPORT_TOKEN}`;
  }
  const response = await fetch(importUrl, { method: "POST", headers, body: JSON.stringify(draft) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error ?? `Blog import failed with ${response.status}.`);
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date(`${options.date}T00:00:00.000Z`);
  const resources = await getPublishedResources();
  const collected = [...(await collectGitHub(now)), ...(await collectHackerNews(now))];
  const candidates = (await enrichCandidates(mergeCandidates(collected), 8)).map(scoreCandidate).sort((a, b) => b.score - a.score);
  const allTopics = [...trendTopics(candidates, options.date), ...comparisonTopics(resources, options.date), ...evergreenTopics(options.date)]
    .filter((topic) => !options.lane || topic.lane === options.lane)
    .sort((a, b) => b.score - a.score);
  const existing = new Set([...(await publishedBlogSlugs()), ...(await topicSlugs())]);
  const topics = allTopics.filter((topic) => !existing.has(slugifyBlog(topic.title))).slice(0, 10);
  const drafts = topics.slice(0, Math.max(1, options.limit)).map((topic) => draftFromTopic(topic, resources));
  const accepted = drafts.filter((draft) => qualityGateBlogDraft(draft).passed);
  const rejected = drafts.filter((draft) => !qualityGateBlogDraft(draft).passed);

  const payload = {
    date: options.date,
    dryRun: options.dryRun,
    counts: {
      collected: collected.length,
      candidates: candidates.length,
      topics: topics.length,
      drafts: drafts.length,
      accepted: accepted.length,
      rejected: rejected.length
    },
    topics,
    accepted,
    rejected: rejected.map((draft) => ({ slug: draft.slug, issues: qualityGateBlogDraft(draft).issues }))
  };

  if (options.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await mkdir("content/blog/topics", { recursive: true });
  await mkdir("content/blog/drafts", { recursive: true });
  await writeFile(path.join("content/blog/topics", `${options.date}.json`), `${JSON.stringify({ date: options.date, topics }, null, 2)}\n`);

  for (const draft of accepted) {
    if (options.importUrl) {
      await importDraft(options.importUrl, draft);
    } else {
      await writeFile(path.join("content/blog/drafts", `${draft.slug}.json`), `${JSON.stringify(draft, null, 2)}\n`);
    }
  }

  console.log(`[blog] ${options.date} topics=${topics.length} accepted=${accepted.length} rejected=${rejected.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

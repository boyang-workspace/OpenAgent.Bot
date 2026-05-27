import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CategorySlug, OpenProjectDraft } from "../../src/lib/content/schema";
import { parseOpenProject } from "../../src/lib/content/schema";
import { slugify } from "../discovery/utils";

const categories = new Set(["models", "agents", "memory-systems", "skills", "plugins", "tools"]);

type Options = {
  title: string;
  category: CategorySlug;
  summary?: string;
  source?: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Options {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const title = valueAfter("--title");
  if (!title) throw new Error("--title is required.");
  const category = valueAfter("--category") ?? "tools";
  if (!categories.has(category)) throw new Error("--category must be one of models, agents, memory-systems, skills, plugins, tools.");
  return {
    title,
    category: category as CategorySlug,
    summary: valueAfter("--summary"),
    source: valueAfter("--source"),
    dryRun: argv.includes("--dry-run")
  };
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

function defaultTags(category: CategorySlug): string[] {
  const base = [categoryTag(category), "open-source", "developer-workflow"];
  if (category === "memory-systems") base.push("memory", "personal-memory");
  if (category === "agents") base.push("workflow-orchestration", "coding-agent");
  if (category === "tools") base.push("automation", "self-hosted-ai");
  return Array.from(new Set(base));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date().toISOString();
  const summary = options.summary ?? `${options.title} is a draft OpenAgent resource profile prepared for editorial review.`;
  const sourceLinks = options.source ? [options.source] : ["https://www.openagent.bot"];
  const slug = slugify(options.title);
  const draft = parseOpenProject({
    slug,
    title: options.title,
    oneLiner: summary.slice(0, 140),
    summary,
    whyItMatters: `${options.title} needs an editorial review pass that explains what it is, when to choose it, and how it compares with nearby open AI resources.`,
    bestFor: ["Open-source AI builders", "Editorial review", `${options.category.replaceAll("-", " ")} discovery`],
    notFor: ["Publishing without source verification"],
    category: options.category,
    tags: defaultTags(options.category),
    homepageUrl: options.source,
    sourceLinks,
    seoTitle: `${options.title}: Open-source ${options.category.replaceAll("-", " ")} profile`.slice(0, 80),
    seoDescription: `An OpenAgent editorial draft for ${options.title}, including what it is, who it is for, source links, and related open AI context.`.slice(0, 180),
    shareTitle: `${options.title} on OpenAgent.bot`,
    shareDescription: summary.slice(0, 180),
    status: "draft",
    generatedAt: now,
    updatedAt: now.slice(0, 10),
    openSourceStatus: "unknown",
    isFeatured: false,
    isSponsored: false,
    coreStrengths: [
      {
        title: "Editorial positioning",
        description: `Explain the concrete job ${options.title} helps a reader do.`,
        whyItMatters: "This keeps the page useful for humans instead of becoming a thin metadata record."
      },
      {
        title: "Source-backed facts",
        description: "Fill in verified facts from official sources before publishing.",
        whyItMatters: "Facts and editorial judgment should stay separate."
      },
      {
        title: "Decision support",
        description: "Add comparison notes and practical use cases before marking ready.",
        whyItMatters: "The page should be more useful than a README summary."
      }
    ],
    useCaseNotes: [
      { title: "Evaluate fit", description: `Understand whether ${options.title} belongs in this category.` },
      { title: "Compare alternatives", description: "Clarify how it differs from adjacent resources." },
      { title: "Decide next step", description: "Give readers a clear source link or trial path." }
    ],
    compareNotes: [
      {
        title: `When to choose ${options.title}`,
        summary: "Choose it when verified source facts and practical use cases match the reader's workflow."
      }
    ],
    gettingStarted: sourceLinks.map((url) => ({ label: "Review source", url, type: "homepage" })),
    seoArticle: {
      intro: `${options.title} is an OpenAgent resource draft prepared for editorial review.`,
      whatItIs: summary,
      whyItMatters: `${options.title} may be relevant to ${options.category.replaceAll("-", " ")} readers, but this draft should be verified and strengthened before publishing.`,
      howItWorks: "Review official sources, extract facts, then refine this article with concrete use cases and comparisons.",
      useCases: [
        { title: "Resource evaluation", description: "Help readers decide whether this resource is worth trying." },
        { title: "Category discovery", description: "Place it in the right OpenAgent category and tag structure." },
        { title: "Editorial comparison", description: "Explain when to choose it over nearby alternatives." }
      ],
      alternatives: [
        {
          title: "Selection note",
          summary: "The final version should compare this resource with at least one adjacent project or category."
        }
      ],
      gettingStarted: sourceLinks.map((url) => ({ label: "Review source", url, type: "homepage" })),
      faq: [
        { question: "Is this ready to publish?", answer: "No. This is a draft that needs source verification and editorial review." }
      ]
    },
    noindex: true
  } satisfies OpenProjectDraft);

  if (options.dryRun) {
    console.log(JSON.stringify(draft, null, 2));
    return;
  }

  await mkdir("content/projects/drafts", { recursive: true });
  const filePath = path.join("content/projects/drafts", `${draft.slug}.json`);
  await writeFile(filePath, `${JSON.stringify(draft, null, 2)}\n`);
  console.log(`[resource] wrote ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

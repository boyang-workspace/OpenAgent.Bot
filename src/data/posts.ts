export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  author: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const posts: BlogPost[] = [
  {
    slug: "open-source-ai-directory-playbook",
    title: "The open-source AI directory playbook",
    summary:
      "How OpenAgent.bot organizes models, agents, skills, memory systems, and tools into a durable discovery layer.",
    publishedAt: "2026-04-15",
    tags: ["directory", "seo", "agent-readable"],
    author: "OpenAgent.bot Editors",
    body: "Open-source AI discovery is moving from link lists toward structured resource layers. A durable directory needs stable slugs, useful editorial summaries, and machine-readable outputs that agents can consume without scraping pages."
  },
  {
    slug: "why-agent-readable-pages-matter",
    title: "Why agent-readable pages matter",
    summary:
      "Human-readable pages are only half the interface. AI-native directories need JSON, Markdown, and manifest-ready routes.",
    publishedAt: "2026-04-14",
    tags: ["llms", "structured-data", "future-web"],
    author: "OpenAgent.bot Editors",
    body: "Agents need predictable structure. When a resource page has a matching Markdown or JSON representation, tools can cite, compare, filter, and route information with less ambiguity."
  },
  {
    slug: "curating-open-agent-tools",
    title: "Curating open agent tools without noise",
    summary:
      "A practical editorial lens for separating durable agent infrastructure from short-lived launch noise.",
    publishedAt: "2026-04-12",
    tags: ["agents", "curation", "open-source"],
    author: "OpenAgent.bot Editors",
    body: "Good curation starts by asking what a project helps someone do today. The best entries explain the use case, the maturity signal, the license, and the relationship to nearby tools."
  }
];

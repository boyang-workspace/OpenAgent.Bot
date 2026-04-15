import type { CategorySlug } from "@/config/site";

export type Resource = {
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  tags: string[];
  repoUrl?: string;
  homepageUrl?: string;
  license?: string;
  updatedAt: string;
  coverImage: string;
  featured?: boolean;
  trending?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export const resources: Resource[] = [
  {
    slug: "llama-cpp",
    title: "llama.cpp",
    summary:
      "A fast, portable inference stack for running open-weight language models across local machines, servers, and edge devices.",
    category: "models",
    tags: ["inference", "local-ai", "open-weights"],
    repoUrl: "https://github.com/ggerganov/llama.cpp",
    homepageUrl: "https://github.com/ggerganov/llama.cpp",
    license: "MIT",
    updatedAt: "2026-04-10",
    coverImage: "https://opengraph.githubassets.com/openagentbot/ggerganov/llama.cpp",
    featured: true,
    trending: true
  },
  {
    slug: "open-webui",
    title: "Open WebUI",
    summary:
      "A self-hosted AI interface for local and remote models with a familiar chat experience and an active open-source ecosystem.",
    category: "tools",
    tags: ["self-hosted", "chat-ui", "ollama"],
    repoUrl: "https://github.com/open-webui/open-webui",
    homepageUrl: "https://openwebui.com",
    license: "BSD-3-Clause",
    updatedAt: "2026-04-08",
    coverImage: "https://opengraph.githubassets.com/openagentbot/open-webui/open-webui",
    featured: true
  },
  {
    slug: "langgraph",
    title: "LangGraph",
    summary:
      "A graph-based framework for building stateful agent workflows with durable execution, branching, and human review paths.",
    category: "agents",
    tags: ["agent-framework", "workflow", "state"],
    repoUrl: "https://github.com/langchain-ai/langgraph",
    homepageUrl: "https://langchain-ai.github.io/langgraph/",
    license: "MIT",
    updatedAt: "2026-04-06",
    coverImage: "https://opengraph.githubassets.com/openagentbot/langchain-ai/langgraph",
    trending: true
  },
  {
    slug: "mem0",
    title: "mem0",
    summary:
      "A memory layer for AI applications that helps agents store, retrieve, and reuse user and task context over time.",
    category: "memory-systems",
    tags: ["memory", "context", "retrieval"],
    repoUrl: "https://github.com/mem0ai/mem0",
    homepageUrl: "https://mem0.ai",
    license: "Apache-2.0",
    updatedAt: "2026-04-05",
    coverImage: "https://opengraph.githubassets.com/openagentbot/mem0ai/mem0",
    trending: true
  },
  {
    slug: "model-context-protocol",
    title: "Model Context Protocol",
    summary:
      "An open protocol for connecting AI applications to external tools, data sources, and structured context providers.",
    category: "plugins",
    tags: ["protocol", "connectors", "mcp"],
    repoUrl: "https://github.com/modelcontextprotocol",
    homepageUrl: "https://modelcontextprotocol.io",
    license: "Open specification",
    updatedAt: "2026-04-03",
    coverImage: "https://opengraph.githubassets.com/openagentbot/modelcontextprotocol/typescript-sdk",
    featured: true
  },
  {
    slug: "browser-use",
    title: "browser-use",
    summary:
      "A browser automation project that gives agents a practical way to inspect pages, take actions, and complete web tasks.",
    category: "skills",
    tags: ["browser", "automation", "agent-skill"],
    repoUrl: "https://github.com/browser-use/browser-use",
    homepageUrl: "https://browser-use.com",
    license: "MIT",
    updatedAt: "2026-03-29",
    coverImage: "https://opengraph.githubassets.com/openagentbot/browser-use/browser-use"
  }
];

export function getResourcesByCategory(category: CategorySlug) {
  return resources.filter((resource) => resource.category === category);
}

export function getRelatedResources(resource: Resource) {
  return resources
    .filter((candidate) => candidate.slug !== resource.slug && candidate.category === resource.category)
    .slice(0, 3);
}

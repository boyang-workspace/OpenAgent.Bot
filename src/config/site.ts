export const site = {
  name: "OpenAgent.bot",
  url: "https://www.openagent.bot",
  title: "OpenAgent.bot - Open-source AI resources for humans and agents",
  description:
    "Discover open-source AI models, agents, skills, memory systems, plugins, and tools through an editorial directory built for humans and agent-readable workflows.",
  nav: [
    { label: "Models", href: "/models" },
    { label: "Agents", href: "/agents" },
    { label: "Skills", href: "/skills" },
    { label: "Memory", href: "/memory-systems" },
    { label: "Plugins", href: "/plugins" },
    { label: "Tools", href: "/tools" },
    { label: "Blog", href: "/blog" }
  ]
};

export const categories = [
  {
    slug: "models",
    label: "Models",
    description: "Open models, inference stacks, and model release resources."
  },
  {
    slug: "agents",
    label: "Agents",
    description: "Agent frameworks, autonomous workflows, and orchestration projects."
  },
  {
    slug: "skills",
    label: "Skills",
    description: "Reusable skills, workflow packs, and task-specific agent capabilities."
  },
  {
    slug: "memory-systems",
    label: "Memory Systems",
    description: "Long-term memory, context retrieval, and knowledge persistence systems."
  },
  {
    slug: "plugins",
    label: "Plugins",
    description: "Extensions, connectors, and plugin ecosystems for AI tooling."
  },
  {
    slug: "tools",
    label: "Tools",
    description: "Practical utilities for building, testing, and operating AI products."
  }
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

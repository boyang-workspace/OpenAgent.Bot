export const site = {
  name: "OpenAgent.bot",
  url: "https://www.openagent.bot",
  title: "OpenAgent.bot - Open-source AI resources for humans and agents",
  description:
    "Find the right open-source agents, skills, MCP connectors, memory systems, models, and tools for agent workflows.",
  analytics: {
    ga4MeasurementId: "G-92BLS0VYN1"
  },
  nav: [
    { label: "Stack Finder", href: "/stack-finder" },
    { label: "Evaluations", href: "/evaluations" },
    { label: "Models", href: "/models" },
    { label: "Agents", href: "/agents" },
    { label: "Skills", href: "/skills" },
    { label: "Bots", href: "/bots" },
    { label: "Memory", href: "/memory-systems" },
    { label: "Plugins", href: "/plugins" },
    { label: "Tools", href: "/tools" },
    { label: "Guides", href: "/blog" }
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
    slug: "bots",
    label: "Bots",
    description: "Open-source AI bots for Discord, Telegram, Slack, WhatsApp, Matrix, WeChat, and self-hosted agent channels."
  },
  {
    slug: "tools",
    label: "Tools",
    description: "Practical utilities for building, testing, and operating AI products."
  }
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

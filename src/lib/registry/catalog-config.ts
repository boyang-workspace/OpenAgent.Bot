import type { CatalogCategory } from "./catalog";

export type CatalogPageConfig = {
  category: CatalogCategory;
  href: string;
  shortLabel: string;
  label: string;
  eyebrow: string;
  description: string;
  relatedViews?: Array<{ label: string; href: string }>;
};

export const catalogPages: Record<Exclude<CatalogCategory, "supporting-infrastructure">, CatalogPageConfig> = {
  "foundation-model": {
    category: "foundation-model", href: "/models", shortLabel: "Models", label: "Foundation Models",
    eyebrow: "Open model database", description: "Open and open-weight foundation models, tracked across releases, repositories, model revisions and evaluations."
  },
  agent: {
    category: "agent", href: "/agents", shortLabel: "Agents", label: "Agents",
    eyebrow: "Open agent database", description: "Runnable agents and agent frameworks ranked by observed maintenance and release activity.",
    relatedViews: [{ label: "Open-source agent frameworks", href: "/open-source-agent-frameworks" }]
  },
  "robot-model": {
    category: "robot-model", href: "/robot-models", shortLabel: "Robot models", label: "Robot Models",
    eyebrow: "Embodied intelligence database", description: "VLA, policy, world, perception and manipulation models tracked as versioned robot intelligence.",
    relatedViews: [{ label: "Open-source VLA models", href: "/open-source-vla-models" }, { label: "Robotics system layers", href: "/robotics" }]
  },
  "robot-hardware": {
    category: "robot-hardware", href: "/robots", shortLabel: "Robots", label: "Robot Hardware",
    eyebrow: "Open robot hardware database", description: "Physical robots and open hardware platforms tracked across product, SDK, firmware and documentation updates.",
    relatedViews: [{ label: "Open-source robots", href: "/open-source-robots" }, { label: "Open-source humanoid robots", href: "/open-source-humanoid-robots" }, { label: "Robotics system layers", href: "/robotics" }]
  }
};

export const primaryCatalogPages = Object.values(catalogPages);

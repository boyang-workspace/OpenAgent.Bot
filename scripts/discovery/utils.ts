import type { CategorySlug, DiscoveryCandidate, SourceMetrics } from "../../src/lib/content/schema";

export type ScoredCandidate = DiscoveryCandidate & {
  category: CategorySlug;
  score: number;
  reasons: string[];
  sourceLinks: string[];
};

const categorySignals: Array<{ category: CategorySlug; signals: string[] }> = [
  { category: "memory-systems", signals: ["memory", "memories", "context", "retrieval", "vector", "rag"] },
  { category: "agents", signals: ["agent", "agents", "autonomous", "multi-agent", "workflow", "orchestration"] },
  { category: "models", signals: ["model", "models", "llm", "inference", "open-weight", "local ai"] },
  { category: "plugins", signals: ["mcp", "plugin", "plugins", "connector", "server", "integration"] },
  { category: "skills", signals: ["skill", "skills", "playbook", "workflow", "automation pack"] },
  { category: "tools", signals: ["tool", "ui", "webui", "dashboard", "cli", "interface"] }
];

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function extractGitHubRepoUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/);
  if (!match) return undefined;
  return `https://github.com/${match[1]}/${match[2].replace(/\.git$/, "")}`;
}

export function classifyCategory(title: string, text = ""): CategorySlug {
  const haystack = `${title} ${text}`.toLowerCase();
  let best: { category: CategorySlug; hits: number } = { category: "tools", hits: 0 };

  for (const candidate of categorySignals) {
    const hits = candidate.signals.reduce((count, signal) => count + (haystack.includes(signal) ? 1 : 0), 0);
    if (hits > best.hits) {
      best = { category: candidate.category, hits };
    }
  }

  return best.category;
}

function candidateKey(candidate: DiscoveryCandidate): string {
  return (candidate.repoUrl ?? candidate.url).toLowerCase().replace(/\/$/, "");
}

function mergeMetrics(left: SourceMetrics, right: SourceMetrics): SourceMetrics {
  return {
    stars: Math.max(left.stars ?? 0, right.stars ?? 0) || undefined,
    forks: Math.max(left.forks ?? 0, right.forks ?? 0) || undefined,
    recentStars: Math.max(left.recentStars ?? 0, right.recentStars ?? 0) || undefined,
    hnPoints: Math.max(left.hnPoints ?? 0, right.hnPoints ?? 0) || undefined,
    hnComments: Math.max(left.hnComments ?? 0, right.hnComments ?? 0) || undefined,
    productHuntVotes: Math.max(left.productHuntVotes ?? 0, right.productHuntVotes ?? 0) || undefined,
    xLikes: Math.max(left.xLikes ?? 0, right.xLikes ?? 0) || undefined,
    xReposts: Math.max(left.xReposts ?? 0, right.xReposts ?? 0) || undefined
  };
}

export function mergeCandidates(candidates: DiscoveryCandidate[]): DiscoveryCandidate[] {
  const byKey = new Map<string, DiscoveryCandidate>();

  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    const existing = byKey.get(key);
    const links = candidate.sourceLinks ?? [candidate.url];

    if (!existing) {
      byKey.set(key, {
        ...candidate,
        sourceLinks: Array.from(new Set([candidate.url, ...links]))
      });
      continue;
    }

    byKey.set(key, {
      ...existing,
      description: existing.description ?? candidate.description,
      rawText: [existing.rawText, candidate.rawText].filter(Boolean).join("\n\n"),
      sourceMetrics: mergeMetrics(existing.sourceMetrics, candidate.sourceMetrics),
      sourceLinks: Array.from(new Set([...(existing.sourceLinks ?? [existing.url]), candidate.url, ...links]))
    });
  }

  return Array.from(byKey.values());
}

function hasLicenseSignal(candidate: DiscoveryCandidate): boolean {
  const text = `${candidate.description ?? ""} ${candidate.rawText ?? ""}`.toLowerCase();
  return Boolean(candidate.repoUrl) && /license|mit|apache|bsd|gpl|open-source|open source/.test(text);
}

function calculateHeat(metrics: SourceMetrics): number {
  const stars = Math.min((metrics.stars ?? 0) / 1000, 1) * 4;
  const recentStars = Math.min((metrics.recentStars ?? 0) / 50, 1) * 2;
  const hn = Math.min(((metrics.hnPoints ?? 0) + (metrics.hnComments ?? 0)) / 100, 1) * 4;
  return Math.round(stars + recentStars + hn);
}

export function scoreCandidate(candidate: DiscoveryCandidate): ScoredCandidate {
  const text = `${candidate.title} ${candidate.description ?? ""} ${candidate.rawText ?? ""}`.toLowerCase();
  const reasons: string[] = [];

  const openSourceScore = hasLicenseSignal(candidate) ? 1 : candidate.repoUrl ? 0.7 : 0;
  if (openSourceScore >= 0.7) reasons.push("repo and license signals");

  const aiSignals = ["ai", "agent", "llm", "model", "memory", "mcp", "skill", "workflow", "inference", "rag"];
  const aiHits = aiSignals.filter((signal) => text.includes(signal)).length;
  const aiRelevanceScore = Math.min(aiHits / 3, 1);
  if (aiRelevanceScore >= 0.7) reasons.push("strong AI relevance");

  const updatedRecently = /updated|release|commit|2026|2025/.test(text) || Boolean(candidate.sourceMetrics.recentStars);
  const maintainerActivityScore = updatedRecently ? 0.85 : 0.5;

  const clarityScore = (candidate.description?.length ?? 0) > 60 || (candidate.rawText?.length ?? 0) > 280 ? 0.85 : 0.45;
  const distributionScore = /(install|try|use|build|deploy|workflow|automation|framework|server|tool)/.test(text) ? 0.9 : 0.55;
  const sourceHeatScore = calculateHeat(candidate.sourceMetrics) / 10;

  const score = Math.round(
    openSourceScore * 30 +
      aiRelevanceScore * 25 +
      maintainerActivityScore * 15 +
      clarityScore * 10 +
      distributionScore * 10 +
      sourceHeatScore * 10
  );

  return {
    ...candidate,
    category: classifyCategory(candidate.title, `${candidate.description ?? ""} ${candidate.rawText ?? ""}`),
    score,
    reasons,
    sourceLinks: candidate.sourceLinks ?? [candidate.url]
  };
}

export function todayString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

import type { CatalogCategory, CatalogLifecycleState } from "./catalog";
import type { RegistryEntity } from "./types";

export type ActivitySignal = "release" | "commit" | "verification" | "unknown";

export type ActivityEntry = {
  entity: RegistryEntity;
  rank: number;
  score: number;
  signal: ActivitySignal;
  signalAt: string;
  ageDays: number;
  state: CatalogLifecycleState;
};

const windows: Record<CatalogCategory, { cooling: number; dormant: number }> = {
  "foundation-model": { cooling: 180, dormant: 540 },
  agent: { cooling: 90, dormant: 365 },
  "robot-model": { cooling: 180, dormant: 540 },
  "robot-hardware": { cooling: 365, dormant: 730 },
  "supporting-infrastructure": { cooling: 180, dormant: 540 }
};

function validTime(value?: string): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
}

export function activitySignal(entity: RegistryEntity, category: CatalogCategory): { signal: ActivitySignal; at: string } {
  const candidates: Array<{ signal: ActivitySignal; at?: string; priority: number }> = category === "robot-hardware"
    ? [
        { signal: "release", at: entity.lastReleaseAt, priority: 4 },
        { signal: "verification", at: entity.lastVerifiedAt, priority: 3 },
        { signal: "commit", at: entity.lastCommitAt, priority: 2 }
      ]
    : [
        { signal: "release", at: entity.lastReleaseAt, priority: 4 },
        { signal: "commit", at: entity.lastCommitAt, priority: 3 },
        { signal: "verification", at: entity.lastVerifiedAt, priority: 2 }
      ];
  const selected = candidates
    .filter((item): item is { signal: ActivitySignal; at: string; priority: number } => Boolean(item.at))
    .sort((a, b) => validTime(b.at) - validTime(a.at) || b.priority - a.priority)[0];
  return selected ? { signal: selected.signal, at: selected.at } : { signal: "unknown", at: entity.firstSeenAt };
}

export function lifecycleFromActivity(entity: RegistryEntity, category: CatalogCategory, ageDays: number): CatalogLifecycleState {
  if (entity.lifecycle === "archived") return "archived";
  if (!Number.isFinite(ageDays)) return "unknown";
  const threshold = windows[category];
  if (ageDays >= threshold.dormant) return "dormant";
  if (ageDays >= threshold.cooling) return "cooling";
  return "active";
}

export function rankByActivity(entities: RegistryEntity[], category: CatalogCategory, now = new Date()): ActivityEntry[] {
  const nowTime = now.getTime();
  const dormantWindow = windows[category].dormant;
  return entities
    .map((entity) => {
      const selected = activitySignal(entity, category);
      const ageDays = Math.max(0, Math.floor((nowTime - validTime(selected.at)) / 86_400_000));
      const score = Math.max(0, Math.round(100 * (1 - Math.min(ageDays, dormantWindow) / dormantWindow)));
      return { entity, score: selected.signal === "unknown" ? 0 : score, signal: selected.signal, signalAt: selected.at, ageDays, state: selected.signal === "unknown" ? "unknown" : lifecycleFromActivity(entity, category, ageDays) };
    })
    .sort((a, b) => Number(a.signal === "unknown") - Number(b.signal === "unknown") || validTime(b.signalAt) - validTime(a.signalAt) || (b.entity.stars ?? 0) - (a.entity.stars ?? 0) || a.entity.name.localeCompare(b.entity.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

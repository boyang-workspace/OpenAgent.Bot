export const entityKinds = [
  "agent",
  "agent-framework",
  "model",
  "robot",
  "robotics-framework",
  "hardware",
  "simulator",
  "protocol",
  "tool",
  "dataset"
] as const;

export type EntityKind = (typeof entityKinds)[number];

export const opennessStatuses = [
  "open-source",
  "open-weights",
  "open-core",
  "source-available",
  "closed",
  "unknown"
] as const;

export type OpennessStatus = (typeof opennessStatuses)[number];
export type SourceTrustTier = "canonical" | "official" | "community" | "discovery";
export type SourceAutomationStatus = "active" | "registered" | "manual" | "paused";
export type SourceKind = "api" | "feed" | "repository" | "newsroom" | "research" | "documentation" | "registry";

export type RegistryEntity = {
  id: string;
  slug: string;
  kind: EntityKind;
  name: string;
  summary: string;
  description?: string;
  organization?: string;
  country?: string;
  lifecycle: "active" | "inactive" | "archived" | "unknown";
  opennessStatus: OpennessStatus;
  licenseSpdx?: string;
  canonicalUrl?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  logoUrl?: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  lastReleaseAt?: string;
  lastCommitAt?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistrySource = {
  id: string;
  name: string;
  publisher: string;
  region: "global" | "us" | "cn" | "eu" | "other";
  kind: SourceKind;
  trustTier: SourceTrustTier;
  automationStatus: SourceAutomationStatus;
  connector: "github" | "huggingface" | "rss" | "json-api" | "html" | "manual";
  url: string;
  feedUrl?: string;
  apiUrl?: string;
  scope: Array<"agents" | "models" | "robots" | "hardware" | "research" | "company-news">;
  cadence: "hourly" | "daily" | "weekly" | "manual";
  notes?: string;
};

export type RegistryChange = {
  id: string;
  entityId: string;
  entitySlug: string;
  entityName: string;
  entityKind: EntityKind;
  factKey: string;
  changeType: "created" | "updated" | "removed";
  previousValue?: unknown;
  nextValue?: unknown;
  sourceName: string;
  sourceUrl?: string;
  detectedAt: string;
};

export type RegistryStats = {
  entities: number;
  agents: number;
  robots: number;
  models: number;
  sources: number;
  observations: number;
  changes30d: number;
  lastSyncAt?: string;
};

export type EntityQuery = {
  q?: string;
  kinds?: EntityKind[];
  openness?: OpennessStatus[];
  country?: string;
  sort?: "updated" | "stars" | "name";
  limit?: number;
  offset?: number;
};

export type EntityQueryResult = {
  items: RegistryEntity[];
  total: number;
  limit: number;
  offset: number;
};

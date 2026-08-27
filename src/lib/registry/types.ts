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

export const entityDomains = ["agent", "robotics", "shared"] as const;
export type EntityDomain = (typeof entityDomains)[number];

export const roboticsLayers = ["platform", "intelligence", "stack"] as const;
export type RoboticsLayer = (typeof roboticsLayers)[number];

export const robotModelTypes = [
  "vla", "policy-model", "foundation-model", "world-model", "navigation-model",
  "perception-model", "manipulation-model", "vision-language-model", "other"
] as const;
export type RobotModelType = (typeof robotModelTypes)[number];

export const robotFormFactors = [
  "humanoid", "mobile-manipulator", "manipulator", "dual-arm", "robot-arm",
  "quadruped", "mobile-base", "drone", "hand", "gripper", "sensor-platform", "other"
] as const;
export type RobotFormFactor = (typeof robotFormFactors)[number];

export const roboticsStackTypes = [
  "framework", "simulator", "dataset", "runtime", "sdk", "driver", "teleoperation",
  "data-collection", "training-infrastructure", "evaluation", "tool", "other"
] as const;
export type RoboticsStackType = (typeof roboticsStackTypes)[number];

export type RegistryRoboticsProfile = {
  layer: RoboticsLayer;
  modelType?: RobotModelType;
  formFactor?: RobotFormFactor;
  stackType?: RoboticsStackType;
  metadata: Record<string, unknown>;
  confidence: number;
  classificationMethod: "rule" | "manual" | "source" | "inferred";
  reviewStatus: "provisional" | "verified";
  sourceUrl?: string;
  updatedAt: string;
};

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
  domains: EntityDomain[];
  primaryDomain?: EntityDomain;
  robotics?: RegistryRoboticsProfile;
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
  downloads30d?: number;
  openIssues?: number;
  lastReleaseAt?: string;
  lastCommitAt?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistryDomainAssignment = {
  domain: EntityDomain;
  isPrimary: boolean;
  confidence: number;
  classificationMethod: "rule" | "manual" | "source" | "inferred";
  reviewStatus: "provisional" | "verified";
  sourceUrl?: string;
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

export type RegistryFact = {
  key: string;
  value: unknown;
  confidence: number;
  observedAt: string;
  sourceName: string;
  sourceTrustTier: SourceTrustTier;
  sourceUrl?: string;
};

export type RegistryOpennessFacet = {
  facet: "code" | "weights" | "data" | "hardware" | "documentation" | "governance";
  status: "open" | "partial" | "closed" | "unknown";
  licenseOrTerms?: string;
  sourceName: string;
  sourceUrl?: string;
  observedAt: string;
};

export type RegistryRelationship = {
  id: string;
  direction: "outbound" | "inbound";
  type: string;
  status: "candidate" | "verified" | "rejected";
  confidence: number;
  entity: Pick<RegistryEntity, "id" | "slug" | "name" | "kind" | "summary">;
  evidence: Array<{
    sourceName: string;
    sourceUrl: string;
    excerpt?: string;
    observedAt: string;
  }>;
};

export type RegistrySubscription = {
  sourceName: string;
  sourceTrustTier: SourceTrustTier;
  locator: string;
  lastSyncedAt?: string;
  nextSyncAt?: string;
};

export type RegistryMetricSnapshot = {
  key: string;
  value: number;
  observedAt: string;
};

export type RegistryDossier = {
  entity: RegistryEntity;
  domainAssignments: RegistryDomainAssignment[];
  facts: RegistryFact[];
  opennessFacets: RegistryOpennessFacet[];
  changes: RegistryChange[];
  relationships: RegistryRelationship[];
  subscriptions: RegistrySubscription[];
  metricSnapshots: RegistryMetricSnapshot[];
  record: {
    observationCount: number;
    metricSnapshotCount: number;
    firstObservationAt?: string;
    lastObservationAt?: string;
  };
};

export type RegistryStats = {
  entities: number;
  agents: number;
  robots: number;
  infrastructure: number;
  robotPlatforms: number;
  robotIntelligence: number;
  roboticsStack: number;
  models: number;
  tools: number;
  sources: number;
  liveSources: number;
  observations: number;
  metricEntities: number;
  changes30d: number;
  historyStartedAt?: string;
  lastSyncAt?: string;
};

export type EntityQuery = {
  q?: string;
  domains?: EntityDomain[];
  roboticsLayers?: RoboticsLayer[];
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

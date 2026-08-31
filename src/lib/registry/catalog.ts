import type { RegistryDatabase } from "./repository";

export const catalogCategories = [
  "foundation-model",
  "agent",
  "robot-model",
  "robot-hardware",
  "supporting-infrastructure"
] as const;

export type CatalogCategory = (typeof catalogCategories)[number];
export type CatalogInclusionStatus = "included" | "review" | "excluded";
export type CatalogLifecycleState = "active" | "cooling" | "dormant" | "archived" | "unknown";

export type CatalogProfile = {
  entityId: string;
  category: CatalogCategory;
  subtype?: string;
  inclusionStatus: CatalogInclusionStatus;
  inclusionReason?: string;
  opennessBasis: "code" | "weights" | "hardware" | "mixed" | "source-available" | "unknown";
  metadata: Record<string, unknown>;
  sourceId?: string;
  sourceUrl?: string;
  confidence: number;
  observedAt: string;
  updatedAt: string;
};

export type CatalogRelease = {
  id: string;
  entityId: string;
  version?: string;
  title: string;
  kind: "software" | "model" | "weights" | "dataset" | "firmware" | "hardware" | "documentation" | "other";
  channel: "stable" | "prerelease" | "development" | "unknown";
  url: string;
  publishedAt?: string;
  observedAt: string;
  sourceId: string;
};

export type CatalogPaper = {
  id: string;
  title: string;
  url: string;
  doi?: string;
  arxivId?: string;
  publishedAt?: string;
  relationshipType: "introduces" | "evaluates" | "uses" | "extends" | "documents" | "other";
};

export type CatalogEvaluation = {
  id: string;
  benchmarkId: string;
  benchmarkName: string;
  evaluatorType: "official" | "third-party" | "community" | "unknown";
  metricKey: string;
  metricValue?: number;
  metricText?: string;
  unit?: string;
  conditions: Record<string, unknown>;
  resultUrl: string;
  evaluatedAt?: string;
  observedAt: string;
};

export type CatalogLifecycleAssessment = {
  id: string;
  state: CatalogLifecycleState;
  basis: "official" | "inferred" | "curated";
  reasonCode: string;
  reason: string;
  methodologyVersion: string;
  signals: Record<string, unknown>;
  sourceUrl?: string;
  assessedAt: string;
};

export type CatalogDetail = {
  profile?: CatalogProfile;
  releases: CatalogRelease[];
  papers: CatalogPaper[];
  evaluations: CatalogEvaluation[];
  lifecycle?: CatalogLifecycleAssessment;
  completeness?: CatalogCompleteness;
};

export type CatalogCompleteness = {
  present: number;
  required: number;
  coverage: number;
  modules: Array<{
    key: string;
    label: string;
    status: "present" | "missing";
    updateSource: string;
  }>;
};

export type CatalogCategoryHealth = {
  category: CatalogCategory;
  entities: number;
  metricEntities: number;
  coverage: number;
  historyStartedAt?: string;
  latestObservationAt?: string;
};

function parseJson(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function profileFromRow(row: Record<string, string | number | null>): CatalogProfile {
  return {
    entityId: String(row.entity_id),
    category: String(row.primary_category) as CatalogCategory,
    subtype: typeof row.subtype === "string" ? row.subtype : undefined,
    inclusionStatus: String(row.inclusion_status) as CatalogInclusionStatus,
    inclusionReason: typeof row.inclusion_reason === "string" ? row.inclusion_reason : undefined,
    opennessBasis: String(row.openness_basis) as CatalogProfile["opennessBasis"],
    metadata: parseJson(typeof row.metadata_json === "string" ? row.metadata_json : null),
    sourceId: typeof row.source_id === "string" ? row.source_id : undefined,
    sourceUrl: typeof row.source_url === "string" ? row.source_url : undefined,
    confidence: Number(row.confidence),
    observedAt: String(row.observed_at),
    updatedAt: String(row.updated_at)
  };
}

export class CatalogRepository {
  constructor(private readonly db: RegistryDatabase) {}

  async listProfiles(category?: CatalogCategory, includedOnly = true): Promise<CatalogProfile[]> {
    const filters = [includedOnly ? "inclusion_status = 'included'" : "1 = 1"];
    const values: unknown[] = [];
    if (category) {
      values.push(category);
      filters.push(`primary_category = ?${values.length}`);
    }
    const result = await this.db.prepare(`
      SELECT * FROM catalog_profiles
      WHERE ${filters.join(" AND ")}
      ORDER BY primary_category, entity_id
    `).bind(...values).all<Record<string, string | number | null>>();
    return (result.results ?? []).map(profileFromRow);
  }

  async getDetail(entityId: string): Promise<CatalogDetail> {
    const [profile, releases, papers, evaluations, lifecycle, completenessRow] = await Promise.all([
      this.db.prepare("SELECT * FROM catalog_profiles WHERE entity_id = ?1 LIMIT 1").bind(entityId).first<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT * FROM project_releases WHERE entity_id = ?1
        ORDER BY COALESCE(published_at, observed_at) DESC LIMIT 50`).bind(entityId).all<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT p.*, ep.relationship_type FROM papers p
        JOIN entity_papers ep ON ep.paper_id = p.id WHERE ep.entity_id = ?1
        ORDER BY COALESCE(p.published_at, p.observed_at) DESC`).bind(entityId).all<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT er.*, b.name AS benchmark_name FROM evaluation_results er
        JOIN benchmarks b ON b.id = er.benchmark_id WHERE er.entity_id = ?1
        ORDER BY COALESCE(er.evaluated_at, er.observed_at) DESC`).bind(entityId).all<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT * FROM lifecycle_assessments WHERE entity_id = ?1
        ORDER BY assessed_at DESC LIMIT 1`).bind(entityId).first<Record<string, string | number | null>>(),
      this.db.prepare(`SELECT e.description,e.organization,e.openness_status,e.license_spdx,
          e.canonical_url,e.repository_url,e.documentation_url,
          EXISTS(SELECT 1 FROM current_facts cf WHERE cf.entity_id=e.id AND cf.fact_key='owner') AS has_owner,
          EXISTS(SELECT 1 FROM entity_metrics_current emc WHERE emc.entity_id=e.id) AS has_activity,
          EXISTS(SELECT 1 FROM project_releases pr WHERE pr.entity_id=e.id) AS has_releases,
          EXISTS(SELECT 1 FROM source_subscriptions ss WHERE ss.entity_id=e.id AND ss.source_id='huggingface' AND ss.enabled=1) AS has_model_card,
          EXISTS(SELECT 1 FROM entity_papers ep WHERE ep.entity_id=e.id) AS has_papers,
          EXISTS(SELECT 1 FROM evaluation_results er WHERE er.entity_id=e.id) AS has_evaluations,
          EXISTS(SELECT 1 FROM usage_identity_rules ur WHERE ur.entity_id=e.id) AS has_usage_mapping,
          EXISTS(SELECT 1 FROM robotics_profiles rp WHERE rp.entity_id=e.id) AS has_robotics_profile
        FROM entities e WHERE e.id=?1 LIMIT 1`).bind(entityId).first<Record<string, string | number | null>>()
    ]);

    const category = typeof profile?.primary_category === "string" ? profile.primary_category as CatalogCategory : "supporting-infrastructure";
    const present = (value: unknown) => value === 1 || value === true || (typeof value === "string" && value.trim().length > 0);
    const coreModules = {
      identity: { key:"identity", label:"Official identity", status: present(completenessRow?.description) && present(completenessRow?.canonical_url), updateSource:"Official site + canonical registry record" },
      openness: { key:"openness", label:"Open status & license", status: completenessRow?.openness_status !== "unknown" && present(completenessRow?.license_spdx), updateSource:"Repository license + official model/hardware terms" },
      maintainer: { key:"maintainer", label:"Maintainer", status: present(completenessRow?.organization) || Number(completenessRow?.has_owner) === 1, updateSource:"Official organization or GitHub owner" },
      links: { key:"links", label:"Official links", status: present(completenessRow?.repository_url) || present(completenessRow?.documentation_url), updateSource:"Official documentation + repository" },
      activity: { key:"activity", label:"Activity history", status: Number(completenessRow?.has_activity) === 1, updateSource:"GitHub / Hugging Face daily snapshots" },
      releases: { key:"releases", label:"Release history", status: Number(completenessRow?.has_releases) === 1, updateSource:"GitHub Releases / package registry / official release feed" },
      modelCard: { key:"model-card", label:"Model card", status: Number(completenessRow?.has_model_card) === 1, updateSource:"Hugging Face official model repository" },
      papers: { key:"papers", label:"Papers", status: Number(completenessRow?.has_papers) === 1, updateSource:"Official model card/repository declaration → arXiv" },
      evaluations: { key:"evaluations", label:"Evaluations", status: Number(completenessRow?.has_evaluations) === 1, updateSource:"Structured model-index + named benchmark publishers" },
      usage: { key:"usage", label:"Usage identity", status: Number(completenessRow?.has_usage_mapping) === 1, updateSource:"Curated OpenRouter identity rule" },
      hardware: { key:"hardware", label:"Hardware specification", status: Number(completenessRow?.has_robotics_profile) === 1, updateSource:"Official product and technical documentation" }
    };
    const required = category === "foundation-model"
      ? [coreModules.identity,coreModules.openness,coreModules.links,coreModules.activity,coreModules.releases,coreModules.modelCard,coreModules.papers,coreModules.evaluations,coreModules.usage]
      : category === "agent"
        ? [coreModules.identity,coreModules.openness,coreModules.maintainer,coreModules.links,coreModules.activity,coreModules.releases,coreModules.usage]
        : category === "robot-model"
          ? [coreModules.identity,coreModules.openness,coreModules.links,coreModules.activity,coreModules.releases,coreModules.papers,coreModules.evaluations]
          : category === "robot-hardware"
            ? [coreModules.identity,coreModules.openness,coreModules.maintainer,coreModules.links,coreModules.activity,coreModules.releases,coreModules.hardware]
            : [coreModules.identity,coreModules.openness,coreModules.links,coreModules.activity,coreModules.releases];
    const presentModules = required.filter((module) => module.status).length;

    return {
      profile: profile ? profileFromRow(profile) : undefined,
      releases: (releases.results ?? []).map((row) => ({
        id: String(row.id), entityId: String(row.entity_id),
        version: typeof row.version === "string" ? row.version : undefined,
        title: String(row.title), kind: String(row.release_kind) as CatalogRelease["kind"],
        channel: String(row.channel) as CatalogRelease["channel"], url: String(row.release_url),
        publishedAt: typeof row.published_at === "string" ? row.published_at : undefined,
        observedAt: String(row.observed_at), sourceId: String(row.source_id)
      })),
      papers: (papers.results ?? []).map((row) => ({
        id: String(row.id), title: String(row.title), url: String(row.paper_url),
        doi: typeof row.doi === "string" ? row.doi : undefined,
        arxivId: typeof row.arxiv_id === "string" ? row.arxiv_id : undefined,
        publishedAt: typeof row.published_at === "string" ? row.published_at : undefined,
        relationshipType: String(row.relationship_type) as CatalogPaper["relationshipType"]
      })),
      evaluations: (evaluations.results ?? []).map((row) => ({
        id: String(row.id), benchmarkId: String(row.benchmark_id), benchmarkName: String(row.benchmark_name),
        evaluatorType: String(row.evaluator_type) as CatalogEvaluation["evaluatorType"],
        metricKey: String(row.metric_key),
        metricValue: typeof row.metric_value === "number" ? row.metric_value : undefined,
        metricText: typeof row.metric_text === "string" ? row.metric_text : undefined,
        unit: typeof row.unit === "string" ? row.unit : undefined,
        conditions: parseJson(typeof row.conditions_json === "string" ? row.conditions_json : null),
        resultUrl: String(row.result_url),
        evaluatedAt: typeof row.evaluated_at === "string" ? row.evaluated_at : undefined,
        observedAt: String(row.observed_at)
      })),
      lifecycle: lifecycle ? {
        id: String(lifecycle.id), state: String(lifecycle.state) as CatalogLifecycleState,
        basis: String(lifecycle.basis) as CatalogLifecycleAssessment["basis"],
        reasonCode: String(lifecycle.reason_code), reason: String(lifecycle.reason),
        methodologyVersion: String(lifecycle.methodology_version),
        signals: parseJson(typeof lifecycle.signals_json === "string" ? lifecycle.signals_json : null),
        sourceUrl: typeof lifecycle.source_url === "string" ? lifecycle.source_url : undefined,
        assessedAt: String(lifecycle.assessed_at)
      } : undefined,
      completeness: {
        present: presentModules,
        required: required.length,
        coverage: required.length ? presentModules / required.length : 0,
        modules: required.map((module) => ({ ...module, status: module.status ? "present" as const : "missing" as const }))
      }
    };
  }

  async getCategoryHealth(category: CatalogCategory): Promise<CatalogCategoryHealth> {
    const row = await this.db.prepare(`
      SELECT
        COUNT(DISTINCT cp.entity_id) AS entities,
        COUNT(DISTINCT CASE WHEN ms.entity_id IS NOT NULL THEN cp.entity_id END) AS metric_entities,
        MIN(ms.observed_at) AS history_started_at,
        MAX(COALESCE(ms.observed_at, cp.observed_at)) AS latest_observation_at
      FROM catalog_profiles cp
      JOIN entities e ON e.id = cp.entity_id AND e.visibility = 'public'
      LEFT JOIN metric_snapshots ms ON ms.entity_id = cp.entity_id
      WHERE cp.primary_category = ?1 AND cp.inclusion_status = 'included'
    `).bind(category).first<Record<string, string | number | null>>();
    const entities = Number(row?.entities ?? 0);
    const metricEntities = Number(row?.metric_entities ?? 0);
    return {
      category,
      entities,
      metricEntities,
      coverage: entities ? metricEntities / entities : 0,
      historyStartedAt: typeof row?.history_started_at === "string" ? row.history_started_at : undefined,
      latestObservationAt: typeof row?.latest_observation_at === "string" ? row.latest_observation_at : undefined
    };
  }
}

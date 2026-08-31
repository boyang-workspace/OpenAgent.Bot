-- SteamDB-style catalogue foundation. Additive only: existing evidence, metrics,
-- changes, URLs and reviewed intake remain authoritative and intact.

CREATE TABLE catalog_profiles (
  entity_id TEXT PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  primary_category TEXT NOT NULL CHECK (primary_category IN (
    'foundation-model','agent','robot-model','robot-hardware','supporting-infrastructure'
  )),
  subtype TEXT,
  inclusion_status TEXT NOT NULL DEFAULT 'review' CHECK (inclusion_status IN ('included','review','excluded')),
  inclusion_reason TEXT,
  openness_basis TEXT NOT NULL DEFAULT 'unknown' CHECK (openness_basis IN (
    'code','weights','hardware','mixed','source-available','unknown'
  )),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  source_url TEXT,
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_catalog_profiles_category ON catalog_profiles(primary_category, inclusion_status, entity_id);
CREATE INDEX idx_catalog_profiles_subtype ON catalog_profiles(primary_category, subtype, entity_id);

INSERT INTO catalog_profiles (
  entity_id, primary_category, subtype, inclusion_status, inclusion_reason,
  openness_basis, source_url, confidence, observed_at, updated_at
)
SELECT e.id,
  CASE
    WHEN rp.layer = 'intelligence' THEN 'robot-model'
    WHEN rp.layer = 'platform' THEN 'robot-hardware'
    WHEN EXISTS (SELECT 1 FROM entity_domains ed WHERE ed.entity_id = e.id AND ed.domain = 'agent')
      AND e.kind IN ('agent','agent-framework') THEN 'agent'
    WHEN e.kind = 'model' THEN 'foundation-model'
    ELSE 'supporting-infrastructure'
  END,
  CASE
    WHEN rp.layer = 'intelligence' THEN COALESCE(rp.model_type, 'intelligence')
    WHEN rp.layer = 'platform' THEN COALESCE(rp.form_factor, 'platform')
    WHEN e.kind = 'agent-framework' THEN 'framework'
    WHEN e.kind = 'agent' THEN 'runtime'
    WHEN e.kind = 'model' THEN 'foundation-model'
    ELSE e.kind
  END,
  CASE WHEN e.visibility = 'public' THEN 'included' ELSE 'review' END,
  'Migrated from the existing public registry; catalogue classification confidence remains separately reviewable.',
  CASE
    WHEN e.openness_status = 'open-source' THEN 'code'
    WHEN e.openness_status = 'open-weights' THEN 'weights'
    WHEN e.kind IN ('robot','hardware') AND EXISTS (
      SELECT 1 FROM openness_facets ofc WHERE ofc.entity_id = e.id AND ofc.facet = 'hardware' AND ofc.status = 'open'
    ) THEN 'hardware'
    WHEN e.openness_status IN ('open-core','source-available') THEN 'source-available'
    ELSE 'unknown'
  END,
  COALESCE(rp.source_url, e.canonical_url, e.repository_url),
  CASE WHEN COALESCE(rp.review_status, 'provisional') = 'verified' THEN 0.95 ELSE 0.7 END,
  COALESCE(e.last_verified_at, e.updated_at),
  datetime('now')
FROM entities e
LEFT JOIN robotics_profiles rp ON rp.entity_id = e.id;

CREATE TABLE entity_facets (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  facet_namespace TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  source_id TEXT NOT NULL REFERENCES sources(id),
  source_url TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1 CHECK (confidence >= 0 AND confidence <= 1),
  observed_at TEXT NOT NULL,
  effective_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(entity_id, facet_namespace, schema_version, source_id, observed_at)
);
CREATE INDEX idx_entity_facets_entity_namespace ON entity_facets(entity_id, facet_namespace, observed_at DESC);

CREATE TABLE project_releases (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  upstream_id TEXT,
  version TEXT,
  title TEXT NOT NULL,
  release_kind TEXT NOT NULL CHECK (release_kind IN (
    'software','model','weights','dataset','firmware','hardware','documentation','other'
  )),
  channel TEXT NOT NULL DEFAULT 'stable' CHECK (channel IN ('stable','prerelease','development','unknown')),
  release_url TEXT NOT NULL,
  notes TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  source_id TEXT NOT NULL REFERENCES sources(id),
  published_at TEXT,
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(entity_id, source_id, release_url)
);
CREATE INDEX idx_project_releases_entity_time ON project_releases(entity_id, published_at DESC, observed_at DESC);
CREATE INDEX idx_project_releases_kind_time ON project_releases(release_kind, published_at DESC);

-- Normalize already-retained stable GitHub release and npm package facts so the
-- first catalogue deployment does not wait for the next scheduled sync.
INSERT OR IGNORE INTO project_releases (
  id, entity_id, upstream_id, version, title, release_kind, channel,
  release_url, metadata_json, source_id, published_at, observed_at, created_at
)
SELECT 'release_backfill_' || replace(cf.observation_id, '-', '_'), cf.entity_id, NULL,
  json_extract(cf.value_json, '$.tag'),
  COALESCE(json_extract(cf.value_json, '$.name'), json_extract(cf.value_json, '$.tag')),
  CASE cp.primary_category
    WHEN 'foundation-model' THEN 'model'
    WHEN 'robot-model' THEN 'model'
    WHEN 'robot-hardware' THEN 'firmware'
    ELSE 'software'
  END,
  'stable', json_extract(cf.value_json, '$.url'), '{}', cf.source_id,
  json_extract(cf.value_json, '$.publishedAt'), cf.observed_at, datetime('now')
FROM current_facts cf
JOIN catalog_profiles cp ON cp.entity_id = cf.entity_id
WHERE cf.fact_key = 'github_release.latest'
  AND json_valid(cf.value_json)
  AND json_type(cf.value_json) = 'object'
  AND json_extract(cf.value_json, '$.url') IS NOT NULL;

INSERT OR IGNORE INTO project_releases (
  id, entity_id, upstream_id, version, title, release_kind, channel,
  release_url, metadata_json, source_id, published_at, observed_at, created_at
)
SELECT 'release_backfill_' || replace(cf.observation_id, '-', '_'), cf.entity_id, NULL,
  json_extract(cf.value_json, '$.version'),
  json_extract(cf.value_json, '$.name') || ' ' || json_extract(cf.value_json, '$.version'),
  'software', 'stable', json_extract(cf.value_json, '$.url'), '{}', cf.source_id,
  json_extract(cf.value_json, '$.publishedAt'), cf.observed_at, datetime('now')
FROM current_facts cf
WHERE cf.fact_key = 'npm.package'
  AND json_valid(cf.value_json)
  AND json_type(cf.value_json) = 'object'
  AND json_extract(cf.value_json, '$.url') IS NOT NULL;

CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  doi TEXT,
  arxiv_id TEXT,
  paper_url TEXT NOT NULL,
  published_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  source_id TEXT NOT NULL REFERENCES sources(id),
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_papers_doi ON papers(doi) WHERE doi IS NOT NULL;
CREATE UNIQUE INDEX idx_papers_arxiv ON papers(arxiv_id) WHERE arxiv_id IS NOT NULL;

CREATE TABLE entity_papers (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'introduces','evaluates','uses','extends','documents','other'
  )),
  source_url TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, paper_id, relationship_type)
);

CREATE TABLE benchmarks (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'foundation-model','agent','robot-model','robot-hardware','cross-category'
  )),
  task TEXT,
  primary_metric TEXT,
  methodology_url TEXT NOT NULL,
  evaluator TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  source_id TEXT NOT NULL REFERENCES sources(id),
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE evaluation_results (
  id TEXT PRIMARY KEY,
  benchmark_id TEXT NOT NULL REFERENCES benchmarks(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  release_id TEXT REFERENCES project_releases(id) ON DELETE SET NULL,
  evaluator_type TEXT NOT NULL CHECK (evaluator_type IN ('official','third-party','community','unknown')),
  metric_key TEXT NOT NULL,
  metric_value REAL,
  metric_text TEXT,
  unit TEXT,
  higher_is_better INTEGER CHECK (higher_is_better IN (0,1)),
  conditions_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(conditions_json)),
  result_url TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id),
  evaluated_at TEXT,
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (metric_value IS NOT NULL OR metric_text IS NOT NULL)
);
CREATE INDEX idx_evaluation_results_benchmark ON evaluation_results(benchmark_id, metric_key, metric_value DESC);
CREATE INDEX idx_evaluation_results_entity ON evaluation_results(entity_id, observed_at DESC);

CREATE TABLE lifecycle_assessments (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('active','cooling','dormant','archived','unknown')),
  basis TEXT NOT NULL CHECK (basis IN ('official','inferred','curated')),
  reason_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  methodology_version TEXT NOT NULL,
  signals_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(signals_json)),
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  source_url TEXT,
  assessed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_lifecycle_assessments_current ON lifecycle_assessments(entity_id, assessed_at DESC);
CREATE INDEX idx_lifecycle_assessments_state ON lifecycle_assessments(state, assessed_at DESC);

CREATE TABLE metric_definitions (
  metric_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL CHECK (family IN ('activity','momentum','adoption','evaluation','coverage','lifecycle')),
  unit TEXT,
  higher_is_better INTEGER CHECK (higher_is_better IN (0,1)),
  applicable_categories_json TEXT NOT NULL CHECK (json_valid(applicable_categories_json)),
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO metric_definitions VALUES
  ('github.stars','GitHub stars','adoption','count',1,'["foundation-model","agent","robot-model","supporting-infrastructure"]','Current repository stars. An adoption signal, never a capability score.',datetime('now'),datetime('now')),
  ('github.commits_30d','Commits in 30 days','activity','count',1,'["agent","robot-model","supporting-infrastructure"]','Meaningful commits observed in the trailing 30-day window.',datetime('now'),datetime('now')),
  ('release.recency_days','Release recency','activity','days',0,'["foundation-model","agent","robot-model","robot-hardware"]','Days since the latest qualifying category-specific release.',datetime('now'),datetime('now')),
  ('huggingface.downloads_30d','Hugging Face downloads','adoption','count',1,'["foundation-model","robot-model"]','Downloads reported for a model repository over the source-defined period.',datetime('now'),datetime('now')),
  ('coverage.required_fields','Required field coverage','coverage','ratio',1,'["foundation-model","agent","robot-model","robot-hardware"]','Share of required category fields with fresh, attributed values.',datetime('now'),datetime('now'));

CREATE TABLE data_coverage_snapshots (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('foundation-model','agent','robot-model','robot-hardware')),
  schema_version TEXT NOT NULL,
  required_fields INTEGER NOT NULL,
  present_fields INTEGER NOT NULL,
  fresh_fields INTEGER NOT NULL,
  coverage REAL NOT NULL CHECK (coverage >= 0 AND coverage <= 1),
  detail_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(detail_json)),
  calculated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(entity_id, category, schema_version, calculated_at)
);
CREATE INDEX idx_data_coverage_category_time ON data_coverage_snapshots(category, calculated_at DESC);

ALTER TABLE ranking_definitions ADD COLUMN category TEXT NOT NULL DEFAULT 'all'
  CHECK (category IN ('all','foundation-model','agent','robot-model','robot-hardware'));
ALTER TABLE ranking_definitions ADD COLUMN family TEXT NOT NULL DEFAULT 'momentum'
  CHECK (family IN ('momentum','activity','adoption','evaluation'));
ALTER TABLE ranking_definitions ADD COLUMN window_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE ranking_definitions ADD COLUMN eligibility_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(eligibility_json));

ALTER TABLE ranking_snapshots ADD COLUMN data_as_of TEXT;
ALTER TABLE ranking_snapshots ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'collecting'
  CHECK (publication_status IN ('collecting','published','invalid'));
ALTER TABLE ranking_snapshots ADD COLUMN quality_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(quality_json));

ALTER TABLE ranking_entries ADD COLUMN eligibility_status TEXT NOT NULL DEFAULT 'eligible'
  CHECK (eligibility_status IN ('eligible','insufficient-data','excluded'));
ALTER TABLE ranking_entries ADD COLUMN explanation_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(explanation_json));

UPDATE ranking_definitions
SET eligibility_json = '{"minimum_entity_count":10,"requires_methodology":true}',
    updated_at = datetime('now')
WHERE id = 'open-momentum';

INSERT OR IGNORE INTO ranking_definitions (
  id, name, description, version, methodology_json, minimum_history_days,
  minimum_coverage, status, created_at, updated_at, category, family,
  window_days, eligibility_json
) VALUES
  ('foundation-model-activity','Foundation Model Activity','Tracks qualifying model, weight, paper and repository updates without treating stars as quality.','0.1.0','{"components":["release_recency","weight_revision_recency","download_trajectory","paper_recency"]}',30,0.8,'collecting',datetime('now'),datetime('now'),'foundation-model','activity',90,'{"minimum_entity_count":10,"required_metrics":["release.recency_days"]}'),
  ('agent-activity','Agent Activity','Tracks sustained releases, commits, contributors and maintenance health.','0.1.0','{"components":["release_recency","commit_recency","release_cadence","contributor_breadth","maintenance_health"]}',30,0.8,'collecting',datetime('now'),datetime('now'),'agent','activity',90,'{"minimum_entity_count":10,"required_metrics":["release.recency_days"]}'),
  ('robot-model-activity','Robot Model Activity','Tracks model, policy, dataset, benchmark and supported-platform updates.','0.1.0','{"components":["release_recency","benchmark_recency","paper_recency","platform_growth"]}',30,0.8,'collecting',datetime('now'),datetime('now'),'robot-model','activity',180,'{"minimum_entity_count":10,"required_metrics":["release.recency_days"]}'),
  ('robot-hardware-activity','Robot Hardware Activity','Tracks product revisions, SDK or firmware releases, documentation and official availability.','0.1.0','{"components":["product_revision_recency","firmware_recency","documentation_recency","availability_signal"]}',30,0.8,'collecting',datetime('now'),datetime('now'),'robot-hardware','activity',365,'{"minimum_entity_count":10,"required_metrics":["release.recency_days"]}');

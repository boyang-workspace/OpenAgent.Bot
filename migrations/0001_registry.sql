PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  organization TEXT,
  country TEXT,
  lifecycle TEXT NOT NULL DEFAULT 'unknown',
  visibility TEXT NOT NULL DEFAULT 'public',
  openness_status TEXT NOT NULL DEFAULT 'unknown',
  license_spdx TEXT,
  canonical_url TEXT,
  repository_url TEXT,
  documentation_url TEXT,
  logo_url TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  last_verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (kind IN ('agent','agent-framework','model','robot','robotics-framework','hardware','simulator','protocol','tool','dataset')),
  CHECK (lifecycle IN ('active','inactive','archived','unknown')),
  CHECK (visibility IN ('public','unlisted','review')),
  CHECK (openness_status IN ('open-source','open-weights','open-core','source-available','closed','unknown'))
);

CREATE INDEX IF NOT EXISTS idx_entities_kind_updated ON entities(kind, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_entities_openness_updated ON entities(openness_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_entities_organization ON entities(organization, name);

CREATE TABLE IF NOT EXISTS entity_aliases (
  entity_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  alias_type TEXT NOT NULL DEFAULT 'name',
  created_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, alias),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'global',
  kind TEXT NOT NULL,
  trust_tier TEXT NOT NULL,
  automation_status TEXT NOT NULL,
  connector TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  api_url TEXT,
  scope_json TEXT NOT NULL DEFAULT '[]',
  cadence TEXT NOT NULL DEFAULT 'daily',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (trust_tier IN ('canonical','official','community','discovery')),
  CHECK (automation_status IN ('active','registered','manual','paused'))
);

CREATE INDEX IF NOT EXISTS idx_sources_tier_status ON sources(trust_tier, automation_status, publisher);

CREATE TABLE IF NOT EXISTS source_subscriptions (
  id TEXT PRIMARY KEY,
  entity_id TEXT,
  source_id TEXT NOT NULL,
  external_id TEXT,
  locator TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_synced_at TEXT,
  next_sync_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_id, locator),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_source_subscriptions_due ON source_subscriptions(enabled, next_sync_at);

CREATE TABLE IF NOT EXISTS sync_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  discovered_count INTEGER NOT NULL DEFAULT 0,
  observed_count INTEGER NOT NULL DEFAULT 0,
  changed_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  cursor_json TEXT,
  error_summary TEXT,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  CHECK (trigger_type IN ('schedule','manual','backfill','webhook')),
  CHECK (status IN ('running','succeeded','failed','partial'))
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started ON sync_runs(source_id, started_at DESC);

CREATE TABLE IF NOT EXISTS source_items (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  published_at TEXT,
  discovered_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  topics_json TEXT NOT NULL DEFAULT '[]',
  raw_hash TEXT NOT NULL,
  UNIQUE(source_id, url),
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_source_items_published ON source_items(published_at DESC, source_id);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  sync_run_id TEXT,
  fact_key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  value_hash TEXT NOT NULL,
  source_url TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(entity_id, source_id, fact_key, value_hash, observed_at),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  FOREIGN KEY (sync_run_id) REFERENCES sync_runs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_observations_entity_fact_time ON observations(entity_id, fact_key, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_source_time ON observations(source_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS current_facts (
  entity_id TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  observation_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  value_json TEXT NOT NULL,
  value_hash TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, fact_key),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS change_events (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  observation_id TEXT,
  fact_key TEXT NOT NULL,
  change_type TEXT NOT NULL,
  previous_value_json TEXT,
  next_value_json TEXT,
  source_url TEXT,
  detected_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE SET NULL,
  CHECK (change_type IN ('created','updated','removed'))
);

CREATE INDEX IF NOT EXISTS idx_change_events_detected ON change_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_events_entity_detected ON change_events(entity_id, detected_at DESC);

CREATE TABLE IF NOT EXISTS entity_metrics_current (
  entity_id TEXT PRIMARY KEY,
  stars INTEGER,
  forks INTEGER,
  watchers INTEGER,
  downloads_30d INTEGER,
  dependents INTEGER,
  contributors INTEGER,
  open_issues INTEGER,
  last_release_at TEXT,
  last_commit_at TEXT,
  source_id TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entity_metrics_stars ON entity_metrics_current(stars DESC);

CREATE TABLE IF NOT EXISTS metric_snapshots (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value REAL NOT NULL,
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(entity_id, source_id, metric_key, observed_at),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_entity_key_time ON metric_snapshots(entity_id, metric_key, observed_at DESC);

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  source_entity_id TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'verified',
  confidence REAL NOT NULL DEFAULT 0.5,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_entity_id, target_entity_id, relationship_type),
  FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  CHECK (relationship_type IN ('depends-on','integrates-with','implements','powers','fork-of','successor-of','alternative-to','uses-model','runs-on','manufactured-by')),
  CHECK (status IN ('candidate','verified','rejected'))
);

CREATE TABLE IF NOT EXISTS relationship_evidence (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  excerpt TEXT,
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (relationship_id) REFERENCES relationships(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS openness_facets (
  entity_id TEXT NOT NULL,
  facet TEXT NOT NULL,
  status TEXT NOT NULL,
  license_or_terms TEXT,
  source_id TEXT NOT NULL,
  source_url TEXT,
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, facet),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  CHECK (facet IN ('code','weights','data','hardware','documentation','governance')),
  CHECK (status IN ('open','partial','closed','unknown'))
);

CREATE TABLE IF NOT EXISTS ranking_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL,
  methodology_json TEXT NOT NULL,
  minimum_history_days INTEGER NOT NULL DEFAULT 30,
  minimum_coverage REAL NOT NULL DEFAULT 0.8,
  status TEXT NOT NULL DEFAULT 'collecting',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (status IN ('collecting','published','paused'))
);

CREATE TABLE IF NOT EXISTS ranking_snapshots (
  id TEXT PRIMARY KEY,
  ranking_id TEXT NOT NULL,
  calculated_at TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  methodology_version TEXT NOT NULL,
  entity_count INTEGER NOT NULL,
  coverage REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ranking_id) REFERENCES ranking_definitions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ranking_entries (
  ranking_snapshot_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score REAL NOT NULL,
  score_components_json TEXT NOT NULL,
  previous_rank INTEGER,
  PRIMARY KEY (ranking_snapshot_id, entity_id),
  FOREIGN KEY (ranking_snapshot_id) REFERENCES ranking_snapshots(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO ranking_definitions (
  id, name, description, version, methodology_json, minimum_history_days, minimum_coverage, status, created_at, updated_at
) VALUES (
  'open-momentum',
  'Open Momentum',
  'Measures sustained project activity, adoption and transparent maintenance without rewarding raw size alone.',
  '0.1.0',
  '{"components":["star_velocity","release_cadence","commit_recency","contributor_breadth","openness_coverage"]}',
  30,
  0.8,
  'collecting',
  datetime('now'),
  datetime('now')
);

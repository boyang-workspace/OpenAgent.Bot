CREATE TABLE IF NOT EXISTS registry_resource_types (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL,
  includes_json TEXT NOT NULL DEFAULT '[]',
  excludes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL,
  includes_json TEXT NOT NULL DEFAULT '[]',
  excludes_json TEXT NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_resources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  canonical_type TEXT NOT NULL,
  primary_category TEXT NOT NULL,
  legacy_category TEXT,
  legacy_resource_type TEXT,
  one_liner TEXT NOT NULL,
  short_description TEXT,
  status TEXT NOT NULL,
  open_source INTEGER NOT NULL DEFAULT 0,
  license TEXT,
  pricing_model TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'medium',
  data_quality_score INTEGER NOT NULL DEFAULT 0,
  record_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  last_verified_at TEXT,
  FOREIGN KEY (canonical_type) REFERENCES registry_resource_types(id),
  FOREIGN KEY (primary_category) REFERENCES registry_categories(id),
  CHECK (source_confidence IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_registry_resources_category_quality
  ON registry_resources (primary_category, data_quality_score DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_registry_resources_type_quality
  ON registry_resources (canonical_type, data_quality_score DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_registry_resources_legacy_category
  ON registry_resources (legacy_category, slug);

CREATE TABLE IF NOT EXISTS registry_capabilities (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  normalized_group TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_resource_capabilities (
  resource_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'resource_v1',
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  PRIMARY KEY (resource_id, capability_id),
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (capability_id) REFERENCES registry_capabilities(id) ON DELETE CASCADE,
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_registry_resource_capabilities_capability
  ON registry_resource_capabilities (capability_id, resource_id);

CREATE TABLE IF NOT EXISTS registry_integrations (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_resource_integrations (
  resource_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'resource_v1',
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  PRIMARY KEY (resource_id, integration_id),
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES registry_integrations(id) ON DELETE CASCADE,
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_registry_resource_integrations_integration
  ON registry_resource_integrations (integration_id, resource_id);

CREATE TABLE IF NOT EXISTS registry_interfaces (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_resource_interfaces (
  resource_id TEXT NOT NULL,
  interface_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'resource_v1',
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  PRIMARY KEY (resource_id, interface_id),
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (interface_id) REFERENCES registry_interfaces(id) ON DELETE CASCADE,
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE TABLE IF NOT EXISTS registry_deployment_modes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_resource_deployment_modes (
  resource_id TEXT NOT NULL,
  deployment_mode_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'resource_v1',
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  PRIMARY KEY (resource_id, deployment_mode_id),
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (deployment_mode_id) REFERENCES registry_deployment_modes(id) ON DELETE CASCADE,
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE TABLE IF NOT EXISTS registry_links (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_registry_links_resource_type
  ON registry_links (resource_id, link_type);

CREATE TABLE IF NOT EXISTS registry_fact_observations (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  fact_value_json TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'resource_v1',
  confidence TEXT NOT NULL DEFAULT 'medium',
  observed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_registry_fact_observations_resource_key
  ON registry_fact_observations (resource_id, fact_key, observed_at DESC);

CREATE TABLE IF NOT EXISTS registry_relationships (
  id TEXT PRIMARY KEY,
  source_resource_id TEXT NOT NULL,
  target_resource_id TEXT,
  target_slug TEXT,
  relationship_type TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (target_resource_id) REFERENCES registry_resources(id) ON DELETE SET NULL,
  CHECK (relationship_type IN ('similar', 'alternative', 'integrates_with', 'depends_on', 'compares_to', 'powers', 'provides_capability')),
  CHECK (confidence IN ('high', 'medium', 'low'))
);

CREATE INDEX IF NOT EXISTS idx_registry_relationships_source_type
  ON registry_relationships (source_resource_id, relationship_type);

CREATE TABLE IF NOT EXISTS registry_robot_specs (
  resource_id TEXT PRIMARY KEY,
  embodiment_type TEXT,
  form_factor TEXT,
  mobility TEXT,
  manipulation TEXT,
  sensors_json TEXT NOT NULL DEFAULT '[]',
  actuators_json TEXT NOT NULL DEFAULT '[]',
  autonomy_level TEXT,
  sdk_json TEXT NOT NULL DEFAULT '[]',
  simulation_support TEXT,
  availability TEXT,
  safety_notes TEXT,
  spec_confidence TEXT NOT NULL DEFAULT 'low',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (resource_id) REFERENCES registry_resources(id) ON DELETE CASCADE,
  CHECK (spec_confidence IN ('high', 'medium', 'low'))
);

CREATE TABLE IF NOT EXISTS registry_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  article_type TEXT NOT NULL,
  status TEXT NOT NULL,
  content_json TEXT NOT NULL,
  primary_resource_id TEXT,
  primary_capability_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (primary_resource_id) REFERENCES registry_resources(id) ON DELETE SET NULL,
  FOREIGN KEY (primary_capability_id) REFERENCES registry_capabilities(id) ON DELETE SET NULL
);

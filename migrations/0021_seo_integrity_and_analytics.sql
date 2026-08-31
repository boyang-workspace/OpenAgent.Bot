-- Source roles and binding history keep repository identity changes separate
-- from project fact changes.
ALTER TABLE source_subscriptions ADD COLUMN source_role TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE source_subscriptions ADD COLUMN valid_from TEXT;
ALTER TABLE source_subscriptions ADD COLUMN valid_until TEXT;

-- Keep historical bindings while allowing exactly one active metric owner per
-- source. The previous full unique index prevented a reviewed locator change
-- from retaining its closed validity interval.
DROP INDEX IF EXISTS idx_single_package_metric_owner;
CREATE UNIQUE INDEX idx_single_active_package_metric_owner
ON source_subscriptions(entity_id, source_id)
WHERE enabled = 1 AND source_id IN ('npm', 'huggingface');

UPDATE source_subscriptions
SET source_role = CASE source_id
  WHEN 'huggingface' THEN 'weights'
  WHEN 'npm' THEN 'package'
  WHEN 'github-releases' THEN 'core'
  ELSE 'primary'
END,
valid_from = COALESCE(created_at, datetime('now'));

CREATE TABLE source_binding_events (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_role TEXT NOT NULL,
  old_locator TEXT,
  new_locator TEXT,
  reason TEXT NOT NULL,
  changed_at TEXT NOT NULL
);

CREATE INDEX idx_source_binding_events_entity_time
ON source_binding_events(entity_id, changed_at DESC);

-- Expand the evidence-backed openness vocabulary without changing existing rows.
ALTER TABLE openness_facets RENAME TO openness_facets_legacy;

CREATE TABLE openness_facets (
  entity_id TEXT NOT NULL,
  facet TEXT NOT NULL,
  status TEXT NOT NULL,
  license_or_terms TEXT,
  source_id TEXT NOT NULL,
  source_url TEXT,
  evidence_confidence TEXT NOT NULL DEFAULT 'verified',
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, facet),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  CHECK (facet IN (
    'code','weights','data','hardware','firmware','documentation','governance',
    'commercial_use','cad','bom','control_stack'
  )),
  CHECK (status IN ('open','partial','source_available','closed','unknown','not_applicable')),
  CHECK (evidence_confidence IN ('verified','inferred','manual','conflicting','stale'))
);

INSERT INTO openness_facets (
  entity_id, facet, status, license_or_terms, source_id, source_url,
  evidence_confidence, observed_at, updated_at
)
SELECT entity_id, facet, status, license_or_terms, source_id, source_url,
       'verified', observed_at, updated_at
FROM openness_facets_legacy;

DROP TABLE openness_facets_legacy;

CREATE TABLE entity_license_scopes (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  path TEXT,
  license_identifier TEXT NOT NULL,
  status TEXT NOT NULL,
  source_url TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_id, scope, path),
  CHECK (status IN ('open','restricted','unknown'))
);

CREATE INDEX idx_entity_license_scopes_entity
ON entity_license_scopes(entity_id, status, scope);

-- Long-term first-party analytics rollups. Raw events stay in Analytics Engine.
CREATE TABLE analytics_daily (
  date TEXT PRIMARY KEY,
  requests INTEGER NOT NULL DEFAULT 0,
  pageviews INTEGER NOT NULL DEFAULT 0,
  human_pageviews INTEGER NOT NULL DEFAULT 0,
  human_visitors INTEGER NOT NULL DEFAULT 0,
  search_bot_requests INTEGER NOT NULL DEFAULT 0,
  ai_crawler_requests INTEGER NOT NULL DEFAULT 0,
  ai_agent_requests INTEGER NOT NULL DEFAULT 0,
  api_requests INTEGER NOT NULL DEFAULT 0,
  unknown_bot_requests INTEGER NOT NULL DEFAULT 0,
  outbound_clicks INTEGER NOT NULL DEFAULT 0,
  evidence_clicks INTEGER NOT NULL DEFAULT 0,
  searches INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE analytics_page_daily (
  date TEXT NOT NULL,
  path TEXT NOT NULL,
  route_type TEXT NOT NULL,
  pageviews INTEGER NOT NULL DEFAULT 0,
  human_pageviews INTEGER NOT NULL DEFAULT 0,
  agent_pageviews INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, path)
);

CREATE TABLE analytics_actor_daily (
  date TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, actor_type, actor_name)
);

CREATE TABLE analytics_referrer_daily (
  date TEXT NOT NULL,
  source TEXT NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  pageviews INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, source)
);

CREATE TABLE analytics_entity_daily (
  date TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_slug TEXT NOT NULL,
  human_views INTEGER NOT NULL DEFAULT 0,
  agent_views INTEGER NOT NULL DEFAULT 0,
  evidence_clicks INTEGER NOT NULL DEFAULT 0,
  source_clicks INTEGER NOT NULL DEFAULT 0,
  outbound_clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, entity_type, entity_slug)
);

CREATE TABLE analytics_event_daily (
  date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  events INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, event_type)
);

CREATE TABLE analytics_search_daily (
  date TEXT NOT NULL,
  query TEXT NOT NULL,
  searches INTEGER NOT NULL DEFAULT 0,
  zero_results INTEGER NOT NULL DEFAULT 0,
  result_clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, query)
);

CREATE TABLE analytics_outbound_daily (
  date TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, source, destination)
);

CREATE TABLE analytics_rollup_state (
  id TEXT PRIMARY KEY CHECK (id = 'global'),
  last_hourly_rollup TEXT,
  last_daily_reconciliation TEXT,
  last_success TEXT,
  last_error TEXT,
  updated_at TEXT NOT NULL
);

INSERT INTO analytics_rollup_state (id, updated_at)
VALUES ('global', datetime('now'));

CREATE INDEX idx_analytics_page_date_views ON analytics_page_daily(date, pageviews DESC);
CREATE INDEX idx_analytics_entity_date_views ON analytics_entity_daily(date, human_views DESC, agent_views DESC);
CREATE INDEX idx_analytics_search_date_searches ON analytics_search_daily(date, searches DESC);

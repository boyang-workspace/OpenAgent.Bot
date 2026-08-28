-- Schema only: project content is published through the reviewed intake API.
CREATE TABLE intake_publications (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id),
  revision INTEGER NOT NULL,
  payload_hash TEXT NOT NULL,
  manifest_json TEXT NOT NULL CHECK (json_valid(manifest_json)),
  before_json TEXT NOT NULL CHECK (json_valid(before_json)),
  diff_json TEXT NOT NULL CHECK (json_valid(diff_json)),
  reviewer TEXT NOT NULL,
  published_at TEXT NOT NULL,
  guard INTEGER NOT NULL CHECK (guard = 1),
  UNIQUE (entity_id, revision)
);

CREATE TABLE entity_interfaces (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  interface_id TEXT NOT NULL,
  interface_type TEXT NOT NULL CHECK (interface_type IN ('cli','api','mcp','sdk')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('documented','tested','unknown')),
  PRIMARY KEY (entity_id, interface_id)
);
CREATE INDEX idx_entity_interfaces_type ON entity_interfaces(interface_type, entity_id);
CREATE UNIQUE INDEX idx_single_package_metric_owner ON source_subscriptions(entity_id, source_id)
  WHERE source_id = 'npm' AND entity_id IS NOT NULL;

ALTER TABLE source_subscriptions ADD COLUMN error_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE source_subscriptions ADD COLUMN last_error TEXT;

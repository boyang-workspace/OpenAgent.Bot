-- Public rankings are read far more often than they change. Keep their
-- lightweight counters on the entity row and support the remaining detail
-- lookups with covering indexes instead of repeatedly scanning history.
ALTER TABLE entities ADD COLUMN evidence_count INTEGER NOT NULL DEFAULT 0;

UPDATE entities
SET evidence_count = (
  SELECT COUNT(*) FROM observations WHERE observations.entity_id = entities.id
);

CREATE INDEX IF NOT EXISTS idx_source_subscriptions_entity_enabled
ON source_subscriptions(entity_id, enabled, source_id);

CREATE INDEX IF NOT EXISTS idx_observations_entity_time
ON observations(entity_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_entity_time
ON metric_snapshots(entity_id, observed_at DESC);

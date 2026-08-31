-- Additive metadata: preserve legacy change_events and observation identities.
-- No backfill: earlier missing events must not acquire fabricated timestamps.
CREATE TABLE change_event_corrections (
  event_id TEXT PRIMARY KEY REFERENCES change_events(id),
  publication_id TEXT NOT NULL REFERENCES intake_publications(id),
  previous_observation_id TEXT NOT NULL REFERENCES observations(id),
  reason TEXT NOT NULL CHECK (length(trim(reason)) BETWEEN 1 AND 1000)
);
CREATE INDEX change_event_corrections_publication ON change_event_corrections(publication_id);

-- Runs before the current_facts upsert in the same publication transaction.
-- Protect against a concurrent selection change even when timestamps collide.
CREATE TRIGGER correction_selection_guard BEFORE INSERT ON change_event_corrections
BEGIN
  SELECT RAISE(ABORT, 'Correction requires the current prior observation and a new reviewed event')
  WHERE NOT EXISTS (
    SELECT 1 FROM change_events c
    JOIN current_facts f ON f.entity_id=c.entity_id AND f.fact_key=c.fact_key
    JOIN observations old ON old.id=NEW.previous_observation_id
      AND old.entity_id=c.entity_id AND old.fact_key=c.fact_key
    JOIN observations next ON next.id=c.observation_id
      AND next.entity_id=c.entity_id AND next.fact_key=c.fact_key
    JOIN intake_publications p ON p.id=NEW.publication_id AND p.entity_id=c.entity_id
    WHERE c.id=NEW.event_id AND c.change_type='updated'
      AND f.observation_id=NEW.previous_observation_id
      AND old.id!=next.id
      AND c.previous_value_json=old.value_json AND c.next_value_json=next.value_json
      AND c.detected_at=p.published_at
  );
END;
CREATE TRIGGER correction_no_update BEFORE UPDATE ON change_event_corrections
BEGIN SELECT RAISE(ABORT, 'Correction metadata is immutable'); END;
CREATE TRIGGER correction_no_delete BEFORE DELETE ON change_event_corrections
BEGIN SELECT RAISE(ABORT, 'Correction metadata is immutable'); END;

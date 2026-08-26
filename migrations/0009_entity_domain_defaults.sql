-- Keep future imports classified even before editorial review.
CREATE TRIGGER IF NOT EXISTS entities_assign_default_domain
AFTER INSERT ON entities
WHEN NOT EXISTS (SELECT 1 FROM entity_domains WHERE entity_id = NEW.id)
BEGIN
  INSERT INTO entity_domains (
    entity_id, domain, is_primary, confidence, classification_method, review_status,
    source_url, created_at, updated_at
  ) VALUES (
    NEW.id,
    CASE
      WHEN NEW.kind IN ('agent','agent-framework') THEN 'agent'
      WHEN NEW.kind IN ('robot','robotics-framework','hardware','simulator') THEN 'robotics'
      ELSE 'shared-infrastructure'
    END,
    1, 0.8, 'rule', 'provisional', NEW.canonical_url, datetime('now'), datetime('now')
  );
END;

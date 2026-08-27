-- Remove the legacy Genesis duplicate while preserving its public slug as an alias.

INSERT OR IGNORE INTO entity_aliases (entity_id, alias, alias_type, created_at)
SELECT id, 'genesis-world', 'slug', datetime('now')
FROM entities
WHERE slug = 'genesis';

DELETE FROM entities
WHERE id = 'robotics_genesis'
  AND slug = 'genesis-world'
  AND EXISTS (SELECT 1 FROM entities WHERE id = 'res_genesis' AND slug = 'genesis');

UPDATE entities
SET repository_url = 'https://github.com/Genesis-Embodied-AI/genesis-world',
    canonical_url = 'https://genesis-world.readthedocs.io',
    documentation_url = 'https://genesis-world.readthedocs.io',
    updated_at = datetime('now')
WHERE id = 'res_genesis' AND slug = 'genesis';

UPDATE source_subscriptions
SET locator = 'Genesis-Embodied-AI/genesis-world',
    updated_at = datetime('now')
WHERE entity_id = 'res_genesis' AND source_id = 'github';

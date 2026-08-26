-- Separate ecosystem field from artifact form.
-- An entity can belong to more than one field, while keeping one primary field.

CREATE TABLE IF NOT EXISTS entity_domains (
  entity_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0.5,
  classification_method TEXT NOT NULL DEFAULT 'rule',
  review_status TEXT NOT NULL DEFAULT 'provisional',
  source_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, domain),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  CHECK (domain IN ('agent','robotics','shared-infrastructure')),
  CHECK (is_primary IN (0,1)),
  CHECK (confidence >= 0 AND confidence <= 1),
  CHECK (classification_method IN ('rule','manual','source','inferred')),
  CHECK (review_status IN ('provisional','verified'))
);

CREATE INDEX IF NOT EXISTS idx_entity_domains_domain ON entity_domains(domain, entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_domains_primary
  ON entity_domains(entity_id) WHERE is_primary = 1;

-- High-confidence artifact corrections from canonical project descriptions.
UPDATE entities SET kind = 'robot', updated_at = datetime('now') WHERE slug = 'aira';
UPDATE entities SET kind = 'simulator', updated_at = datetime('now') WHERE slug = 'genesis';
UPDATE entities SET kind = 'model', updated_at = datetime('now') WHERE slug = 'isaac-gr00t';
UPDATE entities SET kind = 'tool', updated_at = datetime('now') WHERE slug IN ('crawl4ai','lelab','rlinf');
UPDATE entities SET kind = 'robotics-framework', updated_at = datetime('now') WHERE slug = 'openeai';
UPDATE entities SET kind = 'agent', updated_at = datetime('now') WHERE slug IN ('cowagent','nanobot');
UPDATE entities SET kind = 'agent-framework', updated_at = datetime('now')
WHERE slug IN (
  'astrbot','autogen','browser-use','crewai','google-adk','langchain','langgraph',
  'llamaindex','metagpt','openai-agents-python','smolagents','webwright'
);

-- The earlier robotics seed duplicated Genesis under a stale repository slug.
-- Keep its history for audit, but remove it from public results and redirect its URL.
UPDATE entities SET visibility = 'unlisted', updated_at = datetime('now') WHERE slug = 'genesis-world';

-- Conservative baseline: software systems, physical systems, and shared building blocks.
INSERT OR IGNORE INTO entity_domains (
  entity_id, domain, is_primary, confidence, classification_method, review_status,
  source_url, created_at, updated_at
)
SELECT id,
  CASE
    WHEN kind IN ('agent','agent-framework') THEN 'agent'
    WHEN kind IN ('robot','robotics-framework','hardware','simulator') THEN 'robotics'
    ELSE 'shared-infrastructure'
  END,
  1, 0.8, 'rule', 'provisional', canonical_url, datetime('now'), datetime('now')
FROM entities;

-- Cross-layer or domain-specific infrastructure reviewed from canonical summaries.
UPDATE entity_domains SET domain = 'robotics', confidence = 0.95,
  classification_method = 'manual', review_status = 'verified', updated_at = datetime('now')
WHERE entity_id IN (
  SELECT id FROM entities WHERE slug IN ('isaac-gr00t','openpi','lelab','rlinf')
);

UPDATE entity_domains SET domain = 'agent', confidence = 0.95,
  classification_method = 'manual', review_status = 'verified', updated_at = datetime('now')
WHERE entity_id IN (
  SELECT id FROM entities WHERE slug IN ('crawl4ai','cowagent','nanobot')
);

-- RLinf explicitly supports both embodied and software-agent reinforcement learning.
INSERT OR IGNORE INTO entity_domains (
  entity_id, domain, is_primary, confidence, classification_method, review_status,
  source_url, created_at, updated_at
)
SELECT id, 'agent', 0, 0.9, 'manual', 'verified', canonical_url, datetime('now'), datetime('now')
FROM entities WHERE slug = 'rlinf';

-- Registry V2.1: normalize shared field naming and add typed Robotics layers.

DROP TRIGGER IF EXISTS entities_assign_default_domain;

CREATE TABLE entity_domains_v21 (
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
  CHECK (domain IN ('agent','robotics','shared')),
  CHECK (is_primary IN (0,1)),
  CHECK (confidence >= 0 AND confidence <= 1),
  CHECK (classification_method IN ('rule','manual','source','inferred')),
  CHECK (review_status IN ('provisional','verified'))
);

INSERT INTO entity_domains_v21 (
  entity_id, domain, is_primary, confidence, classification_method, review_status,
  source_url, created_at, updated_at
)
SELECT entity_id,
  CASE WHEN domain = 'shared-infrastructure' THEN 'shared' ELSE domain END,
  is_primary, confidence, classification_method, review_status,
  source_url, created_at, updated_at
FROM entity_domains;

DROP TABLE entity_domains;
ALTER TABLE entity_domains_v21 RENAME TO entity_domains;

CREATE INDEX idx_entity_domains_domain ON entity_domains(domain, entity_id);
CREATE UNIQUE INDEX idx_entity_domains_primary
  ON entity_domains(entity_id) WHERE is_primary = 1;

CREATE TRIGGER entities_assign_default_domain
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
      ELSE 'shared'
    END,
    1, 0.8, 'rule', 'provisional', NEW.canonical_url, datetime('now'), datetime('now')
  );
END;

CREATE TABLE robotics_profiles (
  entity_id TEXT PRIMARY KEY,
  layer TEXT NOT NULL,
  model_type TEXT,
  form_factor TEXT,
  stack_type TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0.5,
  classification_method TEXT NOT NULL DEFAULT 'rule',
  review_status TEXT NOT NULL DEFAULT 'provisional',
  source_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  CHECK (layer IN ('platform','intelligence','stack')),
  CHECK (model_type IS NULL OR model_type IN (
    'vla','policy-model','foundation-model','world-model','navigation-model',
    'perception-model','manipulation-model','vision-language-model','other'
  )),
  CHECK (form_factor IS NULL OR form_factor IN (
    'humanoid','mobile-manipulator','manipulator','dual-arm','robot-arm','quadruped',
    'mobile-base','drone','hand','gripper','sensor-platform','other'
  )),
  CHECK (stack_type IS NULL OR stack_type IN (
    'framework','simulator','dataset','runtime','sdk','driver','teleoperation',
    'data-collection','training-infrastructure','evaluation','tool','other'
  )),
  CHECK (confidence >= 0 AND confidence <= 1),
  CHECK (classification_method IN ('rule','manual','source','inferred')),
  CHECK (review_status IN ('provisional','verified')),
  CHECK (json_valid(metadata_json))
);

CREATE INDEX idx_robotics_profiles_layer ON robotics_profiles(layer, entity_id);
CREATE INDEX idx_robotics_profiles_model_type ON robotics_profiles(model_type, entity_id);
CREATE INDEX idx_robotics_profiles_form_factor ON robotics_profiles(form_factor, entity_id);
CREATE INDEX idx_robotics_profiles_stack_type ON robotics_profiles(stack_type, entity_id);

-- The OpenEAI record represents a physical arm platform with an integrated VLA stack.
UPDATE entities SET kind = 'hardware', updated_at = datetime('now') WHERE slug = 'openeai';

INSERT INTO robotics_profiles (
  entity_id, layer, model_type, form_factor, stack_type, metadata_json,
  confidence, classification_method, review_status, source_url, created_at, updated_at
)
SELECT id,
  CASE
    WHEN slug IN ('aira','openarm','openeai','qingloong','reachy-2') THEN 'platform'
    WHEN slug = 'isaac-gr00t' THEN 'intelligence'
    ELSE 'stack'
  END,
  CASE WHEN slug = 'isaac-gr00t' THEN 'vla' END,
  CASE
    WHEN slug IN ('aira','openarm','openeai') THEN 'robot-arm'
    WHEN slug IN ('qingloong','reachy-2') THEN 'humanoid'
  END,
  CASE
    WHEN slug IN ('genesis','isaac-lab','mujoco') THEN 'simulator'
    WHEN slug IN ('lerobot','openpi','ros-2') THEN 'framework'
    WHEN slug = 'unitree-sdk2' THEN 'sdk'
    WHEN slug = 'rlinf' THEN 'training-infrastructure'
    WHEN slug = 'lelab' THEN 'data-collection'
  END,
  '{}', 0.95, 'manual', 'verified', canonical_url, datetime('now'), datetime('now')
FROM entities
WHERE slug IN (
  'aira','genesis','isaac-gr00t','isaac-lab','lelab','lerobot','mujoco','openarm',
  'openeai','openpi','qingloong','reachy-2','rlinf','ros-2','unitree-sdk2'
);

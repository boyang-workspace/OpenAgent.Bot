-- Keep biped separate from humanoid. Preserve all existing profile data and checks.
CREATE TABLE robotics_profiles_next (
  entity_id TEXT PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  layer TEXT NOT NULL CHECK (layer IN ('platform','intelligence','stack')),
  model_type TEXT CHECK (model_type IS NULL OR model_type IN ('vla','policy-model','foundation-model','world-model','navigation-model','perception-model','manipulation-model','vision-language-model','other')),
  form_factor TEXT CHECK (form_factor IS NULL OR form_factor IN ('humanoid','biped','mobile-manipulator','manipulator','dual-arm','robot-arm','quadruped','mobile-base','drone','hand','gripper','sensor-platform','other')),
  stack_type TEXT CHECK (stack_type IS NULL OR stack_type IN ('framework','simulator','dataset','runtime','sdk','driver','teleoperation','data-collection','training-infrastructure','evaluation','tool','other')),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  classification_method TEXT NOT NULL DEFAULT 'rule' CHECK (classification_method IN ('rule','manual','source','inferred')),
  review_status TEXT NOT NULL DEFAULT 'provisional' CHECK (review_status IN ('provisional','verified')),
  source_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO robotics_profiles_next SELECT * FROM robotics_profiles;
DROP TABLE robotics_profiles;
ALTER TABLE robotics_profiles_next RENAME TO robotics_profiles;
CREATE INDEX idx_robotics_profiles_layer ON robotics_profiles(layer, entity_id);
CREATE INDEX idx_robotics_profiles_model_type ON robotics_profiles(model_type, entity_id);
CREATE INDEX idx_robotics_profiles_form_factor ON robotics_profiles(form_factor, entity_id);
CREATE INDEX idx_robotics_profiles_stack_type ON robotics_profiles(stack_type, entity_id);

-- Use cases are many-to-many facets, not a new entity kind or navigation category.
CREATE TABLE use_cases (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE entity_use_cases (
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  use_case_slug TEXT NOT NULL REFERENCES use_cases(slug),
  source_url TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  PRIMARY KEY (entity_id, use_case_slug)
);
CREATE INDEX idx_entity_use_cases_filter ON entity_use_cases(use_case_slug, entity_id);

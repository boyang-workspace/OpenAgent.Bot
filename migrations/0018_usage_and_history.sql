-- Public usage history plus repeatable detail-history collection rules.
-- Usage facts remain source-scoped: token counts from different platforms are
-- never added together as if they described the whole market.

CREATE TABLE usage_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  api_url TEXT NOT NULL,
  metric_scope TEXT NOT NULL,
  license_name TEXT,
  attribution_template TEXT,
  first_data_at TEXT,
  granularity TEXT NOT NULL DEFAULT 'daily' CHECK (granularity IN ('daily','window','snapshot')),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO usage_sources (
  id, name, source_url, api_url, metric_scope, license_name,
  attribution_template, first_data_at, granularity, enabled, metadata_json,
  created_at, updated_at
) VALUES (
  'openrouter', 'OpenRouter', 'https://openrouter.ai/rankings',
  'https://openrouter.ai/api/v1/datasets',
  'Public traffic processed through OpenRouter; private and zero-data-retention traffic is excluded.',
  'CC BY 4.0',
  'Source: OpenRouter (openrouter.ai/rankings), as of {as_of}. Licensed under CC BY 4.0.',
  '2025-01-01', 'daily', 1,
  '{"model_dataset":"rankings-daily","app_dataset":"app-rankings","model_daily_limit":50,"app_daily_limit":200}',
  datetime('now'), datetime('now')
);

CREATE TABLE usage_subjects (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES usage_sources(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('model','app')),
  source_subject_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  openness_status TEXT NOT NULL DEFAULT 'unknown' CHECK (openness_status IN (
    'open-source','open-weights','open-core','source-available','closed','unknown'
  )),
  mapping_basis TEXT NOT NULL DEFAULT 'unmapped' CHECK (mapping_basis IN ('exact','prefix','curated','unmapped')),
  source_url TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_id, subject_type, source_subject_id)
);
CREATE INDEX idx_usage_subjects_type_open ON usage_subjects(source_id, subject_type, openness_status, entity_id);

CREATE TABLE usage_identity_rules (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES usage_sources(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('model','app')),
  match_kind TEXT NOT NULL CHECK (match_kind IN ('exact','prefix')),
  pattern TEXT NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  confidence REAL NOT NULL DEFAULT 1 CHECK (confidence >= 0 AND confidence <= 1),
  source_url TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_id, subject_type, match_kind, pattern)
);

CREATE TABLE usage_daily (
  subject_id TEXT NOT NULL REFERENCES usage_subjects(id) ON DELETE CASCADE,
  usage_date TEXT NOT NULL,
  total_tokens TEXT NOT NULL,
  total_requests INTEGER,
  source_rank INTEGER,
  source_as_of TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (subject_id, usage_date),
  CHECK (length(usage_date) = 10),
  CHECK (total_requests IS NULL OR total_requests >= 0),
  CHECK (source_rank IS NULL OR source_rank > 0)
);
CREATE INDEX idx_usage_daily_date_subject ON usage_daily(usage_date DESC, subject_id);

CREATE TABLE usage_sync_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES usage_sources(id) ON DELETE CASCADE,
  dataset TEXT NOT NULL CHECK (dataset IN ('models','apps')),
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','partial','failed','skipped')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  mapped_count INTEGER NOT NULL DEFAULT 0,
  open_count INTEGER NOT NULL DEFAULT 0,
  source_as_of TEXT,
  error_summary TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_usage_sync_runs_source_time ON usage_sync_runs(source_id, started_at DESC);

-- Curated aliases are deliberately conservative. Unknown subjects remain in
-- the raw source view but never acquire an "open" label by name guessing.
INSERT INTO usage_identity_rules (id,source_id,subject_type,match_kind,pattern,entity_id,confidence,source_url,notes,created_at,updated_at) VALUES
  ('usage_app_aider','openrouter','app','exact','aider','res_aider',1,'https://aider.chat','Official product name.',datetime('now'),datetime('now')),
  ('usage_app_cline','openrouter','app','exact','cline','res_cline',1,'https://cline.bot','Official product name.',datetime('now'),datetime('now')),
  ('usage_app_codex','openrouter','app','exact','codex','res_codex_cli',1,'https://github.com/openai/codex','Open-source Codex CLI record.',datetime('now'),datetime('now')),
  ('usage_app_hermes','openrouter','app','exact','hermes agent','res_hermes_agent',1,'https://github.com/NousResearch/hermes-agent','Official product name.',datetime('now'),datetime('now')),
  ('usage_app_kilo','openrouter','app','exact','kilo code','res_kilo_code',1,'https://github.com/Kilo-Org/kilocode','Official product name.',datetime('now'),datetime('now')),
  ('usage_app_openclaw','openrouter','app','exact','openclaw','res_openclaw',1,'https://github.com/openclaw/openclaw','Official product name.',datetime('now'),datetime('now')),
  ('usage_app_opencode','openrouter','app','exact','opencode','res_opencode',1,'https://github.com/anomalyco/opencode','Only OpenRouter-attributed traffic, not total OpenCode usage.',datetime('now'),datetime('now')),
  ('usage_app_openhands','openrouter','app','exact','openhands','res_openhands',1,'https://github.com/OpenHands/OpenHands','Official product name.',datetime('now'),datetime('now')),
  ('usage_model_deepseek_r1','openrouter','model','prefix','deepseek/deepseek-r1','res_deepseek_r1',0.99,'https://huggingface.co/deepseek-ai/DeepSeek-R1','Includes dated and public variants of the same family.',datetime('now'),datetime('now')),
  ('usage_model_deepseek_v4','openrouter','model','prefix','deepseek/deepseek-v4','res_deepseek_v4',0.99,'https://www.deepseek.com/','Includes dated and public variants of the same family.',datetime('now'),datetime('now')),
  ('usage_model_glm5','openrouter','model','prefix','z-ai/glm-5','res_glm_5',0.99,'https://github.com/zai-org/GLM-5','Includes dated and public variants of the same family.',datetime('now'),datetime('now')),
  ('usage_model_gemma4','openrouter','model','prefix','google/gemma-4','res_gemma_4',0.99,'https://deepmind.google/models/gemma/gemma-4/','Gemma 4 family.',datetime('now'),datetime('now')),
  ('usage_model_kimi25','openrouter','model','prefix','moonshotai/kimi-k2.5','res_kimi_k2_5',0.98,'https://github.com/MoonshotAI/Kimi-K2.5','Kimi K2.5 family.',datetime('now'),datetime('now')),
  ('usage_model_llama4','openrouter','model','prefix','meta-llama/llama-4','res_llama_4',0.99,'https://github.com/meta-llama/llama-models','Llama 4 family.',datetime('now'),datetime('now')),
  ('usage_model_mistral_large3','openrouter','model','prefix','mistralai/mistral-large-3','res_mistral_large_3',0.99,'https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512','Mistral Large 3 family.',datetime('now'),datetime('now')),
  ('usage_model_mistral_small32','openrouter','model','prefix','mistralai/mistral-small-3.2','res_mistral_small_3_2',0.99,'https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506','Mistral Small 3.2 family.',datetime('now'),datetime('now')),
  ('usage_model_phi4','openrouter','model','prefix','microsoft/phi-4','res_phi_4',0.99,'https://huggingface.co/microsoft/phi-4','Phi-4 family.',datetime('now'),datetime('now')),
  ('usage_model_qwen3vl','openrouter','model','prefix','qwen/qwen3-vl','res_qwen3_vl',0.99,'https://github.com/QwenLM/Qwen3-VL','Qwen3-VL family.',datetime('now'),datetime('now')),
  ('usage_model_qwen35','openrouter','model','prefix','qwen/qwen3.5','res_qwen3_5',0.99,'https://github.com/QwenLM/Qwen3','Qwen3.5 family.',datetime('now'),datetime('now')),
  ('usage_model_qwen36','openrouter','model','prefix','qwen/qwen3.6','res_qwen3_6',0.99,'https://github.com/QwenLM/Qwen3.6','Qwen3.6 family.',datetime('now'),datetime('now'));

CREATE TABLE history_source_rules (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('identity','activity','releases','model-card','papers','evaluations','hardware','usage')),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  locator_strategy TEXT NOT NULL,
  cadence TEXT NOT NULL,
  trust_tier TEXT NOT NULL CHECK (trust_tier IN ('canonical','official','third-party','discovery')),
  automation_status TEXT NOT NULL CHECK (automation_status IN ('active','planned','manual','blocked')),
  notes TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO history_source_rules VALUES
  ('history_github_identity','all','identity','GitHub Repository API','https://docs.github.com/rest/repos/repos','repository subscription','daily','canonical','active','Owner, creation date, license, topics, language, archive state and current repository counters.',datetime('now')),
  ('history_github_release','all','releases','GitHub Releases API','https://docs.github.com/rest/releases/releases','mirror every enabled GitHub repository subscription','daily','canonical','active','Up to 100 published releases per repository per sync; drafts excluded and prereleases labeled.',datetime('now')),
  ('history_hf_card','foundation-model,robot-model','model-card','Hugging Face Hub','https://huggingface.co/docs/hub/model-cards','curated model repository locator','daily','canonical','active','Model metadata, license, tags, datasets, base models, arXiv identifiers and structured model-index evaluations.',datetime('now')),
  ('history_arxiv','foundation-model,agent,robot-model','papers','arXiv','https://export.arxiv.org/api/query','IDs declared by official repositories or model cards','weekly','canonical','active','Resolve only source-declared arXiv identifiers; no fuzzy title matching.',datetime('now')),
  ('history_openrouter_model','foundation-model','usage','OpenRouter Data API','https://openrouter.ai/docs/cookbook/administration/data-api','model permaslug plus curated identity rules','daily','third-party','active','Public OpenRouter traffic only; never represented as total market usage.',datetime('now')),
  ('history_openrouter_app','agent','usage','OpenRouter App Rankings','https://openrouter.ai/apps/','public app ID plus curated identity rules','daily','third-party','active','Opt-in OpenRouter-attributed app traffic only; not total app usage.',datetime('now')),
  ('history_official_eval','foundation-model,agent,robot-model','evaluations','Official model cards and benchmark publishers','https://huggingface.co/docs/hub/model-cards','structured result with benchmark, conditions and source URL','weekly','official','active','Store official and third-party results separately; never combine incomparable conditions.',datetime('now')),
  ('history_hardware_manual','robot-hardware','hardware','Official product documentation','https://www.openagent.bot/methodology','curated official product/specification URL','monthly','official','manual','Physical specifications require per-vendor adapters or reviewed updates.',datetime('now'));

-- Release-history subscriptions live separately from each record's canonical
-- identity subscriptions. This keeps the original source contract stable while
-- allowing history collectors to expand independently.
INSERT OR IGNORE INTO sources (
  id,name,publisher,region,kind,trust_tier,automation_status,connector,url,api_url,
  scope_json,cadence,enabled,created_at,updated_at
) VALUES (
  'github-releases','GitHub Releases','GitHub','global','repository','canonical','active',
  'github-releases','https://github.com','https://api.github.com',
  '["agents","models","robots","hardware"]','daily',1,datetime('now'),datetime('now')
);

CREATE TABLE history_subscriptions (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  external_id TEXT,
  locator TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  last_synced_at TEXT,
  next_sync_at TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(entity_id, source_id, locator)
);
CREATE INDEX idx_history_subscriptions_due
  ON history_subscriptions(source_id, enabled, next_sync_at, last_synced_at);

INSERT OR IGNORE INTO history_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled,
  last_synced_at, next_sync_at, created_at, updated_at
)
SELECT 'sub_release_' || replace(entity_id, '-', '_'), entity_id, 'github-releases',
  NULL, locator, 1, NULL, datetime('now'), datetime('now'), datetime('now')
FROM source_subscriptions
WHERE source_id = 'github' AND enabled = 1;

ALTER TABLE blog_topics ADD COLUMN source_type TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE blog_topics ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_topics ADD COLUMN notes TEXT;
ALTER TABLE blog_topics ADD COLUMN manual_override INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_blog_topics_source_priority
  ON blog_topics (source_type, priority DESC, updated_at DESC);

ALTER TABLE blog_drafts ADD COLUMN editable_content_json TEXT;
ALTER TABLE blog_drafts ADD COLUMN review_report_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE blog_drafts ADD COLUMN approved_by_human INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_drafts ADD COLUMN approved_at TEXT;
ALTER TABLE blog_drafts ADD COLUMN approved_by_actor TEXT;
ALTER TABLE blog_drafts ADD COLUMN prompt_version_id TEXT;
ALTER TABLE blog_drafts ADD COLUMN template_version_id TEXT;
ALTER TABLE blog_drafts ADD COLUMN model_name TEXT;

CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_versions_kind_version
  ON prompt_versions (kind, version);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_kind_active
  ON prompt_versions (kind, is_active DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS template_versions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_versions_kind_version
  ON template_versions (kind, version);

CREATE INDEX IF NOT EXISTS idx_template_versions_kind_active
  ON template_versions (kind, is_active DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS debug_runs (
  id TEXT PRIMARY KEY,
  source_topic_id TEXT,
  source_draft_id TEXT,
  action TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version_id TEXT,
  template_version_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  artifacts_ref TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_topic_id) REFERENCES blog_topics(id),
  FOREIGN KEY (source_draft_id) REFERENCES blog_drafts(id)
);

CREATE INDEX IF NOT EXISTS idx_debug_runs_created
  ON debug_runs (created_at DESC);

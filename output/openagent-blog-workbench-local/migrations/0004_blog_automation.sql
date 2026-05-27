CREATE TABLE IF NOT EXISTS blog_topics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  lane TEXT NOT NULL,
  title TEXT NOT NULL,
  angle TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  search_intent TEXT NOT NULL,
  source_signals_json TEXT NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_topics_date_title
  ON blog_topics (date, title);

CREATE INDEX IF NOT EXISTS idx_blog_topics_date_status_score
  ON blog_topics (date, status, score DESC);

CREATE TABLE IF NOT EXISTS blog_drafts (
  id TEXT PRIMARY KEY,
  topic_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content_json TEXT NOT NULL,
  target_keyword TEXT,
  search_intent TEXT,
  source_links_json TEXT NOT NULL DEFAULT '[]',
  quality_report_json TEXT NOT NULL DEFAULT '{}',
  pr_url TEXT,
  pr_number INTEGER,
  pr_branch TEXT,
  commit_sha TEXT,
  publish_status TEXT,
  live_url TEXT,
  last_publish_preview_json TEXT,
  last_error TEXT,
  merged_at TEXT,
  merge_commit_sha TEXT,
  deployed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES blog_topics(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_drafts_slug
  ON blog_drafts (slug);

CREATE INDEX IF NOT EXISTS idx_blog_drafts_status_updated
  ON blog_drafts (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS blog_revisions (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'human',
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (draft_id) REFERENCES blog_drafts(id)
);

CREATE INDEX IF NOT EXISTS idx_blog_revisions_draft_created
  ON blog_revisions (draft_id, created_at DESC);

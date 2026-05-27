CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  homepage_url TEXT,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created
  ON submissions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS project_drafts (
  id TEXT PRIMARY KEY,
  submission_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content_json TEXT NOT NULL,
  pr_url TEXT,
  pr_number INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_drafts_slug
  ON project_drafts (slug);

CREATE INDEX IF NOT EXISTS idx_project_drafts_status_updated
  ON project_drafts (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS admin_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_events_entity_created
  ON admin_events (entity_type, entity_id, created_at DESC);

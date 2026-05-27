ALTER TABLE submissions ADD COLUMN draft_id TEXT;
ALTER TABLE submissions ADD COLUMN review_note TEXT;

ALTER TABLE project_drafts ADD COLUMN pr_branch TEXT;
ALTER TABLE project_drafts ADD COLUMN commit_sha TEXT;
ALTER TABLE project_drafts ADD COLUMN publish_status TEXT;
ALTER TABLE project_drafts ADD COLUMN live_url TEXT;
ALTER TABLE project_drafts ADD COLUMN last_publish_preview_json TEXT;
ALTER TABLE project_drafts ADD COLUMN last_error TEXT;

ALTER TABLE admin_events ADD COLUMN actor TEXT DEFAULT 'human';
ALTER TABLE admin_events ADD COLUMN before_json TEXT;
ALTER TABLE admin_events ADD COLUMN after_json TEXT;
ALTER TABLE admin_events ADD COLUMN result_json TEXT;
ALTER TABLE admin_events ADD COLUMN error TEXT;

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS draft_revisions (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'human',
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (draft_id) REFERENCES project_drafts(id)
);

CREATE INDEX IF NOT EXISTS idx_draft_revisions_draft_created
  ON draft_revisions (draft_id, created_at DESC);

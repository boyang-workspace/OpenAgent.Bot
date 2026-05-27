ALTER TABLE project_drafts ADD COLUMN operation TEXT NOT NULL DEFAULT 'create';
ALTER TABLE project_drafts ADD COLUMN source_file_path TEXT;
ALTER TABLE project_drafts ADD COLUMN source_slug TEXT;
ALTER TABLE project_drafts ADD COLUMN merged_at TEXT;
ALTER TABLE project_drafts ADD COLUMN merge_commit_sha TEXT;
ALTER TABLE project_drafts ADD COLUMN deployed_at TEXT;
ALTER TABLE project_drafts ADD COLUMN archived_at TEXT;

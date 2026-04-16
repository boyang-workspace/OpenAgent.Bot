import type { DraftStatus, Env, ProjectDraft, ProjectDraftContent, Submission, SubmissionStatus } from "./types";

type SubmissionRow = {
  id: string;
  project_name: string;
  repo_url: string;
  homepage_url: string | null;
  category: Submission["category"];
  summary: string;
  submitter_name: string | null;
  submitter_email: string | null;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
};

type DraftRow = {
  id: string;
  submission_id: string | null;
  slug: string;
  title: string;
  category: ProjectDraft["category"];
  status: DraftStatus;
  content_json: string;
  pr_url: string | null;
  pr_number: number | null;
  created_at: string;
  updated_at: string;
};

export function mapSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    projectName: row.project_name,
    repoUrl: row.repo_url,
    homepageUrl: row.homepage_url ?? undefined,
    category: row.category,
    summary: row.summary,
    submitterName: row.submitter_name ?? undefined,
    submitterEmail: row.submitter_email ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapDraft(row: DraftRow): ProjectDraft {
  return {
    id: row.id,
    submissionId: row.submission_id ?? undefined,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    content: JSON.parse(row.content_json) as ProjectDraftContent,
    prUrl: row.pr_url ?? undefined,
    prNumber: row.pr_number ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function logEvent(env: Env, entityType: string, entityId: string, action: string, metadata?: unknown): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO admin_events (id, entity_type, entity_id, action, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(crypto.randomUUID(), entityType, entityId, action, metadata ? JSON.stringify(metadata) : null, new Date().toISOString())
    .run();
}

export async function getSubmission(env: Env, id: string): Promise<Submission | undefined> {
  const row = await env.DB.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first<SubmissionRow>();
  return row ? mapSubmission(row) : undefined;
}

export async function getDraft(env: Env, id: string): Promise<ProjectDraft | undefined> {
  const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(id).first<DraftRow>();
  return row ? mapDraft(row) : undefined;
}

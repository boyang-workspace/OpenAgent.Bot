import type { AdminActor, AdminEvent, DraftStatus, Env, ProjectDraft, ProjectDraftContent, PublishStatus, Submission, SubmissionStatus } from "./types";

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
  draft_id?: string | null;
  review_note?: string | null;
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
  pr_branch?: string | null;
  commit_sha?: string | null;
  publish_status?: PublishStatus | null;
  live_url?: string | null;
  last_publish_preview_json?: string | null;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
};

type AdminEventRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor?: AdminActor | null;
  metadata_json: string | null;
  before_json?: string | null;
  after_json?: string | null;
  result_json?: string | null;
  error?: string | null;
  created_at: string;
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
    draftId: row.draft_id ?? undefined,
    reviewNote: row.review_note ?? undefined,
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
    prBranch: row.pr_branch ?? undefined,
    commitSha: row.commit_sha ?? undefined,
    publishStatus: row.publish_status ?? undefined,
    liveUrl: row.live_url ?? undefined,
    lastPublishPreview: row.last_publish_preview_json ? JSON.parse(row.last_publish_preview_json) : undefined,
    lastError: row.last_error ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapEvent(row: AdminEventRow): AdminEvent {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    actor: row.actor ?? "human",
    metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
    before: row.before_json ? JSON.parse(row.before_json) : undefined,
    after: row.after_json ? JSON.parse(row.after_json) : undefined,
    result: row.result_json ? JSON.parse(row.result_json) : undefined,
    error: row.error ?? undefined,
    createdAt: row.created_at
  };
}

export async function logEvent(
  env: Env,
  entityType: string,
  entityId: string,
  action: string,
  details: { actor?: AdminActor; metadata?: unknown; before?: unknown; after?: unknown; result?: unknown; error?: string } = {}
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO admin_events (
      id, entity_type, entity_id, action, metadata_json, actor, before_json, after_json, result_json, error, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      entityType,
      entityId,
      action,
      details.metadata ? JSON.stringify(details.metadata) : null,
      details.actor ?? "human",
      details.before ? JSON.stringify(details.before) : null,
      details.after ? JSON.stringify(details.after) : null,
      details.result ? JSON.stringify(details.result) : null,
      details.error ?? null,
      new Date().toISOString()
    )
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

export async function saveRevision(env: Env, draftId: string, content: ProjectDraftContent, actor: AdminActor = "human"): Promise<void> {
  await env.DB.prepare("INSERT INTO draft_revisions (id, draft_id, actor, content_json, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), draftId, actor, JSON.stringify(content), new Date().toISOString())
    .run();
}

export async function getIdempotentResponse(env: Env, key: string | undefined, action: string, entityId: string): Promise<unknown | undefined> {
  if (!key) return undefined;
  const row = await env.DB.prepare("SELECT response_json FROM idempotency_keys WHERE key = ? AND action = ? AND entity_id = ?")
    .bind(key, action, entityId)
    .first<{ response_json: string }>();
  return row?.response_json ? JSON.parse(row.response_json) : undefined;
}

export async function saveIdempotentResponse(
  env: Env,
  key: string | undefined,
  action: string,
  entityType: string,
  entityId: string,
  response: unknown
): Promise<void> {
  if (!key) return;
  await env.DB.prepare(
    "INSERT OR REPLACE INTO idempotency_keys (key, action, entity_type, entity_id, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(key, action, entityType, entityId, JSON.stringify(response), new Date().toISOString())
    .run();
}

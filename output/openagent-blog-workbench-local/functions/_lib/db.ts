import type {
  AdminActor,
  AdminEvent,
  BlogDraft,
  BlogDraftStatus,
  BlogPublishStatus,
  BlogQualityReport,
  BlogReviewReport,
  BlogTopic,
  BlogTopicLane,
  BlogTopicSourceType,
  BlogTopicStatus,
  DebugRun,
  DebugRunAction,
  DebugRunStatus,
  DraftOperation,
  DraftStatus,
  Env,
  PromptVersion,
  PromptVersionKind,
  ProjectDraft,
  ProjectDraftContent,
  PublishStatus,
  Submission,
  SubmissionStatus,
  TemplateVersion,
  TemplateVersionKind
} from "./types";

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
  operation?: DraftOperation | null;
  content_json: string;
  source_file_path?: string | null;
  source_slug?: string | null;
  pr_url: string | null;
  pr_number: number | null;
  pr_branch?: string | null;
  commit_sha?: string | null;
  publish_status?: PublishStatus | null;
  live_url?: string | null;
  last_publish_preview_json?: string | null;
  last_error?: string | null;
  merged_at?: string | null;
  merge_commit_sha?: string | null;
  deployed_at?: string | null;
  archived_at?: string | null;
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

type BlogTopicRow = {
  id: string;
  date: string;
  lane: BlogTopicLane;
  source_type: BlogTopicSourceType;
  priority: number;
  title: string;
  angle: string;
  primary_keyword: string;
  search_intent: string;
  source_signals_json: string;
  score: number;
  status: BlogTopicStatus;
  notes: string | null;
  manual_override: number | null;
  created_at: string;
  updated_at: string;
};

type BlogDraftRow = {
  id: string;
  topic_id: string | null;
  slug: string;
  title: string;
  status: BlogDraftStatus;
  content_json: string;
  editable_content_json: string | null;
  target_keyword: string | null;
  search_intent: string | null;
  source_links_json: string;
  quality_report_json: string;
  review_report_json: string | null;
  pr_url: string | null;
  pr_number: number | null;
  pr_branch: string | null;
  commit_sha: string | null;
  publish_status: BlogPublishStatus | null;
  live_url: string | null;
  last_publish_preview_json: string | null;
  last_error: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  deployed_at: string | null;
  approved_by_human: number | null;
  approved_at: string | null;
  approved_by_actor: AdminActor | null;
  prompt_version_id: string | null;
  template_version_id: string | null;
  model_name: string | null;
  created_at: string;
  updated_at: string;
};

type PromptVersionRow = {
  id: string;
  kind: PromptVersionKind;
  version: string;
  content: string;
  config_json: string;
  is_active: number | null;
  created_at: string;
};

type TemplateVersionRow = {
  id: string;
  kind: TemplateVersionKind;
  version: string;
  content: string;
  is_active: number | null;
  created_at: string;
};

type DebugRunRow = {
  id: string;
  source_topic_id: string | null;
  source_draft_id: string | null;
  action: DebugRunAction;
  model: string;
  prompt_version_id: string | null;
  template_version_id: string | null;
  status: DebugRunStatus;
  artifacts_ref: string;
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
    operation: row.operation ?? "create",
    content: JSON.parse(row.content_json) as ProjectDraftContent,
    sourceFilePath: row.source_file_path ?? undefined,
    sourceSlug: row.source_slug ?? undefined,
    prUrl: row.pr_url ?? undefined,
    prNumber: row.pr_number ?? undefined,
    prBranch: row.pr_branch ?? undefined,
    commitSha: row.commit_sha ?? undefined,
    publishStatus: row.publish_status ?? undefined,
    liveUrl: row.live_url ?? undefined,
    lastPublishPreview: row.last_publish_preview_json ? JSON.parse(row.last_publish_preview_json) : undefined,
    lastError: row.last_error ?? undefined,
    mergedAt: row.merged_at ?? undefined,
    mergeCommitSha: row.merge_commit_sha ?? undefined,
    deployedAt: row.deployed_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
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

export function mapBlogTopic(row: BlogTopicRow): BlogTopic {
  return {
    id: row.id,
    date: row.date,
    lane: row.lane,
    sourceType: row.source_type ?? "auto",
    priority: row.priority ?? 0,
    title: row.title,
    angle: row.angle,
    primaryKeyword: row.primary_keyword,
    searchIntent: row.search_intent,
    sourceSignals: JSON.parse(row.source_signals_json || "[]") as string[],
    score: row.score,
    status: row.status,
    notes: row.notes ?? undefined,
    manualOverride: Boolean(row.manual_override),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapBlogDraft(row: BlogDraftRow): BlogDraft {
  const generatedContent = JSON.parse(row.content_json) as BlogDraft["content"];
  const editableContent = row.editable_content_json ? (JSON.parse(row.editable_content_json) as BlogDraft["content"]) : generatedContent;
  return {
    id: row.id,
    topicId: row.topic_id ?? undefined,
    slug: row.slug,
    title: row.title,
    status: row.status,
    content: editableContent,
    generatedContent,
    targetKeyword: row.target_keyword ?? undefined,
    searchIntent: row.search_intent ?? undefined,
    sourceLinks: JSON.parse(row.source_links_json || "[]") as string[],
    qualityReport: JSON.parse(row.quality_report_json || "{}") as BlogQualityReport,
    reviewReport: row.review_report_json ? (JSON.parse(row.review_report_json) as BlogReviewReport) : undefined,
    prUrl: row.pr_url ?? undefined,
    prNumber: row.pr_number ?? undefined,
    prBranch: row.pr_branch ?? undefined,
    commitSha: row.commit_sha ?? undefined,
    publishStatus: row.publish_status ?? undefined,
    liveUrl: row.live_url ?? undefined,
    lastPublishPreview: row.last_publish_preview_json ? JSON.parse(row.last_publish_preview_json) : undefined,
    lastError: row.last_error ?? undefined,
    mergedAt: row.merged_at ?? undefined,
    mergeCommitSha: row.merge_commit_sha ?? undefined,
    deployedAt: row.deployed_at ?? undefined,
    approvedByHuman: Boolean(row.approved_by_human),
    approvedAt: row.approved_at ?? undefined,
    approvedByActor: row.approved_by_actor ?? undefined,
    promptVersionId: row.prompt_version_id ?? undefined,
    templateVersionId: row.template_version_id ?? undefined,
    modelName: row.model_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPromptVersion(row: PromptVersionRow): PromptVersion {
  return {
    id: row.id,
    kind: row.kind,
    version: row.version,
    content: row.content,
    config: JSON.parse(row.config_json || "{}") as Record<string, unknown>,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

export function mapTemplateVersion(row: TemplateVersionRow): TemplateVersion {
  return {
    id: row.id,
    kind: row.kind,
    version: row.version,
    content: row.content,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

export function mapDebugRun(row: DebugRunRow): DebugRun {
  return {
    id: row.id,
    sourceTopicId: row.source_topic_id ?? undefined,
    sourceDraftId: row.source_draft_id ?? undefined,
    action: row.action,
    model: row.model,
    promptVersionId: row.prompt_version_id ?? undefined,
    templateVersionId: row.template_version_id ?? undefined,
    status: row.status,
    artifactsRef: JSON.parse(row.artifacts_ref || "{}") as Record<string, unknown>,
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

export async function getBlogDraft(env: Env, id: string): Promise<BlogDraft | undefined> {
  const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(id).first<BlogDraftRow>();
  return row ? mapBlogDraft(row) : undefined;
}

export async function saveBlogRevision(env: Env, draftId: string, content: BlogDraft["content"], actor: AdminActor = "human"): Promise<void> {
  await env.DB.prepare("INSERT INTO blog_revisions (id, draft_id, actor, content_json, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), draftId, actor, JSON.stringify(content), new Date().toISOString())
    .run();
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

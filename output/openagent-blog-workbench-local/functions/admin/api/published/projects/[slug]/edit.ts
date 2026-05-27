import { getPublishedProject } from "../../../../../_lib/github";
import { actorFromRequest, error, ok, readJson, requireAdmin } from "../../../../../_lib/http";
import { logEvent, mapDraft, saveRevision } from "../../../../../_lib/db";
import type { Env, ProjectDraftContent } from "../../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const slug = String(params.slug ?? "");
    const body = await readJson(request).catch(() => ({} as Record<string, unknown>));
    const dryRun = body.dryRun === true;
    const actor = actorFromRequest(request);
    const project = await getPublishedProject(env, slug);
    if (!project) return error("Published project not found.", 404);

    const content: ProjectDraftContent = { ...project, status: "published" };
    const draftId = crypto.randomUUID();
    const existing = await env.DB.prepare("SELECT * FROM project_drafts WHERE slug = ?").bind(project.slug).first();

    if (dryRun) {
      return ok({ dryRun: true, operation: "update", sourceFilePath: project.filePath, content });
    }

    const now = new Date().toISOString();
    if (existing) {
      const existingDraft = mapDraft(existing as Parameters<typeof mapDraft>[0]);
      await saveRevision(env, existingDraft.id, existingDraft.content, actor);
      await env.DB.prepare(
        `UPDATE project_drafts
         SET title = ?, category = ?, status = 'draft', operation = 'update', content_json = ?, source_file_path = ?,
             source_slug = ?, pr_url = NULL, pr_number = NULL, pr_branch = NULL, commit_sha = NULL, publish_status = NULL,
             last_publish_preview_json = NULL, last_error = NULL, merged_at = NULL, merge_commit_sha = NULL,
             deployed_at = NULL, archived_at = NULL, updated_at = ?
         WHERE id = ?`
      )
        .bind(project.title, project.category, JSON.stringify(content), project.filePath, project.slug, now, existingDraft.id)
        .run();
      await logEvent(env, "project_draft", existingDraft.id, "created_update_draft", { actor, before: existingDraft.content, after: content });
      const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(existingDraft.id).first();
      return ok({ project: mapDraft(row as Parameters<typeof mapDraft>[0]) });
    }

    await env.DB.prepare(
      `INSERT INTO project_drafts (
        id, submission_id, slug, title, category, status, operation, content_json, source_file_path, source_slug, created_at, updated_at
      ) VALUES (?, NULL, ?, ?, ?, 'draft', 'update', ?, ?, ?, ?, ?)`
    )
      .bind(draftId, project.slug, project.title, project.category, JSON.stringify(content), project.filePath, project.slug, now, now)
      .run();
    await logEvent(env, "project_draft", draftId, "created_update_draft", { actor, after: content });
    const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(draftId).first();
    return ok({ project: mapDraft(row as Parameters<typeof mapDraft>[0]) });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to create update draft.", 500);
  }
};

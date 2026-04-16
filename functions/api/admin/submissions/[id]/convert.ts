import { error, ok, requireAdmin } from "../../../../_lib/http";
import { getSubmission, logEvent } from "../../../../_lib/db";
import type { Env } from "../../../../_lib/types";
import { defaultDraftContent } from "../../../../_lib/validation";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const submission = await getSubmission(env, id);
    if (!submission) return error("Submission not found.", 404);

    const existing = await env.DB.prepare("SELECT id FROM project_drafts WHERE submission_id = ?").bind(id).first<{ id: string }>();
    if (existing?.id) return ok({ draftId: existing.id, alreadyConverted: true });

    const now = new Date().toISOString();
    const draftId = crypto.randomUUID();
    const content = defaultDraftContent({
      projectName: submission.projectName,
      repoUrl: submission.repoUrl,
      homepageUrl: submission.homepageUrl,
      category: submission.category,
      summary: submission.summary
    });

    await env.DB.prepare(
      `INSERT INTO project_drafts (
        id, submission_id, slug, title, category, status, content_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)`
    )
      .bind(draftId, submission.id, content.slug, content.title, content.category, JSON.stringify(content), now, now)
      .run();

    await env.DB.prepare("UPDATE submissions SET status = 'converted', updated_at = ? WHERE id = ?").bind(now, submission.id).run();
    await logEvent(env, "submission", submission.id, "converted_to_draft", { draftId });
    await logEvent(env, "project_draft", draftId, "created_from_submission", { submissionId: submission.id });

    return ok({ draftId });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to convert submission.", 500);
  }
};

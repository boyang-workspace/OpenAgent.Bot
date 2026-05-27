import { actorFromRequest, boolParam, error, ok, readJson, requireAdmin } from "../../../../_lib/http";
import { getIdempotentResponse, getSubmission, logEvent, saveIdempotentResponse } from "../../../../_lib/db";
import type { Env } from "../../../../_lib/types";
import { defaultDraftContent } from "../../../../_lib/validation";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const actor = actorFromRequest(request);
    const body = request.method === "POST" ? await readJson(request).catch(() => ({} as Record<string, unknown>)) : {};
    const dryRun = boolParam(request, "dryRun") || body.dryRun === true;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : request.headers.get("idempotency-key") ?? undefined;
    const existingResponse = await getIdempotentResponse(env, idempotencyKey, "convert_submission", id);
    if (existingResponse) return ok({ idempotent: true, result: existingResponse });

    const submission = await getSubmission(env, id);
    if (!submission) return error("Submission not found.", 404);

    const existing = await env.DB.prepare("SELECT id FROM project_drafts WHERE submission_id = ?").bind(id).first<{ id: string }>();
    const content = defaultDraftContent({
      projectName: submission.projectName,
      repoUrl: submission.repoUrl,
      homepageUrl: submission.homepageUrl,
      category: submission.category,
      summary: submission.summary
    });
    if (existing?.id) {
      const response = { draftId: existing.id, alreadyConverted: true };
      await saveIdempotentResponse(env, idempotencyKey, "convert_submission", "submission", id, response);
      return ok(response);
    }

    if (dryRun) {
      return ok({ dryRun: true, plannedDraft: content, nextState: "converted" });
    }

    const now = new Date().toISOString();
    const draftId = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO project_drafts (
        id, submission_id, slug, title, category, status, content_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)`
    )
      .bind(draftId, submission.id, content.slug, content.title, content.category, JSON.stringify(content), now, now)
      .run();

    await env.DB.prepare("UPDATE submissions SET status = 'converted', draft_id = ?, updated_at = ? WHERE id = ?").bind(draftId, now, submission.id).run();
    await logEvent(env, "submission", submission.id, "converted_to_draft", { actor, before: submission, after: { ...submission, status: "converted", draftId }, result: { draftId } });
    await logEvent(env, "project_draft", draftId, "created_from_submission", { actor, metadata: { submissionId: submission.id }, after: content });

    const response = { draftId };
    await saveIdempotentResponse(env, idempotencyKey, "convert_submission", "submission", id, response);
    return ok(response);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to convert submission.", 500);
  }
};

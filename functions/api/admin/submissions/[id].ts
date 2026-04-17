import { actorFromRequest, error, ok, requireAdmin } from "../../../_lib/http";
import { getSubmission, logEvent } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const submission = await getSubmission(env, id);
    if (!submission) return error("Submission not found.", 404);

    const draftRows = await env.DB.prepare("SELECT id FROM project_drafts WHERE submission_id = ?").bind(id).all<{ id: string }>();
    const draftIds = (draftRows.results ?? []).map((row: { id: string }) => row.id);
    for (const draftId of draftIds) {
      await env.DB.prepare("DELETE FROM draft_revisions WHERE draft_id = ?").bind(draftId).run();
      await env.DB.prepare("DELETE FROM idempotency_keys WHERE entity_id = ?").bind(draftId).run();
    }
    await env.DB.prepare("DELETE FROM project_drafts WHERE submission_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM submissions WHERE id = ?").bind(id).run();
    await logEvent(env, "submission", id, "deleted", {
      actor: actorFromRequest(request),
      before: submission,
      result: { deletedDraftIds: draftIds }
    });

    return ok({ deleted: true, id, deletedDraftIds: draftIds });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to delete submission.", 500);
  }
};

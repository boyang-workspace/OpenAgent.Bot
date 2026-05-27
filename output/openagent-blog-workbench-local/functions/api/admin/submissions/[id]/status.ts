import { actorFromRequest, error, ok, readJson, requireAdmin } from "../../../../_lib/http";
import { getSubmission, logEvent } from "../../../../_lib/db";
import type { Env, SubmissionStatus } from "../../../../_lib/types";

const statuses = new Set(["new", "reviewing", "converted", "rejected", "duplicate"]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const submission = await getSubmission(env, id);
    if (!submission) return error("Submission not found.", 404);

    const input = await readJson(request);
    const status = input.status;
    if (typeof status !== "string" || !statuses.has(status)) {
      return error("Invalid submission status.");
    }
    if (status === "converted") {
      return error("Use convert to move a submission into draft workflow.");
    }

    const note = typeof input.reviewNote === "string" ? input.reviewNote.trim() : undefined;
    const now = new Date().toISOString();
    await env.DB.prepare("UPDATE submissions SET status = ?, review_note = ?, updated_at = ? WHERE id = ?")
      .bind(status, note ?? null, now, id)
      .run();
    await logEvent(env, "submission", id, "status_updated", {
      actor: actorFromRequest(request),
      before: submission,
      after: { ...submission, status: status as SubmissionStatus, reviewNote: note, updatedAt: now }
    });

    return ok({ status });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update submission status.");
  }
};

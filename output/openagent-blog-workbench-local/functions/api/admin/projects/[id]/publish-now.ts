import { actorFromRequest, boolParam, error, ok, readJson, requireAdmin } from "../../../../_lib/http";
import { getDraft, getIdempotentResponse, logEvent, saveIdempotentResponse } from "../../../../_lib/db";
import { isLive, publishNow, publishPreview } from "../../../../_lib/github";
import type { Env } from "../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const id = String(params.id ?? "");
  try {
    const body = await readJson(request).catch(() => ({} as Record<string, unknown>));
    const actor = actorFromRequest(request);
    const dryRun = boolParam(request, "dryRun") || body.dryRun === true;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : request.headers.get("idempotency-key") ?? undefined;
    const existingResponse = await getIdempotentResponse(env, idempotencyKey, "publish_now", id);
    if (existingResponse) return ok({ idempotent: true, result: existingResponse });

    const draft = await getDraft(env, id);
    if (!draft) return error("Project draft not found.", 404);
    if (draft.status !== "ready") return error("Only ready drafts can be published now.", 400);

    const preview = publishPreview(draft);
    if (dryRun) {
      await env.DB.prepare("UPDATE project_drafts SET last_publish_preview_json = ?, updated_at = ? WHERE id = ?")
        .bind(JSON.stringify(preview), new Date().toISOString(), id)
        .run();
      return ok({ dryRun: true, preview });
    }

    await env.DB.prepare("UPDATE project_drafts SET publish_status = 'running', last_error = NULL, updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), id)
      .run();

    const result = await publishNow(env, draft);
    const now = new Date().toISOString();
    const status = draft.operation === "archive" || draft.operation === "delete" ? "archived" : "published";
    const publishStatus = result.deployed ? "succeeded" : "deploying";
    await env.DB.prepare(
      `UPDATE project_drafts
       SET status = ?, publish_status = ?, pr_url = ?, pr_number = ?, pr_branch = ?, commit_sha = ?, live_url = ?,
           last_publish_preview_json = ?, last_error = NULL, merged_at = ?, merge_commit_sha = ?,
           deployed_at = ?, archived_at = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(
        status,
        publishStatus,
        result.url,
        result.number,
        result.branch,
        result.commitSha,
        result.liveUrl,
        JSON.stringify(preview),
        result.mergedAt,
        result.mergeCommitSha,
        result.deployed ? now : null,
        draft.operation === "archive" || draft.operation === "delete" ? now : null,
        now,
        id
      )
      .run();

    const response = { ...result, status, publishStatus };
    await saveIdempotentResponse(env, idempotencyKey, "publish_now", "project_draft", id, response);
    await logEvent(env, "project_draft", id, "publish_now", { actor, before: draft, result: response });
    return ok(response);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Failed to publish now.";
    await env.DB.prepare("UPDATE project_drafts SET publish_status = 'failed', last_error = ?, updated_at = ? WHERE id = ?")
      .bind(message, new Date().toISOString(), id)
      .run()
      .catch(() => undefined);
    await logEvent(env, "project_draft", id, "publish_now_failed", { actor: actorFromRequest(request), error: message }).catch(() => undefined);
    return error(message, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const draft = await getDraft(env, String(params.id ?? ""));
  if (!draft) return error("Project draft not found.", 404);
  const deployed = await isLive(env, draft);
  return ok({ deployed });
};

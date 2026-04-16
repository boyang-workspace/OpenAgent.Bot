import { actorFromRequest, boolParam, error, ok, readJson, requireAdmin } from "../../../../_lib/http";
import { createPublishPr, publishPreview } from "../../../../_lib/github";
import { getDraft, getIdempotentResponse, logEvent, saveIdempotentResponse } from "../../../../_lib/db";
import type { Env } from "../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const body = await readJson(request).catch(() => ({} as Record<string, unknown>));
    const actor = actorFromRequest(request);
    const dryRun = boolParam(request, "dryRun") || body.dryRun === true;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : request.headers.get("idempotency-key") ?? undefined;
    const existingResponse = await getIdempotentResponse(env, idempotencyKey, "create_publish_pr", id);
    if (existingResponse) return ok({ idempotent: true, result: existingResponse });

    const draft = await getDraft(env, id);
    if (!draft) return error("Project draft not found.", 404);
    if (draft.status === "pr_created" && draft.prUrl) return ok({ alreadyCreated: true, prUrl: draft.prUrl, prNumber: draft.prNumber });

    const preview = publishPreview(draft);
    if (dryRun) {
      await env.DB.prepare("UPDATE project_drafts SET last_publish_preview_json = ?, updated_at = ? WHERE id = ?")
        .bind(JSON.stringify(preview), new Date().toISOString(), id)
        .run();
      return ok({ dryRun: true, preview });
    }

    const pr = await createPublishPr(env, draft);
    const now = new Date().toISOString();
    const liveUrl = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/${draft.category}/${draft.slug}`;
    await env.DB.prepare(
      `UPDATE project_drafts
       SET status = 'pr_created', publish_status = 'pending', pr_url = ?, pr_number = ?, pr_branch = ?, commit_sha = ?,
           live_url = ?, last_publish_preview_json = ?, last_error = NULL, updated_at = ?
       WHERE id = ?`
    )
      .bind(pr.url, pr.number, pr.branch, pr.commitSha, liveUrl, JSON.stringify(preview), now, id)
      .run();
    await logEvent(env, "project_draft", id, "publish_pr_created", { actor, before: draft, result: pr });

    const response = { prUrl: pr.url, prNumber: pr.number, branch: pr.branch, commitSha: pr.commitSha, liveUrl };
    await saveIdempotentResponse(env, idempotencyKey, "create_publish_pr", "project_draft", id, response);
    return ok(response);
  } catch (caught) {
    const id = String(params.id ?? "");
    await env.DB.prepare("UPDATE project_drafts SET publish_status = 'failed', last_error = ?, updated_at = ? WHERE id = ?")
      .bind(caught instanceof Error ? caught.message : "Failed to create publish PR.", new Date().toISOString(), id)
      .run()
      .catch(() => undefined);
    await logEvent(env, "project_draft", id, "publish_pr_failed", { actor: actorFromRequest(request), error: caught instanceof Error ? caught.message : "Failed to create publish PR." }).catch(() => undefined);
    return error(caught instanceof Error ? caught.message : "Failed to create publish PR.", 500);
  }
};

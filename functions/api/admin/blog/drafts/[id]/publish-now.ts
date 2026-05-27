import { actorFromRequest, boolParam, error, ok, readJson, requireAdmin } from "../../../../../_lib/http";
import { blogPublishPreview, isBlogLive, publishBlogNow } from "../../../../../_lib/blog-github";
import { getBlogDraft, getIdempotentResponse, logEvent, saveIdempotentResponse } from "../../../../../_lib/db";
import type { Env } from "../../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const id = String(params.id ?? "");
  try {
    const body = await readJson(request).catch(() => ({} as Record<string, unknown>));
    const actor = actorFromRequest(request);
    const dryRun = boolParam(request, "dryRun") || body.dryRun === true;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : request.headers.get("idempotency-key") ?? undefined;
    const existingResponse = await getIdempotentResponse(env, idempotencyKey, "publish_blog_now", id);
    if (existingResponse) return ok({ idempotent: true, result: existingResponse });

    const draft = await getBlogDraft(env, id);
    if (!draft) return error("Blog draft not found.", 404);
    if (draft.status !== "ready") return error("Only ready blog drafts can be published now.", 400);

    const preview = blogPublishPreview(draft);
    if (dryRun) {
      await env.DB.prepare("UPDATE blog_drafts SET last_publish_preview_json = ?, updated_at = ? WHERE id = ?")
        .bind(JSON.stringify(preview), new Date().toISOString(), id)
        .run();
      return ok({ dryRun: true, preview });
    }

    await env.DB.prepare("UPDATE blog_drafts SET publish_status = 'running', last_error = NULL, updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), id)
      .run();

    const result = await publishBlogNow(env, draft);
    const now = new Date().toISOString();
    const publishStatus = result.deployed ? "succeeded" : "deploying";
    await env.DB.prepare(
      `UPDATE blog_drafts
       SET status = 'published', publish_status = ?, pr_url = ?, pr_number = ?, pr_branch = ?, commit_sha = ?, live_url = ?,
           last_publish_preview_json = ?, last_error = NULL, merged_at = ?, merge_commit_sha = ?, deployed_at = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(publishStatus, result.url, result.number, result.branch, result.commitSha, result.liveUrl, JSON.stringify(preview), result.mergedAt, result.mergeCommitSha, result.deployed ? now : null, now, id)
      .run();

    const response = { ...result, status: "published", publishStatus };
    await saveIdempotentResponse(env, idempotencyKey, "publish_blog_now", "blog_draft", id, response);
    await logEvent(env, "blog_draft", id, "publish_now", { actor, before: draft, result: response });
    return ok(response);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Failed to publish blog now.";
    await env.DB.prepare("UPDATE blog_drafts SET publish_status = 'failed', last_error = ?, updated_at = ? WHERE id = ?").bind(message, new Date().toISOString(), id).run().catch(() => undefined);
    await logEvent(env, "blog_draft", id, "publish_now_failed", { actor: actorFromRequest(request), error: message }).catch(() => undefined);
    return error(message, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const draft = await getBlogDraft(env, String(params.id ?? ""));
  if (!draft) return error("Blog draft not found.", 404);
  const deployed = await isBlogLive(env, draft);
  return ok({ deployed });
};

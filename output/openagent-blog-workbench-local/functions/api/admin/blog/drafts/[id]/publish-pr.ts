import { actorFromRequest, boolParam, error, ok, readJson, requireAdmin } from "../../../../../_lib/http";
import { blogPublishPreview, createBlogPublishPr } from "../../../../../_lib/blog-github";
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
    const existingResponse = await getIdempotentResponse(env, idempotencyKey, "create_blog_publish_pr", id);
    if (existingResponse) return ok({ idempotent: true, result: existingResponse });

    const draft = await getBlogDraft(env, id);
    if (!draft) return error("Blog draft not found.", 404);
    if (draft.status === "pr_created" && draft.prUrl) return ok({ alreadyCreated: true, prUrl: draft.prUrl, prNumber: draft.prNumber });

    const preview = blogPublishPreview(draft);
    if (dryRun) {
      await env.DB.prepare("UPDATE blog_drafts SET last_publish_preview_json = ?, updated_at = ? WHERE id = ?")
        .bind(JSON.stringify(preview), new Date().toISOString(), id)
        .run();
      return ok({ dryRun: true, preview });
    }

    const pr = await createBlogPublishPr(env, draft);
    const now = new Date().toISOString();
    const liveUrl = `${env.PUBLIC_SITE_URL ?? "https://www.openagent.bot"}/blog/${draft.slug}`;
    await env.DB.prepare(
      `UPDATE blog_drafts
       SET status = 'pr_created', publish_status = 'pending', pr_url = ?, pr_number = ?, pr_branch = ?, commit_sha = ?,
           live_url = ?, last_publish_preview_json = ?, last_error = NULL, updated_at = ?
       WHERE id = ?`
    )
      .bind(pr.url, pr.number, pr.branch, pr.commitSha, liveUrl, JSON.stringify(preview), now, id)
      .run();

    await logEvent(env, "blog_draft", id, "publish_pr_created", { actor, before: draft, result: pr });
    const response = { prUrl: pr.url, prNumber: pr.number, branch: pr.branch, commitSha: pr.commitSha, liveUrl };
    await saveIdempotentResponse(env, idempotencyKey, "create_blog_publish_pr", "blog_draft", id, response);
    return ok(response);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Failed to create blog publish PR.";
    await env.DB.prepare("UPDATE blog_drafts SET publish_status = 'failed', last_error = ?, updated_at = ? WHERE id = ?").bind(message, new Date().toISOString(), id).run().catch(() => undefined);
    await logEvent(env, "blog_draft", id, "publish_pr_failed", { actor: actorFromRequest(request), error: message }).catch(() => undefined);
    return error(message, 500);
  }
};

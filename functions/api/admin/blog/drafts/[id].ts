import { actorFromRequest, error, json, ok, readJson, requireAdmin } from "../../../../_lib/http";
import { getBlogDraft, logEvent, mapBlogDraft, saveBlogRevision } from "../../../../_lib/db";
import { buildBlogReviewReport, parseBlogDraftPayload } from "../../../../_lib/blog-validation";
import type { Env } from "../../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const draft = await getBlogDraft(env, String(params.id ?? ""));
  if (!draft) return error("Blog draft not found.", 404);

  return json({ ok: true, draft });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const existing = await getBlogDraft(env, id);
    if (!existing) return error("Blog draft not found.", 404);

    const input = await readJson(request);
    const status = input.status === "ready" ? "ready" : input.status === "rejected" ? "rejected" : "draft";
    const payload = parseBlogDraftPayload(input);
    if (status === "ready" && !payload.qualityReport.passed) {
      return error(`Blog draft failed quality gate: ${payload.qualityReport.issues.join(" ")}`, 422);
    }

    const now = new Date().toISOString();
    const reviewReport = buildBlogReviewReport(payload.qualityReport);
    await env.DB.prepare(
      `UPDATE blog_drafts
       SET slug = ?, title = ?, status = ?, editable_content_json = ?, target_keyword = ?, search_intent = ?,
           source_links_json = ?, quality_report_json = ?, review_report_json = ?, approved_by_human = 0,
           approved_at = NULL, approved_by_actor = NULL, updated_at = ?
       WHERE id = ?`
    )
      .bind(
        payload.content.slug,
        payload.content.title,
        status,
        JSON.stringify(payload.content),
        payload.targetKeyword ?? null,
        payload.searchIntent ?? null,
        JSON.stringify(payload.sourceLinks),
        JSON.stringify(payload.qualityReport),
        JSON.stringify(reviewReport),
        now,
        id
      )
      .run();

    await saveBlogRevision(env, id, existing.content, actorFromRequest(request));
    await logEvent(env, "blog_draft", id, "updated", { actor: actorFromRequest(request), before: existing.content, after: payload, result: { status } });

    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(id).first();
    return json({ ok: true, draft: mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]) });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update blog draft.");
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const existing = await getBlogDraft(env, id);
    if (!existing) return error("Blog draft not found.", 404);
    await env.DB.prepare("DELETE FROM blog_revisions WHERE draft_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM idempotency_keys WHERE entity_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM blog_drafts WHERE id = ?").bind(id).run();
    await logEvent(env, "blog_draft", id, "deleted", { actor: actorFromRequest(request), before: existing });
    return ok({ deleted: true, id });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to delete blog draft.", 500);
  }
};

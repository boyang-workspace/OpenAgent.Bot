import { actorFromRequest, error, json, requireAdmin } from "../../../../../_lib/http";
import { reviewDraftWithLocalModel } from "../../../../../_lib/blog-workbench";
import { getBlogDraft, logEvent, mapBlogDraft } from "../../../../../_lib/db";
import { buildBlogReviewReport, parseBlogDraftPayload } from "../../../../../_lib/blog-validation";
import type { Env } from "../../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const draft = await getBlogDraft(env, id);
    if (!draft) return error("Blog draft not found.", 404);
    const payload = parseBlogDraftPayload({
      ...draft.content,
      targetKeyword: draft.targetKeyword,
      searchIntent: draft.searchIntent,
      sourceLinks: draft.sourceLinks
    });
    let reviewReport = buildBlogReviewReport(payload.qualityReport, {
      approvedByHuman: false
    });
    let reviewDebug: Record<string, unknown> = {
      provider: "fallback"
    };
    try {
      const local = await reviewDraftWithLocalModel(env, draft);
      reviewReport = {
        ...reviewReport,
        summary: local.review.summary,
        blockingIssues: local.review.blockingIssues,
        warnings: local.review.warnings
      };
      reviewDebug = local.debug;
    } catch (caught) {
      reviewDebug = {
        provider: "fallback",
        error: caught instanceof Error ? caught.message : "Local reviewer unavailable."
      };
    }
    await env.DB.prepare(
      `UPDATE blog_drafts
       SET quality_report_json = ?, review_report_json = ?, approved_by_human = 0,
           approved_at = NULL, approved_by_actor = NULL, updated_at = ?
       WHERE id = ?`
    )
      .bind(JSON.stringify(payload.qualityReport), JSON.stringify(reviewReport), new Date().toISOString(), id)
      .run();
    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(id).first();
    const updated = mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]);
    await logEvent(env, "blog_draft", id, "reviewed", {
      actor: actorFromRequest(request),
      result: reviewReport,
      metadata: { reviewDebug }
    });
    return json({ ok: true, draft: updated, reviewReport });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to review blog draft.", 400);
  }
};

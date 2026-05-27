import { actorFromRequest, error, json, requireAdmin } from "../../../../../_lib/http";
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
    const reviewReport = buildBlogReviewReport(payload.qualityReport);
    if (reviewReport.blockingIssues.length) {
      return error(`Draft still has blocking issues: ${reviewReport.blockingIssues.join(" ")}`, 422);
    }
    const approvedAt = new Date().toISOString();
    const actor = actorFromRequest(request);
    await env.DB.prepare(
      `UPDATE blog_drafts
       SET status = 'ready', quality_report_json = ?, review_report_json = ?, approved_by_human = 1,
           approved_at = ?, approved_by_actor = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(
        JSON.stringify(payload.qualityReport),
        JSON.stringify(buildBlogReviewReport(payload.qualityReport, { approvedByHuman: true, approvedAt })),
        approvedAt,
        actor,
        approvedAt,
        id
      )
      .run();
    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(id).first();
    const updated = mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]);
    await logEvent(env, "blog_draft", id, "approved", { actor, result: { approvedAt } });
    return json({ ok: true, draft: updated });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to approve blog draft.", 400);
  }
};

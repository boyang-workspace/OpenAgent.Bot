import { error, json, requireAdmin } from "../../../../_lib/http";
import { mapBlogDraft } from "../../../../_lib/db";
import { buildBlogReviewReport } from "../../../../_lib/blog-validation";
import { getActivePromptVersion, getActiveTemplateVersion } from "../../../../_lib/blog-workbench";
import type { Env } from "../../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const result = await env.DB.prepare("SELECT * FROM blog_drafts ORDER BY updated_at DESC LIMIT 100").all();
  if (!result.success) return error(result.error ?? "Failed to load blog drafts.", 500);

  return json({
    ok: true,
    drafts: (result.results ?? []).map((row) => mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]))
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const { actorFromRequest, readJson } = await import("../../../../_lib/http");
    const { logEvent } = await import("../../../../_lib/db");
    const { parseBlogDraftPayload } = await import("../../../../_lib/blog-validation");
    const input = await readJson(request);
    const payload = parseBlogDraftPayload(input);
    if (!payload.qualityReport.passed) return error(`Blog draft failed quality gate: ${payload.qualityReport.issues.join(" ")}`, 422);

    const existing = await env.DB.prepare("SELECT * FROM blog_drafts WHERE slug = ?").bind(payload.content.slug).first();
    if (existing) return json({ ok: true, duplicate: true, draft: mapBlogDraft(existing as Parameters<typeof mapBlogDraft>[0]) });

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO blog_drafts (
        id, topic_id, slug, title, status, content_json, editable_content_json, target_keyword, search_intent,
        source_links_json, quality_report_json, review_report_json, approved_by_human, prompt_version_id,
        template_version_id, model_name, created_at, updated_at
      ) VALUES (?, NULL, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        payload.content.slug,
        payload.content.title,
        JSON.stringify(payload.content),
        JSON.stringify(payload.content),
        payload.targetKeyword ?? null,
        payload.searchIntent ?? null,
        JSON.stringify(payload.sourceLinks),
        JSON.stringify(payload.qualityReport),
        JSON.stringify(buildBlogReviewReport(payload.qualityReport)),
        (await getActivePromptVersion(env, "draft-generation"))?.id ?? null,
        (await getActiveTemplateVersion(env, "blog-outline"))?.id ?? null,
        "imported",
        now,
        now
      )
      .run();
    await logEvent(env, "blog_draft", id, "imported", { actor: actorFromRequest(request), after: payload });

    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(id).first();
    return json({ ok: true, draft: mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]) }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to import blog draft.", 400);
  }
};

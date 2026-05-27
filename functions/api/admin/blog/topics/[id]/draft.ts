import { actorFromRequest, error, json, requireAdmin } from "../../../../../_lib/http";
import { generateDraftFromTopicWithLocalModel, getActivePromptVersion, getActiveTemplateVersion } from "../../../../../_lib/blog-workbench";
import { logEvent, mapBlogDraft, mapBlogTopic } from "../../../../../_lib/db";
import { parseBlogDraftPayload } from "../../../../../_lib/blog-validation";
import type { Env } from "../../../../../_lib/types";

function topicIdFromRequest(request: Request, params: Record<string, string | string[] | undefined>): string {
  const rawParam = params.id;
  const fromParams = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  if (typeof fromParams === "string" && fromParams.trim()) return decodeURIComponent(fromParams.trim());

  const fromQuery = new URL(request.url).searchParams.get("topicId");
  if (fromQuery) return fromQuery;

  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  const draftIndex = segments.lastIndexOf("draft");
  if (draftIndex > 0) {
    return decodeURIComponent(segments[draftIndex - 1] ?? "");
  }
  const topicIndex = segments.lastIndexOf("topics");
  if (topicIndex >= 0 && segments.length > topicIndex + 1) {
    return decodeURIComponent(segments[topicIndex + 1] ?? "");
  }
  return "";
}

function draftSourceLinks(topic: { sourceSignals: string[] }): string[] {
  return [
    ...new Set([
      ...topic.sourceSignals.filter((link) => /^https?:/i.test(link)),
      "https://github.com/trending?spoken_language_code=en",
      "https://news.ycombinator.com/",
      "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
    ])
  ].slice(0, 3);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = topicIdFromRequest(request, params);
    const topicRow = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(id).first();
    if (!topicRow) return error("Blog topic not found.", 404);

    const topic = mapBlogTopic(topicRow as Parameters<typeof mapBlogTopic>[0]);
    const duplicateRow = await env.DB.prepare(
      "SELECT id, title, primary_keyword FROM blog_topics WHERE id <> ? AND (lower(title) = lower(?) OR lower(primary_keyword) = lower(?)) LIMIT 1"
    )
      .bind(topic.id, topic.title, topic.primaryKeyword)
      .first<{ id: string }>();
    if (duplicateRow && !topic.manualOverride) {
      return error("Potential duplicate topic detected. Enable manual override or adjust the title/keyword before drafting.", 409);
    }
    let generationDebug: Record<string, unknown> = {};
    const local = await generateDraftFromTopicWithLocalModel(env, topic, {
      promptVersionId: (await getActivePromptVersion(env, "draft-generation"))?.id,
      templateVersionId: (await getActiveTemplateVersion(env, "blog-outline"))?.id
    });
    const generated = {
      ...local.draft,
      seoTitle: local.draft.seoTitle ?? `${topic.title} | OpenAgent.bot`,
      seoDescription: local.draft.seoDescription ?? topic.searchIntent,
      targetKeyword: topic.primaryKeyword,
      searchIntent: topic.searchIntent,
      sourceLinks: draftSourceLinks(topic)
    };
    generationDebug = local.debug;
    const payload = parseBlogDraftPayload(generated);
    if (!payload.qualityReport.passed) return error(`Generated draft failed quality gate: ${payload.qualityReport.issues.join(" ")}`, 422);

    const existing = await env.DB.prepare("SELECT * FROM blog_drafts WHERE slug = ?").bind(payload.content.slug).first();
    if (existing) return json({ ok: true, duplicate: true, draft: mapBlogDraft(existing as Parameters<typeof mapBlogDraft>[0]) });

    const now = new Date().toISOString();
    const draftId = crypto.randomUUID();
    const promptVersion = await getActivePromptVersion(env, "draft-generation");
    const templateVersion = await getActiveTemplateVersion(env, "blog-outline");
    await env.DB.prepare(
      `INSERT INTO blog_drafts (
        id, topic_id, slug, title, status, content_json, editable_content_json, target_keyword, search_intent,
        source_links_json, quality_report_json, review_report_json, approved_by_human, prompt_version_id,
        template_version_id, model_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`
    )
      .bind(
        draftId,
        topic.id,
        payload.content.slug,
        payload.content.title,
        JSON.stringify(payload.content),
        JSON.stringify(payload.content),
        payload.targetKeyword ?? null,
        payload.searchIntent ?? null,
        JSON.stringify(payload.sourceLinks),
        JSON.stringify(payload.qualityReport),
        JSON.stringify({
          summary: "Draft generated. Run review after editing or before approval.",
          blockingIssues: payload.qualityReport.issues,
          warnings: [
            "Generated with the local model writer.",
            Array.isArray((generationDebug as { repairAttempts?: unknown[] }).repairAttempts) &&
            ((generationDebug as { repairAttempts?: unknown[] }).repairAttempts?.length ?? 0) > 0
              ? "The local model needed a repair pass to satisfy the quality gate."
              : "Review manually before approval."
          ],
          checkedAt: payload.qualityReport.checkedAt,
          approvedByHuman: false
        }),
        promptVersion?.id ?? null,
        templateVersion?.id ?? null,
        "template-seed",
        now,
        now
      )
      .run();
    await env.DB.prepare("UPDATE blog_topics SET status = 'drafted', updated_at = ? WHERE id = ?").bind(now, topic.id).run();
    await logEvent(env, "blog_draft", draftId, "created_from_topic", {
      actor: actorFromRequest(request),
      metadata: { topicId: topic.id, generationDebug },
      after: payload
    });

    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(draftId).first();
    return json({ ok: true, draft: mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]) }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to draft blog topic.", 500);
  }
};

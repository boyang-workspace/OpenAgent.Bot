import { actorFromRequest, error, json, readJson, requireAdmin } from "../../../_lib/http";
import { logEvent, mapDraft } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";
import { parseDraftContent } from "../../../_lib/validation";

function qualityGate(content: ReturnType<typeof parseDraftContent>): string[] {
  const issues: string[] = [];
  if (!content.sourceLinks.length) issues.push("At least one source link is required.");
  if ((content.coreStrengths?.length ?? 0) < 3) issues.push("At least 3 core strengths are required.");
  if ((content.useCaseNotes?.length ?? 0) < 3) issues.push("At least 3 use case notes are required.");
  if ((content.compareNotes?.length ?? 0) < 1) issues.push("At least 1 comparison note is required.");
  if (!content.seoArticle?.intro || !content.seoArticle.whatItIs || !content.seoArticle.whyItMatters) {
    issues.push("SEO article needs intro, whatItIs, and whyItMatters.");
  }
  return issues;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const input = await readJson(request);
    const contentInput = typeof input.content === "object" && input.content !== null && !Array.isArray(input.content) ? input.content : input;
    const content = parseDraftContent(contentInput as Record<string, unknown>);
    const issues = qualityGate(content);
    const actor = actorFromRequest(request);
    const now = new Date().toISOString();

    if (issues.length) {
      await logEvent(env, "project_draft", content.slug, "editorial_import_rejected", {
        actor,
        metadata: { issues, source: input.source ?? "codex_editorial_run" },
        after: content
      });
      return error(`Draft did not pass editorial quality gate: ${issues.join(" ")}`, 422);
    }

    const existing = await env.DB.prepare("SELECT * FROM project_drafts WHERE slug = ?").bind(content.slug).first();
    if (existing) {
      return json({ ok: true, duplicate: true, project: mapDraft(existing as Parameters<typeof mapDraft>[0]) });
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO project_drafts (
        id, submission_id, slug, title, category, status, operation, content_json, created_at, updated_at
      ) VALUES (?, NULL, ?, ?, ?, 'draft', 'create', ?, ?, ?)`
    )
      .bind(id, content.slug, content.title, content.category, JSON.stringify(content), now, now)
      .run();

    await logEvent(env, "project_draft", id, "editorial_imported", {
      actor,
      metadata: { source: input.source ?? "codex_editorial_run" },
      after: content,
      result: { status: "draft" }
    });

    const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(id).first();
    return json({ ok: true, project: mapDraft(row as Parameters<typeof mapDraft>[0]) }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to import editorial draft.", 400);
  }
};

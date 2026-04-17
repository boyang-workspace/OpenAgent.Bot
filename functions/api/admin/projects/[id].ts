import { actorFromRequest, boolParam, error, json, ok, readJson, requireAdmin } from "../../../_lib/http";
import { getDraft, logEvent, mapDraft, saveRevision } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";
import { parseDraftContent } from "../../../_lib/validation";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const draft = await getDraft(env, String(params.id ?? ""));
  if (!draft) return error("Project draft not found.", 404);

  return json({ ok: true, project: draft });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const existing = await getDraft(env, id);
    if (!existing) return error("Project draft not found.", 404);

    const input = await readJson(request);
    const actor = actorFromRequest(request);
    const dryRun = boolParam(request, "dryRun") || input.dryRun === true;
    const content = parseDraftContent(input);
    const status = input.status === "ready" ? "ready" : "draft";
    const now = new Date().toISOString();

    if (existing.operation === "archive") {
      return error("Archive drafts cannot be edited. Publish the archive operation or recreate it from Published.", 400);
    }

    if (existing.operation === "update" && (content.slug !== existing.sourceSlug || content.category !== existing.category)) {
      return error("Published project updates cannot change slug or category in V1.", 400);
    }

    if (dryRun) {
      return json({ ok: true, dryRun: true, project: { ...existing, slug: content.slug, title: content.title, category: content.category, status, content } });
    }

    await env.DB.prepare(
      "UPDATE project_drafts SET slug = ?, title = ?, category = ?, status = ?, content_json = ?, updated_at = ? WHERE id = ?"
    )
      .bind(content.slug, content.title, content.category, status, JSON.stringify(content), now, id)
      .run();

    await saveRevision(env, id, existing.content, actor);
    await logEvent(env, "project_draft", id, "updated", { actor, before: existing.content, after: content, result: { status } });

    const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(id).first();
    return json({ ok: true, project: mapDraft(row as Parameters<typeof mapDraft>[0]) });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update project draft.");
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const existing = await getDraft(env, id);
    if (!existing) return error("Project draft not found.", 404);

    const actor = actorFromRequest(request);
    await env.DB.prepare("DELETE FROM draft_revisions WHERE draft_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM idempotency_keys WHERE entity_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM project_drafts WHERE id = ?").bind(id).run();
    if (existing.submissionId) {
      await env.DB.prepare("UPDATE submissions SET status = 'reviewing', draft_id = NULL, updated_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), existing.submissionId)
        .run();
    }
    await logEvent(env, "project_draft", id, "deleted", { actor, before: existing });

    return ok({ deleted: true, id });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to delete project draft.", 500);
  }
};

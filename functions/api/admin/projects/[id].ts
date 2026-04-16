import { error, json, readJson, requireAdmin } from "../../../_lib/http";
import { getDraft, logEvent, mapDraft } from "../../../_lib/db";
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
    const content = parseDraftContent(input);
    const status = input.status === "ready" ? "ready" : "draft";
    const now = new Date().toISOString();

    await env.DB.prepare(
      "UPDATE project_drafts SET slug = ?, title = ?, category = ?, status = ?, content_json = ?, updated_at = ? WHERE id = ?"
    )
      .bind(content.slug, content.title, content.category, status, JSON.stringify(content), now, id)
      .run();

    await logEvent(env, "project_draft", id, "updated", { status });

    const row = await env.DB.prepare("SELECT * FROM project_drafts WHERE id = ?").bind(id).first();
    return json({ ok: true, project: mapDraft(row as Parameters<typeof mapDraft>[0]) });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update project draft.");
  }
};

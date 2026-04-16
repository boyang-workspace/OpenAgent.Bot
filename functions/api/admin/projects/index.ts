import { error, json, requireAdmin } from "../../../_lib/http";
import { mapDraft } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const result = await env.DB.prepare("SELECT * FROM project_drafts ORDER BY updated_at DESC LIMIT 100").all();
  if (!result.success) return error(result.error ?? "Failed to load project drafts.", 500);

  return json({
    ok: true,
    projects: (result.results ?? []).map((row) => mapDraft(row as Parameters<typeof mapDraft>[0]))
  });
};

import { error, json, requireAdmin } from "../../../_lib/http";
import { mapEvent } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const result = await env.DB.prepare("SELECT * FROM admin_events ORDER BY created_at DESC LIMIT 100").all();
    return json({
      ok: true,
      events: (result.results ?? []).map((row: unknown) => mapEvent(row as Parameters<typeof mapEvent>[0]))
    });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to load admin events.", 500);
  }
};

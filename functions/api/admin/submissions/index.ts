import { error, json, requireAdmin } from "../../../_lib/http";
import { mapSubmission } from "../../../_lib/db";
import type { Env } from "../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const where = status ? "WHERE status = ?" : "";
  const statement = env.DB.prepare(`SELECT * FROM submissions ${where} ORDER BY created_at DESC LIMIT 100`);
  const result = status ? await statement.bind(status).all() : await statement.all();

  if (!result.success) return error(result.error ?? "Failed to load submissions.", 500);

  return json({
    ok: true,
    submissions: (result.results ?? []).map((row) => mapSubmission(row as Parameters<typeof mapSubmission>[0]))
  });
};

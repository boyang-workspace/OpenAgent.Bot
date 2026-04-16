import { listPublishedProjects } from "../../../../_lib/github";
import { error, json, requireAdmin } from "../../../../_lib/http";
import type { Env } from "../../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    return json({ ok: true, projects: await listPublishedProjects(env) });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to load published projects.", 500);
  }
};

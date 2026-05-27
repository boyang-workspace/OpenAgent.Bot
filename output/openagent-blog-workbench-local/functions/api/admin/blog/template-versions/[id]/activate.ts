import { error, json, requireAdmin } from "../../../../../_lib/http";
import { activateTemplateVersion } from "../../../../../_lib/blog-workbench";
import type { Env } from "../../../../../_lib/types";

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const template = await activateTemplateVersion(env, String(params.id ?? ""));
  if (!template) return error("Template version not found.", 404);
  return json({ ok: true, template });
};

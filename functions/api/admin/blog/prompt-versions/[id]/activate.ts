import { error, json, requireAdmin } from "../../../../../_lib/http";
import { activatePromptVersion } from "../../../../../_lib/blog-workbench";
import type { Env } from "../../../../../_lib/types";

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const prompt = await activatePromptVersion(env, String(params.id ?? ""));
  if (!prompt) return error("Prompt version not found.", 404);
  return json({ ok: true, prompt });
};

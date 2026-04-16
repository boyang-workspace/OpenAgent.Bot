import { error, ok, requireAdmin } from "../../../../_lib/http";
import { getDraft } from "../../../../_lib/db";
import { isLive } from "../../../../_lib/github";
import type { Env } from "../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const id = String(params.id ?? "");
  const draft = await getDraft(env, id);
  if (!draft) return error("Project draft not found.", 404);

  const deployed = await isLive(env, draft);
  if (deployed) {
    await env.DB.prepare("UPDATE project_drafts SET publish_status = 'succeeded', deployed_at = ?, updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), new Date().toISOString(), id)
      .run();
  }

  return ok({ deployed, publishStatus: deployed ? "succeeded" : draft.publishStatus ?? "deploying" });
};

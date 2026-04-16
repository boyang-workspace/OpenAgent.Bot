import { error, ok, requireAdmin } from "../../../../_lib/http";
import { createPublishPr } from "../../../../_lib/github";
import { getDraft, logEvent } from "../../../../_lib/db";
import type { Env } from "../../../../_lib/types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const draft = await getDraft(env, id);
    if (!draft) return error("Project draft not found.", 404);
    if (draft.status === "pr_created") return error("A publish PR already exists for this draft.", 409);

    const pr = await createPublishPr(env, draft);
    const now = new Date().toISOString();
    await env.DB.prepare("UPDATE project_drafts SET status = 'pr_created', pr_url = ?, pr_number = ?, updated_at = ? WHERE id = ?")
      .bind(pr.url, pr.number, now, id)
      .run();
    await logEvent(env, "project_draft", id, "publish_pr_created", pr);

    return ok({ prUrl: pr.url, prNumber: pr.number });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to create publish PR.", 500);
  }
};

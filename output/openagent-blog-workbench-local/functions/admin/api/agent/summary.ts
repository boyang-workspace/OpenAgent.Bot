import { error, json, requireAdmin } from "../../../_lib/http";
import type { Env } from "../../../_lib/types";

async function count(env: Env, table: string, status?: string): Promise<number> {
  const sql = status ? `SELECT COUNT(*) AS count FROM ${table} WHERE status = ?` : `SELECT COUNT(*) AS count FROM ${table}`;
  const query = env.DB.prepare(sql);
  const row = status ? await query.bind(status).first<{ count: number }>() : await query.first<{ count: number }>();
  return row?.count ?? 0;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const newSubmissions = await count(env, "submissions", "new");
    const convertedSubmissions = await count(env, "submissions", "converted");
    const draftProjects = await count(env, "project_drafts", "draft");
    const readyProjects = await count(env, "project_drafts", "ready");
    const openPrs = await count(env, "project_drafts", "pr_created");

    return json({
      ok: true,
      summary: {
        newSubmissions,
        convertedSubmissions,
        draftProjects,
        readyProjects,
        openPrs,
        risks: [
          ...(readyProjects ? [`${readyProjects} ready draft(s) can create publish PRs.`] : []),
          ...(openPrs ? [`${openPrs} publish PR(s) need GitHub review or merge.`] : [])
        ],
        nextActions: [
          ...(newSubmissions ? ["Review new submissions"] : []),
          ...(draftProjects ? ["Complete draft metadata and SEO fields"] : []),
          ...(readyProjects ? ["Create publish PRs"] : []),
          ...(openPrs ? ["Check publishing PR status"] : [])
        ]
      }
    });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to load agent summary.", 500);
  }
};

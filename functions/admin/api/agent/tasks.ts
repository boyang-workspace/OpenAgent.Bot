import { error, json, requireAdmin } from "../../../_lib/http";
import { mapDraft, mapSubmission } from "../../../_lib/db";
import type { AgentTask, Env } from "../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const submissionRows = await env.DB.prepare("SELECT * FROM submissions WHERE status IN ('new', 'reviewing') ORDER BY created_at DESC LIMIT 50").all();
    const draftRows = await env.DB.prepare("SELECT * FROM project_drafts WHERE status IN ('draft', 'ready', 'pr_created') ORDER BY updated_at DESC LIMIT 50").all();
    const submissions = (submissionRows.results ?? []).map((row: unknown) => mapSubmission(row as Parameters<typeof mapSubmission>[0]));
    const drafts = (draftRows.results ?? []).map((row: unknown) => mapDraft(row as Parameters<typeof mapDraft>[0]));

    const tasks: AgentTask[] = [
      ...submissions.map((submission) => ({
        id: `convert-submission:${submission.id}`,
        type: "review_submission" as const,
        title: `Review ${submission.projectName}`,
        entityType: "submission" as const,
        entityId: submission.id,
        recommendedAction: "Convert to a project draft or reject as duplicate/no fit.",
        riskLevel: "low" as const,
        nextEndpoint: `/admin/api/agent/tasks/convert-submission:${submission.id}/run`
      })),
      ...drafts.map((draft) => {
        if (draft.status === "ready") {
          return {
            id: `create-publish-pr:${draft.id}`,
            type: "create_publish_pr" as const,
            title: `Create publish PR for ${draft.title}`,
            entityType: "project_draft" as const,
            entityId: draft.id,
            recommendedAction: "Dry-run publish preview, then create a GitHub PR.",
            riskLevel: "medium" as const,
            nextEndpoint: `/admin/api/agent/tasks/create-publish-pr:${draft.id}/run`
          };
        }
        if (draft.status === "pr_created") {
          return {
            id: `check-publish-pr:${draft.id}`,
            type: "check_publish_pr" as const,
            title: `Check PR for ${draft.title}`,
            entityType: "project_draft" as const,
            entityId: draft.id,
            recommendedAction: "Open the GitHub PR and verify merge/deploy status.",
            riskLevel: "low" as const,
            nextEndpoint: `/admin/api/projects/${draft.id}`
          };
        }
        return {
          id: `complete-draft:${draft.id}`,
          type: "complete_draft" as const,
          title: `Complete draft for ${draft.title}`,
          entityType: "project_draft" as const,
          entityId: draft.id,
          recommendedAction: "Fill missing editorial and SEO fields, then mark ready.",
          riskLevel: "medium" as const,
          nextEndpoint: `/admin/projects?id=${draft.id}`
        };
      })
    ];

    return json({ ok: true, tasks });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to load agent tasks.", 500);
  }
};

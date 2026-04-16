import { error, readJson, requireAdmin } from "../../../../../_lib/http";
import type { Env } from "../../../../../_lib/types";
import { onRequestPost as convertSubmission } from "../../../../../api/admin/submissions/[id]/convert";
import { onRequestPost as createPublishPr } from "../../../../../api/admin/projects/[id]/publish-pr";

function taskParts(raw: string): { action: string; entityId: string } {
  const [action, ...rest] = raw.split(":");
  return { action, entityId: rest.join(":") };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const blocked = requireAdmin(context.request, context.env);
  if (blocked) return blocked;

  const rawId = String(context.params.id ?? "");
  const { action, entityId } = taskParts(rawId);
  const body = await readJson(context.request).catch(() => ({} as Record<string, unknown>));
  const dryRun = body.dryRun === true;
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : `${rawId}:${dryRun ? "dry" : "run"}`;
  const url = new URL(context.request.url);
  if (dryRun) url.searchParams.set("dryRun", "true");

  const request = new Request(url.toString(), {
    method: "POST",
    headers: {
      ...Object.fromEntries(context.request.headers.entries()),
      "content-type": "application/json",
      "x-openagent-actor": "automation"
    },
    body: JSON.stringify({ ...body, dryRun, idempotencyKey })
  });

  if (action === "convert-submission") {
    return convertSubmission({ ...context, request, params: { id: entityId } });
  }
  if (action === "create-publish-pr") {
    return createPublishPr({ ...context, request, params: { id: entityId } });
  }

  return error("This agent task is not executable yet.", 400);
};

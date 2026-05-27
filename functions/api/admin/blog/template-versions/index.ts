import { error, json, readJson, requireAdmin } from "../../../../_lib/http";
import { createTemplateVersion, listTemplateVersions } from "../../../../_lib/blog-workbench";
import type { Env, TemplateVersionKind } from "../../../../_lib/types";

function parseKind(value: unknown): TemplateVersionKind | undefined {
  return value === "blog-outline" ? value : undefined;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  return json({ ok: true, templates: await listTemplateVersions(env, kind) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const input = await readJson(request);
    const kind = parseKind(input.kind);
    const content = typeof input.content === "string" ? input.content.trim() : "";
    if (!kind || !content) return error("Template kind and content are required.");
    const template = await createTemplateVersion(env, { kind, content, activate: input.activate === true });
    return json({ ok: true, template }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to create template version.", 400);
  }
};

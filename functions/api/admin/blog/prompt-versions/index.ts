import { error, json, readJson, requireAdmin } from "../../../../_lib/http";
import { createPromptVersion, listPromptVersions } from "../../../../_lib/blog-workbench";
import type { Env, PromptVersionKind } from "../../../../_lib/types";

function parseKind(value: unknown): PromptVersionKind | undefined {
  return value === "topic-generation" ||
    value === "evidence-summarization" ||
    value === "outline-generation" ||
    value === "draft-generation" ||
    value === "reviewer" ||
    value === "quality-thresholds"
    ? value
    : undefined;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  return json({ ok: true, prompts: await listPromptVersions(env, kind) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const input = await readJson(request);
    const kind = parseKind(input.kind);
    const content = typeof input.content === "string" ? input.content.trim() : "";
    if (!kind || !content) return error("Prompt kind and content are required.");
    const prompt = await createPromptVersion(env, {
      kind,
      content,
      config: typeof input.config === "object" && input.config && !Array.isArray(input.config) ? (input.config as Record<string, unknown>) : undefined,
      activate: input.activate === true
    });
    return json({ ok: true, prompt }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to create prompt version.", 400);
  }
};

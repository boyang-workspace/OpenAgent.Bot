import { error, json, readJson, requireAdmin } from "../../../../_lib/http";
import {
  buildReviewFromDraft,
  generateDebugOutline,
  generateDraftFromTopic,
  generateDraftFromTopicWithLocalModel,
  generateOutlineWithLocalModel,
  getActivePromptVersion,
  getActiveTemplateVersion,
  listDebugRuns,
  reviewDraftWithLocalModel,
  saveDebugRun
} from "../../../../_lib/blog-workbench";
import { getBlogDraft, mapBlogTopic } from "../../../../_lib/db";
import { getConfiguredLocalModel } from "../../../../_lib/app-settings";
import type { DebugRunAction, Env } from "../../../../_lib/types";

function parseAction(value: string): DebugRunAction | undefined {
  return value === "outline" || value === "draft" || value === "review" ? value : undefined;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;
  return json({ ok: true, runs: await listDebugRuns(env) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const action = parseAction(String(params.action ?? ""));
    if (!action) return error("Unknown debug action.", 404);
    const input = await readJson(request);
    const topicId = typeof input.topicId === "string" ? input.topicId : undefined;
    const draftId = typeof input.draftId === "string" ? input.draftId : undefined;
    const model = typeof input.model === "string" && input.model.trim() ? input.model.trim() : await getConfiguredLocalModel(env);
    const promptVersion = await getActivePromptVersion(env, action === "review" ? "reviewer" : action === "outline" ? "outline-generation" : "draft-generation");
    const templateVersion = await getActiveTemplateVersion(env, "blog-outline");

    if (!topicId && !draftId) return error("Provide a topicId or draftId for debugging.", 400);

    let artifactsRef: Record<string, unknown>;
    if (action === "review") {
      const draft = draftId ? await getBlogDraft(env, draftId) : undefined;
      if (!draft) return error("Draft not found.", 404);
      try {
        const local = await reviewDraftWithLocalModel(env, draft, { model, promptVersionId: promptVersion?.id });
        artifactsRef = {
          prompt: local.debug.prompt,
          input: draft.content,
          output: local.review,
          rawResponse: local.debug.rawText
        };
      } catch (caught) {
        artifactsRef = {
          prompt: promptVersion?.content,
          input: draft.content,
          output: buildReviewFromDraft(draft),
          error: caught instanceof Error ? caught.message : "Local model unavailable."
        };
      }
    } else {
      const topicRow = topicId
        ? await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(topicId).first()
        : draftId
          ? await env.DB.prepare("SELECT t.* FROM blog_drafts d JOIN blog_topics t ON d.topic_id = t.id WHERE d.id = ?").bind(draftId).first()
          : undefined;
      if (!topicRow) return error("Topic not found for debug run.", 404);
      const topic = mapBlogTopic(topicRow as Parameters<typeof mapBlogTopic>[0]);
      if (action === "outline") {
        try {
          const local = await generateOutlineWithLocalModel(env, topic, {
            model,
            promptVersionId: promptVersion?.id,
            templateContent: templateVersion?.content
          });
          artifactsRef = {
            prompt: local.debug.prompt,
            template: local.debug.template,
            input: topic,
            output: local.outline,
            rawResponse: local.debug.rawText
          };
        } catch (caught) {
          artifactsRef = {
            prompt: promptVersion?.content,
            template: templateVersion?.content,
            input: topic,
            output: generateDebugOutline(templateVersion?.content ?? "", topic),
            error: caught instanceof Error ? caught.message : "Local model unavailable."
          };
        }
      } else {
        try {
          const local = await generateDraftFromTopicWithLocalModel(env, topic, {
            model,
            promptVersionId: promptVersion?.id,
            templateVersionId: templateVersion?.id,
            templateContent: templateVersion?.content
          });
          artifactsRef = {
            prompt: local.debug.prompt,
            template: templateVersion?.content,
            input: topic,
            output: local.draft,
            rawResponse: local.debug.rawText
          };
        } catch (caught) {
          const generatedDraft = generateDraftFromTopic(topic, templateVersion?.content ?? "");
          artifactsRef = {
            prompt: promptVersion?.content,
            template: templateVersion?.content,
            input: topic,
            output: generatedDraft,
            error: caught instanceof Error ? caught.message : "Local model unavailable."
          };
        }
      }
    }

    const run = await saveDebugRun(env, {
      action,
      model,
      promptVersionId: promptVersion?.id,
      templateVersionId: templateVersion?.id,
      sourceTopicId: topicId,
      sourceDraftId: draftId,
      artifactsRef
    });
    return json({ ok: true, run, preview: artifactsRef });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Debug run failed.", 400);
  }
};

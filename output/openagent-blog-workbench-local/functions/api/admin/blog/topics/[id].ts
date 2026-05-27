import { actorFromRequest, error, json, readJson, requireAdmin } from "../../../../_lib/http";
import { logEvent, mapBlogTopic } from "../../../../_lib/db";
import { buildTopicWarnings } from "../../../../_lib/blog-workbench";
import type { BlogTopicLane, Env } from "../../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const row = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(String(params.id ?? "")).first();
  if (!row) return error("Blog topic not found.", 404);
  const topic = mapBlogTopic(row as Parameters<typeof mapBlogTopic>[0]);
  const peers = await env.DB.prepare("SELECT id, title, primary_keyword FROM blog_topics WHERE id <> ? ORDER BY created_at DESC LIMIT 200")
    .bind(topic.id)
    .all();
  return json({
    ok: true,
    topic: {
      ...topic,
      warnings: buildTopicWarnings(topic, (peers.results ?? []).map((peer: unknown) => ({
        id: String((peer as { id: string }).id),
        title: String((peer as { title: string }).title),
        primaryKeyword: String((peer as { primary_keyword: string }).primary_keyword)
      })))
    }
  });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const existingRow = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(id).first();
    if (!existingRow) return error("Blog topic not found.", 404);
    const existing = mapBlogTopic(existingRow as Parameters<typeof mapBlogTopic>[0]);
    const input = await readJson(request);
    const lane = input.lane === "trend" || input.lane === "comparison" || input.lane === "evergreen" ? (input.lane as BlogTopicLane) : existing.lane;
    const title = typeof input.title === "string" ? input.title.trim() : existing.title;
    const angle = typeof input.angle === "string" ? input.angle.trim() : existing.angle;
    const primaryKeyword = typeof input.primaryKeyword === "string" ? input.primaryKeyword.trim() : existing.primaryKeyword;
    const searchIntent = typeof input.searchIntent === "string" ? input.searchIntent.trim() : existing.searchIntent;
    const priority = input.promote === true ? existing.priority + 10 : Number.isFinite(Number(input.priority)) ? Number(input.priority) : existing.priority;
    const notes = typeof input.notes === "string" ? input.notes.trim() : existing.notes ?? "";
    const manualOverride = input.manualOverride === undefined ? existing.manualOverride : input.manualOverride === true;
    const sourceSignals = Array.isArray(input.sourceLinks)
      ? input.sourceLinks
          .filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item: string) => item.trim())
      : existing.sourceSignals;
    const status = input.status === "drafted" || input.status === "ignored" || input.status === "new" ? input.status : existing.status;

    if (!title || !angle || !primaryKeyword || !searchIntent) return error("Title, angle, primary keyword, and search intent are required.");

    await env.DB.prepare(
      `UPDATE blog_topics
       SET lane = ?, priority = ?, title = ?, angle = ?, primary_keyword = ?, search_intent = ?,
           source_signals_json = ?, status = ?, notes = ?, manual_override = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(
        lane,
        priority,
        title,
        angle,
        primaryKeyword,
        searchIntent,
        JSON.stringify(sourceSignals),
        status,
        notes || null,
        manualOverride ? 1 : 0,
        new Date().toISOString(),
        id
      )
      .run();

    const row = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(id).first();
    const topic = mapBlogTopic(row as Parameters<typeof mapBlogTopic>[0]);
    const peers = await env.DB.prepare("SELECT id, title, primary_keyword FROM blog_topics WHERE id <> ? ORDER BY created_at DESC LIMIT 200")
      .bind(topic.id)
      .all();
    const warnings = buildTopicWarnings(topic, (peers.results ?? []).map((peer: unknown) => ({
      id: String((peer as { id: string }).id),
      title: String((peer as { title: string }).title),
      primaryKeyword: String((peer as { primary_keyword: string }).primary_keyword)
    })));
    await logEvent(env, "blog_topic", id, "updated", { actor: actorFromRequest(request), before: existing, after: topic, result: { warnings } });
    return json({ ok: true, topic: { ...topic, warnings } });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update blog topic.", 400);
  }
};

import { actorFromRequest, error, json, readJson, requireAdmin } from "../../../../_lib/http";
import { logEvent, mapBlogTopic } from "../../../../_lib/db";
import { buildTopicWarnings } from "../../../../_lib/blog-workbench";
import type { BlogTopicLane, Env } from "../../../../_lib/types";
import { slugifyBlog } from "../../../../../src/lib/content/blog-automation";

function parseManualTopic(input: Record<string, unknown>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const angle = typeof input.angle === "string" ? input.angle.trim() : "";
  const primaryKeyword = typeof input.primaryKeyword === "string" ? input.primaryKeyword.trim() : "";
  const searchIntent = typeof input.searchIntent === "string" ? input.searchIntent.trim() : "";
  const lane = input.lane === "trend" || input.lane === "comparison" || input.lane === "evergreen" ? (input.lane as BlogTopicLane) : "trend";
  const date = typeof input.date === "string" && input.date.trim() ? input.date.trim() : new Date().toISOString().slice(0, 10);
  const priority = Number.isFinite(Number(input.priority)) ? Number(input.priority) : 100;
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const sourceLinks = Array.isArray(input.sourceLinks)
    ? input.sourceLinks
        .filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item: string) => item.trim())
    : [];
  const manualOverride = input.manualOverride === true;

  if (!title || !angle || !primaryKeyword || !searchIntent) throw new Error("Title, angle, primary keyword, and search intent are required.");

  return {
    id: `manual:${date}:${slugifyBlog(title)}`,
    date,
    lane,
    sourceType: "manual" as const,
    priority,
    title,
    angle,
    primaryKeyword,
    searchIntent,
    sourceSignals: sourceLinks,
    score: 100 + Math.max(0, priority),
    status: "new" as const,
    notes,
    manualOverride
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const payload = parseManualTopic(await readJson(request));
    const peers = await env.DB.prepare("SELECT id, title, primary_keyword FROM blog_topics ORDER BY created_at DESC LIMIT 200").all();
    const warnings = buildTopicWarnings(
      payload,
      (peers.results ?? []).map((peer) => ({
        id: String((peer as { id: string }).id),
        title: String((peer as { title: string }).title),
        primaryKeyword: String((peer as { primary_keyword: string }).primary_keyword)
      }))
    );
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT OR REPLACE INTO blog_topics (
        id, date, lane, source_type, priority, title, angle, primary_keyword, search_intent,
        source_signals_json, score, status, notes, manual_override, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM blog_topics WHERE id = ?), ?), ?)`
    )
      .bind(
        payload.id,
        payload.date,
        payload.lane,
        payload.sourceType,
        payload.priority,
        payload.title,
        payload.angle,
        payload.primaryKeyword,
        payload.searchIntent,
        JSON.stringify(payload.sourceSignals),
        payload.score,
        payload.status,
        payload.notes || null,
        payload.manualOverride ? 1 : 0,
        payload.id,
        now,
        now
      )
      .run();

    const row = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(payload.id).first();
    const topic = row ? mapBlogTopic(row as Parameters<typeof mapBlogTopic>[0]) : undefined;
    await logEvent(env, "blog_topic", payload.id, "manual_created", { actor: actorFromRequest(request), after: payload, result: { warnings } });
    return json({ ok: true, topic: topic ? { ...topic, warnings } : undefined }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to create manual blog topic.", 400);
  }
};

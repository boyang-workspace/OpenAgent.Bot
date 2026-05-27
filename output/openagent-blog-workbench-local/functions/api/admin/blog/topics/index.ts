import { error, json, requireAdmin } from "../../../../_lib/http";
import { mapBlogTopic } from "../../../../_lib/db";
import { buildTopicWarnings } from "../../../../_lib/blog-workbench";
import type { Env } from "../../../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const query = date
    ? "SELECT * FROM blog_topics WHERE date = ? ORDER BY priority DESC, score DESC, created_at DESC LIMIT 100"
    : "SELECT * FROM blog_topics ORDER BY date DESC, priority DESC, score DESC LIMIT 100";
  const statement = date ? env.DB.prepare(query).bind(date) : env.DB.prepare(query);
  const result = await statement.all();
  if (!result.success) return error(result.error ?? "Failed to load blog topics.", 500);

  const topics = (result.results ?? []).map((row) => mapBlogTopic(row as Parameters<typeof mapBlogTopic>[0]));

  return json({
    ok: true,
    topics: topics.map((topic) => ({
      ...topic,
      warnings: buildTopicWarnings(
        topic,
        topics.filter((peer) => peer.id !== topic.id).map((peer) => ({ id: peer.id, title: peer.title, primaryKeyword: peer.primaryKeyword }))
      )
    }))
  });
};

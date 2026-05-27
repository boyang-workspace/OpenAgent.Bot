import { actorFromRequest, error, json, readJson, requireAdmin } from "../../../../_lib/http";
import { logEvent, mapBlogTopic } from "../../../../_lib/db";
import type { BlogTopicLane, Env } from "../../../../_lib/types";
import { slugifyBlog } from "../../../../../src/lib/content/blog-automation";

const lanes: BlogTopicLane[] = ["trend", "comparison", "evergreen"];

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function topicSeed(date: string, lane: BlogTopicLane, index: number) {
  const topicMap = {
    trend: [
      ["New open-source AI agents worth tracking", "Track new open-source agent projects and explain which ones deserve builder attention.", "open-source AI agents"],
      ["Browser agents moving from demos to workflows", "Compare browser-agent projects by practical workflow readiness.", "browser agents workflow automation"],
      ["Open-source AI tools with real developer adoption", "Turn discovery signals into a practical shortlist for builders.", "open-source AI tools"]
    ],
    comparison: [
      ["Best open-source browser agents for workflow automation", "Compare browser agents by setup, reliability, action surface, and safety model.", "best open-source browser agents"],
      ["Open-source AI memory systems compared", "Help builders choose between memory systems for agent context and retrieval.", "open-source AI memory systems"],
      ["Open-source alternatives to hosted AI agent platforms", "Compare open projects against hosted agent platforms for developer control.", "open-source AI agent alternatives"]
    ],
    evergreen: [
      ["How to choose an open-source AI agent stack", "Explain models, tools, memory, browser action, and review loops for builders.", "open-source AI agent stack"],
      ["What MCP means for open AI workflows", "Explain MCP as a practical integration layer for agent builders.", "MCP open AI workflows"],
      ["Local-first AI agents: what builders should evaluate", "Explain when local-first agents matter and what tradeoffs to check.", "local-first AI agents"]
    ]
  } satisfies Record<BlogTopicLane, string[][]>;
  const selected = topicMap[lane][index % topicMap[lane].length];
  return {
    id: `${date}:${lane}:${slugifyBlog(selected[0])}`,
    date,
    lane,
    title: selected[0],
    angle: selected[1],
    primaryKeyword: selected[2],
    searchIntent: `Readers want a practical decision guide for ${selected[2]}, with source links, comparisons, and OpenAgent next steps.`,
    sourceSignals: ["/agents", "/memory-systems", "/skills", "https://github.com/trending?spoken_language_code=en"],
    score: lane === "comparison" ? 92 - index : lane === "trend" ? 86 - index : 78 - index,
    status: "new" as const
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const input: Record<string, unknown> = await readJson(request).catch(() => ({}));
    const date = typeof input.date === "string" ? input.date : todayString();
    const requestedLane = typeof input.lane === "string" && lanes.includes(input.lane as BlogTopicLane) ? (input.lane as BlogTopicLane) : undefined;
    const selectedLanes = requestedLane ? [requestedLane] : lanes;
    const now = new Date().toISOString();
    const actor = actorFromRequest(request);
    const topics = selectedLanes.flatMap((lane) => [0, 1, 2].map((index) => topicSeed(date, lane, index))).slice(0, 9);

    for (const topic of topics) {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO blog_topics (
          id, date, lane, source_type, priority, title, angle, primary_keyword, search_intent,
          source_signals_json, score, status, notes, manual_override, created_at, updated_at
        ) VALUES (?, ?, ?, 'auto', 0, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)`
      )
        .bind(
          topic.id,
          topic.date,
          topic.lane,
          topic.title,
          topic.angle,
          topic.primaryKeyword,
          topic.searchIntent,
          JSON.stringify(topic.sourceSignals),
          topic.score,
          topic.status,
          now,
          now
        )
        .run();
    }

    await logEvent(env, "blog_topic", date, "generated", { actor, result: { count: topics.length, lane: requestedLane ?? "all" } });
    const result = await env.DB.prepare("SELECT * FROM blog_topics WHERE date = ? ORDER BY score DESC, created_at DESC").bind(date).all();
    return json({
      ok: true,
      topics: (result.results ?? []).map((row) => mapBlogTopic(row as Parameters<typeof mapBlogTopic>[0]))
    });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to generate blog topics.", 500);
  }
};

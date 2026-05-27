import { actorFromRequest, error, json, requireAdmin } from "../../../../../_lib/http";
import { generateDraftFromTopicWithLocalModel, getActivePromptVersion, getActiveTemplateVersion } from "../../../../../_lib/blog-workbench";
import { logEvent, mapBlogDraft, mapBlogTopic } from "../../../../../_lib/db";
import { parseBlogDraftPayload } from "../../../../../_lib/blog-validation";
import type { BlogTopic, Env } from "../../../../../_lib/types";
import { slugifyBlog } from "../../../../../../src/lib/content/blog-automation";

function draftForTopic(topic: BlogTopic) {
  const slug = slugifyBlog(topic.title);
  const sourceLinks = [
    "https://github.com/trending?spoken_language_code=en",
    "https://news.ycombinator.com/",
    "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
  ];
  const body = [
    `**${topic.title} is a decision problem, not just a list of links.** If you are searching for ${topic.primaryKeyword}, start by checking whether each project solves your real workflow, has current source activity, and exposes enough documentation to evaluate safely.`,
    topic.angle,
    "## Quick recommendation",
    "| Need | Start with | Why |",
    "|---|---|---|",
    "| Agent workflow discovery | [OpenAgent agents](/agents) | Start from curated open-source agent profiles |",
    "| Memory and context options | [OpenAgent memory systems](/memory-systems) | Compare long-term context projects before adopting one |",
    "| Reusable agent procedures | [OpenAgent skills](/skills) | Find skill systems and workflow packaging ideas |",
    "## Comparison criteria",
    "| Criteria | What to check | Why it matters |",
    "|---|---|---|",
    "| Source activity | Stars, releases, commits, and issue health | Active projects are easier to evaluate and safer to recommend |",
    "| Setup path | README, docs, examples, and install commands | A tool that cannot be tested quickly is harder to adopt |",
    "| Action surface | Browser, code, memory, tools, or protocols | The failure modes depend on what the agent can touch |",
    "| Review model | Logs, permissions, sandboxes, and rollback | Human review is still the quality control layer |",
    "## Source checks",
    `Use official and primary sources first: [GitHub Trending](${sourceLinks[0]}), [Hacker News](${sourceLinks[1]}), and [Google's helpful content guidance](${sourceLinks[2]}). Treat launch posts as signals, not proof.`,
    "## OpenAgent next step",
    "Use the directory as a shortlist, then open the official repository or docs for any project that looks promising. The useful question is not whether a project is popular. The useful question is whether its action surface, setup path, and failure modes match your workflow.",
    "## FAQ",
    `### What is the best way to evaluate ${topic.primaryKeyword}?`,
    "Start with the official source, then compare setup difficulty, maintenance, examples, and fit for your workflow.",
    "### Should this be published automatically?",
    "No. This draft needs source verification, stronger examples, and human editorial review before publishing.",
    "### How does OpenAgent help?",
    "OpenAgent keeps curated resource pages, category pages, and source links in one place so builders can compare before committing to a tool.",
    "### What should be verified before publishing?",
    "Verify claims about license, setup, project status, and capabilities against official repositories or docs."
  ].join("\n\n");

  return {
    slug,
    title: topic.title,
    summary: topic.angle,
    publishedAt: topic.date,
    tags: [topic.lane, "open-source", "ai-agents"],
    author: "OpenAgent.bot Editors",
    body,
    seoTitle: `${topic.title} | OpenAgent.bot`.slice(0, 80),
    seoDescription: topic.searchIntent.slice(0, 180),
    targetKeyword: topic.primaryKeyword,
    searchIntent: topic.searchIntent,
    sourceLinks
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const id = String(params.id ?? "");
    const topicRow = await env.DB.prepare("SELECT * FROM blog_topics WHERE id = ?").bind(id).first();
    if (!topicRow) return error("Blog topic not found.", 404);

    const topic = mapBlogTopic(topicRow as Parameters<typeof mapBlogTopic>[0]);
    const duplicateRow = await env.DB.prepare(
      "SELECT id, title, primary_keyword FROM blog_topics WHERE id <> ? AND (lower(title) = lower(?) OR lower(primary_keyword) = lower(?)) LIMIT 1"
    )
      .bind(topic.id, topic.title, topic.primaryKeyword)
      .first<{ id: string }>();
    if (duplicateRow && !topic.manualOverride) {
      return error("Potential duplicate topic detected. Enable manual override or adjust the title/keyword before drafting.", 409);
    }
    let generated = draftForTopic(topic);
    let generationDebug: Record<string, unknown> = {
      provider: "fallback",
      reason: "template-seed"
    };
    try {
      const local = await generateDraftFromTopicWithLocalModel(env, topic, {
        promptVersionId: (await getActivePromptVersion(env, "draft-generation"))?.id,
        templateVersionId: (await getActiveTemplateVersion(env, "blog-outline"))?.id
      });
      generated = {
        ...local.draft,
        seoTitle: local.draft.seoTitle ?? `${topic.title} | OpenAgent.bot`,
        seoDescription: local.draft.seoDescription ?? topic.searchIntent,
        targetKeyword: topic.primaryKeyword,
        searchIntent: topic.searchIntent,
        sourceLinks: topic.sourceSignals.filter((link) => /^https?:/i.test(link)).slice(0, 3)
      };
      generationDebug = local.debug;
    } catch (caught) {
      generationDebug = {
        provider: "fallback",
        error: caught instanceof Error ? caught.message : "Local model unavailable."
      };
    }
    const payload = parseBlogDraftPayload(generated);
    if (!payload.qualityReport.passed) return error(`Generated draft failed quality gate: ${payload.qualityReport.issues.join(" ")}`, 422);

    const existing = await env.DB.prepare("SELECT * FROM blog_drafts WHERE slug = ?").bind(payload.content.slug).first();
    if (existing) return json({ ok: true, duplicate: true, draft: mapBlogDraft(existing as Parameters<typeof mapBlogDraft>[0]) });

    const now = new Date().toISOString();
    const draftId = crypto.randomUUID();
    const promptVersion = await getActivePromptVersion(env, "draft-generation");
    const templateVersion = await getActiveTemplateVersion(env, "blog-outline");
    await env.DB.prepare(
      `INSERT INTO blog_drafts (
        id, topic_id, slug, title, status, content_json, editable_content_json, target_keyword, search_intent,
        source_links_json, quality_report_json, review_report_json, approved_by_human, prompt_version_id,
        template_version_id, model_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`
    )
      .bind(
        draftId,
        topic.id,
        payload.content.slug,
        payload.content.title,
        JSON.stringify(payload.content),
        JSON.stringify(payload.content),
        payload.targetKeyword ?? null,
        payload.searchIntent ?? null,
        JSON.stringify(payload.sourceLinks),
        JSON.stringify(payload.qualityReport),
        JSON.stringify({
          summary: "Draft generated. Run review after editing or before approval.",
          blockingIssues: payload.qualityReport.issues,
          warnings: [
            generationDebug.provider === "ollama" ? "Generated with the local model writer." : "Generated from the deterministic fallback writer.",
            "Review manually before approval."
          ],
          checkedAt: payload.qualityReport.checkedAt,
          approvedByHuman: false
        }),
        promptVersion?.id ?? null,
        templateVersion?.id ?? null,
        "template-seed",
        now,
        now
      )
      .run();
    await env.DB.prepare("UPDATE blog_topics SET status = 'drafted', updated_at = ? WHERE id = ?").bind(now, topic.id).run();
    await logEvent(env, "blog_draft", draftId, "created_from_topic", {
      actor: actorFromRequest(request),
      metadata: { topicId: topic.id, generationDebug },
      after: payload
    });

    const row = await env.DB.prepare("SELECT * FROM blog_drafts WHERE id = ?").bind(draftId).first();
    return json({ ok: true, draft: mapBlogDraft(row as Parameters<typeof mapBlogDraft>[0]) }, { status: 201 });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to draft blog topic.", 500);
  }
};

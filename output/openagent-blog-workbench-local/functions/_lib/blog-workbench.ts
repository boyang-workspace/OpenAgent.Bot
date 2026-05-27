import type {
  BlogDraft,
  BlogPostContent,
  BlogReviewReport,
  BlogTopic,
  DebugRunAction,
  Env,
  PromptVersionKind,
  TemplateVersionKind
} from "./types";
import { buildBlogReviewReport, parseBlogDraftPayload } from "./blog-validation";
import { mapDebugRun, mapPromptVersion, mapTemplateVersion } from "./db";
import { defaultLocalModel, runLocalModelJson } from "./local-model";

const promptDefaults: Record<PromptVersionKind, { version: string; content: string; config: Record<string, unknown> }> = {
  "topic-generation": {
    version: "v1",
    content: [
      "You are the OpenAgent topic editor.",
      "Pick builder-relevant topics using current evidence, strong user intent, and low overlap with existing content.",
      "Return concise decision-oriented topics with title, angle, primary keyword, and search intent."
    ].join("\n\n"),
    config: { temperature: 0.1, maxTokens: 600 }
  },
  "evidence-summarization": {
    version: "v1",
    content: [
      "Summarize the evidence bundle for an OpenAgent editor.",
      "Separate verified facts from interpretation.",
      "Keep citations visible and avoid unsupported claims."
    ].join("\n\n"),
    config: { temperature: 0.1, maxTokens: 900 }
  },
  "outline-generation": {
    version: "v1",
    content: [
      "Generate a practical blog outline for OpenAgent.",
      "Use the active blog outline template.",
      "Every section should help a reader decide what to test next."
    ].join("\n\n"),
    config: { temperature: 0.15, maxTokens: 800 }
  },
  "draft-generation": {
    version: "v1",
    content: [
      "Write a decision-oriented OpenAgent draft.",
      "Follow the outline template, include direct source references, and keep a useful operator tone.",
      "Do not invent facts that are not present in the evidence bundle."
    ].join("\n\n"),
    config: { temperature: 0.25, maxTokens: 3200 }
  },
  reviewer: {
    version: "v1",
    content: [
      "Review the OpenAgent draft.",
      "Call out blocking issues separately from softer editorial warnings.",
      "Recommend publish only if the evidence, comparisons, and internal links are present."
    ].join("\n\n"),
    config: { temperature: 0.05, maxTokens: 1200 }
  },
  "quality-thresholds": {
    version: "v1",
    content: [
      "Structural checks:",
      "- At least 3 source links",
      "- At least 3 internal OpenAgent links",
      "- Comparison table or comparison block",
      "- FAQ section with questions",
      "- Distinct target keyword and search intent"
    ].join("\n"),
    config: { hardGate: true }
  }
};

const templateDefaults: Record<TemplateVersionKind, { version: string; content: string }> = {
  "blog-outline": {
    version: "v1",
    content: [
      "# OpenAgent Blog Outline",
      "- Quick recommendation",
      "- Comparison criteria",
      "- Source-grounded checks",
      "- Related OpenAgent resources",
      "- What to do next",
      "- FAQ"
    ].join("\n")
  }
};

export async function ensureBlogWorkbenchSeeds(env: Env): Promise<void> {
  const now = new Date().toISOString();
  for (const [kind, seed] of Object.entries(promptDefaults) as Array<[PromptVersionKind, (typeof promptDefaults)[PromptVersionKind]]>) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO prompt_versions (id, kind, version, content, config_json, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`
    )
      .bind(`prompt:${kind}:${seed.version}`, kind, seed.version, seed.content, JSON.stringify(seed.config), now)
      .run();
  }
  for (const [kind, seed] of Object.entries(templateDefaults) as Array<[TemplateVersionKind, (typeof templateDefaults)[TemplateVersionKind]]>) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO template_versions (id, kind, version, content, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`
    )
      .bind(`template:${kind}:${seed.version}`, kind, seed.version, seed.content, now)
      .run();
  }
}

export async function listPromptVersions(env: Env, kind?: PromptVersionKind) {
  await ensureBlogWorkbenchSeeds(env);
  const sql = kind
    ? "SELECT * FROM prompt_versions WHERE kind = ? ORDER BY kind ASC, is_active DESC, created_at DESC"
    : "SELECT * FROM prompt_versions ORDER BY kind ASC, is_active DESC, created_at DESC";
  const result = kind ? await env.DB.prepare(sql).bind(kind).all() : await env.DB.prepare(sql).all();
  return (result.results ?? []).map((row) => mapPromptVersion(row as Parameters<typeof mapPromptVersion>[0]));
}

export async function listTemplateVersions(env: Env, kind?: TemplateVersionKind) {
  await ensureBlogWorkbenchSeeds(env);
  const sql = kind
    ? "SELECT * FROM template_versions WHERE kind = ? ORDER BY kind ASC, is_active DESC, created_at DESC"
    : "SELECT * FROM template_versions ORDER BY kind ASC, is_active DESC, created_at DESC";
  const result = kind ? await env.DB.prepare(sql).bind(kind).all() : await env.DB.prepare(sql).all();
  return (result.results ?? []).map((row) => mapTemplateVersion(row as Parameters<typeof mapTemplateVersion>[0]));
}

export async function getActivePromptVersion(env: Env, kind: PromptVersionKind) {
  await ensureBlogWorkbenchSeeds(env);
  const row = await env.DB.prepare("SELECT * FROM prompt_versions WHERE kind = ? ORDER BY is_active DESC, created_at DESC LIMIT 1").bind(kind).first();
  return row ? mapPromptVersion(row as Parameters<typeof mapPromptVersion>[0]) : undefined;
}

export async function getActiveTemplateVersion(env: Env, kind: TemplateVersionKind) {
  await ensureBlogWorkbenchSeeds(env);
  const row = await env.DB.prepare("SELECT * FROM template_versions WHERE kind = ? ORDER BY is_active DESC, created_at DESC LIMIT 1").bind(kind).first();
  return row ? mapTemplateVersion(row as Parameters<typeof mapTemplateVersion>[0]) : undefined;
}

export function buildTopicWarnings(topic: Pick<BlogTopic, "sourceType" | "manualOverride" | "title" | "primaryKeyword">, peers: Array<Pick<BlogTopic, "id" | "title" | "primaryKeyword">> = []): string[] {
  const warnings: string[] = [];
  const titleLower = topic.title.toLowerCase();
  const keywordLower = topic.primaryKeyword.toLowerCase();
  if (peers.some((peer) => peer.title.toLowerCase() === titleLower)) warnings.push("Another topic already has the same title.");
  if (peers.some((peer) => peer.primaryKeyword.toLowerCase() === keywordLower)) warnings.push("Another topic already targets the same keyword.");
  if (topic.sourceType === "manual") warnings.push("Manual topic: keep because you explicitly added it.");
  if (topic.manualOverride) warnings.push("Manual override enabled. Duplicate warnings will not block draft generation.");
  return warnings;
}

function outlineSectionsFromTemplate(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim());
}

export function generateDebugOutline(templateContent: string, topic: Pick<BlogTopic, "title" | "angle" | "primaryKeyword">): { title: string; sections: string[] } {
  const sections = outlineSectionsFromTemplate(templateContent);
  return {
    title: `${topic.title} outline`,
    sections: sections.length ? sections : ["Quick recommendation", "Comparison criteria", "FAQ"]
  };
}

export function generateDraftFromTopic(topic: Pick<BlogTopic, "title" | "date" | "lane" | "angle" | "primaryKeyword" | "searchIntent" | "sourceSignals">, templateContent: string): BlogPostContent {
  const outline = generateDebugOutline(templateContent, topic);
  const sourceLinks = topic.sourceSignals.filter((link) => /^https?:/i.test(link)).slice(0, 3);
  const body = [
    `**${topic.title} should help a builder make a concrete decision.** Start with ${topic.primaryKeyword}, then narrow the comparison to the workflow that matters.`,
    topic.angle,
    ...outline.sections.map((section) => `## ${section}\n${section === "FAQ" ? "### What should be verified first?\nCheck the primary sources and workflow fit before publishing." : `Use this section to evaluate ${topic.primaryKeyword} with evidence and OpenAgent context.`}`),
    sourceLinks.length ? `Primary sources: ${sourceLinks.map((link) => `[source](${link})`).join(", ")}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    title: topic.title,
    summary: topic.angle,
    publishedAt: topic.date,
    tags: [topic.lane, "open-source", "ai-agents"],
    author: "OpenAgent.bot Editors",
    body,
    seoTitle: `${topic.title} | OpenAgent.bot`.slice(0, 80),
    seoDescription: topic.searchIntent.slice(0, 180)
  };
}

function sourceLinksForTopic(topic: Pick<BlogTopic, "sourceSignals">): string[] {
  return topic.sourceSignals.filter((link) => /^https?:/i.test(link)).slice(0, 3);
}

function outlinePrompt(topic: Pick<BlogTopic, "title" | "angle" | "primaryKeyword" | "searchIntent">, templateContent: string, promptContent: string): string {
  return [
    promptContent,
    "",
    "Return strict JSON with shape: {\"title\": string, \"sections\": string[]}.",
    `Topic title: ${topic.title}`,
    `Angle: ${topic.angle}`,
    `Primary keyword: ${topic.primaryKeyword}`,
    `Search intent: ${topic.searchIntent}`,
    "Template:",
    templateContent
  ].join("\n");
}

function draftPrompt(
  topic: Pick<BlogTopic, "title" | "date" | "lane" | "angle" | "primaryKeyword" | "searchIntent" | "sourceSignals">,
  templateContent: string,
  promptContent: string
): string {
  const sourceLinks = sourceLinksForTopic(topic);
  return [
    promptContent,
    "",
    "Return strict JSON with shape:",
    "{\"summary\": string, \"seoTitle\": string, \"seoDescription\": string, \"body\": string}",
    "The body must include these sections exactly once: Quick recommendation, Comparison criteria, FAQ.",
    "The body must include at least 3 internal OpenAgent links: /agents, /memory-systems, /skills.",
    "The body must include at least one markdown table and visible source links.",
    `Title: ${topic.title}`,
    `Angle: ${topic.angle}`,
    `Published date: ${topic.date}`,
    `Lane: ${topic.lane}`,
    `Primary keyword: ${topic.primaryKeyword}`,
    `Search intent: ${topic.searchIntent}`,
    `Source links: ${sourceLinks.join(", ") || "None"}`,
    "Template:",
    templateContent
  ].join("\n");
}

function reviewPrompt(draft: BlogDraft, promptContent: string): string {
  return [
    promptContent,
    "",
    "Return strict JSON with shape:",
    "{\"summary\": string, \"blockingIssues\": string[], \"warnings\": string[]}",
    "Blocking issues should only include publication blockers.",
    `Draft title: ${draft.title}`,
    `Target keyword: ${draft.targetKeyword ?? ""}`,
    `Search intent: ${draft.searchIntent ?? ""}`,
    `Quality gate issues: ${(draft.qualityReport.issues ?? []).join(" | ") || "None"}`,
    "Draft body:",
    draft.content.body
  ].join("\n");
}

export async function generateDraftFromTopicWithLocalModel(
  env: Env,
  topic: Pick<BlogTopic, "id" | "title" | "date" | "lane" | "angle" | "primaryKeyword" | "searchIntent" | "sourceSignals">,
  options: {
    model?: string;
    promptContent?: string;
    promptVersionId?: string;
    templateContent?: string;
    templateVersionId?: string;
  } = {}
) {
  const templateContent = options.templateContent ?? (await getActiveTemplateVersion(env, "blog-outline"))?.content ?? templateDefaults["blog-outline"].content;
  const promptVersion = options.promptVersionId
    ? (await listPromptVersions(env)).find((version) => version.id === options.promptVersionId)
    : await getActivePromptVersion(env, "draft-generation");
  const promptContent = options.promptContent ?? promptVersion?.content ?? promptDefaults["draft-generation"].content;
  const model = options.model ?? defaultLocalModel(env);

  const local = await runLocalModelJson<{ summary: string; seoTitle: string; seoDescription: string; body: string }>(env, {
    model,
    temperature: 0.2,
    prompt: draftPrompt(topic, templateContent, promptContent)
  });

  const draft: BlogPostContent = {
    slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    title: topic.title,
    summary: local.parsed?.summary?.trim() || topic.angle,
    publishedAt: topic.date,
    tags: [topic.lane, "open-source", "ai-agents"],
    author: "OpenAgent.bot Editors",
    body: local.parsed?.body?.trim() || generateDraftFromTopic(topic, templateContent).body,
    seoTitle: (local.parsed?.seoTitle?.trim() || `${topic.title} | OpenAgent.bot`).slice(0, 80),
    seoDescription: (local.parsed?.seoDescription?.trim() || topic.searchIntent).slice(0, 180)
  };

  return {
    draft,
    debug: {
      provider: local.provider,
      model: local.model,
      promptVersionId: promptVersion?.id,
      templateVersionId: options.templateVersionId,
      rawText: local.rawText,
      prompt: local.prompt
    }
  };
}

export async function generateOutlineWithLocalModel(
  env: Env,
  topic: Pick<BlogTopic, "title" | "angle" | "primaryKeyword" | "searchIntent">,
  options: { model?: string; promptContent?: string; promptVersionId?: string; templateContent?: string } = {}
) {
  const templateContent = options.templateContent ?? (await getActiveTemplateVersion(env, "blog-outline"))?.content ?? templateDefaults["blog-outline"].content;
  const promptVersion = options.promptVersionId
    ? (await listPromptVersions(env)).find((version) => version.id === options.promptVersionId)
    : await getActivePromptVersion(env, "outline-generation");
  const promptContent = options.promptContent ?? promptVersion?.content ?? promptDefaults["outline-generation"].content;
  const local = await runLocalModelJson<{ title: string; sections: string[] }>(env, {
    model: options.model ?? defaultLocalModel(env),
    temperature: 0.1,
    prompt: outlinePrompt(topic, templateContent, promptContent)
  });
  return {
    outline: local.parsed ?? generateDebugOutline(templateContent, topic),
    debug: {
      provider: local.provider,
      model: local.model,
      promptVersionId: promptVersion?.id,
      rawText: local.rawText,
      prompt: local.prompt,
      template: templateContent
    }
  };
}

export async function reviewDraftWithLocalModel(
  env: Env,
  draft: BlogDraft,
  options: { model?: string; promptContent?: string; promptVersionId?: string } = {}
) {
  const promptVersion = options.promptVersionId
    ? (await listPromptVersions(env)).find((version) => version.id === options.promptVersionId)
    : await getActivePromptVersion(env, "reviewer");
  const promptContent = options.promptContent ?? promptVersion?.content ?? promptDefaults.reviewer.content;
  const local = await runLocalModelJson<{ summary: string; blockingIssues: string[]; warnings: string[] }>(env, {
    model: options.model ?? defaultLocalModel(env),
    temperature: 0.05,
    prompt: reviewPrompt(draft, promptContent)
  });
  const fallback = buildReviewFromDraft(draft);
  return {
    review: {
      ...fallback,
      summary: local.parsed?.summary?.trim() || fallback.summary,
      blockingIssues: Array.isArray(local.parsed?.blockingIssues) ? local.parsed.blockingIssues : fallback.blockingIssues,
      warnings: Array.isArray(local.parsed?.warnings) ? local.parsed.warnings : fallback.warnings
    },
    debug: {
      provider: local.provider,
      model: local.model,
      promptVersionId: promptVersion?.id,
      rawText: local.rawText,
      prompt: local.prompt
    }
  };
}

export function buildReviewFromDraft(draft: BlogDraft): BlogReviewReport {
  const payload = parseBlogDraftPayload({
    ...draft.content,
    targetKeyword: draft.targetKeyword,
    searchIntent: draft.searchIntent,
    sourceLinks: draft.sourceLinks
  });
  return buildBlogReviewReport(payload.qualityReport, {
    approvedByHuman: draft.approvedByHuman,
    approvedAt: draft.approvedAt
  });
}

export async function createPromptVersion(
  env: Env,
  input: { kind: PromptVersionKind; content: string; config?: Record<string, unknown>; activate?: boolean }
) {
  await ensureBlogWorkbenchSeeds(env);
  const row = await env.DB.prepare("SELECT COUNT(*) as count FROM prompt_versions WHERE kind = ?").bind(input.kind).first<{ count: number }>();
  const version = `v${Number(row?.count ?? 0) + 1}`;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  if (input.activate) {
    await env.DB.prepare("UPDATE prompt_versions SET is_active = 0 WHERE kind = ?").bind(input.kind).run();
  }
  await env.DB.prepare(
    `INSERT INTO prompt_versions (id, kind, version, content, config_json, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, input.kind, version, input.content, JSON.stringify(input.config ?? {}), input.activate ? 1 : 0, now)
    .run();
  const created = await env.DB.prepare("SELECT * FROM prompt_versions WHERE id = ?").bind(id).first();
  return created ? mapPromptVersion(created as Parameters<typeof mapPromptVersion>[0]) : undefined;
}

export async function createTemplateVersion(
  env: Env,
  input: { kind: TemplateVersionKind; content: string; activate?: boolean }
) {
  await ensureBlogWorkbenchSeeds(env);
  const row = await env.DB.prepare("SELECT COUNT(*) as count FROM template_versions WHERE kind = ?").bind(input.kind).first<{ count: number }>();
  const version = `v${Number(row?.count ?? 0) + 1}`;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  if (input.activate) {
    await env.DB.prepare("UPDATE template_versions SET is_active = 0 WHERE kind = ?").bind(input.kind).run();
  }
  await env.DB.prepare(
    `INSERT INTO template_versions (id, kind, version, content, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, input.kind, version, input.content, input.activate ? 1 : 0, now)
    .run();
  const created = await env.DB.prepare("SELECT * FROM template_versions WHERE id = ?").bind(id).first();
  return created ? mapTemplateVersion(created as Parameters<typeof mapTemplateVersion>[0]) : undefined;
}

export async function activatePromptVersion(env: Env, id: string) {
  const row = await env.DB.prepare("SELECT * FROM prompt_versions WHERE id = ?").bind(id).first();
  if (!row) return undefined;
  const version = mapPromptVersion(row as Parameters<typeof mapPromptVersion>[0]);
  await env.DB.prepare("UPDATE prompt_versions SET is_active = 0 WHERE kind = ?").bind(version.kind).run();
  await env.DB.prepare("UPDATE prompt_versions SET is_active = 1 WHERE id = ?").bind(id).run();
  return version;
}

export async function activateTemplateVersion(env: Env, id: string) {
  const row = await env.DB.prepare("SELECT * FROM template_versions WHERE id = ?").bind(id).first();
  if (!row) return undefined;
  const version = mapTemplateVersion(row as Parameters<typeof mapTemplateVersion>[0]);
  await env.DB.prepare("UPDATE template_versions SET is_active = 0 WHERE kind = ?").bind(version.kind).run();
  await env.DB.prepare("UPDATE template_versions SET is_active = 1 WHERE id = ?").bind(id).run();
  return version;
}

export async function saveDebugRun(
  env: Env,
  input: {
    action: DebugRunAction;
    model: string;
    promptVersionId?: string;
    templateVersionId?: string;
    sourceTopicId?: string;
    sourceDraftId?: string;
    artifactsRef: Record<string, unknown>;
    status?: "completed" | "failed";
  }
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO debug_runs (
      id, source_topic_id, source_draft_id, action, model, prompt_version_id, template_version_id, status, artifacts_ref, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      input.sourceTopicId ?? null,
      input.sourceDraftId ?? null,
      input.action,
      input.model,
      input.promptVersionId ?? null,
      input.templateVersionId ?? null,
      input.status ?? "completed",
      JSON.stringify(input.artifactsRef),
      now
    )
    .run();
  const row = await env.DB.prepare("SELECT * FROM debug_runs WHERE id = ?").bind(id).first();
  return row ? mapDebugRun(row as Parameters<typeof mapDebugRun>[0]) : undefined;
}

export async function listDebugRuns(env: Env) {
  const result = await env.DB.prepare("SELECT * FROM debug_runs ORDER BY created_at DESC LIMIT 30").all();
  return (result.results ?? []).map((row) => mapDebugRun(row as Parameters<typeof mapDebugRun>[0]));
}

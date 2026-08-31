import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import tasksFile from "./knowledge-expansion-tasks.json";
import { prepareEvaluation } from "./knowledge-agent-tasks";
import { knowledgeResponse } from "../src/lib/registry/knowledge-query";
import { buildKnowledgeDocument } from "../src/lib/registry/knowledge-document";

type Task = {
  id: string; group: string; question: string; endpoint: "search" | "project" | "history"; params: string;
  expected?: string[]; unknown?: number; discover?: string; assertions?: Array<{ path: string; value: unknown }>;
};
export const expansionTasks = tasksFile.tasks as Task[];
export const expansionTime = tasksFile.evaluationTime;
export const expansionSlugs = tasksFile.cohort;
const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

export async function prepareExpansion(enrich = true) {
  const context = await prepareEvaluation();
  try {
    if (enrich) for (const slug of expansionSlugs) {
      const manifest = JSON.parse(readFileSync(`content/intake/${slug}.json`, "utf8"));
      const preview = await context.intake.preview(manifest);
      await context.intake.publish(manifest, preview.baseHash, preview.payloadHash, "isolated knowledge expansion evaluation");
    }
    return context;
  } catch (error) { context.db.close(); throw error; }
}

export async function runExpansionTask(context: Awaited<ReturnType<typeof prepareExpansion>>, task: Task) {
  const responses: Array<{ endpoint: string; query: string; status: number; jsonBytes: number; body: any }> = [];
  const request = async (endpoint: Task["endpoint"], query: string) => {
    const response = await knowledgeResponse(new Request(`https://evaluation.invalid/api/knowledge/v1/${endpoint}.json?${query}`), endpoint, () => context.adapter, () => expansionTime);
    const raw = await response.text();
    const result = { endpoint, query, status: response.status, jsonBytes: Buffer.byteLength(raw), body: JSON.parse(raw) };
    responses.push(result);
    if (result.status !== 200) throw new Error(`HTTP ${result.status}: ${result.body.error?.code}`);
    return result.body;
  };
  const checks: Array<{ name: string; expected: unknown; actual: unknown; passed: boolean }> = [];
  const check = (name: string, actual: unknown, expected: unknown) => checks.push({ name, actual: actual ?? null, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
  try {
    if (task.discover) {
      const slug = new URLSearchParams(task.params).get("slug")!;
      const keys: string[] = [];
      let cursor: string | null = null, pages = 0;
      do {
        const page = await request("project", `slug=${slug}&section=fields&limit=5${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
        keys.push(...page.items.map((item: any) => item.key));
        cursor = page.nextCursor;
        if (++pages > 100) throw new Error("Field pagination did not terminate");
      } while (cursor);
      check("discoverable field", keys.includes(task.discover), true);
      if (!keys.includes(task.discover)) throw new Error("Requested field cannot be discovered");
    }
    const result = await request(task.endpoint, task.params);
    if (task.expected) {
      check("matching interfaces", result.items.map((item: any) => `${item.project.slug}/${item.interface.localId}`).sort(), task.expected);
      check("unknown candidates", result.coverage.unknownCandidatesThisPage, task.unknown);
      check("bounded query exhausted", result.coverage.exhausted, true);
      check("upstream coverage is not asserted", result.coverage.upstream, "unknown");
    }
    for (const assertion of task.assertions ?? []) {
      const actual = assertion.path.split(".").reduce((value: any, key) => value?.[key], result);
      check(assertion.path, actual, assertion.value);
    }
    if (task.group === "evidence" || task.group === "field-discovery" || task.group === "resource") {
      const evidence = Object.values(result.evidence) as any[];
      check("dated pinned provenance", evidence.length > 0 && evidence.every(item => /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[a-f0-9]{40}\//.test(item.url) && item.observedAt && item.observedAt <= expansionTime), true);
    }
    return { ...task, passed: checks.every(item => item.passed), checks, responses };
  } catch (error) {
    return { ...task, passed: false, checks, error: String(error), responses };
  }
}

export async function evaluateExpansion(stage: "before" | "data-only" | "after" = "after") {
  const context = await prepareExpansion(stage !== "before");
  try {
    const tasks = [];
    for (const task of expansionTasks) tasks.push(await runExpansionTask(context, task));
    const coverage = [];
    for (const slug of expansionSlugs) {
      const dossier = (await context.registry.getEntityDossier(slug))!;
      const document = await buildKnowledgeDocument(dossier);
      coverage.push({ slug, projectId: document.project.id, interfaces: document.interfaces.length, resources: document.resources.length,
        curatedFacts: document.facts.filter(item => /^(software|scope|policy|capabilities)\./.test(item.key)).length,
        fullDocumentBytes: Buffer.byteLength(JSON.stringify(document)),
        runtimeTests: document.interfaces.filter(item => item.transport.verification === "tested").length,
        scopedFreshnessChecks: document.interfaces.filter(item => item.access.checkedAt !== null).length,
        projectionIssues: document.issues.length });
    }
    return {
      stage, recordedAt: new Date().toISOString(), evaluationTime: expansionTime,
      method: "Frozen source-grounded deterministic HTTP tasks in isolated SQLite. Cohort curated by the evaluator; not independent agent success, token savings, production tests or market validation.",
      fingerprints: {
        taskSpec: hash("evaluations/knowledge-expansion-tasks.json"), evaluator: hash("evaluations/knowledge-expansion.ts"),
        query: hash("src/lib/registry/knowledge-query.ts"),
        manifests: stage === "before" ? {} : Object.fromEntries(expansionSlugs.map(slug => [slug, hash(`content/intake/${slug}.json`)]))
      },
      summary: { total: tasks.length, passed: tasks.filter(item => item.passed).length, failed: tasks.filter(item => !item.passed).map(item => item.id) },
      coverage, tasks
    };
  } finally { context.db.close(); }
}

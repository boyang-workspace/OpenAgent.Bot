import { readFileSync } from "node:fs";
import { RegistryRepository } from "../src/lib/registry/repository";
import { RegistryIntakeService } from "../src/lib/registry/intake";
import { RegistrySyncService } from "../src/lib/registry/sync";
import { buildKnowledgeDocument, type LegacyResourceIdentity } from "../src/lib/registry/knowledge-document";
import { buildEntityDocument } from "../src/lib/registry/documents";
import { knowledgeClaim, matchKnowledgeClaim, type KnowledgeClaim, type KnowledgeDocument, type KnowledgeEvidence } from "../src/lib/registry/knowledge-contract";
import { registryTestDatabase } from "../tests/helpers/registry-database";
import { knowledgeResponse } from "../src/lib/registry/knowledge-query";

export const evaluationTime = "2026-08-28T02:00:00.000Z";
export const discoveryTasks = [
  { id: "Q1", question: "Find a documented, read-only, no-auth MCP interface", params: "interface=mcp&access=read-only&authentication=none", expected: ["vgpu/mcp-http"] },
  { id: "Q2", question: "Find a documented, read-only MCP interface requiring authentication", params: "interface=mcp&access=read-only&authentication=required", expected: [] },
  { id: "Q3", question: "Find a documented CLI that can write", params: "interface=cli&access=read-write", expected: ["opencode/cli", "vgpu/cli"] },
  { id: "Q4", question: "Find read-only SDKs (unknown must not pass)", params: "interface=sdk&access=read-only", expected: [] },
  { id: "Q5", question: "Find independently tested, read-only MCP interfaces", params: "interface=mcp&access=read-only&verification=tested", expected: [] },
  { id: "Q6", question: "Find fresh, read-only MCP interfaces", params: "interface=mcp&access=read-only&require_fresh=true", expected: [] }
];
export const representativeSlugs = ["vgpu", "opencode", "microduck", "microduck-runtime", "microduck-rl", "microduck-policies"];
export const holdoutSlugs = ["openhands", "langgraph", "lerobot", "playwright-mcp"];
export const compactTasks = [
  { slug: "vgpu", params: "section=interfaces&id=mcp-http", question: "Inspect hosted MCP access, auth, provenance and verification" },
  { slug: "opencode", params: "section=interfaces&id=cli", question: "Inspect CLI access, auth, provenance and verification" },
  { slug: "microduck", params: "section=resources&id=browser-simulator", question: "Locate the browser simulator and its stated resource terms" },
  { slug: "microduck-runtime", params: "section=resources&id=runtime-docs", question: "Locate runtime documentation and its stated resource terms" },
  { slug: "microduck-rl", params: "section=resources&id=mjcf-models", question: "Locate simulation assets with scoped version and evidence" },
  { slug: "microduck-policies", params: "section=resources&id=alpha-walking", question: "Locate one policy artifact with scoped digest and resource terms" }
];

export async function prepareEvaluation() {
  const { db, adapter } = registryTestDatabase();
  const registry = new RegistryRepository(adapter), intake = new RegistryIntakeService(adapter);
  await new RegistrySyncService(adapter).registerSources();
  for (const slug of ["vgpu", "opencode"]) {
    const manifest = JSON.parse(readFileSync(`content/intake/${slug}.json`, "utf8"));
    const preview = await intake.preview(manifest);
    await intake.publish(manifest, preview.baseHash, preview.payloadHash, "isolated task evaluation");
  }
  const maps = JSON.parse(readFileSync("content/knowledge/microduck-resource-ids.json", "utf8")) as Record<string, LegacyResourceIdentity[]>;
  const documents = new Map<string, KnowledgeDocument>();
  const sizes = [];
  for (const slug of [...representativeSlugs, ...holdoutSlugs]) {
    const dossier = (await registry.getEntityDossier(slug))!;
    const document = await buildKnowledgeDocument(dossier, { legacyResourceIds: maps[dossier.entity.id] });
    documents.set(slug, document);
    sizes.push({ slug, cohort: holdoutSlugs.includes(slug) ? "holdout" : "representative", legacyJsonBytes: Buffer.byteLength(JSON.stringify(buildEntityDocument(dossier))), knowledgeJsonBytes: Buffer.byteLength(JSON.stringify(document)), interfaces: document.interfaces.length, resources: document.resources.length, scopedChecks: document.interfaces.filter((item) => item.access.checkedAt !== null).length });
  }
  return { db, adapter, registry, intake, documents, sizes };
}

export function evaluateDiscoveryLocally(documents: Map<string, KnowledgeDocument>) {
  return discoveryTasks.map((task) => {
    const params = new URLSearchParams(task.params), results: string[] = [];
    let unknownCandidates = 0;
    for (const [slug, document] of documents) for (const item of document.interfaces) {
      if (item.type !== params.get("interface")) continue;
      const options = { asOf: evaluationTime, requireFresh: params.get("require_fresh") === "true", verification: params.get("verification") === "tested" ? "tested" as const : "documented" as const };
      const decisions = [matchKnowledgeClaim(item.access, params.get("access")!, options)];
      if (params.has("authentication")) decisions.push(matchKnowledgeClaim(item.authentication, params.get("authentication")!, options));
      if (decisions.every((value) => value === "matched")) results.push(`${slug}/${item.localId}`);
      else if (!decisions.includes("not-matched") && decisions.includes("unknown")) unknownCandidates++;
    }
    results.sort();
    return { ...task, results, unknownCandidates, correct: JSON.stringify(results) === JSON.stringify(task.expected), execution: "evaluation-only client filtering, not a product search endpoint" };
  });
}

export function evaluateUncertainty() {
  const evidence: KnowledgeEvidence[] = [{ sourceId: "fixture", sourceName: "Synthetic safety fixture", sourceTrust: "official", url: "https://example.com/synthetic-evidence", observedAt: "2026-08-28T00:00:00Z", publishedAt: null }];
  const cases: Array<{ id: string; claim: KnowledgeClaim; options?: Record<string, unknown> }> = [
    { id: "U1-missing-value", claim: knowledgeClaim(null, evidence) },
    { id: "U2-missing-evidence", claim: knowledgeClaim("read-only") },
    { id: "U3-withdrawn", claim: knowledgeClaim(null, evidence, { status: "withdrawn" }) },
    { id: "U4-conflicting", claim: knowledgeClaim(null, evidence, { status: "conflicted", alternatives: [{ value: "read-only", evidence }, { value: "read-write", evidence }] }) },
    { id: "U5-expired", claim: knowledgeClaim("read-only", evidence, { checkedAt: "2026-08-28T00:00:00Z", expiresAt: "2026-08-28T01:00:00Z" }) },
    { id: "U6-no-freshness", claim: knowledgeClaim("read-only", evidence), options: { requireFresh: true } },
    { id: "U7-not-tested", claim: knowledgeClaim("read-only", evidence), options: { verification: "tested" } },
    { id: "U8-unscoped-version", claim: knowledgeClaim("read-only", evidence), options: { versionId: "unknown-version" } },
    { id: "U9-future-evidence", claim: knowledgeClaim("read-only", [{ ...evidence[0], observedAt: "2026-08-29T00:00:00Z" }]) },
    { id: "U10-unknown-verification", claim: knowledgeClaim("read-only", evidence, { verification: "unknown" }) }
  ];
  return cases.map(({ id, claim, options }) => ({ id, expected: "unknown", actual: matchKnowledgeClaim(claim, "read-only", { asOf: evaluationTime, ...options }), synthetic: true }));
}

export async function addHistoryFixture(intake: RegistryIntakeService) {
  // Deliberately synthetic revisions of one field in an isolated database. No
  // upstream change, review freshness or production history is being asserted.
  const manifest = JSON.parse(readFileSync("content/intake/vgpu.json", "utf8"));
  for (let revision = 1; revision <= 26; revision++) {
    manifest.entity.summary = `Synthetic history audit revision ${revision}`;
    const preview = await intake.preview(manifest);
    await intake.publish(manifest, preview.baseHash, preview.payloadHash, "synthetic history evaluation");
  }
}

export async function evaluateBaseline() {
  const context = await prepareEvaluation();
  try {
    await addHistoryFixture(context.intake);
    const dossier = (await context.registry.getEntityDossier("vgpu"))!;
    const document = await buildKnowledgeDocument(dossier);
    const ledgerChanges = Number(context.db.prepare("SELECT count(*) AS n FROM change_events WHERE entity_id='registry_vgpu' AND fact_key='curated.entity'").get()!.n);
    return {
      evaluatedAt: new Date().toISOString(), evaluationTime,
      method: "Deterministic local component evaluation; no independent agents, inference timing or real-world success rate measured",
      population: { projects: Number(context.db.prepare("SELECT count(*) AS n FROM entities").get()!.n), representative: representativeSlugs, holdout: holdoutSlugs },
      discovery: evaluateDiscoveryLocally(context.documents),
      productSearchAvailable: false,
      payloads: context.sizes,
      uncertainty: evaluateUncertainty(),
      history: { synthetic: true, ledgerChanges, exposedChanges: document.history.recentChanges.filter((event) => event.factKey === "curated.entity").length, canRetrieveOlderPages: false, pointInTime: document.history.pointInTime },
      holdoutCoverage: holdoutSlugs.map((slug) => ({ slug, interfaces: context.documents.get(slug)!.interfaces.length, resources: context.documents.get(slug)!.resources.length }))
    };
  } finally { context.db.close(); }
}

export async function evaluateIteration() {
  const context = await prepareEvaluation();
  const query = async (endpoint: "search" | "project" | "history", params: string) => {
    const response = await knowledgeResponse(new Request(`https://evaluation.invalid/api/knowledge/v1/${endpoint}.json?${params}`), endpoint, () => context.adapter, () => evaluationTime);
    if (response.status !== 200) throw new Error(`Evaluation request failed: ${response.status} ${await response.text()}`);
    return response.json();
  };
  try {
    const discovery = [];
    for (const task of discoveryTasks) {
      const response = await query("search", task.params);
      const results = response.items.map((item: { project: { slug: string }; interface: { localId: string } }) => `${item.project.slug}/${item.interface.localId}`).sort();
      discovery.push({ ...task, results, correct: JSON.stringify(results) === JSON.stringify(task.expected), unknownCandidates: response.coverage.unknownCandidatesThisPage, exhausted: response.coverage.exhausted, jsonBytes: Buffer.byteLength(JSON.stringify(response)), execution: "local HTTP handler against isolated SQLite, not deployed production" });
    }
    const payloads = [];
    for (const task of compactTasks) {
      const response = await query("project", `slug=${task.slug}&${task.params}`);
      const size = context.sizes.find((item) => item.slug === task.slug)!;
      payloads.push({ ...task, legacyJsonBytes: size.legacyJsonBytes, knowledgeJsonBytes: size.knowledgeJsonBytes, taskJsonBytes: Buffer.byteLength(JSON.stringify(response)), items: response.items.length, evidenceRecords: Object.keys(response.evidence).length });
    }
    await addHistoryFixture(context.intake);
    let cursor: string | null = null, pages = 0;
    const events: string[] = [];
    do {
      const response = await query("history", `slug=vgpu&fact_key=curated.entity&limit=5${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
      events.push(...response.items.map((item: { id: string }) => item.id));
      cursor = response.nextCursor; pages++;
      if (pages > 100) throw new Error("History pagination did not terminate");
    } while (cursor);
    return {
      evaluatedAt: new Date().toISOString(), evaluationTime,
      method: "Deterministic local HTTP-handler evaluation; no independent agents, inference timing or real-world success rate measured",
      population: { projects: Number(context.db.prepare("SELECT count(*) AS n FROM entities").get()!.n), representative: representativeSlugs, holdout: holdoutSlugs },
      discovery, productSearchAvailable: "local-only", payloads, uncertainty: evaluateUncertainty(),
      history: { synthetic: true, ledgerChanges: Number(context.db.prepare("SELECT count(*) AS n FROM change_events WHERE entity_id='registry_vgpu' AND fact_key='curated.entity'").get()!.n), exposedChanges: events.length, uniqueEvents: new Set(events).size, pages, canRetrieveOlderPages: true, pointInTime: "unavailable" },
      holdoutCoverage: holdoutSlugs.map((slug) => ({ slug, interfaces: context.documents.get(slug)!.interfaces.length, resources: context.documents.get(slug)!.resources.length }))
    };
  } finally { context.db.close(); }
}

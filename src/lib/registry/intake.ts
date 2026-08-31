import { factHash, stableStringify } from "./observations";
import { IntakeError, validateManifest, validateCorrections, type Evidence, type IntakeManifest } from "./intake-contract";
import type { D1Statement, RegistryDatabase } from "./repository";

type Row = Record<string, any>;
type Diff = { field: string; before: unknown; after: unknown };
const entityColumns = {
  slug: "slug", name: "name", kind: "kind", summary: "summary", description: "description",
  organization: "organization", country: "country", lifecycle: "lifecycle", visibility: "visibility",
  opennessStatus: "openness_status", licenseSpdx: "license_spdx", canonicalUrl: "canonical_url",
  repositoryUrl: "repository_url", documentationUrl: "documentation_url"
} as const;

function factSet(manifest: IntakeManifest): Array<{ key: string; value: unknown; evidence: Evidence }> {
  return [
    { key: "curated.entity", value: manifest.entity, evidence: manifest.evidence },
    { key: "curated.domains", value: manifest.domains, evidence: manifest.evidence },
    { key: "curated.use_cases", value: manifest.useCases, evidence: manifest.evidence },
    { key: "curated.facets", value: manifest.facets, evidence: manifest.evidence },
    ...(manifest.robotics ? [{ key: "curated.robotics", value: manifest.robotics, evidence: manifest.evidence }] : []),
    ...manifest.facts,
    ...manifest.resources.map(({ evidence, ...resource }) => ({ key: `resources.${resource.id}`, value: resource, evidence })),
    ...manifest.interfaces.map(({ evidence, ...item }) => ({ key: `interfaces.${item.id}`, value: item, evidence }))
  ];
}

export class RegistryIntakeService {
  constructor(private readonly db: RegistryDatabase) {}

  private async state(slug: string) {
    const entity = await this.db.prepare("SELECT * FROM entities WHERE slug = ?1").bind(slug).first<Row>();
    const id = entity?.id ?? `registry_${slug.replaceAll("-", "_")}`;
    const results = await Promise.all([
      this.db.prepare("SELECT f.*, o.source_url FROM current_facts f LEFT JOIN observations o ON o.id = f.observation_id WHERE f.entity_id = ?1 ORDER BY f.fact_key").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM source_subscriptions WHERE entity_id = ?1 ORDER BY source_id, locator").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM entity_domains WHERE entity_id = ?1 ORDER BY is_primary DESC, domain").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM openness_facets WHERE entity_id = ?1 ORDER BY facet").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM entity_license_scopes WHERE entity_id = ?1 ORDER BY scope, path").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM robotics_profiles WHERE entity_id = ?1").bind(id).first<Row>(),
      this.db.prepare("SELECT * FROM intake_publications WHERE entity_id = ?1 ORDER BY revision DESC LIMIT 1").bind(id).first<Row>(),
      this.db.prepare("SELECT * FROM entity_use_cases WHERE entity_id = ?1 ORDER BY use_case_slug").bind(id).all<Row>(),
      this.db.prepare("SELECT * FROM entity_interfaces WHERE entity_id = ?1 ORDER BY interface_id").bind(id).all<Row>()
    ]);
    return { id, entity, facts: results[0].results ?? [], subscriptions: results[1].results ?? [], domains: results[2].results ?? [], facets: results[3].results ?? [], licenses: results[4].results ?? [], robotics: results[5], publication: results[6], useCases: results[7].results ?? [], interfaces: results[8].results ?? [] };
  }

  async preview(input: unknown, correctionInput: unknown = []) {
    const manifest = validateManifest(input);
    const corrections = validateCorrections(correctionInput);
    const state = await this.state(manifest.entity.slug);
    const previous = state.publication ? JSON.parse(state.publication.manifest_json) as IntakeManifest : undefined;
    const facts = factSet(manifest);
    if (state.robotics && !manifest.robotics) throw new IntakeError("Existing robotics profile cannot be implicitly removed; supply it explicitly");
    const sourceIds = [...new Set([manifest.evidence, ...facts.map((f) => f.evidence), ...manifest.facets.map((f) => f.evidence), ...manifest.licenses.map((f) => f.evidence), ...manifest.useCases.map((f) => f.evidence)].map((e) => e.sourceId).concat(manifest.subscriptions.map((s) => s.sourceId)))];
    for (const sourceId of sourceIds) {
      const source = await this.db.prepare("SELECT id FROM sources WHERE id = ?1 AND enabled = 1 AND trust_tier IN ('canonical','official')").bind(sourceId).first();
      if (!source) throw new IntakeError(`Unregistered, disabled or non-official source: ${sourceId}`);
    }
    const duplicate = await this.db.prepare("SELECT slug FROM entities WHERE lower(rtrim(canonical_url, '/')) = lower(rtrim(?1, '/')) AND id != ?2 LIMIT 1").bind(manifest.entity.canonicalUrl, state.id).first<{ slug: string }>();
    if (duplicate) throw new IntakeError(`Canonical identity already belongs to ${duplicate.slug}`, 409);
    for (const subscription of manifest.subscriptions) {
      const owner = await this.db.prepare("SELECT entity_id FROM source_subscriptions WHERE source_id = ?1 AND lower(locator) = lower(?2)").bind(subscription.sourceId, subscription.locator).first<{ entity_id: string }>();
      if (owner && owner.entity_id !== state.id) throw new IntakeError(`Subscription ${subscription.locator} already has another metric owner`, 409);
      if (subscription.sourceId === "github" && manifest.entity.repositoryUrl?.toLowerCase() !== `https://github.com/${subscription.locator}`.toLowerCase()) throw new IntakeError("GitHub subscription must match the declared repository");
      if (subscription.sourceId === "github-releases" && !manifest.subscriptions.some((item) => item.sourceId === "github" && item.locator.toLowerCase() === subscription.locator.toLowerCase())) throw new IntakeError("Release subscription requires the same repository owner");
    }
    for (const useCase of manifest.useCases) {
      const existing = await this.db.prepare("SELECT name, description FROM use_cases WHERE slug = ?1").bind(useCase.slug).first<Row>();
      if (existing && (existing.name !== useCase.name || existing.description !== useCase.description)) throw new IntakeError(`Use case ${useCase.slug} already has a different definition; reuse its canonical vocabulary`, 409);
    }

    const diff: Diff[] = [];
    const compare = (field: string, before: unknown, after: unknown) => {
      if (stableStringify(before ?? null) !== stableStringify(after ?? null)) diff.push({ field, before: before ?? null, after: after ?? null });
    };
    for (const [field, column] of Object.entries(entityColumns)) compare(`entity.${field}`, state.entity?.[column], manifest.entity[field as keyof typeof manifest.entity]);
    compare("domains", state.domains.map((d) => d.domain), [manifest.domains[0], ...manifest.domains.slice(1).sort()]);
    compare("useCases", state.useCases.map((u) => ({ slug: u.use_case_slug, sourceUrl: u.source_url, observedAt: u.observed_at })), manifest.useCases.map((u) => ({ slug: u.slug, sourceUrl: u.evidence.sourceUrl, observedAt: u.evidence.observedAt })).sort((a,b) => a.slug.localeCompare(b.slug)));
    compare("facets", state.facets.map((f) => ({ facet: f.facet, status: f.status, terms: f.license_or_terms, evidence: { sourceId: f.source_id, sourceUrl: f.source_url, observedAt: f.observed_at } })), [...manifest.facets].sort((a,b) => a.facet.localeCompare(b.facet)));
    compare("licenses", state.licenses.map((l) => ({ id: l.id, scope: l.scope, path: l.path ?? undefined, licenseIdentifier: l.license_identifier, status: l.status, evidence: { sourceId: l.source_id, sourceUrl: l.source_url, observedAt: l.observed_at } })), [...manifest.licenses].sort((a,b) => a.id.localeCompare(b.id)));
    compare("interfaces", state.interfaces.map((i) => ({ id: i.interface_id, type: i.interface_type, verification: i.verification_status })), manifest.interfaces.map((i) => ({ id: i.id, type: i.type, verification: i.verification })).sort((a,b) => a.id.localeCompare(b.id)));
    compare("subscriptions", state.subscriptions.filter((s) => s.enabled).map((s) => ({ sourceId: s.source_id, locator: s.locator, role: s.source_role ?? "primary" })), [...manifest.subscriptions].sort((a, b) => a.sourceId.localeCompare(b.sourceId)));
    for (const fact of facts) {
      const current = state.facts.find((f) => f.fact_key === fact.key);
      compare(fact.key, current ? { value: JSON.parse(current.value_json), sourceId: current.source_id, sourceUrl: current.source_url, observedAt: current.observed_at } : null, { value: fact.value, ...fact.evidence });
    }
    const removals = previous ? factSet(previous).filter((old) => !facts.some((f) => f.key === old.key)).map((f) => f.key) : [];
    for (const key of removals) compare(key, state.facts.find((f) => f.fact_key === key)?.value_json, null);
    for (const correction of corrections) {
      const current = state.facts.find(f => f.fact_key === correction.factKey);
      if (!current || !facts.some(f => f.key === correction.factKey)) throw new IntakeError("Correction must target an existing retained fact; creation/removal is not a correction");
      if (current.observation_id !== correction.previousObservationId) throw new IntakeError("Correction prior observation is stale or belongs to a different fact; preview again", 409);
      if (!diff.some(item => item.field === correction.factKey)) throw new IntakeError("Correction requires a changed fact value or evidence");
    }
    const correctionTargets = facts.filter(fact => diff.some(item => item.field === fact.key)).flatMap(fact => {
      const current = state.facts.find(item => item.fact_key === fact.key);
      return current ? [{ factKey: fact.key, previousObservationId: String(current.observation_id) }] : [];
    });
    return { manifest, corrections, correctionTargets, state, diff, removals, payloadHash: await factHash(corrections.length ? { manifest, corrections } : manifest), baseHash: await factHash(state), revision: Number(state.publication?.revision ?? 0) + 1 };
  }

  async publish(input: unknown, baseHash: string, payloadHash: string, reviewer: string, correctionInput: unknown = []) {
    if (!reviewer?.trim() || reviewer.length > 200) throw new IntakeError("Reviewer is required");
    const preview = await this.preview(input, correctionInput);
    if (preview.baseHash !== baseHash || preview.payloadHash !== payloadHash) throw new IntakeError("The preview is stale or the manifest changed; preview again", 409);
    if (preview.diff.length === 0) return { status: "unchanged", slug: preview.manifest.entity.slug, revision: preview.revision - 1 };
    const { manifest: m, state, revision } = preview;
    const now = new Date().toISOString(), publicationId = `intake_${crypto.randomUUID()}`;
    const statements: D1Statement[] = [];
    const insert = (table: string, row: Row, suffix = "") => statements.push(this.db.prepare(`INSERT INTO ${table} (${Object.keys(row).join(",")}) VALUES (${Object.keys(row).map((_, i) => `?${i + 1}`).join(",")}) ${suffix}`).bind(...Object.values(row).map((v) => v ?? null)));

    // New rows and the revision claim are in the same D1 transaction. A stale
    // revision, concurrent sync, identity collision or later error rolls it back.
    const projected = Object.fromEntries(Object.entries(entityColumns).map(([field, column]) => [column, m.entity[field as keyof typeof m.entity] ?? null]));
    if (!state.entity) insert("entities", { id: state.id, ...projected, first_seen_at: now, last_seen_at: now, last_verified_at: m.evidence.observedAt, created_at: now, updated_at: now });
    statements.push(this.db.prepare(`INSERT INTO intake_publications
      (id,entity_id,revision,payload_hash,manifest_json,before_json,diff_json,reviewer,published_at,guard)
      VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,
        CASE WHEN COALESCE((SELECT MAX(revision) FROM intake_publications WHERE entity_id = ?2),0) = ?10
          AND (?11 IS NULL OR EXISTS (SELECT 1 FROM entities WHERE id = ?2 AND updated_at = ?11 AND last_seen_at = ?12))
        THEN 1 ELSE 0 END)`)
      .bind(publicationId, state.id, revision, preview.payloadHash, stableStringify(m), stableStringify({ ...state, publication: state.publication ? { id: state.publication.id, revision: state.publication.revision } : null }), stableStringify(preview.diff), reviewer, now, revision - 1, state.entity?.updated_at ?? null, state.entity?.last_seen_at ?? null));
    if (state.entity) {
      const row = { ...projected, last_verified_at: m.evidence.observedAt, updated_at: now };
      statements.push(this.db.prepare(`UPDATE entities SET ${Object.keys(row).map((key, i) => `${key} = ?${i + 2}`).join(",")} WHERE id = ?1`).bind(state.id, ...Object.values(row)));
    }
    statements.push(this.db.prepare("DELETE FROM entity_domains WHERE entity_id = ?1").bind(state.id));
    m.domains.forEach((domain, i) => insert("entity_domains", { entity_id: state.id, domain, is_primary: i === 0 ? 1 : 0, confidence: 1, classification_method: "manual", review_status: "verified", source_url: m.evidence.sourceUrl, created_at: now, updated_at: now }));
    statements.push(this.db.prepare("DELETE FROM entity_use_cases WHERE entity_id = ?1").bind(state.id));
    for (const useCase of m.useCases) {
      insert("use_cases", { slug: useCase.slug, name: useCase.name, description: useCase.description }, "ON CONFLICT(slug) DO NOTHING");
      insert("entity_use_cases", { entity_id: state.id, use_case_slug: useCase.slug, source_url: useCase.evidence.sourceUrl, observed_at: useCase.evidence.observedAt });
    }
    statements.push(this.db.prepare("DELETE FROM openness_facets WHERE entity_id = ?1").bind(state.id));
    for (const facet of m.facets) insert("openness_facets", { entity_id: state.id, facet: facet.facet, status: facet.status, license_or_terms: facet.terms, source_id: facet.evidence.sourceId, source_url: facet.evidence.sourceUrl, evidence_confidence: facet.evidenceConfidence ?? "verified", observed_at: facet.evidence.observedAt, updated_at: now });
    statements.push(this.db.prepare("DELETE FROM entity_license_scopes WHERE entity_id = ?1").bind(state.id));
    for (const license of m.licenses) insert("entity_license_scopes", { id: `license_${state.id}_${license.id}`, entity_id: state.id, source_id: license.evidence.sourceId, scope: license.scope, path: license.path, license_identifier: license.licenseIdentifier, status: license.status, source_url: license.evidence.sourceUrl, observed_at: license.evidence.observedAt, updated_at: now });
    if (m.robotics) {
      const profile = m.robotics;
      const metadata = { ...profile.metadata };
      for (const fact of m.facts.filter((f) => f.key.startsWith("spec."))) metadata[fact.key.slice(5)] = fact.value;
      const row = { entity_id: state.id, layer: profile.layer, form_factor: profile.formFactor, stack_type: profile.stackType, model_type: profile.modelType, metadata_json: stableStringify(metadata), confidence: 1, classification_method: "manual", review_status: "verified", source_url: m.evidence.sourceUrl, created_at: state.robotics?.created_at ?? now, updated_at: now };
      insert("robotics_profiles", row, `ON CONFLICT(entity_id) DO UPDATE SET ${Object.keys(row).filter((key) => key !== "entity_id" && key !== "created_at").map((key) => `${key}=excluded.${key}`).join(",")}`);
    } else if (state.robotics) throw new IntakeError("Existing robotics profile cannot be implicitly removed; supply it explicitly");
    const primaryCategory = m.robotics?.layer === "intelligence"
      ? "robot-model"
      : m.robotics?.layer === "platform"
        ? "robot-hardware"
        : m.domains.includes("agent") && ["agent", "agent-framework"].includes(m.entity.kind)
          ? "agent"
          : m.entity.kind === "model"
            ? "foundation-model"
            : "supporting-infrastructure";
    const subtype = m.robotics?.layer === "intelligence"
      ? m.robotics.modelType ?? "intelligence"
      : m.robotics?.layer === "platform"
        ? m.robotics.formFactor ?? "platform"
        : m.entity.kind === "agent-framework"
          ? "framework"
          : m.entity.kind === "agent"
            ? "runtime"
            : m.entity.kind;
    const hardwareOpen = m.facets.some((facet) => facet.facet === "hardware" && facet.status === "open");
    const opennessBasis = hardwareOpen
      ? "hardware"
      : m.entity.opennessStatus === "open-source"
        ? "code"
        : m.entity.opennessStatus === "open-weights"
          ? "weights"
          : ["open-core", "source-available"].includes(m.entity.opennessStatus)
            ? "source-available"
            : "unknown";
    insert("catalog_profiles", {
      entity_id: state.id, primary_category: primaryCategory, subtype,
      inclusion_status: m.entity.visibility === "public" ? "included" : "review",
      inclusion_reason: "Published through reviewed intake.", openness_basis: opennessBasis,
      metadata_json: "{}", source_id: m.evidence.sourceId, source_url: m.evidence.sourceUrl,
      confidence: 1, observed_at: m.evidence.observedAt, updated_at: now
    }, `ON CONFLICT(entity_id) DO UPDATE SET
      primary_category=excluded.primary_category, subtype=excluded.subtype,
      inclusion_status=excluded.inclusion_status, inclusion_reason=excluded.inclusion_reason,
      openness_basis=excluded.openness_basis, source_id=excluded.source_id,
      source_url=excluded.source_url, confidence=excluded.confidence,
      observed_at=excluded.observed_at, updated_at=excluded.updated_at`);
    statements.push(this.db.prepare("DELETE FROM entity_interfaces WHERE entity_id = ?1").bind(state.id));
    for (const item of m.interfaces) insert("entity_interfaces", { entity_id: state.id, interface_id: item.id, interface_type: item.type, verification_status: item.verification });

    for (const fact of factSet(m)) {
      const current = state.facts.find((f) => f.fact_key === fact.key);
      const hash = await factHash(fact.value), json = stableStringify(fact.value);
      if (current?.value_hash === hash && current.source_id === fact.evidence.sourceId && current.source_url === fact.evidence.sourceUrl && current.observed_at === fact.evidence.observedAt) continue;
      const recorded = await this.db.prepare("SELECT id,source_url FROM observations WHERE entity_id=?1 AND source_id=?2 AND fact_key=?3 AND value_hash=?4 AND observed_at=?5").bind(state.id, fact.evidence.sourceId, fact.key, hash, fact.evidence.observedAt).first<Row>();
      if (recorded && recorded.source_url !== fact.evidence.sourceUrl) throw new IntakeError("An immutable observation already uses this date with a different URL; supply the new verification date");
      const observationId = recorded?.id ?? `obs_${crypto.randomUUID()}`;
      if (!recorded) insert("observations", { id: observationId, entity_id: state.id, source_id: fact.evidence.sourceId, fact_key: fact.key, value_json: json, value_hash: hash, source_url: fact.evidence.sourceUrl, confidence: 1, observed_at: fact.evidence.observedAt, created_at: now });
      const correction = preview.corrections.find(item => item.factKey === fact.key);
      if (!current || current.value_hash !== hash || correction) {
        const eventId = `change_${crypto.randomUUID()}`;
        insert("change_events", { id: eventId, entity_id: state.id, source_id: fact.evidence.sourceId, observation_id: observationId, fact_key: fact.key, change_type: current ? "updated" : "created", previous_value_json: current?.value_json, next_value_json: json, source_url: fact.evidence.sourceUrl, detected_at: now, created_at: now });
        if (correction) insert("change_event_corrections", { event_id: eventId, publication_id: publicationId, previous_observation_id: correction.previousObservationId, reason: correction.reason });
      }
      const row = { entity_id: state.id, fact_key: fact.key, observation_id: observationId, source_id: fact.evidence.sourceId, value_json: json, value_hash: hash, confidence: 1, observed_at: fact.evidence.observedAt, updated_at: now };
      insert("current_facts", row, `ON CONFLICT(entity_id,fact_key) DO UPDATE SET ${Object.keys(row).filter((key) => !["entity_id","fact_key"].includes(key)).map((key) => `${key}=excluded.${key}`).join(",")}`);
    }
    for (const key of preview.removals) {
      const old = state.facts.find((f) => f.fact_key === key);
      if (!old) continue;
      insert("change_events", { id: `change_${crypto.randomUUID()}`, entity_id: state.id, source_id: m.evidence.sourceId, fact_key: key, change_type: "removed", previous_value_json: old.value_json, source_url: m.evidence.sourceUrl, detected_at: now, created_at: now });
      statements.push(this.db.prepare("DELETE FROM current_facts WHERE entity_id = ?1 AND fact_key = ?2").bind(state.id, key));
    }
    // Disabled subscriptions retain both their metrics and validity window.
    statements.push(this.db.prepare("UPDATE source_subscriptions SET enabled = 0, valid_until = COALESCE(valid_until, ?2), updated_at = ?2 WHERE entity_id = ?1").bind(state.id, now));
    for (const sub of m.subscriptions) {
      const previous = state.subscriptions.find((item) => item.source_id === sub.sourceId && item.enabled);
      if (previous && previous.locator !== sub.locator) insert("source_binding_events", { id: `binding_${crypto.randomUUID()}`, entity_id: state.id, source_id: sub.sourceId, source_role: sub.role, old_locator: previous.locator, new_locator: sub.locator, reason: "Reviewed source binding update", changed_at: now });
      const locatorKey = sub.locator.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 80);
      insert("source_subscriptions", { id: `sub_${state.id}_${sub.sourceId}_${locatorKey}`, entity_id: state.id, source_id: sub.sourceId, locator: sub.locator, source_role: sub.role, enabled: 1, valid_from: previous?.locator === sub.locator ? previous.valid_from ?? previous.created_at ?? now : now, valid_until: null, next_sync_at: now, created_at: previous?.locator === sub.locator ? previous.created_at ?? now : now, updated_at: now }, "ON CONFLICT(source_id,locator) DO UPDATE SET enabled=1, source_role=excluded.source_role, valid_until=NULL, updated_at=excluded.updated_at");
    }
    try { await this.db.batch(statements); }
    catch { throw new IntakeError("Publication rolled back: concurrent edit, duplicate identity or database constraint. Preview again.", 409); }
    return { status: "published", slug: m.entity.slug, revision, publicationId, changes: preview.diff.length };
  }

  async revision(publicationId: string) {
    const row = await this.db.prepare("SELECT id,revision,manifest_json,reviewer,published_at FROM intake_publications WHERE id = ?1").bind(publicationId).first<Row>();
    if (!row) throw new IntakeError("Publication not found", 404);
    return { id: row.id, revision: row.revision, manifest: JSON.parse(row.manifest_json), reviewer: row.reviewer, publishedAt: row.published_at };
  }
}

import { entityDomains, entityKinds, opennessFacetNames, opennessFacetStatuses, opennessStatuses, roboticsLayers, robotFormFactors, robotModelTypes, roboticsStackTypes, sourceRoles } from "./types";
import type { EntityDomain, EntityKind, OpennessFacetName, OpennessFacetStatus, OpennessStatus, RegistryRoboticsProfile, SourceRole } from "./types";
import { deriveOpennessStatus } from "./integrity";

export type Evidence = { sourceId: string; sourceUrl: string; observedAt: string };
export type IntakeCorrection = { factKey: string; previousObservationId: string; reason: string };
export const interfaceTypes = ["cli", "api", "mcp", "sdk"] as const;
export type ToolInterface = {
  id: string; name: string; type: typeof interfaceTypes[number];
  transport: string; authentication: "none" | "required" | "optional" | "unknown";
  access: "read-only" | "local-write-opt-in" | "read-write" | "unknown";
  verification: "documented" | "tested" | "unknown";
  runtimes: string[]; description: string; url?: string; command?: string; evidence: Evidence;
};
export type IntakeResource = {
  id: string; name: string; kind: "documentation" | "package" | "repository" | "policy-file" | "simulation-assets" | "dataset" | "simulator" | "product" | "example";
  url: string; description?: string; license?: string; version?: string; revision?: string;
  gitBlobSha?: string; sizeBytes?: number; evidence: Evidence;
};
export type IntakeManifest = {
  schemaVersion: 1;
  entity: {
    slug: string; name: string; kind: EntityKind; summary: string; description: string;
    organization: string; country?: string; lifecycle: "active" | "inactive" | "archived" | "unknown";
    opennessStatus: OpennessStatus; licenseSpdx?: string; canonicalUrl: string;
    repositoryUrl?: string; documentationUrl?: string; visibility: "public" | "unlisted";
  };
  evidence: Evidence;
  domains: EntityDomain[];
  useCases: Array<{ slug: string; name: string; description: string; evidence: Evidence }>;
  facets: Array<{ facet: OpennessFacetName; status: OpennessFacetStatus; terms: string; evidenceConfidence?: "verified" | "inferred" | "manual" | "conflicting" | "stale"; evidence: Evidence }>;
  licenses: Array<{ id: string; scope: string; path?: string; licenseIdentifier: string; status: "open" | "restricted" | "unknown"; evidence: Evidence }>;
  facts: Array<{ key: string; value: unknown; evidence: Evidence }>;
  resources: IntakeResource[];
  interfaces: ToolInterface[];
  subscriptions: Array<{ sourceId: "github" | "github-releases" | "npm" | "huggingface"; locator: string; role: SourceRole }>;
  robotics?: Pick<RegistryRoboticsProfile, "layer" | "formFactor" | "stackType" | "modelType" | "metadata">;
};

export class IntakeError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
function requireThat(value: unknown, message: string): asserts value {
  if (!value) throw new IntakeError(message);
}
function object(value: unknown): asserts value is Record<string, any> {
  requireThat(value && typeof value === "object" && !Array.isArray(value), "Expected an object");
}
function text(value: unknown, name: string, max = 8000): asserts value is string {
  requireThat(typeof value === "string" && value.trim().length > 0 && value.length <= max, `Invalid ${name}`);
}
function choice(value: unknown, choices: readonly string[], name: string) {
  requireThat(typeof value === "string" && choices.includes(value), `Invalid ${name}`);
}
export function publicUrl(value: unknown): asserts value is string {
  text(value, "URL", 2048);
  let url: URL;
  try { url = new URL(value); } catch { throw new IntakeError("Invalid URL"); }
  requireThat(url.protocol === "https:" && !url.username && !url.password && !url.port && url.hostname.includes(".") && !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(url.hostname), "Expected a public HTTPS URL without credentials");
}
function evidence(value: unknown) {
  object(value); text(value.sourceId, "source ID", 100); publicUrl(value.sourceUrl);
  requireThat(typeof value.observedAt === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value.observedAt) && Number.isFinite(Date.parse(value.observedAt)) && Date.parse(value.observedAt) <= Date.now() + 60_000, "Invalid or future evidence date");
}
function slug(value: unknown) { requireThat(typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100, "Invalid stable ID/slug"); }
function unique(items: string[], name: string) { requireThat(new Set(items).size === items.length, `Duplicate ${name}`); }

// Review annotations belong to one publication, not to the reusable manifest.
// They are hashed with that manifest and are never inferred from an update.
export function validateCorrections(input: unknown = []): IntakeCorrection[] {
  requireThat(Array.isArray(input) && input.length <= 20 && JSON.stringify(input).length <= 24_000, "Invalid corrections list");
  for (const item of input) {
    object(item);
    requireThat(Object.keys(item).every(key => ["factKey", "previousObservationId", "reason"].includes(key)), "Unrecognized correction field");
    text(item.factKey, "correction fact key", 200); text(item.previousObservationId, "prior observation ID", 200); text(item.reason, "correction reason", 1000);
  }
  unique(input.map(item => item.factKey), "correction key");
  return input.map(item => ({ factKey: item.factKey, previousObservationId: item.previousObservationId, reason: item.reason.trim() }));
}

// Only canonical resource locators can reach collectors; URLs are never fetched
// from arbitrary manifest fields, and commands are displayed but never executed.
export function validateLocator(sourceId: string, locator: string): void {
  if (sourceId === "npm") requireThat(/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(locator) && locator.length <= 214, "Invalid npm package locator");
  else requireThat(/^[A-Za-z0-9_-][A-Za-z0-9_.-]*\/[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(locator) && !locator.includes(".."), "Expected owner/repository or owner/model, not a URL/subpath");
}

export function validateManifest(input: unknown): IntakeManifest {
  object(input);
  requireThat(JSON.stringify(input).length <= 150_000, "Manifest is too large");
  requireThat(input.schemaVersion === 1, "Unsupported manifest version");
  const allowed = ["schemaVersion", "entity", "evidence", "domains", "useCases", "facets", "licenses", "facts", "resources", "interfaces", "subscriptions", "robotics"];
  requireThat(Object.keys(input).every((key) => allowed.includes(key)), "Unrecognized manifest field");
  const e = input.entity; object(e); slug(e.slug);
  requireThat(Object.keys(e).every((key) => ["slug","name","kind","summary","description","organization","country","lifecycle","opennessStatus","licenseSpdx","canonicalUrl","repositoryUrl","documentationUrl","visibility"].includes(key)), "Unrecognized entity field");
  for (const key of ["name", "summary", "description", "organization"]) text(e[key], key, key === "description" ? 8000 : 500);
  choice(e.kind, entityKinds, "kind"); choice(e.opennessStatus, opennessStatuses, "openness");
  choice(e.lifecycle, ["active","inactive","archived","unknown"], "lifecycle"); choice(e.visibility, ["public","unlisted"], "visibility");
  publicUrl(e.canonicalUrl);
  for (const key of ["repositoryUrl","documentationUrl"]) if (e[key] !== undefined) publicUrl(e[key]);
  if (e.repositoryUrl) requireThat(/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(e.repositoryUrl), "Repository URL must identify a GitHub repository");
  if (e.licenseSpdx !== undefined) text(e.licenseSpdx, "license", 100);
  if (e.country !== undefined) requireThat(/^[A-Z]{2}$/.test(e.country), "Country must use ISO alpha-2");
  evidence(input.evidence);
  if (input.licenses === undefined) input.licenses = [];
  for (const key of ["domains","useCases","facets","licenses","facts","resources","interfaces","subscriptions"]) requireThat(Array.isArray(input[key]) && input[key].length <= 60, `Invalid ${key} list`);
  requireThat(input.domains.length > 0, "A primary domain is required");
  input.domains.forEach((domain: unknown) => choice(domain, entityDomains, "domain")); unique(input.domains, "domain");
  for (const item of input.useCases) { object(item); slug(item.slug); text(item.name,"use case name",100); text(item.description,"use case description",500); evidence(item.evidence); }
  unique(input.useCases.map((item: any) => item.slug), "use case");
  for (const item of input.facets) { object(item); choice(item.facet,opennessFacetNames,"facet"); choice(item.status,opennessFacetStatuses,"facet status"); text(item.terms,"facet terms",2000); if (item.evidenceConfidence !== undefined) choice(item.evidenceConfidence,["verified","inferred","manual","conflicting","stale"],"evidence confidence"); evidence(item.evidence); }
  unique(input.facets.map((item: any) => item.facet), "facet");
  for (const item of input.licenses) {
    object(item); slug(item.id); text(item.scope,"license scope",200); text(item.licenseIdentifier,"license identifier",200); choice(item.status,["open","restricted","unknown"],"license status");
    if (item.path !== undefined) text(item.path,"license path",500); evidence(item.evidence);
  }
  unique(input.licenses.map((item: any) => item.id), "license scope ID");
  for (const item of input.facts) {
    object(item); requireThat(/^(software|spec|training|policy|availability|scope|capabilities)\.[a-z0-9_]+$/.test(item.key), "Fact must use an approved curated namespace");
    requireThat(item.value !== undefined && JSON.stringify(item.value).length <= 16000, "Missing or oversized fact value"); evidence(item.evidence);
    if (item.key.endsWith("_count")) requireThat(Number.isInteger(item.value) && item.value >= 0, "Counts must be non-negative integers");
    if (item.key === "availability.offer") { object(item.value); requireThat(Number.isFinite(item.value.price) && item.value.price >= 0 && /^[A-Z]{3}$/.test(item.value.currency), "Invalid monetary amount/currency"); }
  }
  unique(input.facts.map((item: any) => item.key), "fact key");
  for (const item of input.resources) {
    object(item); slug(item.id); text(item.name,"resource name",200); publicUrl(item.url); evidence(item.evidence);
    choice(item.kind,["documentation","package","repository","policy-file","simulation-assets","dataset","simulator","product","example"],"resource kind");
    if (item.gitBlobSha !== undefined) requireThat(/^[a-f0-9]{40}$/.test(item.gitBlobSha), "Invalid Git blob SHA");
    if (item.sizeBytes !== undefined) requireThat(Number.isInteger(item.sizeBytes) && item.sizeBytes >= 0, "Invalid byte size");
    for (const key of ["description","license","version","revision"]) if (item[key] !== undefined) text(item[key],key,2000);
  }
  unique(input.resources.map((item: any) => item.id), "resource ID");
  for (const item of input.interfaces) {
    object(item); slug(item.id); text(item.name,"interface name",200); choice(item.type,interfaceTypes,"interface type");
    choice(item.authentication,["none","required","optional","unknown"],"authentication"); choice(item.access,["read-only","local-write-opt-in","read-write","unknown"],"access"); choice(item.verification,["documented","tested","unknown"],"verification");
    text(item.transport,"transport",100); text(item.description,"interface description",2000); evidence(item.evidence);
    requireThat(Array.isArray(item.runtimes) && item.runtimes.length <= 10, "Invalid runtimes"); item.runtimes.forEach((r: unknown) => text(r,"runtime",100));
    if (item.url !== undefined) publicUrl(item.url); if (item.command !== undefined) text(item.command,"command",500);
    requireThat(item.url || item.command, "Interface requires URL or command");
  }
  unique(input.interfaces.map((item: any) => item.id), "interface ID");
  for (const item of input.subscriptions) { object(item); choice(item.sourceId,["github","github-releases","npm","huggingface"],"subscription source"); text(item.locator,"locator",214); validateLocator(item.sourceId,item.locator); if (item.role === undefined) item.role = item.sourceId === "huggingface" ? "weights" : item.sourceId === "npm" ? "package" : item.sourceId === "github-releases" ? "core" : "primary"; choice(item.role,sourceRoles,"source role"); }
  unique(input.subscriptions.map((item: any) => item.sourceId), "metric source per entity");
  const derivedOpenness = deriveOpennessStatus({ claimed: e.opennessStatus, facets: input.facets, licenses: input.licenses });
  requireThat(derivedOpenness === e.opennessStatus, `Openness ${e.opennessStatus} conflicts with facet or scoped-license evidence; derived ${derivedOpenness}`);
  if (input.robotics) {
    object(input.robotics); requireThat(input.domains.includes("robotics"), "Robotics profile requires robotics domain");
    choice(input.robotics.layer,roboticsLayers,"robotics layer"); object(input.robotics.metadata);
    for (const [key, values] of [["formFactor",robotFormFactors],["modelType",robotModelTypes],["stackType",roboticsStackTypes]] as const) if (input.robotics[key] !== undefined) choice(input.robotics[key],values,key);
  }
  return input as IntakeManifest;
}

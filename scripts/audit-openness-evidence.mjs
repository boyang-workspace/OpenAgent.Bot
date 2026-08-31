import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const limitArg = process.argv.find((value) => value.startsWith("--limit="));
const limit = Math.min(Math.max(Number(limitArg?.slice(8) || 30), 1), 127);
const labelArg = process.argv.find((value) => value.startsWith("--label="));
const runLabel = (labelArg?.slice(8) || `review-${new Date().toISOString().slice(11, 19).replaceAll(":", "")}`).replace(/[^a-z0-9-]/gi, "-");
const database = "openagent_registry_v2";
const reportDate = new Date().toISOString().slice(0, 10);
const sql = `WITH traffic AS (
  SELECT path,SUM(human_pageviews) AS human_views,SUM(agent_pageviews) AS agent_views
  FROM analytics_page_daily GROUP BY path
) SELECT e.id,e.slug,e.name,e.kind,e.license_spdx,s.locator AS repository,
  COALESCE(m.stars,0) AS stars,COALESCE(t.human_views,0) AS human_views,COALESCE(t.agent_views,0) AS agent_views
FROM entities e
JOIN source_subscriptions s ON s.entity_id=e.id AND s.source_id='github' AND s.enabled=1
LEFT JOIN openness_facets f ON f.entity_id=e.id AND f.facet='code'
LEFT JOIN entity_metrics_current m ON m.entity_id=e.id
LEFT JOIN traffic t ON t.path='/project/'||e.slug
WHERE e.visibility='public' AND e.openness_status='open-source' AND f.entity_id IS NULL
ORDER BY human_views DESC,agent_views DESC,stars DESC,e.name
LIMIT ${limit}`;

const d1Output = execFileSync("npx", ["wrangler", "d1", "execute", database, "--remote", "--json", "--command", sql], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
const queue = JSON.parse(d1Output)[0]?.results ?? [];
const githubToken = execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
if (!githubToken) throw new Error("GitHub authentication is required.");

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${githubToken}`,
  "User-Agent": "OpenAgent-Openness-Audit/1.0",
  "X-GitHub-Api-Version": "2022-11-28"
};
const restrictedName = /^(enterprise|commercial|proprietary|ee)([-_.].*)?$/i;
const openCodeLicenses = new Set([
  "0BSD", "AGPL-3.0", "APACHE-2.0", "BSD-2-CLAUSE", "BSD-3-CLAUSE",
  "GPL-2.0", "GPL-3.0", "ISC", "LGPL-2.1", "LGPL-3.0", "MIT",
  "MPL-2.0", "UNLICENSE"
]);
const normalizeLicense = (value) => String(value ?? "").trim().toUpperCase().replace(/-ONLY$/, "");
const codeLicenseName = /^(?:license|copying)[-_.]?code(?:\.[a-z0-9]+)?$|^code[-_.]?(?:license|copying)(?:\.[a-z0-9]+)?$/i;
const rootLicenseName = /^(?:license|copying)(?:\.[a-z0-9]+)?$/i;

function detectSpdxFromText(value) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (/licensing transition|Portions of this software are licensed as follows|Enterprise License/i.test(text)) return undefined;
  if (/MIT License/i.test(text) && /Permission is hereby granted, free of charge/i.test(text)) return "MIT";
  if (/Apache License,? Version 2\.0/i.test(text)) return "Apache-2.0";
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text) && /Version 3/i.test(text)) return "AGPL-3.0";
  if (/GNU GENERAL PUBLIC LICENSE/i.test(text) && /Version 3/i.test(text)) return "GPL-3.0";
  if (/Mozilla Public License Version 2\.0/i.test(text)) return "MPL-2.0";
  return undefined;
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) return { status: response.status, value: undefined };
  return { status: response.status, value: await response.json() };
}

async function review(row) {
  const [owner, repository] = String(row.repository).split("/");
  if (!owner || !repository) return { ...row, decision: "manual_review", reasons: ["invalid-repository-locator"] };
  const [licenseResponse, contentsResponse] = await Promise.all([
    github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/license`),
    github(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents`)
  ]);
  const rootEntries = Array.isArray(contentsResponse.value) ? contentsResponse.value : [];
  const codeLicenseEntry = rootEntries.find((entry) => codeLicenseName.test(String(entry.name)));
  const rootLicenseEntry = rootEntries.find((entry) => rootLicenseName.test(String(entry.name)));
  const selectedLicenseEntry = codeLicenseEntry ?? (
    !licenseResponse.value?.license?.spdx_id || licenseResponse.value.license.spdx_id === "NOASSERTION"
      ? rootLicenseEntry : undefined
  );
  const selectedLicenseResponse = selectedLicenseEntry?.url ? await github(new URL(selectedLicenseEntry.url).pathname) : undefined;
  const selectedLicenseText = selectedLicenseResponse?.value?.content
    ? Buffer.from(String(selectedLicenseResponse.value.content).replaceAll("\n", ""), "base64").toString("utf8")
    : undefined;
  const fileDetectedLicense = detectSpdxFromText(selectedLicenseText);
  const codeSpecificLicense = codeLicenseEntry ? fileDetectedLicense : undefined;
  const rootFallbackLicense = !codeLicenseEntry ? fileDetectedLicense : undefined;
  const detectedLicense = codeSpecificLicense ?? rootFallbackLicense ?? licenseResponse.value?.license?.spdx_id;
  const evidenceUrl = fileDetectedLicense ? selectedLicenseEntry?.html_url : licenseResponse.value?.html_url;
  const evidencePath = fileDetectedLicense ? selectedLicenseEntry?.path : licenseResponse.value?.path;
  const resolvedRepository = (() => {
    try {
      const [, ownerName, repositoryName] = new URL(evidenceUrl).pathname.split("/");
      return ownerName && repositoryName ? `${ownerName}/${repositoryName}` : undefined;
    } catch { return undefined; }
  })();
  const rootNames = rootEntries.map((entry) => String(entry.name));
  const restrictedSignals = rootNames.filter((name) => restrictedName.test(name));
  const reasons = [];
  if (!fileDetectedLicense && licenseResponse.status !== 200) reasons.push(`license-api-${licenseResponse.status}`);
  if (codeLicenseEntry && !codeSpecificLicense) reasons.push("code-license-not-detected");
  if (!codeLicenseEntry && rootLicenseEntry && !rootFallbackLicense && detectedLicense === "NOASSERTION") reasons.push("root-license-not-detected");
  if (!detectedLicense || detectedLicense === "NOASSERTION") reasons.push("license-not-detected");
  if (normalizeLicense(detectedLicense) !== normalizeLicense(row.license_spdx)) reasons.push("stored-license-mismatch");
  if (detectedLicense && !openCodeLicenses.has(normalizeLicense(detectedLicense))) reasons.push("not-approved-for-open-code-automation");
  if (!evidenceUrl) reasons.push("missing-license-evidence-url");
  if (resolvedRepository && resolvedRepository.toLowerCase() !== String(row.repository).toLowerCase()) reasons.push("repository-redirect");
  if (contentsResponse.status !== 200) reasons.push(`contents-api-${contentsResponse.status}`);
  if (restrictedSignals.length) reasons.push("possible-restricted-scope");
  return {
    ...row,
    detected_license: detectedLicense ?? null,
    evidence_url: evidenceUrl ?? null,
    evidence_path: evidencePath ?? null,
    evidence_kind: codeSpecificLicense ? "code-specific-license-file" : rootFallbackLicense ? "root-license-file-fallback" : "github-license-api",
    resolved_repository: resolvedRepository ?? null,
    restricted_signals: restrictedSignals,
    decision: reasons.length ? "manual_review" : "verified_open_code",
    reasons,
    observed_at: new Date().toISOString()
  };
}

const reviews = [];
for (let offset = 0; offset < queue.length; offset += 6) reviews.push(...await Promise.all(queue.slice(offset, offset + 6).map(review)));
const summary = {
  generated_at: new Date().toISOString(),
  grain: "one active GitHub repository binding per public entity missing a code openness facet",
  reviewed: reviews.length,
  verified_open_code: reviews.filter((row) => row.decision === "verified_open_code").length,
  manual_review: reviews.filter((row) => row.decision === "manual_review").length,
  sources: ["GitHub Repository License API", "GitHub root contents API", "GitHub code-specific license files"]
};

const reportDirectory = resolve(root, "reports", `openness-evidence-${reportDate}-${runLabel}`);
await mkdir(reportDirectory, { recursive: true });
await writeFile(resolve(reportDirectory, "review.json"), `${JSON.stringify({ summary, reviews }, null, 2)}\n`);
const csvRows = reviews.map((row) => [row.id,row.slug,row.name,row.repository,row.resolved_repository,row.license_spdx,row.detected_license,row.decision,row.evidence_kind,row.evidence_path,row.evidence_url,row.restricted_signals.join("|"),row.reasons.join("|")]);
const csv = [["entity-id","slug","name","repository","resolved-repository","stored-license","detected-license","decision","evidence-kind","evidence-path","evidence-url","restricted-signals","reasons"], ...csvRows]
  .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
await writeFile(resolve(reportDirectory, "review.csv"), `${csv}\n`);
console.log(JSON.stringify({ ...summary, report_directory: reportDirectory }, null, 2));

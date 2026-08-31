# Knowledge v0.1 read-only API preview

Local implementation; not deployed. Existing `/api/v1/` and `/project/:slug.json`
contracts are unchanged. Agent discovery links are included in `/llms.txt` and
the supported parameter reference in `/api`; they become available on deployment.

## Three entry points

```text
GET /api/knowledge/v1/search.json?interface=mcp&access=read-only&authentication=none
GET /api/knowledge/v1/project.json?slug=vgpu&section=interfaces&id=mcp-http
GET /api/knowledge/v1/history.json?slug=vgpu&fact_key=curated.entity&limit=5
```

`search`: required `interface=cli|api|mcp|sdk`; optional `access`, `authentication`,
`verification=documented|tested`, `require_fresh=true|false`, `version_id`,
`domain=agent|robotics|shared` (any recorded domain assignment, not compatibility),
`project` (exact slug), `q` (literal substring of project name/summary), `limit`,
`cursor`. Access values: `read-only|local-write-opt-in|read-write`; authentication:
`none|required|optional`. Unknown/duplicate parameters, blank values and invalid
enums return 400; no silently ignored constraints. Equality is exact, on the same
interface. Defaults: documented verification, freshness not required, limit 10.
When no access/auth filter is present, verification/freshness/version requirements
apply to the transport claim. A match is not verification of every field.

`project`: required `slug`; `section=overview` by default. Other sections:
`interfaces`, `resources`, `openness`, `fields`, `facts`. Interfaces/resources accept `id`
(exact local ID). Facts require one `fact_key`; arbitrary whole-fact-list dumping
is intentionally not provided. Non-overview sections support `limit`/`cursor`.
The response-local `evidence` dictionary resolves claim references. Resource
versions, scoped terms and digests remain in the answer. Missing interfaces are
unrecorded coverage, not proof that a project has no interface.

`section=fields` is a paginated key index: each item gives its `key`, top-level
status, verification, freshness, value type and evidence references, without
the full value. Discover available keys here, then request exactly one via
`section=facts&fact_key=...`. Index status applies only to the top-level claim;
nested nulls are still unknown. `fields` accepts neither `id` nor `fact_key`.
Each index item now includes a `valueUrl` for its exact fact. Overview includes
`links.fields`, `links.interfaces` and `links.resources`: known-project lookups
should follow those paths, not call discovery search without an interface.

```text
GET /api/knowledge/v1/search.json?domain=robotics&interface=cli&access=read-write
GET /api/knowledge/v1/project.json?slug=lerobot&section=fields&limit=5
GET /api/knowledge/v1/project.json?slug=lerobot&section=facts&fact_key=policy.physical_execution
```

The expansion manifests cover OpenHands Agent Canvas, Python LangGraph, LeRobot
and Playwright MCP. Existing IDs, domain assignments and metric owners remain
stable. OpenHands SDK/Agent Server, LangGraph JS and Playwright CLI must not be
silently merged into their related repository records. Physical actuation,
browser mutation, model-provider credentials and artifact licenses have separate
scope notes. These are source-reviewed declarations, not executed integrations.

`history`: required `slug`; optional `since` (inclusive ISO timestamp with timezone),
`fact_key`, `limit` (default 5), `cursor`. Detection time drives `since`, not source
publication/effective time. Old SQLite UTC timestamps and ISO times are ordered
chronologically. Each previous/next value has `value`, `bytes`, `truncated`;
values over 4,096 UTF-8 bytes are explicitly omitted. This preview has no full-value
export. An empty event list does not establish unchanged upstream software.

`firstRecordedAt` is the earliest retained observation's **registry insertion**
time for the project (or selected fact key), independent of the `since` filter.
It is not the source publication date, the date the claim became true, or proof
of complete collection. A new intake fact now emits `created`; restoring a removed
selection can also emit `created`, without changing its earliest observation time.
No past missing events are fabricated by the migration.

An explicitly reviewed correction emits `kind=corrected` on this history endpoint,
with `observationId`, `correction.reason`, `publicationId`, `previousObservationId`
and `previousEvidence` references. Both old and new evidence resolve in the page's
dictionary. Ordinary value updates remain `updated`; ordinary removals remain
`removed`. A provenance-only correction can have equal previous/next values but
different evidence. Reviewer identity is not exposed here. Legacy change JSON and
the dossier projection retain their base `updated` enum; consult this endpoint for
correction annotations. A correction is a reviewed declaration, not an independent
guarantee that the new claim is true.

## Pagination and operational bounds

- All page limits are 1–20. Search scans at most 50 interface declarations per
  request. Follow `nextCursor` even on an empty page. `coverage.exhausted` concerns
  only this query over recorded declarations, not the wider ecosystem.
- Search uses a live `(entity_id, fact_key)` keyset. Concurrent mutations can
  change later pages; it is not a consistent full-corpus snapshot.
- Project section cursors bind to the document fingerprint; changes return 409
  and require restarting. The underlying dossier reads are not a DB transaction.
- History captures a rowid horizon and uses `(julianday(detected_at), id)` keyset
  ordering. Later appends are excluded even if their detection time is earlier.
  This assumes the existing append-only ledger; deletion/rewrites are not covered
  by snapshot isolation, and upstream history completeness is still unknown.
- Cursors must retain the same endpoint/project/filters. They are validated
  navigation state, not signed authorization. Every lookup still checks public
  visibility. Changing `limit` is allowed.
- HTTP: GET only (405 otherwise), no-store, 400 invalid input, 404 no public
  identifier, 409 record changed, 413 response exceeds 128 KiB, 503 unavailable
  storage/projection. DB errors do not become empty successful answers.
- This is a bounded preview, not a latency SLA. Projection reuses full dossiers
  internally; no search index, payload-independent CPU budget or load test exists.

## Semantics that agents must not infer

`documented` is not `tested`. Official evidence is not a test report. Sync health
is not field freshness. The sample interfaces have no field-specific expiry or
scoped runtime test report; fresh/tested filters therefore return no positive
match and expose unknown candidates. Contract support is not an ingestion/review
workflow for these fields yet.

Access is **declared capability, not the active runtime configuration**. vgpu's
local MCP defaults to read-only and can opt into writes; its coarse label remains
`local-write-opt-in` and will not match strict `read-only`. Configuration-specific
matching needs a later reviewed mode/scope contract. `referenceUrl` may be a docs
URL, `commandText` is inert, and no interface grants execution authority.

History supports recorded-event navigation, not “what was true at date X”.
`pointInTime` remains `unavailable`; `effectiveAt` remains unknown. Production retention,
backups, restore drills and general immutable upstream byte storage are
not established by this API. Explicit operator corrections are now supported via
reviewed intake, not via a public write endpoint. Resource license text is never a commercial-use
grant or an inherited repository license.

## Isolated HTTP preview and real-client pilot

```bash
npm run knowledge:preview
# Optional fixed port: npm run knowledge:preview -- --port=8979
# Read the printed origin, then GET /llms.txt or /health on that origin.
npm run knowledge:evaluate:client -- --tasks=C1
```

The preview binds only `127.0.0.1`, replays migrations and manifests into **memory**,
then enables SQLite `query_only`. It does not use Wrangler, `.dev.vars`, a persistent
local D1 database, source collectors or production credentials. It serves only
the three Knowledge endpoints, a guide, health and pinned experiment documents;
no arbitrary files, internal write routes or executable project commands. It rejects
non-GET, foreign Origin and nonmatching Host headers. This is local development,
not authenticated hosting for a shared machine or a production deployment.

The bounded in-memory audit records status, byte count, duration, path, query keys
and a query hash. It does not log credentials, query values, request bodies or IPs.
The 13 official source files are fixed at reviewed commits with Git blob and SHA-256
checks; source license notices are retained. They are a test corpus, not a complete
source archive or an operational retention policy.
The experiment reader supports identical navigation in both arms:
`/sources/ID?query=literal` (2–100 characters, first ten matching context windows)
or `/sources/ID?start=1&end=120` (1-based, at most 200 lines). Numbered excerpts
retain the original file URL/digests and explicitly identify whole-file hash scope.
No literal match is not semantic absence. Bare `/sources/ID` still returns the
full original UTF-8 text. No arbitrary file or remote URL can be read.

`knowledge:evaluate:client` explicitly consumes the logged-in Codex account's usage.
It launches fresh ephemeral CLI sessions with transient configuration, an empty
working directory, no shell/web/plugins/hooks/other agents and one read-only MCP
proxy. The proxy enforces each arm's route allowlist and a 24-read budget; it is a
**test adapter, not a production MCP product**. No global settings or login state
are changed. Claude login is checked, never created automatically. The baseline is
the same pinned original documents, not live search; see the
[pilot receipt and limitations](evaluations/2026-08-28-client-pilot/README.md).
Use `--tasks=C2 --arms=platform` (or `sources`) for one trial at a time and preserve
its printed receipt immediately. Each client task has a 180-second timeout.

## Reproduce the local evaluation

```bash
npm run knowledge:check
npm run knowledge:evaluate -- after
npm run knowledge:evaluate:expansion -- after
node scripts/evaluate-knowledge.mjs before
npm test
npm run check
npm run build
```

Tests replay migrations and reviewed manifests into isolated in-memory SQLite.
No connector, production write, package command from a record, shader or robot
is executed. No dependency was added and no CI workflow was enabled.

Before public rollout: persist the reviewed legacy resource-ID mappings through
the intake/migration audit path, review/publish the OpenCode manifest separately,
and the four expansion manifests separately, then exercise the deployed Worker/D1
boundary and establish operational limits. The saved before/data-only/after
expansion receipts are under `docs/evaluations/2026-08-28-expansion/`; all three
use the same frozen task specification. Re-running `before` now omits enrichment
but uses current code, so it does not reproduce the old API binary; use the saved
receipt and query fingerprint for the historical baseline.

Apply additive migration `0016_reviewed_corrections.sql` before deploying the new
history query or using corrections. This work has not applied it to production.
Earlier saved evaluation receipts describe the prior code/ledger behavior and are
preserved unchanged; rerunning against current code intentionally produces new
first-seen events and different document fingerprints/payload sizes.

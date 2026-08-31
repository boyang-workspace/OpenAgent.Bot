# OpenAgent Knowledge v0.1 — first implementation batch

Status: implemented locally, not published to production. The foundation described
below is now supplemented by a second, read-only API preview: strict search,
compact sections and ledger pagination. See [API semantics](KNOWLEDGE_API.md) and
[the before/after evaluation](evaluations/2026-08-28/README.md). There is still no
production MCP server, point-in-time reconstruction or execution runtime. A later
local batch adds a test-only stdio proxy, isolated HTTP preview and explicit
correction history; see [the client pilot](evaluations/2026-08-28-client-pilot/README.md). References below
to the “first batch” describe its original boundary, not the second batch.

## Scope and implementation decisions

The product direction is a durable, evidence-backed resource knowledge service
for agents and robotics software. Humans still review evidence, configure clients
and authorize actions. A resource description is never execution permission.

The first batch implements three agreed tasks:

1. A versioned contract, explicit identities and a read-only dossier adapter.
2. Three representative samples: vgpu, OpenCode and the Microduck ecosystem.
3. Contract, provenance, identity and legacy compatibility tests.

### ADR: evolve the existing ledger, do not replace it

Keep Astro, Workers and D1. `observations`, `current_facts`, `change_events` and
reviewed intake remain the data foundation. `buildKnowledgeDocument()` is a
derived view, not another database and not a new source of truth.

No migration, connector, production route, UI, workflow setting or existing
dossier response changes in this batch. In particular:

- Reviewed intake still accepts `schemaVersion: 1`.
- Existing project JSON still uses `schemaVersion: "2026-08-28"`.
- The new, separately named Knowledge contract uses `schemaVersion: "0.1.0"`.
- Existing REST filters retain their current behavior. Strict new query parsing
  and REST/MCP integration belong to the next batch.

The tradeoff is explicit: legacy records have missing identity, scope and temporal
metadata. The adapter reports those gaps instead of guessing. Schema v0.1 is
implemented as TypeScript types and checked constructors, not an untrusted JSON
request parser. Any public write/query boundary must validate its own input.

### ADR: identity is separate from version and snapshot

| Object | Identity or version rule |
| --- | --- |
| Project | `urn:openagent:project:<encoded registry ID>`; not the mutable slug |
| Resource | `urn:openagent:resource:<encoded registry ID>:<encoded local ID>` |
| Interface | Separate `interface` namespace, even if its local ID equals a resource ID |
| Resource version | Subject ID plus SHA-256 of the explicit label/revision/digest descriptor |
| Document snapshot | SHA-256 fingerprint of the complete derived document, excluding the fingerprint itself |

The resource version descriptor distinguishes a release label, source revision
and typed digest. A `git-blob-sha1` is a Git object digest, not a raw-file SHA-256.
A release label alone does not promise immutable or recoverable upstream bytes.
A repository/docs commit is not automatically the version of a package or hosted
MCP deployment. Interface version scope therefore remains unknown for these
legacy inputs.

Resource IDs must be assigned explicitly. The Microduck seed predates resource
IDs; `content/knowledge/microduck-resource-ids.json` assigns 14 identities to the
existing four-project ecosystem. The caller opts into this reviewed mapping.
It changes no original facts, source URLs, dates or hashes. The matching pair
`factKey + name` is a legacy lookup, **not** the permanent ID: a later rename must
update that lookup while preserving the assigned ID. Ambiguous/unused mappings
fail validation. Missing mappings produce `missing-resource-id` issues; raw
attributed facts remain visible, but unresolved resources are not published as
addressable machine resources.

Before public rollout, resource identity changes must have an audited persistence
path (reviewed intake or an additive identity migration). The map is not a general
cross-project deduplication or alias-resolution service.

## Claim semantics

Each machine claim carries a selected value or explicit uncertainty, evidence,
verification level, version/effective-time scope and optional field-level freshness.

| Field | Meaning |
| --- | --- |
| `status: known` | A non-null value with at least one dated source URL; not a correctness guarantee |
| `status: unknown` | No selected value; missing values and missing evidence cannot satisfy constraints |
| `status: conflicted` | At least two distinct, attributed alternatives; no silently chosen winner |
| `status: withdrawn` | No currently usable selected value |
| `verification: documented` | Source-backed description, not execution or safety testing |
| `verification: tested` | Requires a report, test timestamp and matching exact version scope |
| `sourceTrust` | Source classification, separate from verification and claim confidence |
| `observedAt` | When evidence was observed; not its publication or effective date |
| `publishedAt` | Upstream publication time, null when unknown |
| `checkedAt` / `expiresAt` | Check and expiry of this claim, not the repository's latest successful sync |
| `validFrom` / `validUntil` | Explicit effective interval, independent of observation time |

`knowledgeClaim()` and `assertKnowledgeClaim()` enforce these invariants.
`matchKnowledgeClaim()` is an exact-equality building block returning `matched`,
`not-matched` or `unknown`; it performs no semantic inference. Unknown, conflicted,
withdrawn, expired, unsupported-version and insufficient-verification claims
cannot produce `matched`. A freshness requirement cannot pass without a field-level
check and expiry. Without that requirement, dated documentation can match, but
does not claim to be fresh. Future observations/tests cannot establish an earlier
known state.

The adapter deliberately does not infer a freshness lifetime. Existing curated
evidence has no recorded field-level expiry; its freshness remains unknown. Source
sync health is exposed separately, including the last error; a fetch failure does
not erase the last attributed resource data or refresh its evidence date.

`project` fields are navigation/display metadata. Arbitrary `facts` are attributed
source statements, potentially composite and containing nested unknown values.
Constraint queries should use typed projections or explicitly supported fact
keys, not recursively treat every embedded legacy value as a verified assertion.
In particular, an embedded legacy `verification: tested` is not a test report.

Resource license text is resource-specific and literal; it is never inherited
from the project or automatically converted into an SPDX/commercial-use grant.
Relationship review is not runtime compatibility, which remains `unknown` here.

## The three sample cases

| Sample | Implemented representation | Deliberately not asserted |
| --- | --- | --- |
| vgpu | One tool, five interfaces, five resources; hosted read-only MCP distinguished from opt-in local writes | Tested MCP, deploy version, freshness, automatic invocation |
| OpenCode | Existing `res_opencode` identity; CLI and HTTP API; model configuration and permission facts; three pinned resources | Universal no-auth access, minimum compatible model version, sandbox safety |
| Microduck ecosystem | Four existing projects; fourteen resources including nine policy files; typed digests; scoped openness and simulation terms | Open hardware, unrestricted weight licensing, a training dataset, tested robot compatibility |

vgpu reuses its existing reviewed manifest. Microduck reuses the original
migration observations and evidence dates. Tests replay the real migration chain
and publish manifests only into isolated in-memory SQLite through the existing
preview/hash/publish workflow. They do not fetch dependencies or execute any
listed command, policy or shader.

The OpenCode manifest is new and **not yet published**. Primary sources reviewed
on 2026-08-28, pinned to commit `15537a41d2a0514f7040e1c4128b7846cdc19ce0`:

- [CLI](https://github.com/anomalyco/opencode/blob/15537a41d2a0514f7040e1c4128b7846cdc19ce0/packages/web/src/content/docs/cli.mdx)
- [Server](https://github.com/anomalyco/opencode/blob/15537a41d2a0514f7040e1c4128b7846cdc19ce0/packages/web/src/content/docs/server.mdx)
- [Permissions](https://github.com/anomalyco/opencode/blob/15537a41d2a0514f7040e1c4128b7846cdc19ce0/packages/web/src/content/docs/permissions.mdx)
- [Models](https://github.com/anomalyco/opencode/blob/15537a41d2a0514f7040e1c4128b7846cdc19ce0/packages/web/src/content/docs/models.mdx)
- [Source license](https://github.com/anomalyco/opencode/blob/15537a41d2a0514f7040e1c4128b7846cdc19ce0/LICENSE)

For example, evaluating the vgpu sample at `2026-08-28T02:00:00Z` yields:

```json
{
  "hostedMcpReadOnly": "matched",
  "hostedMcpNoAuth": "matched",
  "localMcpReadOnly": "not-matched",
  "hostedMcpTested": "unknown",
  "hostedMcpFresh": "unknown"
}
```

These are assertions from the sample contract tests, not live probes. Commands
are inert `commandText`; legacy URLs are `referenceUrl` because some point to
documentation rather than callable endpoints. Every interface explicitly says
`execution: "not-provided"`.

## History boundary

The document includes the available recent change events, preserving detection
time as `recordedAt` and leaving `effectiveAt` unknown. The repository currently
loads at most 20 changes. The document therefore always labels coverage `partial`
and point-in-time queries `unavailable`, even when its change list is empty.

The contract can represent corrections, withdrawals and conflicts. This batch
does **not** implement their review workflow, detect all cross-source conflicts,
retroactively infer validity, or expose the complete observation ledger. A
snapshot fingerprint is not a backup or a historical reconstruction. History
pagination, temporal selection, retention/export and restore drills remain work
for later batches.

## Verification and next checkpoint

```bash
npm run knowledge:check
npm test
npm run check
npm run build
```

The targeted suite verifies both positive samples and failure cases: absent
evidence, unknown permissions, unscoped tests, expiring facts, conflicts,
withdrawals, identity collisions, invalid digests, invalid dates, bidirectional
relationships, retained sync errors and unchanged legacy output/database rows.

Local verification on 2026-08-28: 22 targeted tests passed (also under
`TZ=Asia/Shanghai`), all 81 tests passed, Astro reported zero diagnostics, and the
production build completed. These are local checks, not a deployment or upstream
tool/robot execution test.

After review of this batch:

1. Define strict query inputs and one shared constraint/query service; invalid
   conditions must never silently broaden results.
2. Implement versioned resource/detail/history APIs with pagination and explicit
   unavailable/stale/conflict behavior. Add HTTP endpoint/command scope metadata
   rather than guessing from legacy URLs.
3. Expose a read-only MCP adapter over that same service; no arbitrary URL proxy,
   tool execution, command installation or physical robot control.
4. Expand reviewed records and evaluate real client queries, latency and costs.

No CI workflow is enabled by this batch. Production publication and migrations
must use their existing reviewed operations, not an incidental test run.

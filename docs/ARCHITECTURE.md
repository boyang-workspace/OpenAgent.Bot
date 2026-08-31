# Registry V2 architecture

## Data contract

`entities` stores stable identity and query-friendly materialized fields. It is not the historical source of truth.

`observations` is append-only. Each row binds a normalized fact value to an entity, source, sync run and observation time.

`current_facts` points to the selected observation for each entity/fact pair. When a selected value changes, `change_events` records the previous and next values.

`metric_snapshots` stores time-series measurements used by rankings. `entity_metrics_current` exists only for fast product queries.

`relationships` require one or more rows in `relationship_evidence` before they should be marked verified.

## Agent-first knowledge contract (local preview)

Knowledge v0.1 adds a read-only, versioned projection over existing dossiers. It
separates project/resource/interface identities, resource-version descriptors,
source evidence, verification, effective time and field-level freshness. Missing
metadata stays unknown; the legacy JSON/Markdown and intake contracts are unchanged.
The first batch includes vgpu, OpenCode and Microduck contract samples. The second
adds `KnowledgeQueryService` and three read-only routes under `/api/knowledge/v1/`:
strict interface search, compact project sections and cursor-paginated ledger
changes. Invalid filters fail closed. Evidence is deduplicated within a response,
not omitted. Failed D1 reads return 503, not empty success. Search scans at most
50 candidates per page; changes use a rowid append horizon plus a timestamp/ID
keyset. Neither is historical reconstruction. There is no new database, migration,
MCP server, tool execution or production deployment in these batches. See
[the contract](KNOWLEDGE_V0_1.md) and [query boundaries](KNOWLEDGE_API.md).

The third batch enriches four existing identities from pinned official sources,
without moving repository metrics to related components. `search.domain` uses
an `EXISTS` membership check over `entity_domains`; membership never asserts
compatibility. `project.section=fields` lists fact keys and top-level claim
metadata without values, then clients retrieve an exact key through `facts`.
Field-index pagination retains the same snapshot guard and compact evidence map.
Nested null properties remain unknown even when a composite fact is sourced.
Recorded observations and intake audits are not full upstream history.

The fourth local batch adds a loopback-only, query-only in-memory HTTP preview and
a test-only stdio MCP adapter for real client experiments. It does not use production
secrets or write to a persistent registry. Explicit operator corrections use the
additive `0016_reviewed_corrections.sql` sidecar, leaving legacy event enums and
observations intact. Intake now records initial fact selections as `created`.
Correction reasons and exact prior-observation references are preview-hashed,
validated again at publication and inserted in the same transaction as the new
observation/current selection. A DB trigger checks the still-current prior selection;
correction annotations reject update/delete. No old missing events are backfilled.
The Knowledge history endpoint exposes `corrected`, old/new evidence and the
earliest retained observation insertion time; legacy JSON keeps its base event
kind. Retention/restore guarantees and point-in-time reconstruction remain unbuilt.

## Source tiers

1. Canonical: repository and registry APIs.
2. Official: company newsrooms, research pages and documentation.
3. Community: maintainer discussions and reputable technical references.
4. Discovery: social and aggregator signals; never sufficient alone for material facts.

The code catalog includes both `active` and `registered` sources. Registered HTML sources are an explicit adapter backlog, not claimed automation coverage.

## Synchronization

The internal sync endpoint requires `SYNC_TOKEN`. GitHub Actions calls it in bounded batches. Successful subscriptions move their next sync one day forward; failed subscriptions back off for 2–24 hours and keep their last successful data. Due-time comparisons use SQLite date parsing, including both legacy SQL timestamps and ISO timestamps.

GitHub repositories, GitHub stable releases, npm package/version/downloads and Hugging Face models normalize facts and metrics. The RSS connector stores official source items. HF datasets/spaces and website specifications are not automated yet. Package downloads use a separate metric key and never overwrite the repository/model metrics cache. Release dates are projected from attributed release facts. Sync updates last-seen timestamps, not curated verification dates or entity summaries/licenses.

## Reviewed intake

`content/intake/*.json` follows the validated contract in `intake-contract.ts`. Preview is read-only; publish checks the reviewed payload/base hashes, claims a monotonic revision and writes facts, observations and query projections in one D1 batch. It records the reviewer, previous state and diff in `intake_publications`. `entity_interfaces` is a filter index, not a competing source of truth. Existing robotics profiles cannot be removed by omission. Prior observations remain immutable when a previous manifest is re-published. See [intake operations and limits](REGISTRY_INTAKE.md).

## Ranking publication gate

The first Open Momentum ranking stays in `collecting` until it has at least 30 days of history and 80% input coverage for every entity in a cohort. Published snapshots retain their methodology version and score components.

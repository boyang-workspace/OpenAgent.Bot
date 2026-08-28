# Registry V2 architecture

## Data contract

`entities` stores stable identity and query-friendly materialized fields. It is not the historical source of truth.

`observations` is append-only. Each row binds a normalized fact value to an entity, source, sync run and observation time.

`current_facts` points to the selected observation for each entity/fact pair. When a selected value changes, `change_events` records the previous and next values.

`metric_snapshots` stores time-series measurements used by rankings. `entity_metrics_current` exists only for fast product queries.

`relationships` require one or more rows in `relationship_evidence` before they should be marked verified.

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

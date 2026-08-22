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

The internal sync endpoint requires `SYNC_TOKEN`. GitHub Actions calls it in batches of at most 20 subscriptions. Synchronized subscriptions move their `next_sync_at` forward one day, so a failed or unprocessed subscription remains due.

GitHub and Hugging Face connectors normalize entity facts and metrics. The RSS connector stores official source items. New connectors implement the same snapshot boundary; they do not write directly to product pages.

## Ranking publication gate

The first Open Momentum ranking stays in `collecting` until it has at least 30 days of history and 80% input coverage for every entity in a cohort. Published snapshots retain their methodology version and score components.

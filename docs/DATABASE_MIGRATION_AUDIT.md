# SteamDB-direction migration audit

Date: 2026-08-29

## Keep and extend

The current registry already contains the difficult historical primitives and must
not be replaced:

- `entities`, aliases and relationships provide durable project identity.
- `sources`, subscriptions and sync runs provide collection ownership and health.
- `observations` plus `current_facts` preserve evidence and current selections.
- `metric_snapshots` provides time-series storage without a fixed metric schema.
- `change_events` provides the public change ledger.
- `ranking_definitions`, snapshots and entries already separate methodology from
  calculated results.
- domain assignments, robotics profiles, openness facets, use cases and reviewed
  intake preserve useful reviewed classification.

The existing repository, Hugging Face, package and reviewed-intake connectors are
inputs to the new catalogue. They are not the product taxonomy.

## Add now

Migration `0017_catalog_foundation.sql` adds:

- one explicit catalogue category per entity;
- typed, source-attributed extensible facets;
- releases and artifact versions;
- papers and entity-paper relationships;
- benchmark definitions and evaluation results with conditions;
- versioned lifecycle assessments;
- metric definitions and data-coverage snapshots;
- category/family/window metadata on ranking definitions and quality metadata on
  ranking snapshots and entries.

The migration backfills a conservative category from the reviewed domain and
robotics-layer data. Existing public records remain included while classification
confidence and review status stay separately visible; no item is deleted.

## Route disposition

| Existing surface | Disposition |
| --- | --- |
| `/` | Replace with four-category database overview |
| `/agents` | Keep; convert to category ranking/catalogue |
| `/robotics` | Replace with links to robot models, robot hardware and supporting infrastructure; then redirect when coverage is complete |
| `/database` | Keep during transition; canonical destination becomes `/explore` |
| `/rankings` | Keep as ranking hub and add category/family routes |
| `/changes` | Keep as canonical change ledger |
| `/pulse` | Merge into `/changes`, then redirect |
| `/compare` | Keep as a secondary utility, remove from primary navigation |
| SEO landing pages | Preserve or redirect individually after traffic and canonical review |
| Knowledge/MCP APIs | Keep out of primary navigation; retain as a projection over the same evidence database |

## Known gaps before public rankings

- Historical coverage is still shorter than the 30-day publication gate.
- Foundation-model sources need release/download ownership beyond repository stars.
- Robot-hardware activity requires official product, SDK and firmware sources.
- Benchmark results require test-condition normalization before any performance
  ordering is credible.
- Existing records need catalogue-category review; automatic backfill is a migration
  aid, not an editorial conclusion.

## Safe cleanup rule

No table, record or public route is removed in the foundation migration. Cleanup
requires a replacement route, a redirect map, an indexability check and at least
one production release of overlap. Unused tables are archived only after query and
pipeline references reach zero.

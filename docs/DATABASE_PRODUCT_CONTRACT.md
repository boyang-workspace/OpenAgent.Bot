# OpenAgent.bot database product contract

Status: implementation baseline
Version: 0.1
Date: 2026-08-29

## Product definition

OpenAgent.bot is a public, historical database for open AI and robotics projects.
It records what a project is, what it publishes, how it changes, how it is
evaluated, and which source supports every material claim. Rankings are a view
over that database; they are not the database itself.

The product promise is:

> Track open models, agents, robot intelligence and robot hardware over time.

## Primary catalogue categories

Every public project has exactly one primary catalogue category. Secondary
relationships and facets may cross category boundaries.

| Category | Included objects | Excluded or redirected objects |
| --- | --- | --- |
| `foundation-model` | LLMs, VLMs and general multimodal foundation models with accessible code or weights | APIs with no open implementation or weights |
| `agent` | Runnable agents, agent harnesses and agent frameworks | General tools with no agent runtime or orchestration role |
| `robot-model` | VLA, policy, world, perception, navigation and manipulation models; versioned robot simulation assets | General AI models with no embodied use; physical robot products |
| `robot-hardware` | Complete robots, arms, hands, mobile bases, drones and open robot hardware platforms | SDKs, simulators and training frameworks |
| `supporting-infrastructure` | Datasets, simulators, SDKs, protocols and tools needed for discovery and relationships | Not shown as a primary homepage leaderboard |

`robot-model` uses subtypes to keep unlike artifacts out of the same cohort:

- `intelligence`: learned VLA, policy, world, perception, navigation and manipulation models.
- `physics`: physics models and simulation engines when the model itself is the tracked artifact.
- `asset`: URDF, MJCF, CAD and digital-twin artifacts.

## Inclusion policy

A project is eligible for the public catalogue when all of the following hold:

1. It has a stable upstream identity and at least one official or canonical source.
2. Its code, weights, hardware design, or another material implementation facet
   is publicly inspectable. The exact openness facet is shown; "open" is never
   inferred from marketing language.
3. It is a real released project or a clearly identified prerelease, not a listicle
   entry, company claim, or unverified repository fork.
4. OpenAgent.bot can distinguish it from aliases, forks, packages and related
   components.

`inclusion_status` is one of `included`, `review`, or `excluded`. An excluded
record may remain internally for redirects, deduplication and historical audit.

## Lifecycle policy

Lifecycle is an assessment with evidence and a methodology version, not a mutable
label on the project alone.

| State | Meaning |
| --- | --- |
| `active` | Meaningful release, commit, model, documentation, firmware or product update inside the category-specific active window |
| `cooling` | Previously active, but the recent update rate has materially slowed |
| `dormant` | No meaningful activity inside the category-specific dormant window and no official archival signal |
| `archived` | Officially archived, discontinued, deprecated, superseded or repository-archived |
| `unknown` | Insufficient or conflicting evidence |

The UI may use "probably dormant" as informal copy. It must not present "dead"
as a verified fact unless an official source says the project is discontinued.

Initial windows are deliberately conservative and versioned in methodology:

- Software agents: active at 90 days, dormant after 365 days.
- Foundation and robot models: active at 180 days, dormant after 540 days.
- Robot hardware: active at 365 days, dormant after 730 days.

An official archival or discontinuation signal always takes precedence over time
windows. A stable mature project can be manually reviewed out of a false dormant
classification with an explicit reason and source.

## Ranking families

Rankings are always scoped by category, family, time window and methodology
version. No cross-category composite rank is published.

- `momentum`: change over a recent window; avoids rewarding raw historical size.
- `activity`: sustained maintenance and release health.
- `adoption`: current usage or following, explicitly source-labelled.
- `evaluation`: comparable third-party or benchmark results only.

The first implementation publishes category-specific `activity` definitions in
collecting state. A ranking can move to `published` only when it has:

- at least 30 comparable history days;
- at least 80% required-metric coverage;
- at least 10 eligible projects;
- a frozen methodology version and visible component weights.

### Category-specific activity inputs

| Category | Primary inputs |
| --- | --- |
| Foundation model | model/release recency, model-card or weight revision, download trajectory, paper/update recency |
| Agent | stable release recency, commit recency, release cadence, contributor breadth, issue/PR maintenance |
| Robot model | weight/policy release, dataset or benchmark update, paper recency, supported platform growth |
| Robot hardware | product revision, SDK/firmware release, documentation update, availability and official lifecycle signal |

Stars are an adoption input. They do not dominate activity or evaluation.

## Evidence and time contract

Every displayed material value must expose, directly or through its detail view:

- source identity and URL;
- observed time;
- effective or release time when different;
- applicable project release or artifact version when known;
- confidence and whether the source is canonical, official, community, or discovery;
- freshness or missing-data state.

Unknown values remain unknown. Collection failures retain the last known value and
surface staleness; they do not silently write zero.

## Detail-page contract

Every detail page uses one shared record header and category-specific modules:

1. Identity, category, subtype, organization, openness and lifecycle.
2. Current metrics with source and observation time.
3. Historical charts and rank history.
4. Releases and versioned artifacts.
5. Papers and project relationships.
6. Benchmark and third-party evaluation results with conditions.
7. Category-specific specifications and facets.
8. Changes, sources, data coverage and correction entry point.

"Complete" means coverage is visible and attributable, not that every field is
filled.

## Information architecture

- `/` — four category snapshots, recent releases and important changes.
- `/models` — foundation-model rankings and catalogue.
- `/agents` — agent rankings and catalogue.
- `/robot-models` — robot-intelligence, physics and asset cohorts.
- `/robots` — robot-hardware rankings and catalogue.
- `/rankings/:category/:family` — methodology-versioned ranking history.
- `/project/:slug` — canonical project record.
- `/changes` — observed change ledger.
- `/explore` — full cross-category filter and search interface.
- `/methodology` — inclusion, lifecycle, source and ranking rules.

Legacy routes are redirected only after their replacement ships. Historical data
is never deleted as part of a route cleanup.

## Visual contract

- Inter is the primary family, with tabular numerals enabled for data.
- Black, white and neutral gray define the interface. Color is reserved for
  lifecycle, warning and data-quality semantics.
- Tables are the primary comparison surface; cards are used for summaries.
- Text and data maintain WCAG AA contrast. "Gray" never means low-contrast body
  copy.
- Dense desktop tables retain a useful mobile representation with a sticky identity
  column or an explicit row-detail layout.

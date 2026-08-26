# Registry data quality audit — 2026-08-26

## Intended use and grain

- Grain: one public registry row per named project or artifact.
- Primary key: `entities.id`; public identity: unique `entities.slug`.
- Current homepage use: project discovery, Agent/Robot baseline boards, evidence status, and future 30-day rankings.
- Audit source: production Cloudflare D1 database, read-only queries run on 2026-08-26 (Asia/Shanghai).

## Compact profile

| Check | Result | Assessment |
| --- | ---: | --- |
| Public entities | 158 | Usable as a registry total |
| Agent rows | 65 (41.1%) | Taxonomy needs review |
| Tool rows | 64 (40.5%) | Large enough to require a first-class content layer |
| Model rows | 20 (12.7%) | Mostly open-weight models |
| Robot + robotics framework + simulator rows | 9 (5.7%) | Too small for a mature ranked cohort |
| Entities with metric history | 155 / 158 (98.1%) | Good repository-metric coverage |
| Metric history | 2026-08-22 to 2026-08-26 | Only 4 days; 30-day movement must not publish yet |
| Evidence observations | 1,500+ | Broad repository evidence, limited semantic depth |
| Verified change events | 2 | Change feed is not yet a primary content product |
| Registered sources | 27 | Source catalog is broad |
| Sources with successful collection | 3 / 27 (11.1%) | Current live evidence comes from GitHub, Hugging Face, and NVIDIA |
| Entities with openness facets | 4 / 158 (2.5%) | Deep openness comparison is not ready for broad claims |
| Relationships | 0 | Ecosystem graph and dependency claims are not ready |
| Duplicate normalized names | 1 group | `genesis` and `genesis-world` require entity resolution |

## Findings

## Remediation status

The first taxonomy remediation was implemented after this snapshot:

- Added a many-to-many `entity_domains` dimension with one primary field, confidence, method, review status, and evidence URL.
- Preserved `kind` as artifact form and added `domain` filtering to the repository, API, Database, homepage, and detail dossiers.
- Corrected high-confidence records including AIRA, Genesis, GR00T, LeLab, OpenEAI, RLinf, Crawl4AI, CowAgent, and nanobot.
- Removed the duplicate `genesis-world` row from public results while preserving its historical records and redirecting its public URL.
- Added a database trigger so future entity imports receive a provisional primary domain automatically.

After the migration the public registry contains 157 unique records, with 62 Agent-field memberships, 15 Robotics-field memberships, and no public record missing a primary domain. Membership totals may overlap because cross-layer projects can belong to more than one domain.

### High — taxonomy conflates artifact type and ecosystem domain

`kind` currently has to answer two different questions: what an artifact is (`model`, `tool`, `simulator`) and which field it belongs to (`agent` or `robot`). This produces obvious classification conflicts such as a simulator, robotics foundation model, and robotic arm appearing in the Agent cohort.

Risk: cohort counts and rankings can look precise while mixing incomparable artifacts.

Remediation: keep `kind` as artifact form and introduce a separate many-to-many domain dimension, for example `agent`, `robotics`, `shared-infrastructure`. Rankings must query both domain and kind. Do not perform a large in-place reclassification before this dimension exists.

### High — ranking history is below the publication gate

The four core GitHub metrics cover 153 entities, but history begins on 2026-08-22. Current rows are safe to describe as an adoption baseline; they are not safe to describe as “moving”, “rising”, or a 7/30/90-day trend.

Risk: misleading ranking claims and loss of trust.

Remediation: keep trend controls disabled, publish the current baseline explicitly, and enable movement only after 30 days and the existing 80% coverage gate.

### High — official-source breadth is mostly catalog, not live ingestion

GitHub, Hugging Face, and the NVIDIA RSS source have successful collection runs; 24 other sources are registered. GitHub and Hugging Face provide entity-level subscriptions, while NVIDIA currently contributes source items.

Risk: “27 sources” can be misread as 27 live pipelines.

Remediation: expose `liveSources / sources` based on successful collection rather than configuration state. Prioritize connectors by data value: official project releases, robotics company repositories/newsrooms, package registries, then general news feeds.

### Medium — content completeness is uneven

- Organization missing: 147 / 158 (93.0%).
- Country missing: 150 / 158 (94.9%).
- Documentation URL missing: 118 / 158 (74.7%).
- Logo missing: 31 / 158 (19.6%).
- Description missing: 4 / 158 (2.5%).
- Repository URL missing: 4 / 158 (2.5%).
- License missing: 2 / 158 (1.3%).

Risk: detail pages can be factually correct but still feel thin, and country/organization filters are not trustworthy.

Remediation: treat organization, documentation, logo, and canonical homepage as enrichment jobs. Do not expose country ranking until coverage is materially higher.

### Medium — semantic evidence is shallow

Repository facts and metrics are broad, but openness facets cover only four entities, relationships are empty, release timestamps are absent, and only two changes have been detected.

Risk: the product can currently support a repository database better than an “everything about openness” claim.

Remediation: sequence the content promise as repository baseline → openness facets → official releases → relationships. Each layer should have a visible coverage status.

## Homepage content decision

The homepage should prioritize only data products that are already defensible:

1. Compact identity and search.
2. Explicit entity layers: Agent, Robot, Tools, Models.
3. Current adoption baseline, not movement ranking.
4. Data coverage and latest verified change.
5. A fully separate sponsor rail with disclosed inventory.

Articles and editorial feeds should not return until there is a repeatable signal or analysis format tied directly to registry data.

## Stable automated tests to add

- Unique `id` and `slug`; normalized-name duplicate report.
- Accepted values for `kind`, lifecycle, visibility, and openness state.
- Daily freshness for active source connectors.
- Metric coverage at or above 90% for any published ranking cohort.
- Minimum 30 calendar days of snapshots before movement publication.
- No ranking entry without a public entity and current metric record.
- Coverage reports for organization, documentation URL, logo, openness facets, and relationships.

## Reproducible query set

```sql
SELECT kind, COUNT(*) FROM entities WHERE visibility = 'public' GROUP BY kind;
SELECT openness_status, COUNT(*) FROM entities WHERE visibility = 'public' GROUP BY openness_status;
SELECT metric_key, COUNT(*), COUNT(DISTINCT entity_id), MIN(observed_at), MAX(observed_at)
FROM metric_snapshots GROUP BY metric_key;
SELECT trust_tier, automation_status, COUNT(*) FROM sources GROUP BY trust_tier, automation_status;
SELECT COUNT(DISTINCT entity_id), COUNT(*) FROM openness_facets;
SELECT COUNT(*) FROM relationships;
SELECT lower(trim(name)), COUNT(*), group_concat(slug)
FROM entities WHERE visibility = 'public'
GROUP BY lower(trim(name)) HAVING COUNT(*) > 1;
```

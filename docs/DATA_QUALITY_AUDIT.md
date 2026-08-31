# Catalogue Detail Data Quality Audit

Audit date: 2026-08-29
Production grain: one included catalogue profile per public entity; historical facts are source-attributed observations, releases, papers, evaluations and metric snapshots.

## Baseline

| Category | Records | Description | Organization | License | Repository | Docs | Metrics | Releases | Papers | Evaluations | Active subscription |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Foundation models | 20 | 20 | 1 | 20 | 16 | 5 | 17 | 0 | 0 | 0 | 17 |
| Agents | 60 | 56 | 1 | 60 | 60 | 17 | 60 | 0 | 0 | 0 | 60 |
| Robot models | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| Robot hardware | 6 | 6 | 4 | 4 | 6 | 4 | 5 | 0 | 0 | 0 | 5 |

Supporting infrastructure had 74 records, 74 current metric rows and one normalized release. It is retained in the database but excluded from the four primary catalogue leaderboards.

## Findings

### Critical — release history was not subscribed at catalogue scale

- Evidence: only one enabled `github-releases` subscription existed despite 155 enabled GitHub repository subscriptions.
- Impact: detail pages showed zero releases even when official repository histories existed; activity ranking could fall back to commit recency.
- Cause: release/package collection was introduced for one reviewed intake record and was never materialized for the migrated catalogue.
- Remediation: migration `0018` mirrors every enabled GitHub repository into a separate `history_subscriptions` queue. Keeping this queue separate preserves each entity's canonical identity subscriptions. The connector now reads up to 100 public releases, labels stable/prerelease channels and upserts the historical rows.
- Automated test: release-subscription count must equal enabled GitHub-subscription count.

### High — papers and evaluations had zero normalized coverage

- Evidence: all four primary categories returned zero linked papers and zero evaluation results.
- Impact: model and robot-model details could not support research provenance or compare published benchmark evidence.
- Cause: tables existed, but active connectors emitted neither paper nor evaluation records.
- Remediation: Hugging Face model cards now emit declared arXiv IDs and structured `model-index` results. arXiv resolution is performed only for identifiers declared by the official model source; fuzzy title matching is prohibited.
- Remaining limitation: model-card coverage is incomplete because many catalogue records do not yet have a verified Hugging Face repository locator.

### High — maintainer coverage was misleadingly sparse

- Evidence: only 8/162 entity rows had an organization, although 155 repository records expose an owner.
- Impact: pages omitted maintainers and a naive completeness score treated most records as ownerless.
- Cause: GitHub owner metadata was not captured and personal maintainers were intentionally not written into the `organization` field.
- Remediation: record the canonical repository owner as attributed evidence and use it as a page-level maintainer fallback. Do not overwrite a curated organization.

### Medium — documentation coverage is sparse

- Evidence: 27/88 primary records had a dedicated documentation URL.
- Impact: installation and official reference links may require opening the repository or canonical site.
- Cause: repository homepages are not always documentation and cannot safely be promoted automatically.
- Remediation: keep this field reviewable; use official model cards, repository README/CITATION files and publisher documentation as candidates. Never infer documentation from an unrelated marketing URL.

### Expected sparsity — historical stars cannot be reliably backfilled from the repository API

- Current daily metric snapshots begin when OpenAgent observes a record. GitHub's repository endpoint exposes current counters, not a complete historical star series.
- Do not fabricate earlier snapshots or reconstruct them from current totals. Continue daily collection and distinguish observed history from project age.

## Repeatable source plan

The executable copy lives in `history_source_rules`.

| Module | Primary source | Cadence | Rule |
| --- | --- | --- | --- |
| Identity and repository activity | GitHub Repository API | Daily | Canonical repository subscription |
| Releases | GitHub Releases; package registries; official release feeds | Daily | Preserve version, channel, timestamp, notes and URL |
| Model metadata | Official Hugging Face model repository | Daily | License, base model, datasets, languages, tags and version links |
| Papers | arXiv IDs declared by official model cards or repositories | Weekly | Exact identifier only; retain declaring source |
| Evaluations | Structured model cards and named benchmark publishers | Weekly | Store evaluator and conditions; never merge incomparable runs |
| Model usage | OpenRouter Data API | Daily | Source-scoped daily public tokens; curated model-family mapping |
| Agent/app usage | OpenRouter App Rankings | Daily | Opt-in OpenRouter attribution only |
| Robot hardware specs | Official product and technical documentation | Monthly/manual | Vendor-specific reviewed adapters |

## Stable automated checks

1. Entity, catalogue profile and required source foreign keys remain valid.
2. Enabled GitHub records have an enabled release-history subscription.
3. Usage daily grain is unique at subject × UTC date.
4. Token totals remain decimal strings and are never parsed through unsafe JavaScript integers.
5. Open-only usage subjects must map to a catalogue entity with a verified open status.
6. Papers require a DOI, arXiv ID or reviewed canonical URL; discovered title similarity is insufficient.
7. Evaluation results require a metric, benchmark, evaluator type, source URL and explicit conditions object.
8. Recent source failures preserve the last good facts and surface the error instead of writing zeros.

## Production validation after the first backfill

Validated at 2026-08-29T15:20Z:

| Category | Included records | Records with releases | Release rows |
| --- | ---: | ---: | ---: |
| Foundation models | 20 | 9 | 197 |
| Agents | 60 | 42 | 3,050 |
| Robot models | 2 | 1 | 5 |
| Robot hardware | 6 | 2 | 17 |
| Supporting infrastructure | 74 | 55 | 2,675 |
| **Total** | **162** | **109** | **5,944** |

- All 155 GitHub history subscriptions completed with zero remaining errors.
- The backfill produced zero duplicate `(entity, source, release URL)` groups and zero missing release URLs.
- Published dates range from 2016-12-20 to 2026-08-29.
- Four official Hugging Face model-card subscriptions completed and yielded two exact-ID paper records; structured evaluation coverage remains zero and must not be inferred.
- One stale locator, `Tiledesk/tiledesk-server`, returned 404. It was verified against the official GitHub organization, corrected to `Tiledesk/tiledesk` in migration `0020`, and then synchronized successfully.

## Openness evidence remediation — 2026-08-31

Intended grain: one scoped license observation and one code-openness facet per reviewed core repository. The starting queue contained 127 public records whose stored overall claim was `open-source` but which had no code facet; all 127 had an active GitHub binding. Public derivation already downgraded these records to `unknown`, so this was a completeness risk rather than a live false claim.

The first batch prioritized observed human views, agent views and repository adoption. `scripts/audit-openness-evidence.mjs` checked the official GitHub License API, stored-license agreement, an allowlist of recognized software licenses, the direct license path and root-level restricted-scope signals.

- 30 records reviewed.
- 28 passed the automated policy directly.
- Goose was manually verified after GitHub resolved `block/goose` to `aaif-goose/goose`; migration `0022` preserves the old binding interval, adds the new binding and records the repository/homepage/documentation changes.
- AutoGen was held for manual review in this first pass because GitHub's aggregate license field returned `CC-BY-4.0`; the second pass found and verified the repository's code-specific `LICENSE-CODE` file.
- 29 scoped license records and 29 verified code facets were added. No weights, data, hardware, governance or commercial-use claims were inferred.

Evidence artifacts are stored in `reports/openness-evidence-2026-08-31-batch-1/`. Re-run with `npm run data:audit:openness -- --limit=N --label=batch-N`; the script is read-only, uses non-overwriting batch directories and produces a review queue rather than modifying D1.

### Second openness batch

Migration `0023` adds 29 more scoped code-license records and verified code facets: 26 automatic approvals plus three manually resolved cases.

- AutoGen uses MIT for repository code via `LICENSE-CODE`; its root `LICENSE` remains a separate CC-BY-4.0 content license. The collector now checks explicit code-license files when GitHub's aggregate repository license is not an approved software license.
- MetaGPT's official GitHub repository resolves from `geekan/MetaGPT` to `FoundationAgents/MetaGPT`. The old source binding is closed, the new binding is active, and the official homepage and documentation URLs are recorded.
- Kilo Code's current root license is MIT. The entity projection was corrected from stale Apache-2.0 while its existing MIT source fact was retained.
- ROS 2 remains unresolved because `ros2/ros2` is an umbrella repository with no single root license. The official README's general open-source statement is not precise enough to assign one code license to the whole scope.

After both batches, the missing-code-facet queue fell from 127 to 69 records: 58 evidence-backed resolutions, a 45.7% reduction. The second-pass artifacts are in `reports/openness-evidence-2026-08-31-batch-2-resolved/`. Production validation found 29 batch-two scopes, no foreign-key violations, and no SEO audit regressions.

### Third openness batch

Migration `0024` resolves another 28 entities with 29 scoped license rows: 23 automatic approvals, four manually verified source corrections, and one mixed-license classification.

- GitHub MCP Server now follows GitHub's official `github/github-mcp-server` repository rather than the historical example inside `modelcontextprotocol/servers`.
- Memori, Odysseus and Antigravity Awesome Skills preserve their old source-binding intervals and continue from the official resolved repositories. Odysseus's stale MIT projection was corrected to AGPL-3.0.
- Tabby is now `open-core`, not `open-source`: the repository core is Apache-2.0, while `ee/` is governed by the restrictive Tabby Enterprise License. Both scopes and the partial code facet are stored explicitly.
- ROS 2 and AI Agents Skills remain unresolved. The former is an umbrella repository without one root license; the latter currently exposes no repository license file. Neither receives an inferred code facet.

After three batches, the queue fell from 127 to 41 records: 86 evidence-backed resolutions, a 67.7% reduction. Evidence is in `reports/openness-evidence-2026-08-31-batch-3-resolved/`. Production validation found 29 batch-three scopes, 28 code facets, no foreign-key violations, and no SEO audit regressions across 180 canonical URLs.

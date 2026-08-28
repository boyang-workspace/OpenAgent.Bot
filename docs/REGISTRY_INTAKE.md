# Reviewed registry intake

## Scope
New project content is a versioned JSON package, not a project-specific SQL migration. Start from `content/intake/vgpu.json`; the executable contract is `src/lib/registry/intake-contract.ts`. Schema migration 0015 adds publication history, an interface filter index and sync error state only.

Canonical identity, kind, domains, resources, use cases, facets and interfaces all carry evidence. The first domain is primary. Interface states are documented/tested/unknown; this intake only documents vgpu, it does not run it. Commands in manifests are display data, never executed.

## Deploy and register sources
Apply D1 migrations, deploy the Worker, then run the existing Registry Sync workflow once to register the versioned source catalog. Production secrets remain in GitHub Actions and the Worker. Never print or commit credentials.

## Preview and publish
Use GitHub Actions **Reviewed Registry Intake** on main:

1. Select `preview` and the manifest path. Review every changed identity, permission, fact, source and removal in its log.
2. Select `publish` with the same manifest and the returned `base_hash` and `payload_hash`. The repository actor is recorded as reviewer. A changed payload or changed database state requires another preview.
3. A successful publish workflow collects initial observations only for that manifest's subscriptions. Later updates follow the daily Registry Sync workflow. Direct CLI publication can use a scoped sync or wait for that daily run.

The authenticated local/operator CLI is equivalent:

```sh
npm run registry:intake -- content/intake/vgpu.json
npm run registry:intake -- content/intake/vgpu.json --publish --base-hash REVIEWED_BASE_HASH --payload-hash REVIEWED_PAYLOAD_HASH --reviewer REVIEWER
```

Set `REGISTRY_SYNC_TOKEN` through the environment. For local development use `--url http://127.0.0.1:8977` with a local Worker SYNC_TOKEN. Do not put production credentials in flags or logs. Preview does not write. Re-importing an unchanged package creates no observations, project or publication. This is an operator workflow, not an open public submission endpoint.

## Update and recover
Keep stable entity/resource/interface IDs and update the manifest in source control. The publish transaction updates corresponding query projections. Only removed fact keys owned by the previous intake revision are removed from current views; observations and before/after audit data remain.

To recover a previously published manifest:

```sh
npm run registry:intake -- --revision PUBLICATION_ID
```

Take its `manifest` object, review it, then preview and publish as a new revision. Unchanged historic observations are reused. The same evidence timestamp cannot be repurposed for a different source URL: use the actual new review date. There is no blind database rewind. For a first publication, correct it or set visibility to unlisted through the same reviewed workflow. Before snapshots support investigating legacy-record changes; generic legacy reverse-manifest generation is not implemented.

Identity conflicts and changing the package/repository metric owner are deliberately blocked; resolve them in an explicit reviewed data migration instead of silently stitching unrelated series.

## Source ownership and freshness
- GitHub repositories own stars/forks/issues/commit activity.
- GitHub Releases tracks the latest **stable release**, not first announcement, prerelease, or arbitrary tags. An accessible repo with no stable release is distinct from inaccessible/failed requests; last known releases remain with a status notice.
- npm tracks the primary package's latest dist-tag/version, deprecation notice and rolling 30 complete UTC days of downloads, excluding today. Zero is accepted only from a valid response. Package downloads are not users or HF model downloads.
- Failure retains previous data, records last_error and applies 2–24 hour backoff. Successful collection clears errors and schedules the next day.
- Automatic collection never updates curated verification dates, summaries or license conclusions. Collectors use separate namespaces. Existing cross-source fact conflicts are preserved, not auto-resolved.
- Published JSON includes fact source IDs/URLs/dates, interface evidence and source-labelled metric snapshots; interface filtering works on the website and list API.

The daily GitHub workflow runs at 02:17 UTC (10:17 China time); actual scheduling may be delayed by GitHub. A newly added subscription also supports a scoped initial sync with `source` + `locator` on the internal endpoint.

## Deliberate limits
This is not an automatic project-discovery or AI adjudication system. New candidates, website specifications, prices, hardware/data licenses and resource inventories still need official evidence and review. Pending review is a preview, not a persisted collaborative review inbox. Cross-source conflicts are not yet queued in a dedicated dashboard.

HF datasets/spaces, PyPI, richer relation vocabulary, multiple independent packages per entity, resource-version search and performance rankings remain follow-ups when concrete records require them. Existing legacy robotics records/relationships are preserved; they are not mass-rewritten into new manifests.

No database replacement, new first-level category or new homepage layout is needed for vgpu and Microduck. No throughput/capacity guarantee has been established by load testing.

## First production verification — 2026-08-28

- vgpu published through [reviewed intake](https://github.com/boyang-workspace/OpenAgent.Bot/actions/runs/33131029038), not a content migration. All three scoped collectors succeeded.
- Live HTML, JSON, Markdown and sitemap include vgpu; MCP and shader-development filters each return the single canonical tool. Five interfaces and five resources match the content package.
- Microduck still has four distinct projects and nine policy files; its closed hardware / open software distinction is preserved.
- Local quality gate: 59 tests passed, Astro check and production build passed. Browser checks covered 1440px desktop and 390px mobile, filter application and overflow. Production intake/sync workflows succeeded. The separate CI workflow was already manually disabled and was left unchanged.
- Remaining limitations are listed above; no vgpu shader, downloaded package or MCP operation was executed during intake.

# OpenAgent.bot Discovery Pipeline

OpenAgent.bot uses a static-first editorial pipeline:

```text
daily signals -> candidates -> scores -> topics -> draft project profiles -> human review -> published pages
```

The first version collects from GitHub and Hacker News. Product Hunt and X are intentionally optional future sources.

## Local Commands

```bash
npm run discovery:daily -- --dry-run
npm run discovery:daily
```

`--dry-run` calls the sources and prints a summary without writing files.

Without `--dry-run`, the pipeline writes:

- `content/discovery/YYYY-MM-DD.json`
- `content/topics/YYYY-MM-DD.json`
- `content/projects/drafts/<slug>.json`

Published project pages only read from:

- `content/projects/published/*.json`

## Review Workflow

1. Read the daily PR.
2. Inspect generated candidates and draft profiles.
3. Edit any draft that is worth publishing.
4. Move the reviewed file from `content/projects/drafts` to `content/projects/published`.
5. Merge the publishing PR.

Draft files are never rendered publicly.

## GitHub Secrets

Set these in GitHub repository settings:

- `OPENAI_API_KEY`: optional for future AI drafting.
- `GITHUB_TOKEN`: provided automatically by GitHub Actions.

The current draft generator has a deterministic fallback, so the daily workflow can still run without `OPENAI_API_KEY`.

## Scoring

Candidates are scored on:

- open-source signal
- AI relevance
- maintainer activity
- README or description clarity
- distribution value
- source heat

Default thresholds:

- `score >= 75`: generate a draft
- `50 <= score < 75`: keep as a topic candidate
- `< 50`: preserve only as raw discovery data

## Agent-Readable Output

Each published project exposes:

```text
/:category/:slug
/:category/:slug.json
/:category/:slug.md
```

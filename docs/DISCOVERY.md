# OpenAgent.bot Discovery Pipeline

OpenAgent.bot uses a manual, static-first editorial pipeline:

```text
manual trigger -> candidates -> facts -> editorial draft -> Admin review -> GitHub-backed publish
```

The first version collects from GitHub and Hacker News. Product Hunt and X are intentionally optional future sources. Discovery is not scheduled by default; this avoids producing low-quality daily automated content.

## Local Commands

```bash
npm run discovery:daily -- --dry-run
npm run discovery:daily
npm run editorial:run -- --dry-run --repo https://github.com/langchain-ai/langgraph --limit 1
npm run resource:prepare -- --dry-run --category memory-systems --title OmniSaver --summary "Open-source memory and saving infrastructure for AI-assisted workflows." --source https://omnisaver.io
npm run blog:prepare -- --dry-run --title "OpenClaw: open-source browser agent infrastructure" --topic "How OpenClaw fits into open AI agent workflows" --tags openclaw,agents,open-source
```

`--dry-run` calls the sources and prints a summary without writing files.

Without `--dry-run`, the pipeline writes:

- `content/discovery/YYYY-MM-DD.json`
- `content/topics/YYYY-MM-DD.json`
- `content/projects/drafts/<slug>.json`

Published project pages only read from:

- `content/projects/published/*.json`

## Manual Editorial Run

Use the editorial runner when you want Codex to prepare Admin drafts from a repo or discovery scan:

```bash
npm run editorial:run -- --dry-run --repo https://github.com/owner/repo --limit 1
```

To import drafts into Admin, set:

```text
OPENAGENT_ADMIN_IMPORT_URL=https://www.openagent.bot/admin/api/editorial/import-draft
CF_ACCESS_CLIENT_ID=...
CF_ACCESS_CLIENT_SECRET=...
```

Then run:

```bash
npm run editorial:run -- --repo https://github.com/owner/repo --limit 1
```

The import endpoint writes to D1 `project_drafts` with status `draft`. It does not publish, create a PR, or modify public content.

## Human-Requested Content Prep

When the owner asks for a specific article or resource, use the manual prep scripts instead of scheduled automation:

- Resource page draft: `npm run resource:prepare`
- Blog post draft: `npm run blog:prepare`

Resource drafts are written to `content/projects/drafts`. Blog drafts are written to `content/blog/drafts`. Drafts are not public until reviewed and published.

## Review Workflow

1. Trigger an editorial run from Codex or GitHub Actions.
2. Inspect the imported draft in `/admin/projects`.
3. Edit the SEO Article, facts, links, tags, and comparison notes.
4. Mark the draft `ready`.
5. Publish from `/admin/publishing`.

Draft files are never rendered publicly.

## GitHub Actions

The discovery workflow is manual-only through `workflow_dispatch`. It should not run on a fixed daily schedule unless quality controls are reviewed again.

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

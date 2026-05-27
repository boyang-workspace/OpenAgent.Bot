# OpenAgent.bot Discovery Pipeline

OpenAgent.bot uses a manual, static-first editorial pipeline:

```text
manual trigger -> candidates -> facts -> editorial draft -> Admin review -> GitHub-backed publish
```

The first version collects from GitHub and Hacker News. Product Hunt and X are intentionally optional future sources.

Resource discovery is manual by default. Blog automation is scheduled, but it is draft-first: it creates topic shortlists and review drafts, not public posts.

## Local Commands

```bash
npm run discovery:daily -- --dry-run
npm run discovery:daily
npm run blog:daily -- --dry-run
npm run blog:daily -- --limit 1
npm run editorial:run -- --dry-run --repo https://github.com/langchain-ai/langgraph --limit 1
npm run resource:prepare -- --dry-run --category memory-systems --title OmniSaver --summary "Open-source memory and saving infrastructure for AI-assisted workflows." --source https://omnisaver.io
npm run blog:prepare -- --dry-run --title "OpenClaw: open-source browser agent infrastructure" --topic "How OpenClaw fits into open AI agent workflows" --tags openclaw,agents,open-source
```

`--dry-run` calls the sources and prints a summary without writing files.

Without `--dry-run`, the pipeline writes:

- `content/discovery/YYYY-MM-DD.json`
- `content/topics/YYYY-MM-DD.json`
- `content/projects/drafts/<slug>.json`

The blog automation writes:

- `content/blog/topics/YYYY-MM-DD.json`
- `content/blog/drafts/<slug>.json`

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

Blog drafts must meet the OpenAgent blog quality bar in [`docs/BLOG_STANDARD.md`](./BLOG_STANDARD.md): search-intent first, comparison-heavy, practical, internally linked, FAQ-backed, and source-cited. Short editorial notes are no longer the default publishing standard.

## Daily Blog Drafts

The daily blog workflow is:

```text
daily discovery signals -> topic shortlist -> research-backed draft -> quality gate -> admin review -> GitHub PR publish
```

The default runner creates one article draft per day:

```bash
npm run blog:daily -- --limit 1
```

Useful options:

- `--dry-run`: print the topic and draft payload without writing files.
- `--date YYYY-MM-DD`: generate for a specific date.
- `--limit N`: generate up to N article drafts.
- `--topic-lane trend|comparison|evergreen`: constrain the topic lane.

The quality gate rejects drafts without source links, internal links, a comparison block, FAQ, target keyword, search intent, SEO fields, or visible source citations.

If `OPENAGENT_BLOG_IMPORT_URL` is set, the runner imports accepted drafts into Admin D1 at `/admin/api/blog/drafts`. Otherwise it writes review files under `content/blog/drafts` so GitHub Actions can open a review PR.

## Review Workflow

1. Trigger an editorial run from Codex or GitHub Actions.
2. Inspect the imported draft in `/admin/projects`.
3. Edit the SEO Article, facts, links, tags, and comparison notes.
4. Mark the draft `ready`.
5. Publish from `/admin/publishing`.

Draft files are never rendered publicly.

## GitHub Actions

The resource discovery workflow is manual-only through `workflow_dispatch`. The blog workflow runs daily at 09:15 Asia/Shanghai and opens a draft PR. Public blog posts still require review and a publish action.

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

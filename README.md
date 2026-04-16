# OpenAgent.bot

OpenAgent.bot is a static-first editorial directory for open-source AI models, agents, skills, memory systems, plugins, and tools.

The project is designed for:

- SEO and GEO acquisition
- Human-readable directory and editorial pages
- Agent-readable Markdown and JSON outputs
- GitHub as the source of truth
- Cloudflare Pages as the default deployment target

## Current Audit

This repository started as an empty folder and was not a git repository. There was no existing stack, route structure, SEO layer, deployment configuration, or content model to preserve.

## Tech Stack

- Astro with static output
- TypeScript
- File-based JSON content under `content/`
- GitHub Actions discovery pipeline
- Cloudflare Pages via `wrangler.toml`
- Cloudflare D1 for submissions and admin drafts

## Local Development

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Quality checks:

```bash
npm run test
npm run check
npm run build
```

Run the discovery pipeline locally:

```bash
npm run discovery:daily -- --dry-run
```

See [docs/DISCOVERY.md](docs/DISCOVERY.md) for the daily GitHub/Hacker News discovery workflow.

## Admin CMS

Admin V1 uses Cloudflare Access for login, D1 for the working queue, and GitHub PRs for publishing.

```bash
npx wrangler d1 create openagent_bot
npm run d1:migrations:remote
```

See [docs/ADMIN.md](docs/ADMIN.md) for the full setup.

## Cloudflare Pages

Recommended Pages settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Environment variable: `PUBLIC_SITE_URL=https://www.openagent.bot`

Manual deploy after Cloudflare login:

```bash
npx wrangler whoami
npx wrangler pages deploy dist --project-name openagent-bot
```

Admin routes require the D1 binding and Cloudflare Access setup described in [docs/ADMIN.md](docs/ADMIN.md).

## Target Structure

```text
src/
  components/      reusable UI components
  config/          site metadata and category config
  data/            blog seed data
  layouts/         page shells and SEO defaults
  lib/             shared helpers
  pages/           Astro routes
  styles/          global styling
public/            static assets
content/
  projects/        published and draft project profiles
  discovery/       raw daily discovery outputs
  topics/          daily topic candidates
scripts/
  discovery/       collectors, scoring, enrichment, draft generation
functions/
  api/             Cloudflare Pages Functions for submit and admin CMS
migrations/        Cloudflare D1 schema migrations
```

Planned later:

```text
admin polish       search, filters, Turnstile, and richer review states
```

## Phased PR Plan

1. Public website skeleton: routes, homepage, category/detail/blog templates, SEO, sitemap, robots, Cloudflare config.
2. Unified content schema and project profiles: typed JSON content, published/draft split, project profile pages.
3. GitHub and Hacker News discovery: daily candidates, scoring, topic formation, draft generation.
4. Daily discovery GitHub Action: scheduled run that opens a review PR.
5. Lightweight review experience: read-only review page before full CMS.
6. Lightweight admin and submissions: D1-backed editing, states, Turnstile, review flow.
7. Product Hunt and X sources: optional signals that never block the core pipeline.
8. Commercial fields: sponsor metadata and click tracking hooks without payment complexity.

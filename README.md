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

Local admin runtime with Pages Functions and D1:

```bash
npm run d1:migrations:local
npm run dev:admin
```

Run the discovery pipeline locally:

```bash
npm run discovery:daily -- --dry-run
```

See [docs/DISCOVERY.md](docs/DISCOVERY.md) for the daily GitHub/Hacker News discovery workflow.
See [docs/LOCAL_BLOG_WORKBENCH.md](docs/LOCAL_BLOG_WORKBENCH.md) for local Prompt Lab, Ollama, and packaging instructions.

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
  components/      reusable UI components (EditorialShell, Header, Footer, ResourceCard)
  config/          site metadata and category config
  layouts/         page shells and SEO defaults
  lib/             shared helpers (content loaders, SEO, display helpers)
  pages/           Astro routes
  styles/          global styling
public/            static assets (favicon, fallback covers, og-default.svg)
content/
  projects/        legacy project JSON profiles, adapted to ResourceV1 at build
  resources/       ResourceV1 JSON profiles
  blog/            published blog posts
  discovery/       raw daily discovery outputs
  topics/          daily topic candidates
scripts/
  discovery/       collectors, scoring, enrichment, draft generation
  blog/            daily blog pipeline
  content/         resource and blog preparation helpers
functions/
  api/             Cloudflare Pages Functions for submit and admin CMS
migrations/        Cloudflare D1 schema migrations
```

## Design System

Light, editorial, source-backed. The directory uses a left sidebar (App Store-style) with a single column of resource cards on the right. Colors, spacing, and component rhythm live in `src/styles/global.css` (light theme tokens) and individual component `<style>` blocks. Keep `--paper`, `--surface`, `--line`, `--ink`, `--muted` as the only allowed color tokens for new work.

## SEO and Social

Every page renders:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">`
- Open Graph and Twitter card meta tags (image defaults to `/og-default.svg` if a page does not pass one)
- `<link rel="preconnect" href="https://github.com">` for avatar performance
- `robots.txt` (disallows `/admin/` and `/api/`)
- `sitemap.xml` covering all published content
- Resource detail pages also emit `SoftwareSourceCode` JSON-LD inside `<head>`

## Quality Gate

CI runs on every PR and push to `main` (`.github/workflows/ci.yml`):

1. `npm run check` — Astro type check
2. `npm test` — vitest suite
3. `npm run build` — full static build

The site also ships with an agent-readable layer (`/llms.txt`, `/index.json`, per-resource `.json` and `.md` outputs) and a `Blog` workbench for local drafting. See `docs/` for details.

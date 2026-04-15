# OpenAgent.bot

OpenAgent.bot is a static-first editorial directory for open-source AI models, agents, skills, memory systems, plugins, and tools.

The project is designed for:

- SEO and GEO acquisition
- Human-readable directory and editorial pages
- Future agent-readable Markdown, JSON, and manifest outputs
- GitHub as the source of truth
- Cloudflare Pages as the default deployment target

## Current Audit

This repository started as an empty folder and was not a git repository. There was no existing stack, route structure, SEO layer, deployment configuration, or content model to preserve.

## Tech Stack

- Astro with static output
- TypeScript
- Static data modules for PR #1 seed content
- Cloudflare Pages via `wrangler.toml`

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

Future PRs will add D1 bindings, Turnstile secrets, and admin routes after the public static site and content schema are stable.

## Target Structure

```text
src/
  components/      reusable UI components
  config/          site metadata and category config
  data/            PR #1 seed data; later replaced by unified content layer
  layouts/         page shells and SEO defaults
  lib/             shared helpers
  pages/           Astro routes
  styles/          global styling
public/            static assets
```

Planned later:

```text
content/           typed content source
admin/             lightweight CMS UI and handlers
migrations/        Cloudflare D1 schema migrations
scripts/           content automation and draft generation
```

## Phased PR Plan

1. Public website skeleton: routes, homepage, category/detail/blog templates, SEO, sitemap, robots, Cloudflare config.
2. Unified content schema: typed content objects, example content, loader boundary, render adapters.
3. Lightweight admin: authenticated admin entry, content list and edit forms, D1 migration skeleton.
4. Submission workflow: public submit form, review state, Turnstile integration point.
5. Agent-readable layer: `llms.txt`, `index.json`, per-resource `.md` and `.json` routes.
6. Blog automation: draft generation workflow and GitHub Actions skeleton.
7. Commercial fields: sponsor metadata and click tracking hooks without payment complexity.

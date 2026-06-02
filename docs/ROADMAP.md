# OpenAgent.bot Phased PR Roadmap

This roadmap records the original phased plan and the actual shipped state. Items below are linked back to commits where useful.

## PR #1: Public Website Skeleton

Status: implemented.

- Astro static site foundation
- Editorial homepage
- Category pages
- Resource detail pages
- Blog index and blog detail pages
- Shared layout, navigation, footer, and resource cards
- Basic SEO metadata, canonical URLs, Open Graph, sitemap, and robots
- Cloudflare Pages config

## PR #2: Unified Content Schema

Status: implemented (legacy `OpenProject` JSON in `content/projects/published/` is adapted to `ResourceV1` at build time via `openProjectToResourceV1`).

## PR #3: Lightweight Admin

Status: implemented.

- `/admin` with content list, create, edit, status, taxonomy controls
- Cloudflare D1 schema and migrations in `migrations/`
- Cloudflare Access gate at the network layer

## PR #4: Submission Workflow

Status: implemented.

- `/submit` form with category + payload fields
- Optional Turnstile integration
- Submissions stored in D1 for admin review
- Payment and sponsor metadata deferred to PR #7

## PR #5: Agent-readable Layer

Status: implemented.

- `/llms.txt` and `/index.json`
- Per-resource `.json` and `.md` outputs
- Canonical HTML / JSON / Markdown share the same slug

## PR #6: Automated Blog Drafts

Status: implemented (drafts only, manual review before publish).

- `scripts/blog/run-daily.ts` and `scripts/blog/import-draft.ts`
- `.github/workflows/daily-blog.yml` opens draft PRs
- Quality gate enforced by `tests/blog-automation.test.ts`

## PR #7: Commercial Metadata

Status: deferred. `isSponsored` and `sponsor` fields exist in the content schema but no payment flow is wired up.

## Beyond the original plan

Implemented incrementally after PR #1-#6:

- **Editorial directory refactor (commits `9d7474a`, `fcddb7e`)** — flat homepage card grid, agent hero with terminal mockup, simplified sidebar.
- **Agent content expansion (`fcddb7e`)** — 7 new agents added (Claude Code, Gemini CLI, Codex CLI, Aider, CrewAI, AutoGen, SWE-agent).
- **Resource directory expansion (`5416289`)** — protocol, evaluation, and observability resources added under existing categories.
- **Design sample cleanup (`97d78e6`)** — old `/design-demo` and `/design-samples/*` routes redirect to `/`.
- **Light-theme audit cleanup (2026-06-02)** — removed the unused `--dark-*` token system, deleted `AgentCard.astro` / `SectionHeading.astro` / `src/lib/content/projects.ts` / `src/data/posts.ts` / `src/pages/design-samples/`, added `output/` and `samples/` to `.gitignore` and removed the previously-tracked build artifacts.
- **SEO and metadata (2026-06-02)** — default `/og-default.svg` for every page, JSON-LD moved into `<head>` via `<slot name="head">`, `preconnect` and `dns-prefetch` for `github.com`, `robots.txt` now disallows `/admin/` and `/api/`.
- **CI workflow (2026-06-02)** — `.github/workflows/ci.yml` runs `npm run check`, `npm test`, `npm run build` on every PR.

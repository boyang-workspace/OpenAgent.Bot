# OpenAgent.bot Phased PR Roadmap

## PR #1: Public Website Skeleton

Status: implemented in this workspace.

Scope:

- Astro static site foundation
- Editorial homepage
- Category pages
- Resource detail pages
- Blog index and blog detail pages
- Shared layout, navigation, footer, and resource cards
- Basic SEO metadata, canonical URLs, Open Graph, sitemap, and robots
- Cloudflare Pages config

Acceptance:

- `npm run check` passes
- `npm run build` passes
- Home, resource detail, `sitemap.xml`, and `robots.txt` return 200 locally

## PR #2: Unified Content Schema

Scope:

- Move seed data into a unified content model
- Define typed objects for `project`, `skill`, `plugin`, `tool`, `blog`, `collection`, and `page`
- Add schema fields for status, SEO, canonical, featured, sponsored, submission type, and noindex
- Create a content loading layer so pages do not duplicate field mapping

## PR #3: Lightweight Admin

Scope:

- Add `/admin`
- Add content list, create, edit, and status controls
- Prepare Cloudflare D1 schema and migrations
- Keep auth simple and Cloudflare-compatible

## PR #4: Submission Workflow

Scope:

- Replace submit placeholder with a real form
- Add Turnstile integration point
- Store submissions for admin review
- Include payment and review status placeholders

## PR #5: Agent-readable Layer

Scope:

- Add `/llms.txt`
- Add `/index.json`
- Add per-resource `.json` and `.md` outputs
- Keep URL structure stable with HTML, Markdown, and JSON representations

## PR #6: Automated Blog Drafts

Scope:

- Add script and GitHub Actions skeleton
- Generate drafts only
- Require manual review before publish

## PR #7: Commercial Metadata

Scope:

- Add sponsor metadata and campaign hooks
- Keep paid submission and payment handling out of scope until needed

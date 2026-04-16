# Admin CMS Setup

OpenAgent.bot admin uses Cloudflare Access, Cloudflare D1, and GitHub pull requests. The public website stays static-first; admin is the working queue and publishing control room.

## What Goes Where

- Public site source of truth: `content/projects/published/*.json`
- Admin working queue: Cloudflare D1
- Login protection: Cloudflare Access
- Publishing: admin can create a review PR or one-click create and merge a GitHub PR
- Agent workspace: JSON APIs under `/admin/api/agent/*`

## Create D1

```bash
npx wrangler d1 create openagent_bot
```

Copy the returned database id into `wrangler.toml` and uncomment:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openagent_bot"
database_id = "..."
```

Apply the schema:

```bash
npm run d1:migrations:remote
```

For local API testing:

```bash
npm run d1:migrations:local
```

## Cloudflare Access

Create an Access application for the Pages project.

Protect:

```text
/admin*
```

Allow:

```text
boyangxie.work@gmail.com
```

Set a Pages environment variable:

```text
ADMIN_EMAIL=boyangxie.work@gmail.com
```

The admin UI calls APIs under `/admin/api/*`, so protecting `/admin*` covers both pages and API routes. `ADMIN_EMAIL` is an extra guard that checks the Access-authenticated email header.

## GitHub Publish Token

Create a fine-grained GitHub token scoped only to:

```text
boyang-workspace/OpenAgent.Bot
```

Required permissions:

```text
Contents: Read and write
Pull requests: Read and write
Metadata: Read
```

Set Cloudflare Pages secrets:

```bash
npx wrangler pages secret put GITHUB_ADMIN_TOKEN --project-name openagent-bot
```

Optional variables:

```text
GITHUB_REPO=boyang-workspace/OpenAgent.Bot
GITHUB_BASE_BRANCH=main
```

## Daily Workflow

1. A user submits a project on `/submit`.
2. The submission is saved to D1 with status `new`.
3. Open `/admin/review`.
4. Convert the submission into a project draft.
5. Open `/admin/projects` and edit structured fields and SEO fields.
6. Mark the draft `ready`.
7. Open `/admin/publishing`, run a preview, then click `Publish now`.
8. Admin creates and merges the GitHub PR.
9. Cloudflare Pages deploys the new static page.

## Published Content

Published projects are managed from `/admin/published`.

- `Edit` copies the current GitHub JSON into a D1 update draft.
- `Archive` creates a ready archive draft that changes the JSON status to `archived`.
- Editing live projects does not change slug or category in V1.
- Archiving removes the project from public routes after the GitHub PR is merged and deployed, while preserving GitHub history.

## Agent APIs

These endpoints are protected by the same Cloudflare Access app:

```text
GET  /admin/api/agent/summary
GET  /admin/api/agent/tasks
POST /admin/api/agent/tasks/:id/run
GET  /admin/api/agent/events
```

Agent-safe mutation rules:

- `dryRun: true` previews the operation without mutating public content.
- `idempotencyKey` prevents repeated Convert or Publish PR operations from duplicating work.
- Publish now first supports preview output, then writes a GitHub branch, opens a PR, merges it, and records live status.
- `admin_events` records actions, actor, before/after JSON, result, and errors.

## Notes

- D1 is not the public content source of truth.
- Drafts are intentionally structured fields, not freeform rich text.
- Turnstile is not required for V1. The form includes a honeypot field and a basic per-email hourly limit.
- The admin UI calls APIs under `/admin/api/*` so the page and API share the same Cloudflare Access session.
- The admin page logs out through `/cdn-cgi/access/logout`, Cloudflare Access's application logout endpoint.
- Converted submissions are not public. A project appears on the site only after a publish PR is merged and deployed.

# Admin CMS Setup

OpenAgent.bot admin V1 uses Cloudflare Access, Cloudflare D1, and GitHub pull requests.

## What Goes Where

- Public site source of truth: `content/projects/published/*.json`
- Admin working queue: Cloudflare D1
- Login protection: Cloudflare Access
- Publishing: admin creates a GitHub PR, then merging the PR publishes the static page

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
/api/admin*
```

Allow:

```text
boyangxie.work@gmail.com
```

Set a Pages environment variable:

```text
ADMIN_EMAIL=boyangxie.work@gmail.com
```

The API still expects Cloudflare Access to be the front door. `ADMIN_EMAIL` is an extra guard that checks the Access-authenticated email header.

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
3. Open `/admin`.
4. Convert the submission into a project draft.
5. Edit structured fields and SEO fields.
6. Click `Create publish PR`.
7. Review and merge the GitHub PR.
8. Cloudflare Pages deploys the new static page.

## Notes

- D1 is not the public content source of truth.
- Drafts are intentionally structured fields, not freeform rich text.
- Turnstile is not required for V1. The form includes a honeypot field and a basic per-email hourly limit.
- The admin UI calls APIs under `/admin/api/*` so the page and API share the same Cloudflare Access session.
- The admin page logs out through `/cdn-cgi/access/logout`, Cloudflare Access's application logout endpoint.

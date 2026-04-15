# Cloudflare Setup

OpenAgent.bot is configured for Cloudflare Pages with static output.

## Pages Project

Create a Cloudflare Pages project connected to the GitHub repository.

Recommended settings:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Production branch: `main`

## Environment Variables

Set:

```text
PUBLIC_SITE_URL=https://openagent.bot
```

Future stages will add:

```text
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

## Wrangler

The repo includes `wrangler.toml` for Pages output configuration.

Useful commands:

```bash
npx wrangler whoami
npx wrangler pages deploy dist --project-name openagent-bot
```

## Custom Domain

After the Pages project exists:

1. Open Cloudflare dashboard.
2. Go to Workers & Pages.
3. Select the `openagent-bot` Pages project.
4. Add `openagent.bot` as a custom domain.
5. Confirm DNS is proxied through Cloudflare.

## Future D1 Binding

PR #3 should create the database and then update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openagent_bot"
database_id = "replace-after-d1-create"
```

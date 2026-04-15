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

Current project:

- Cloudflare account: `Boyang@work`
- Pages project: `openagent-bot`
- Production URL: `https://openagent-bot.pages.dev/`
- Custom domains added in Cloudflare Pages: `openagent.bot`, `www.openagent.bot`
- Current custom domain status: pending DNS verification

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

The domain currently uses registrar DNS:

```text
dns1.registrar-servers.com
dns2.registrar-servers.com
```

Add these records at the registrar DNS provider:

```text
Type: ALIAS
Host: @
Value: openagent-bot.pages.dev

Type: CNAME
Host: www
Value: openagent-bot.pages.dev
```

If the DNS provider does not support `ALIAS` at the root domain, move the domain nameservers to Cloudflare and add the root domain there.

After DNS is set:

1. Open Cloudflare dashboard.
2. Go to Workers & Pages.
3. Select the `openagent-bot` Pages project.
4. Check Custom domains.
5. Wait until `openagent.bot` and `www.openagent.bot` are marked active.

## Future D1 Binding

PR #3 should create the database and then update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openagent_bot"
database_id = "replace-after-d1-create"
```

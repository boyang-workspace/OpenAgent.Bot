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
PUBLIC_SITE_URL=https://www.openagent.bot
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

Recommended quick setup at the registrar DNS provider:

```text
Type: URL Redirect Record
Host: @
Value: https://www.openagent.bot/
Redirect type: Permanent 301
```

```text
Type: CNAME
Host: www
Value: openagent-bot.pages.dev
```

Alternative full Cloudflare DNS setup:

```text
Type: CNAME
Name: @
Target: openagent-bot.pages.dev

Type: CNAME
Name: www
Target: openagent-bot.pages.dev
```

The quick setup uses `www.openagent.bot` as canonical and redirects the root domain to it. The full Cloudflare DNS setup can serve both root and `www` directly, but requires moving nameservers from Namecheap to Cloudflare.

After DNS is set:

1. Open Cloudflare dashboard.
2. Go to Workers & Pages.
3. Select the `openagent-bot` Pages project.
4. Check Custom domains.
5. Wait until `openagent.bot` and `www.openagent.bot` are marked active.

## Admin D1 Binding

Create the database:

```bash
npx wrangler d1 create openagent_bot
```

Then update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openagent_bot"
database_id = "..."
```

Apply migrations:

```bash
npm run d1:migrations:remote
```

See [docs/ADMIN.md](ADMIN.md) for the Access and GitHub token setup.

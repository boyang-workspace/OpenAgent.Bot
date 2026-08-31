# OpenAgent first-party analytics

## Architecture

OpenAgent records public request telemetry in the Cloudflare Worker, records only meaningful browser interactions through a small first-party endpoint, stores raw short-lived telemetry in Workers Analytics Engine, and writes hourly/daily aggregate history to D1.

```text
Public request ─┐
                ├─ Worker classification ─ Analytics Engine ─ hourly Cron ─ D1 rollups ─ private dashboard
Meaningful UI ──┘
```

Collection must never block or change a public response. The dashboard remains unavailable until its admin secret is configured. Analytics failures are isolated from the public site.

## Event schema

The `ANALYTICS` dataset is `openagent_events`. The mapping is defined in `src/lib/analytics/events.ts`.

| Slot | Meaning |
| --- | --- |
| `blob1` | event type |
| `blob2` / `blob3` | actor type / actor name |
| `blob4` / `blob5` | normalized path / route type |
| `blob6` / `blob7` | entity type / entity slug |
| `blob8` | normalized referrer source |
| `blob9`–`blob14` | country, device, browser and UTM labels |
| `blob15` / `blob16` | event target / privacy-filtered event value |
| `blob17` / `blob18` | daily visitor pseudonym / session UUID |
| `blob19` | HTTP method |
| `double1`–`double4` | status, response time, response bytes, actor confidence |
| `double5` | event number; `-1` means not supplied |

Server events use `request`. Browser events are deliberately limited to `page_view`, `internal_search`, `search_result_click`, `filter_change`, `compare_open`, `compare_add_project`, `outbound_click`, `evidence_click`, `source_click`, `api_docs_click`, `api_copy`, and `project_related_click`. `page_view` supplies only a normalized document-referrer source and UTM labels so a browser session can receive one entry-source attribution.

## Actor and route classification

Actors are grouped as `human`, `search_bot`, `ai_crawler`, `ai_agent`, `api_client`, or `unknown_bot`. Known signatures live in `src/lib/analytics/bot-registry.ts`; API routes, JSON clients and common programmatic user agents are classified separately from browsers. Route normalization lives in `src/lib/analytics/classify.ts` and excludes static assets, admin pages, internal APIs, the collection endpoint, robots, and the sitemap.

To add a bot, add one ordered signature to `botRegistry` and add a fixture to `tests/analytics-classification.test.ts`. Put specific signatures before broad ones.

## Privacy policy

- Raw IP addresses, complete user agents, full referrer URLs, cookies, form contents and request bodies are never written.
- Human visitor IDs are HMAC pseudonyms built from a truncated IP and normalized user agent with a salt that rotates each UTC day. They cannot be joined across days.
- Referrers are reduced to source labels such as Google, GitHub, ChatGPT or direct; raw referrer URLs are not retained.
- Search values containing email addresses, URLs, bearer values, tokens, secrets, passwords or API-key patterns are discarded.
- Client sessions are random session-storage UUIDs and are not identity records.
- No fingerprinting, advertising ID or third-party analytics script is used.

## Cloudflare configuration

`wrangler.toml` declares:

```toml
main = "src/worker.ts"

[[analytics_engine_datasets]]
binding = "ANALYTICS"
dataset = "openagent_events"

[triggers]
crons = [ "17 * * * *" ]
```

The custom worker delegates HTTP requests to Astro and exposes the scheduled rollup handler. D1 remains bound as `DB`.

Required configuration:

| Name | Type | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | non-secret Worker variable | Analytics Engine account |
| `ANALYTICS_API_TOKEN` | Wrangler secret | Account-scoped token with Analytics Read permission for SQL queries |
| `ANALYTICS_SECRET` | Wrangler secret | visitor pseudonym HMAC key |
| `ANALYTICS_ADMIN_SECRET` | Wrangler secret | owner-only dashboard password and session signing key |

Secrets must never be committed. Configure them interactively:

```bash
npx wrangler secret put ANALYTICS_API_TOKEN
npx wrangler secret put ANALYTICS_SECRET
npx wrangler secret put ANALYTICS_ADMIN_SECRET
```

Use different high-entropy values for the last two secrets.

## D1 rollups and schedule

Migration `0021_seo_integrity_and_analytics.sql` creates daily tables for totals, pages, actors, referrers, entities, events, searches and outbound destinations, plus `analytics_rollup_state`. Migration `0025_analytics_audience_quality.sql` adds conservative suspected-automation aggregates and session-entry source totals. Raw records, raw referrers and session IDs are not copied into D1.

The Cron runs at minute 17 of each UTC hour. It idempotently replaces the current UTC day's aggregates and, at UTC midnight, reconciles the complete previous day. Analytics Engine `_sample_interval` weights are used for sampled request and event counts. The dashboard queries D1 for 1/7/30/90-day history; Realtime queries Analytics Engine directly for the last 30 minutes.

`Browser-like` means a request whose user agent did not match a known machine signature. It is not a claim that the request came from a person. The rollup separately reports a deliberately conservative `suspected automation` slice when a daily anonymous visitor has a strong repeated or enumerating pattern. It remains visible in browser-like traffic and is excluded from Audience values in the content view. Acquisition assigns one source to the first client page view in a session; internal sources are reported separately and excluded from external acquisition.

## Private dashboard

Open `/admin/analytics/login`. A correct `ANALYTICS_ADMIN_SECRET` creates a signed, HttpOnly, Secure, SameSite=Strict cookie valid for 12 hours. Admin HTML and JSON routes are `noindex`, `no-store`, excluded from collection, absent from navigation and disallowed in `robots.txt`.

Routes:

- `/admin/analytics/overview`
- `/admin/analytics/content`
- `/admin/analytics/acquisition`
- `/admin/analytics/agents`
- `/admin/analytics/search`
- `/admin/analytics/realtime`
- `/admin/analytics/health`
- `/admin/data-health`
- `/api/admin/analytics/{view}.json`

## Local development and deployment

Put local-only values in `.dev.vars`, apply migrations, and run the Worker preview:

```bash
npm run d1:migrations:local
npm run preview
```

Before production deployment:

```bash
npm run check
npm test
npm run seo:audit:source
npm run build
npm run d1:migrations:remote
npm run deploy
```

After deploy, load a few public pages, wait for the next hourly Cron, then check Overview and Data Health. The current day can be empty until the first successful rollup.

## Debugging

- Dashboard redirects to login repeatedly: verify `ANALYTICS_ADMIN_SECRET`, clear the admin cookie and sign in again.
- Realtime warns that credentials are missing: set `CLOUDFLARE_ACCOUNT_ID` and `ANALYTICS_API_TOKEN`.
- Data Health shows a rollup error: inspect Worker logs and token permissions, then wait for the next Cron or invoke a scheduled development run.
- Requests exist but visitor counts are zero: set `ANALYTICS_SECRET`; machine requests intentionally have no visitor ID.
- D1 tables are missing: apply migration 0021 to the same database bound as `DB`.

## Extending metrics

To add an event, update the client event union and allowlist, emit it only at a meaningful interaction, add its rollup query/mapping, and add a fixture test. Do not add generic click or scroll capture.

To add a dashboard metric, first decide whether it is a raw realtime question or long-term aggregate. Prefer a bounded D1 column/table for history, update `buildDailyRollup`, the repository query and dashboard view, and cover the arithmetic in `tests/analytics-rollup.test.ts`.

## Cost notes

The design has no analytics vendor subscription, no chart package, no identity provider and no dedicated database. Analytics Engine absorbs raw event writes and D1 stores only small daily aggregates. Bounded dimensions, hourly batch rollups, sampling-aware SQL, short dashboard caches and a narrow meaningful-event list prevent cardinality and query costs from growing with every DOM interaction.

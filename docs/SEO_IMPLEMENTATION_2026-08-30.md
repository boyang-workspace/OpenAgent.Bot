# SEO, data integrity and IA implementation — 2026-08-30

## Implemented

- Added evidence-aware indexability gates for projects, category landings, comparisons and Usage. Thin or unsupported pages emit `noindex,follow` and are omitted from the sitemap.
- Made project titles and descriptions deterministic, factual and category-aware; added visible and JSON-LD breadcrumbs.
- Added `DataCatalog` structured data to the database and retained server-rendered primary content.
- Canonicalized legacy search to `/database`, removed the dangerous catch-all admin redirect, and protected private/internal routes from indexing and caching.
- Added source roles, binding validity intervals and immutable source-binding events. A reviewed locator change no longer masquerades as a project-language change.
- Expanded facet-level openness evidence and scoped licenses. Unsupported “open source” claims resolve to unknown; mixed open/restricted scopes resolve to open-core.
- Added a single SEO audit CLI that checks the redirect map locally and audits production sitemap URLs, canonicals, indexability and legacy redirects.
- Expanded the live audit to validate titles, descriptions, one-H1 structure, JSON-LD parsing/hostnames, parameter noindex rules, internal-link orphans, redirect chains and explicit 410 routes.
- Centralized UI-state query handling: search, sort, filters, pagination and comparison state are `noindex,follow`; attribution parameters continue to consolidate through the canonical URL.
- Replaced the irrelevant `/prototypes/* → /` redirect with `410 Gone` and `X-Robots-Tag: noindex, nofollow`.
- Expanded the private data-health queue with missing evidence, broken subscriptions, recent sync failures and extreme latest-snapshot changes.
- Added source-level SEO auditing to CI.

## Audit artifacts

Run `npm run seo:audit:source` for a safe pre-deploy redirect audit or `npm run seo:audit` after deployment. Reports are written to:

- `reports/seo-audit.json`
- `reports/seo-url-migration.csv`
- `reports/seo-blog-inventory.csv`

## Manual Search Console follow-up

After deployment, submit `https://www.openagent.bot/sitemap.xml`, inspect representative project/category/compare URLs, request indexing for the principal category pages, and monitor canonical duplication, redirected legacy URLs, crawled-currently-not-indexed and soft-404 reports for at least four weeks. Search Console/backlink exports are still needed before deleting any legacy URL that has meaningful traffic or links.

## Deferred until there is enough data

- Additional attribute landing pages should wait until each page has at least two useful records and a distinct query intent.
- Momentum-derived rankings should wait for 30–90 days of reliable history.
- Search-appearance decisions should use Search Console and the new first-party acquisition/content data rather than adding more indexable templates speculatively.

## Current data cleanup queue

The data-health page deliberately reports stored claims separately from the public, derived openness status. A project that claims `open-source` without an open code facet is rendered as `unknown` and remains in the private review queue; the collector must not manufacture facet evidence from a repository-level license string.

# SEO migration baseline

## Repository and live audit baseline

- Canonical production URLs before the 2026-08-31 cleanup: 209.
- Legacy redirect rules before obsolete prototype removal: 38.
- Duplicate titles, duplicate canonicals, broken canonical targets and sitemap noindex URLs: 0 in the 2026-08-30 production audit.
- The only retained editorial URL is `/blog/continue-vs-cursor`; its content contains no duplicated mutable repository metrics.

## External baseline still required

No Search Console or backlink export exists in this repository. Before removing any additional legacy URL, export and preserve:

- top landing pages and queries for the previous 90 days;
- clicks, impressions, CTR and average position;
- indexed legacy URLs and canonical warnings;
- known backlinks to legacy routes.

Store the exports in this directory. Do not include account credentials or private API tokens.

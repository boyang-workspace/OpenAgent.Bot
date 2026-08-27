# URL migration map — 2026-08-27

This map records canonical URL decisions made during the product and SEO refactor.

| Previous URL | Canonical destination | Treatment |
| --- | --- | --- |
| `/open-source-agents` | `/agents` | 301 |
| `/open-source-ai-agents` | `/agents` | 301 |
| `/bots` | `/robotics` | 301 |
| `/blog` | `/changes` | 301 |
| `/agent/:slug` | `/project/:slug` | 301 |
| `/agents/:slug` | `/project/:slug` | 301 |
| `/bot/:slug` | `/project/:slug` | 301 |
| `/bots/:slug` | `/project/:slug` | 301 |
| `/robot/:slug` | `/project/:slug` | 301 |
| `/robots/:slug` | `/project/:slug` | 301 |
| `/model/:slug` | `/project/:slug` | 301 |
| `/models/:slug` | `/project/:slug` | 301 |
| `/tool/:slug` | `/project/:slug` | 301 |
| `/tools/:slug` | `/project/:slug` | 301 |
| `/blog/openclaw-vs-openhands` | `/compare/openclaw-vs-openhands` | 301 |
| `/blog/langfuse-vs-mlflow` | `/compare/langfuse-vs-mlflow` | 301 |
| `/blog/openclaw-vs-browser-use-vs-openhands` | `/compare/openclaw-vs-browser-use-vs-openhands` | 301 |
| `/blog/continue-vs-cursor` | same URL | Preserved under current app shell |

Rules:

- Canonical host is `https://www.openagent.bot`.
- Indexable paths have no trailing slash.
- Query-based database, search, sort and compare state is `noindex, follow` unless represented by a curated clean URL.
- Redirect and parameter URLs are excluded from the sitemap.
- Project dossiers use `/project/:slug` as the single canonical entity namespace.

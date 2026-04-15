# Repository Audit

Date: 2026-04-15

## Current State

The project directory started empty:

- No existing git repository
- No package manifest
- No application framework
- No route structure
- No content model
- No SEO layer
- No deployment configuration

Because there was no prior implementation, PR #1 is a greenfield public-site foundation rather than a destructive rewrite.

## Technology Recommendation

Use Astro with static output for the public site.

Rationale:

- Strong fit for content directories, editorial pages, and static-first SEO
- Low operational cost on Cloudflare Pages
- TypeScript-friendly without requiring a full backend
- Easy future path to Markdown, JSON, and agent-readable routes
- Keeps CMS, D1, submissions, and automation as later, isolated layers

## Keep / Delete / Rewrite

There was no existing code to keep, delete, or rewrite.

The new foundation should be kept small and extended in stages:

- Keep: static Astro public site, shared layout, category config, seed data, SEO helper
- Replace later: seed data modules with a unified typed content source
- Add later: lightweight admin, D1 migrations, submit workflow, machine-readable outputs

## Initial Route Structure

- `/`
- `/models`
- `/agents`
- `/skills`
- `/memory-systems`
- `/plugins`
- `/tools`
- `/:category/:slug`
- `/blog`
- `/blog/:slug`
- `/about`
- `/manifesto`
- `/submit`
- `/robots.txt`
- `/sitemap.xml`

## Known Limits In PR #1

- Content is seeded in TypeScript data modules, not yet a full content schema.
- `/submit` is a placeholder, not a working submission workflow.
- `/admin` and D1 are intentionally deferred.
- Agent-readable `.md` and `.json` resource outputs are intentionally deferred.

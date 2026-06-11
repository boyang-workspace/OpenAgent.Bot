# 2026-06-11 - GA4 Validation Layer

## Context

OpenAgent.bot now has a resource registry foundation, Stack Finder, and
agent-readable recommendation outputs. The next question is whether the database
direction works in practice.

This iteration adds measurement for the human-facing side of that question.
Agent/API/JSON usage still needs Cloudflare Analytics or request logs because
static JSON requests do not execute browser analytics.

## Decisions

- Keep GA4 as the browser analytics layer.
- Keep `G-92BLS0VYN1` as the production measurement id, but move it into site config.
- Track recommendation and resource decision behavior as first-class events.
- Keep static JSON/API traffic out of GA4 assumptions and verify it through Cloudflare.
- Keep existing click events for continuity.

## Files Changed

- `src/config/site.ts`
- `src/layouts/BaseLayout.astro`
- `src/lib/analytics/browser.ts`
- `src/pages/stack-finder.astro`
- `src/components/ResourceDecisionPanel.astro`
- `src/lib/recommendations/stack-resolver.ts`
- `src/pages/api/recommend.json.ts`
- `tests/stack-resolver.test.ts`
- `docs/GA4_VALIDATION.md`

## Validation Targets

- `stack_finder_change`
- `recommendation_click`
- `recommendation_json_click`
- `resource_json_click`
- `source_outbound_click`
- `decision_panel_view`
- `search`

## Follow-Ups

- Configure GA4 key events and custom dimensions in the GA4 UI.
- Use DebugView after deploy to confirm event delivery.
- Add a Cloudflare-side readout for direct JSON/API usage.
- Revisit the Stack Finder UI once 7-day interaction data is available.

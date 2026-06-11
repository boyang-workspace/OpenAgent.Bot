# GA4 Validation Setup

Snapshot date: 2026-06-11

## Measurement

- Production GA4 measurement id: `G-92BLS0VYN1`
- Code source of truth: `src/config/site.ts`
- GA4 covers browser behavior only.
- Cloudflare Analytics or Pages logs should be used for direct agent/API/JSON traffic because static JSON requests do not execute GA scripts.

## Key Events

Mark these as key events in GA4:

- `recommendation_click`
- `recommendation_json_click`
- `resource_json_click`
- `source_outbound_click`
- `search`

Keep these as diagnostic events:

- `stack_finder_change`
- `decision_panel_view`
- Existing navigation/content clicks such as `click_resource`, `click_blog`, `click_category`, `click_cta`, and `click_nav`

## Custom Dimensions

Register these event-scoped custom dimensions:

- `workflow`
- `environment`
- `stage`
- `resource_slug`
- `resource_category`
- `risk_level`
- `constraint_count`
- `outbound_type`
- `output_type`

## Exploration Reports

Create four GA4 explorations:

1. Stack Finder funnel: `/stack-finder/` -> `stack_finder_change` -> `recommendation_click`
2. Resource decision funnel: resource page -> `decision_panel_view` -> `resource_json_click` or `source_outbound_click`
3. Search behavior: `search` -> resource click -> outbound source click
4. Content to database: blog landing -> resource click -> recommendation or JSON click

## Quality Checks

- Link Google Search Console.
- Check enhanced measurement outbound clicks, but treat `source_outbound_click` as the canonical OpenAgent event.
- Filter internal traffic where possible.
- Exclude preview deployments from production reporting, or use a separate debug stream.
- Set GA4 data retention to 14 months.
- Keep `www.openagent.bot` as the primary domain; no cross-domain setup is currently required.

## Day 0 Validation

Use DebugView after deploy and manually trigger:

- Stack Finder workflow/environment/stage/constraint changes.
- Stack Finder recommendation click.
- Stack Finder JSON link click.
- Resource decision panel view.
- Resource JSON link click.
- External source click.
- Site search submit.

Check that parameters are populated and consistently named.

## 7-Day Read

- Is `/stack-finder/` producing `stack_finder_change` and `recommendation_click`?
- Which workflow gets the most recommendation clicks?
- Which resource categories get the strongest source outbound clicks?
- Do searches lead to resource clicks or dead ends?

## 30-Day Read

- If UI interaction is high but JSON/API traffic is low, the site is still mostly a human directory.
- If JSON/API traffic exists but UI recommendation clicks are low, agent-readable direction may work while the frontend needs iteration.
- If Search Console impressions rise but recommendation events stay low, SEO is working but conversion paths need clearer calls to action.

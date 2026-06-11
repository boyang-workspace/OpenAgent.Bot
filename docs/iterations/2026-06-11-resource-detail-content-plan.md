# 2026-06-11 Resource Detail Content Plan

## Context

Resource detail pages are currently too thin for human readers and SEO, even though the ResourceV1 records and machine-readable Markdown already contain more structured material. The next iteration should turn each detail page into a dual-purpose surface:

- a reliable resource profile for humans evaluating a tool
- a structured decision packet for agents selecting tools, stacks, and next actions

## Direction

The canonical resource stays database-first. Articles, guides, and SEO blocks should be generated from or attached to resource records, not become a second source of truth.

Detail pages should be organized around decision usefulness rather than generic marketing copy:

1. What is this resource?
2. What category/type does it belong to?
3. What can it do?
4. When should an agent or builder use it?
5. What are the constraints, risks, and permission surfaces?
6. What evidence supports the claims?
7. What should it be compared with?
8. What should the next action be?

## Proposed Page Structure

### 1. Decision Hero

Purpose: give humans and agents a fast answer.

Fields:

- name
- one_liner
- resource_type
- primary_category
- maturity
- open_source
- license
- deployment modes
- primary interfaces
- machine-readable JSON and Markdown links

Page copy:

- short direct explanation
- "Best for" bullets
- "Not for" bullets
- source/freshness badge

### 2. Agent Decision Packet

Purpose: make the page useful to agents without requiring prose interpretation.

Fields:

- canonical_id
- slug
- category
- resource_type
- capabilities
- constraints
- deployment_modes
- interfaces
- integrations
- permission_surface
- risk_level
- recommended_use_cases
- avoid_when
- source_confidence
- last_verified_at
- primary_actions

HTML behavior:

- render as a visible structured table
- expose the same packet as embedded JSON-LD or `application/json` script
- link to `.json` and `.md`

### 3. What It Does

Purpose: satisfy search intent and reduce ambiguity.

Sections:

- "What is X?"
- "How X works"
- "Core capabilities"
- "Typical workflow"
- "Inputs and outputs"

This section should be 250-500 words for important resources, shorter for low-confidence or early entries.

### 4. Fit Matrix

Purpose: turn broad categories into practical decisions.

Rows:

- local development
- team production
- research/prototyping
- browser automation
- coding agent workflow
- memory/RAG workflow
- evaluation/observability
- self-hosted deployment
- robotics/embodied use, when relevant

Each row should have:

- fit: strong / partial / weak / unknown
- reason
- required checks

### 5. Evidence and Source Notes

Purpose: improve trust and make agent extraction safer.

Fields:

- official homepage
- GitHub repo
- docs
- package registry
- paper/model card
- latest verification date
- factual notes
- missing evidence

Important rule: separate "verified facts" from "editorial interpretation".

### 6. Comparison Block

Purpose: capture high-intent SEO queries and support stack selection.

Sections:

- alternatives
- similar resources
- compare_with
- "choose X if..."
- "choose Y if..."

This should be structured enough to generate comparison pages later.

### 7. Setup and First Action

Purpose: help both human builders and agents take the next step.

Fields:

- install command, when safe and known
- quickstart links
- docs link
- API reference
- example first workflow
- required credentials
- environment assumptions

Avoid inventing commands. If setup is unknown, show "check official docs".

### 8. Risk, Permissions, and Operational Notes

Purpose: make action-agent choices safer.

Fields:

- filesystem access
- shell/code execution
- browser/session access
- network access
- credential handling
- human approval support
- sandboxing notes
- production readiness caveats

This matters especially for coding agents, browser agents, connectors, and robots.

### 9. FAQ

Purpose: SEO coverage and direct user answers.

Default questions:

- What is X used for?
- Is X open source?
- Is X local-first or cloud-based?
- What is the best alternative to X?
- Can agents use X directly?
- What should I check before production use?

Category-specific FAQ should override defaults.

### 10. Related Resources and Guides

Purpose: internal linking and resolver graph growth.

Blocks:

- related resources
- alternatives
- integrates with
- related blog guides
- category landing page
- Stack Finder link with prefilled query where possible

## Schema Additions

ResourceV1 already supports many needed fields. Add only fields that make the database more useful, not just prose longer.

Recommended additions:

- `decision.agent_packet`
  - `risk_level`
  - `source_confidence`
  - `permission_surface`
  - `recommended_workflows`
  - `avoid_workflows`
  - `primary_actions`
- `evidence`
  - `claims`
  - `sources`
  - `missing_checks`
  - `verified_at`
- `fit_matrix`
  - workflow id
  - fit level
  - reason
  - required checks
- `setup`
  - commands
  - docs links
  - environment assumptions
  - credential requirements
- `faq`
  - question
  - answer
  - intent tag

Avoid duplicating existing fields such as `links`, `facts`, `capabilities`, and `positioning`.

## Agent-Readable Outputs

Update `.json` to remain the canonical full object.

Update `.md` to become a concise agent brief:

1. Identity
2. Decision summary
3. Capabilities
4. Fit matrix
5. Constraints and risks
6. Evidence
7. Alternatives
8. Next actions

Add optional route later:

- `/:category/:slug.agent.json`

This can return a smaller resolver-oriented packet without SEO/editorial material.

## SEO Requirements

Each important detail page should target a primary query pattern:

- "What is X"
- "X open source"
- "X alternative"
- "X vs Y"
- "X for agents"
- "X self hosted"
- "X MCP"
- "X local AI"

Minimum content target for priority resources:

- 800-1,500 words
- FAQ structured data
- SoftwareSourceCode/Product/TechArticle schema as appropriate
- 3-8 internal links
- 2-6 external source links
- last verified date visible

Lower-priority resources can use a compact version until enriched.

## Iteration Plan

### Phase 1: Template Enrichment

- Add page modules that render existing ResourceV1 fields more fully.
- No broad schema migration.
- Expand resource detail HTML from current showcase + decision panel into a complete profile.
- Reuse existing `.md` generation logic where possible.

### Phase 2: Schema Upgrade

- Add evidence, fit matrix, setup, permission/risk, and FAQ fields.
- Add validation in `resource-schema.ts`.
- Add one enriched example resource such as OpenClaw to prove the model.

### Phase 3: Batch Enrichment

- Prioritize top 20 resources by expected demand and category importance.
- Enrich them manually or semi-automatically from official sources.
- Keep low-confidence fields explicit instead of filling with generic copy.

### Phase 4: Agent Packet Route

- Add `/:category/:slug.agent.json`.
- Add the route to `llms.txt`, resource pages, and JSON index.
- Track clicks/requests separately from full `.json`.

### Phase 5: Measurement

- Use GA4 for human interactions:
  - decision panel views
  - JSON clicks
  - outbound source clicks
  - related guide/resource clicks
- Use Cloudflare logs for:
  - `.json`
  - `.md`
  - `.agent.json`
  - `/api/recommend.json`

## First Implementation Recommendation

Start with Phase 1 and a small part of Phase 2:

1. Build reusable detail sections from existing fields.
2. Add a visible facts/evidence/fit/FAQ layout.
3. Add minimal schema fields only where current ResourceV1 cannot express the idea.
4. Enrich 3 representative resources:
   - OpenClaw for agent/platform
   - FastMCP or MCP SDK for connector/protocol
   - AgentMemory or Mem0 for memory

This gives enough variation to test whether the detail template works across categories before touching all resources.

## Open Questions

- Should `bots` be renamed in URLs now, or should the database category change first while preserving legacy URLs?
- Should `.agent.json` be introduced immediately, or wait until Cloudflare logs show real `.json`/`.md` usage?
- How much content should be generated versus manually sourced for top-priority resources?

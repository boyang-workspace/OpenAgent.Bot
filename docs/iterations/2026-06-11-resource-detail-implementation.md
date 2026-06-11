# 2026-06-11 Resource Detail Implementation

## Context

The resource detail plan called for pages that are useful to both agents and human readers. This iteration implements that direction across all published resource detail pages without manually rewriting every resource JSON file.

## What Changed

### Shared Detail Generator

Added a derived resource detail layer in `src/lib/content/resource-detail.ts`.

It generates:

- compact agent decision packets
- risk level
- source confidence
- permission surface
- fit matrix
- evidence sources and evidence claims
- missing checks
- inputs and outputs
- next actions
- FAQ

The generator prefers explicit enriched schema fields when present, and falls back to existing ResourceV1 facts, tags, links, capabilities, and positioning when they are not.

### Resource Detail Page

Added `src/components/ResourceDetailSections.astro` and mounted it on every `/:category/:slug` page.

Each detail page now includes:

- Agent packet block
- machine-readable links
- overview / what it is / why it matters / how to evaluate
- facts table
- fit matrix
- inputs and outputs
- evidence and missing checks
- next actions
- alternatives / related resources
- FAQ

### Agent JSON Route

Added:

- `/:category/:slug.agent.json`

This route returns a compact `openagent.agent_resource_packet.v1` object intended for tool selection, stack resolution, and agent consumption.

### Markdown Brief

Updated resource Markdown output so `/:category/:slug.md` includes:

- agent decision summary
- agent JSON URL
- fit matrix
- evidence
- missing checks
- next actions

### Site Indexes

Updated:

- `/index.json`
- `/llms.txt`

Both now expose the new agent packet URL.

### Schema Extension Points

Extended ResourceV1 with optional fields:

- `decision`
- `evidence`
- `fit_matrix`
- `setup`
- `faq`

These fields are optional. Existing resources keep working, but future enrichment can override the derived defaults.

## Why This Approach

This avoids turning the site into a pile of hand-written pages while still making every detail page richer immediately. The canonical direction remains database-first:

- Resource JSON is the source of truth.
- Detail pages render structured profiles from resource data.
- Human-readable SEO content is attached to or generated from resource records.
- Agent-facing output is available as `.json`, `.md`, and `.agent.json`.

## Validation

Validation for this iteration should include:

- schema parsing tests for the new optional fields
- agent packet generation tests
- Astro type checking
- full build
- spot-check at least one resource page and `.agent.json` output after build

## Follow-Ups

- Enrich top 20 resources with explicit evidence, setup, FAQ, and fit matrix fields.
- Add Cloudflare analytics checks for `.agent.json` requests.
- Register `output_type` as an optional GA4 custom dimension if JSON-format clicks need separate GA4 reporting.
- Revisit legacy `bots` URL semantics when the database category migration for physical robots is ready.

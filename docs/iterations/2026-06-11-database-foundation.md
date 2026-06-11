# 2026-06-11 — Database Foundation

## Context

OpenAgent.bot is moving from a human-facing directory toward an agent-queryable
database. Articles stay useful for humans and SEO, but agents should depend on
structured facts, ontology, capabilities, relationships, source evidence, and
recommendation endpoints.

The previous iteration migrated published resource records into ResourceV1 and
added Stack Finder plus agent-readable JSON outputs. This iteration starts the
database foundation below that layer.

## Product Decision

Treat OpenAgent.bot as a registry database first:

- resources are canonical database entities
- categories and resource types need explicit inclusion and exclusion rules
- capabilities are normalized query dimensions, not page tags
- articles are derived editorial surfaces, not the source of truth
- bots should mean physical or embodied robots, not chat channel bots

## Scope

This iteration establishes:

- a registry ontology in code
- a data model audit for the current 137 ResourceV1 records
- a D1 registry schema migration
- a ResourceV1-to-registry SQL export script
- tests for the ontology and export path

It intentionally avoids a full frontend rewrite. The existing ResourceV1 pages
can keep working while the registry layer becomes the new source of truth.

## Important Findings

- Current published resources: 137
- Current legacy categories:
  - agents: 30
  - bots: 31
  - skills: 35
  - models: 15
  - memory-systems: 11
  - tools: 9
  - plugins: 6
- Current `bots` is overloaded:
  - 25 records are channel/chat/support bots
  - 6 records are robotics or embodied AI related
- `relationships` is empty across all current resource records.
- `github_last_commit_at` and `official_launch_year` are missing across current resource records.

## Decisions

- Add a database-level category `robots` for physical/embodied robots.
- Add `robotics` for simulation, training, SDK, VLA, teleoperation, and policy infrastructure.
- Move Telegram/Discord/Slack/WhatsApp/support bots into `channel-bots`.
- Keep old ResourceV1 public categories for now, but map them into the new registry ontology during export.
- Use Cloudflare D1 because the project already has Wrangler and D1 migrations.
- Split capabilities from integrations so abstract abilities and concrete platforms
  stay queryable as different dimensions.

## Files Changed

- `docs/ITERATIONS.md`
- `docs/iterations/2026-06-11-database-foundation.md`
- `docs/ONTOLOGY.md`
- `docs/DATA_MODEL_AUDIT.md`
- `migrations/0007_resource_registry.sql`
- `src/lib/registry/ontology.ts`
- `scripts/registry/export-seed-sql.ts`
- `tests/registry-ontology.test.ts`
- `package.json`

## Validation

- `npm run registry:export-sql` wrote `output/resource-registry-seed.sql` for 137 resources.
- Legacy `bots` export now maps 25 records to `channel-bots` and 6 records to `robots` or `robotics`.
- The export writes integrations to `registry_integrations`, not `registry_capabilities`.
- Robot specs are generated only for final `robots` or `robotics` placements.
- `Future AGI`, `Argent`, and `Robotics Agent Skills` do not get robot spec rows.
- `npm test`: 50 tests passed.
- `npm run check`: 0 errors.
- `npm run build`: 230 pages built.

## Follow-Ups

- Backfill robot-specific facts for Unitree-style and Optimus-style records:
  form factor, mobility, manipulation, SDK, sensors, autonomy level, availability, safety notes.
- Add source evidence rows for every non-trivial fact, not only record-level links.
- Move public JSON endpoints to read from registry exports.
- Add real query parameters to `/api/recommend.json`.
- Split human pages after the database layer is stable.

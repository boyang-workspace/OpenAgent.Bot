# OpenAgent.bot

**Open(Source) × Agent(s) × (Ro)Bot**

An evidence-backed living registry of open-source agents and robotics, with typed robot platforms, intelligence and stack records.

OpenAgent tracks:

- what projects are
- how open they really are
- what changed
- how they evolve over time

## Product surfaces

- `/database` — query the entity registry
- `/project/:slug` — inspect an entity fact sheet and its attributed sources
- `/sources` — inspect canonical and official source coverage
- `/api/v1/entities.json` and `/api/v1/stats.json` — query the registry from software and agents

Entity classification has two independent axes:

- `domain` — `agent`, `robotics`, or `shared`
- `robotics_profiles` — typed Robotics classification: `platform`, `intelligence`, or `stack`
- `kind` — the artifact form, such as `agent`, `model`, `tool`, `robot`, or `simulator`

This allows records such as a robotics model or an agent-oriented tool to remain accurately typed. Domain assignments retain confidence, classification method, review state, and source URL.

## Data pipeline

Cloudflare Workers runs the Astro application and Cloudflare D1 is the canonical datastore. Bounded connectors fetch GitHub, Hugging Face and official feeds. Each source run records its status, stores timestamped observations and updates the current fact projection. Reviewed intake records initial selections and later value changes; explicit corrections preserve both versions and their evidence.

```text
Source → Sync run → Observation → Current fact → Change event
```

The first observation establishes a baseline. Source timestamps and OpenAgent observation timestamps remain separate.

## Evidence model

Facts retain their source, source URL, observation time and confidence. OpenAgent follows four rules:

1. Evidence over inference.
2. Unknown over guessing.
3. History over snapshots.
4. A public repository license is not proof that an entire product is open.

## Openness methodology

Openness is evaluated by facet: code, weights, data, hardware, documentation and governance. A facet may be open, partial, closed or unknown. Confirmed claims require attributed evidence; missing evidence remains unknown.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the public `/methodology` page for the current model.

## Local development

```bash
npm install
npm run d1:migrations:local
npm run dev
```

Quality gate:

```bash
npm run check
npm test
npm run build
```

## Deployment

The production Worker binds to the independent `openagent_registry_v2` D1 database configured in `wrangler.toml`.

```bash
npm run d1:migrations:remote
npm run deploy
```

Set Worker secrets with `wrangler secret put SYNC_TOKEN` and, when available, `wrangler secret put GITHUB_TOKEN`. The GitHub Actions secret `REGISTRY_SYNC_TOKEN` must match the Worker sync token.

## Contributing data

Open an issue or pull request with the project URL, canonical repository, entity domain, artifact kind and primary evidence links. Do not infer openness facets from marketing copy or a repository license alone. Schema migrations belong in `migrations/`; connector behavior must include Vitest coverage.

Reviewed content packages live in `content/intake/`. Use the **Reviewed Registry Intake** GitHub workflow to preview and then publish with the returned base/payload hashes, or use `npm run registry:intake -- <manifest>` with `REGISTRY_SYNC_TOKEN`. New project content no longer needs a SQL migration. See [the intake runbook](docs/REGISTRY_INTAKE.md) for validation, audit history and recovery.

## Use OpenAgent as an MCP server

Agents discover OpenAgent through its read-only MCP server, not by scraping pages.
Run it locally (it queries the public registry by default):

```bash
npm run mcp                       # node mcp/server.mjs
# or point it at a self-hosted/derived instance:
OPENAGENT_API_BASE=https://your-instance npm run mcp
```

Add it to an agent runtime (Claude Code, Codex, OpenCode, Cline) by pointing the
MCP config at the command `node mcp/server.mjs` from this repo. The server exposes
`search_entities`, `get_entity` and `get_stats`; every returned fact carries a
source, source URL and observation time. The catalog manifest is served at
`/mcp/manifest.json`.

## Development status

Registry V2 is live at `https://www.openagent.bot`. The current work hardens canonical URL migration and the Observation → ChangeEvent history pipeline before publishing momentum rankings or user-facing watch features.

The next machine-facing layer, **OpenAgent Knowledge v0.1**, now has a local
contract/projection, three representative sample cases, and a read-only API
preview for strict interface queries, compact sections and paginated changes.
These changes are local, not deployed; no production MCP server or execution runtime is provided.
Legacy contracts remain unchanged. Run `npm run knowledge:check` for isolated
tests and `npm run knowledge:evaluate` for task-level measurements; see
[the implementation](docs/KNOWLEDGE_V0_1.md), [API semantics](docs/KNOWLEDGE_API.md)
and [the evaluation](docs/evaluations/2026-08-28/README.md).

The next local enrichment batch adds source-reviewed OpenHands Agent Canvas,
LangGraph, LeRobot and Playwright MCP records, strict domain filtering and a
discoverable fact-key index. Run `npm run knowledge:evaluate:expansion` for its
30 frozen tasks. See [the expansion results](docs/evaluations/2026-08-28-expansion/README.md).

The fourth local batch adds `npm run knowledge:preview` (loopback HTTP, query-only
in-memory DB), an explicitly invoked real Codex client pilot, and prospective
first-seen / reviewed correction history. Its stdio MCP proxy is test-only.
Migration 0016 is required for the new history query; it has not been applied to
production. See [the client pilot](docs/evaluations/2026-08-28-client-pilot/README.md)
and [correction operations](docs/REGISTRY_INTAKE.md).

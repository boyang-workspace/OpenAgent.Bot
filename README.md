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
- `/changes` — read append-only fact changes
- `/sources` — inspect canonical and official source coverage
- `/api/v1/entities.json` and `/api/v1/stats.json` — query the registry from software and agents

Entity classification has two independent axes:

- `domain` — `agent`, `robotics`, or `shared`
- `robotics_profiles` — typed Robotics classification: `platform`, `intelligence`, or `stack`
- `kind` — the artifact form, such as `agent`, `model`, `tool`, `robot`, or `simulator`

This allows records such as a robotics model or an agent-oriented tool to remain accurately typed. Domain assignments retain confidence, classification method, review state, and source URL.

## Data pipeline

Cloudflare Workers runs the Astro application and Cloudflare D1 is the canonical datastore. Bounded connectors fetch GitHub, Hugging Face and official feeds. Each source run records its status, stores timestamped observations, updates the current fact projection and emits a change only when a previously observed value moves.

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

## Development status

Registry V2 is live at `https://www.openagent.bot`. The current work hardens canonical URL migration and the Observation → ChangeEvent history pipeline before publishing momentum rankings or user-facing watch features.

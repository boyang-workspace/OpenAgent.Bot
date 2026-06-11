# Data Model Audit

Snapshot date: 2026-06-11

## Current Source Layout

The public resource source is currently:

- `content/resources/published/*.json`

Supporting content exists in:

- `content/blog/published/*.json`
- `content/projects/drafts/*.json`
- `content/discovery/*.json`
- `content/topics/*.json`

## Published Resource Counts

Total published ResourceV1 records: 137

| Legacy category | Count |
| --- | ---: |
| agents | 30 |
| bots | 31 |
| memory-systems | 11 |
| models | 15 |
| plugins | 6 |
| skills | 35 |
| tools | 9 |

| Legacy resource type | Count |
| --- | ---: |
| agent | 30 |
| bot | 31 |
| memory_system | 11 |
| model | 15 |
| plugin | 6 |
| skill | 35 |
| tool | 9 |

## Field Completeness

Decision signals:

| Field | Present | True |
| --- | ---: | ---: |
| open_source | 137 | 129 |
| local_first | 137 | 14 |
| self_hostable | 137 | 48 |
| has_api | 137 | 15 |
| has_cli | 0 | 0 |
| has_gui | 137 | 6 |
| supports_mcp | 137 | 25 |
| supports_docker | 137 | 3 |
| multi_platform | 0 | 0 |

Facts:

| Field | Present |
| --- | ---: |
| license | 137 |
| github_stars | 114 |
| github_repo_full_name | 134 |
| github_last_commit_at | 0 |
| last_verified_at | 137 |
| pricing_model | 137 |
| official_launch_year | 0 |

Structured data:

| Field | Present |
| --- | ---: |
| editorial | 137 |
| seo | 137 |
| media | 137 |
| relationships | 0 |

## Capability Distribution

Top current capability labels:

| Capability | Count |
| --- | ---: |
| agent-skill | 36 |
| workflow-orchestration | 34 |
| messaging | 32 |
| workflow | 27 |
| mcp | 25 |
| local-inference | 21 |
| tool-calling | 18 |
| automation | 16 |
| memory | 16 |
| rag | 9 |
| browser-automation | 8 |
| connectors | 8 |
| plugin | 7 |
| robotics | 7 |

## Bots Problem

The current `bots` category contains 31 records, but the product definition is
changing. The intended database meaning is physical or embodied robots, not chat
or support bots.

Current robotics-ish records in legacy `bots`:

- AIRA
- Genesis
- NVIDIA Isaac GR00T
- LeLab
- OpenEAI
- RLinf

Current channel/chat/support bot records in legacy `bots`:

- AstrBot
- ccpoke
- Chibi
- Comis
- Discollama
- Dograh
- FamClaw
- GPT-Shell
- Kirara AI
- LangBot
- llmcord
- Matrix Comms
- MuseBot
- Openaibot
- opensoul
- Python WhatsApp Bot
- Super Homunculus Bot
- Synapse OSS
- TeleChat
- Telegram AI Agent
- Telegram LLM Bot
- Tiledesk
- wandbot
- Wegent
- Zulip MCP

These records should migrate to `channel-bots`.

## Registry Gaps

1. Source evidence is record-level, not fact-level.
2. Relationships are empty, so alternatives and integrations are mostly prose.
3. Robotics-specific facts do not exist yet.
4. Chat bots and physical robots are mixed under one legacy category.
5. Capabilities are mostly tags, not normalized definitions with query behavior.
6. Articles and resource facts are not clearly separated in storage.

## Database Direction

The next source of truth should be a D1-backed registry with normalized tables
for resources, categories, types, capabilities, integrations, interfaces,
deployment modes, links, fact observations, relationships, evaluations, robot
specs, and articles.

ResourceV1 JSON can remain a migration input and static export format while the
registry schema becomes the canonical database model.

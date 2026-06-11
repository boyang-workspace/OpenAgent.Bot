# OpenAgent.bot Ontology

OpenAgent.bot is a database first. Pages and articles are presentation layers.
Agents should query structured entities, capabilities, relationships, and source
evidence instead of scraping article prose.

## Entity Layers

### Resource

A resource is a specific project, product, model, robot, protocol, connector,
skill pack, or tool that can be referenced by agents and humans.

Examples: browser-use, OpenHands, Mem0, Promptfoo, Genesis, AIRA.

### Capability

A capability is an abstract ability a resource can provide or require.

Examples: browser automation, code editing, memory recall, MCP integration,
robot manipulation, teleoperation, screenshot capture.

Capabilities are not articles and not projects. They are query dimensions.

### Integration

An integration is a concrete external service, platform, model provider, app, or
runtime that a resource connects to.

Examples: Discord, Slack, Claude Code, Codex CLI, Hugging Face, Zendesk.

Integrations are not capabilities. "Discord" is an integration; "messaging" is
a capability.

### Relationship

A relationship connects resources or capabilities.

Examples:

- `alternative`: browser-use is an alternative to OpenClaw for browser automation.
- `integrates_with`: a skill pack integrates with Codex CLI.
- `depends_on`: a workflow depends on an MCP connector.
- `provides_capability`: a resource provides browser automation.

### Article

An article is human-readable editorial output derived from resources,
capabilities, relationships, and source evidence. It is useful for SEO and
human understanding, but it is not the canonical data source.

## Canonical Resource Types

### model

A model or model family used for inference, reasoning, coding, multimodal
understanding, or local AI workloads.

Includes: open-weight LLMs, VLMs, OCR models, local inference candidates.

Excludes: agent runtimes, connectors, physical robots.

### software_agent

A software runtime, framework, or application that plans, calls tools, edits
files, browses, or executes workflows.

Includes: coding agents, browser agents, agent frameworks, workflow runtimes.

Excludes: chat channel bots, physical robots, pure model releases.

### skill_pack

An installable or reusable procedure pack that gives an agent a repeatable
capability.

Includes: SKILL.md collections, agent playbooks, domain skill packs.

Excludes: abstract capability names and agent runtimes.

### connector

A protocol server, plugin, or integration that gives agents controlled access
to an external service or tool surface.

Includes: MCP servers, API connectors, database connectors, platform plugins.

Excludes: standalone agent applications and pure content guides.

### memory_system

A storage, recall, graph, or context layer that gives agents durable state or
retrievable knowledge.

Includes: personal memory, RAG systems, knowledge graphs, workflow state stores.

### evaluation_tool

A tool for traces, prompt tests, regression checks, RAG evaluation,
observability, or safety review.

Includes: prompt evaluators, trace tools, LLM observability, RAG quality tools.

### channel_bot

A software bot that operates inside chat, support, voice, or messaging channels.

Includes: Telegram bots, Discord bots, Slack bots, WhatsApp bots, Matrix bots,
support chat bots.

Excludes: humanoid robots, robot arms, robotics simulators.

### robot

A physical or embodied robot platform with sensors, actuators, motion,
manipulation, or real-world embodiment.

Includes: humanoids, quadrupeds, robot arms, mobile robots, embodied AI
platforms, Unitree-style systems, Optimus-style systems.

Excludes: Telegram bots, Discord bots, software-only support agents.

### robotics_infrastructure

A simulator, training system, VLA model, teleoperation stack, SDK, or
reinforcement-learning tool for robots.

Includes: simulation, robot learning, VLA models, teleoperation, robot SDKs.

Excludes: channel bots and generic agent frameworks without robotics use.

## Canonical Categories

The registry categories are:

- `models`
- `agents`
- `skills`
- `capabilities`
- `connectors`
- `memory`
- `evaluations`
- `tools`
- `channel-bots`
- `robots`
- `robotics`
- `protocols`
- `workflows`
- `articles`

## Bots Definition

In the database layer, `bots` should no longer mean chat bots. The old public
category is legacy wording. The intended database concept is:

> Bot/robot records are physical or embodied robot systems, such as Unitree,
> Tesla Optimus, Figure, AIRA, OpenEAI, or similar platforms.

Chat and support bots move to `channel-bots`.

Robotics simulators, training systems, SDKs, VLA models, and teleoperation
systems move to `robotics`.

-- Generated from the reviewed V1 records as a one-time V2 bootstrap.

-- After this migration is applied, D1 observations are the canonical source of truth.



INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('github', 'GitHub repositories', 'GitHub', 'global', 'repository', 'canonical', 'active', 'github', 'https://github.com', NULL, 'https://api.github.com', '["agents","models","robots","hardware"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('huggingface', 'Hugging Face Hub', 'Hugging Face', 'global', 'registry', 'canonical', 'active', 'huggingface', 'https://huggingface.co', NULL, 'https://huggingface.co/api', '["models","agents","robots"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('arxiv', 'arXiv', 'Cornell Tech', 'global', 'research', 'canonical', 'registered', 'rss', 'https://arxiv.org', NULL, 'https://export.arxiv.org/api/query', '["research","agents","models","robots"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('pypi', 'Python Package Index', 'Python Packaging Authority', 'global', 'registry', 'canonical', 'registered', 'json-api', 'https://pypi.org', NULL, 'https://pypi.org/pypi/{project}/json', '["agents","robots"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('npm', 'npm Registry', 'npm', 'global', 'registry', 'canonical', 'registered', 'json-api', 'https://www.npmjs.com', NULL, 'https://registry.npmjs.org/{package}', '["agents","robots"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('open-robotics', 'Open Robotics Blog', 'Open Robotics', 'us', 'newsroom', 'official', 'registered', 'html', 'https://www.openrobotics.org/blog', NULL, NULL, '["robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('nvidia-developer', 'NVIDIA Technical Blog', 'NVIDIA', 'us', 'newsroom', 'official', 'active', 'rss', 'https://developer.nvidia.com/blog/', 'https://developer.nvidia.com/blog/feed/', NULL, '["agents","models","robots","hardware","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('openai-news', 'OpenAI News', 'OpenAI', 'us', 'newsroom', 'official', 'registered', 'html', 'https://openai.com/news/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('anthropic-news', 'Anthropic Newsroom', 'Anthropic', 'us', 'newsroom', 'official', 'registered', 'html', 'https://www.anthropic.com/news', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('google-deepmind', 'Google DeepMind News', 'Google DeepMind', 'us', 'research', 'official', 'registered', 'html', 'https://deepmind.google/discover/blog/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('meta-ai', 'Meta AI Blog', 'Meta', 'us', 'research', 'official', 'registered', 'html', 'https://ai.meta.com/blog/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('microsoft-research', 'Microsoft Research Blog', 'Microsoft', 'us', 'research', 'official', 'registered', 'html', 'https://www.microsoft.com/en-us/research/blog/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('allen-ai', 'Ai2 Blog', 'Allen Institute for AI', 'us', 'research', 'official', 'registered', 'html', 'https://allenai.org/blog', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('qwen-blog', 'Qwen Blog', 'Alibaba Cloud / Qwen Team', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://qwenlm.github.io/blog/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('deepseek', 'DeepSeek Official', 'DeepSeek', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.deepseek.com/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('zhipu-ai', 'Zhipu AI Official', 'Zhipu AI', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.zhipuai.cn/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('moonshot-ai', 'Moonshot AI Official', 'Moonshot AI', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.moonshot.cn/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('baidu-ai', 'Baidu AI Official', 'Baidu', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://ai.baidu.com/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('tencent-hunyuan', 'Tencent Hunyuan', 'Tencent', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://hunyuan.tencent.com/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('bytedance-seed', 'ByteDance Seed', 'ByteDance', 'cn', 'research', 'official', 'registered', 'html', 'https://seed.bytedance.com/en/', NULL, NULL, '["agents","models","robots","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('huawei-noah', 'Huawei Noah''s Ark Lab', 'Huawei', 'cn', 'research', 'official', 'registered', 'html', 'https://www.noahlab.com.hk/', NULL, NULL, '["agents","models","robots","hardware","research"]', 'weekly', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('minimax', 'MiniMax Official', 'MiniMax', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.minimaxi.com/', NULL, NULL, '["agents","models","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('unitree', 'Unitree News', 'Unitree Robotics', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.unitree.com/news/', NULL, NULL, '["robots","hardware","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('ubtech', 'UBTECH News', 'UBTECH Robotics', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.ubtrobot.com/en/news', NULL, NULL, '["robots","hardware","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('agibot', 'AgiBot Official', 'AgiBot', 'cn', 'newsroom', 'official', 'registered', 'html', 'https://www.zhiyuan-robot.com/', NULL, NULL, '["robots","hardware","research","company-news"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('pollen-robotics', 'Pollen Robotics', 'Pollen Robotics', 'eu', 'newsroom', 'official', 'registered', 'html', 'https://www.pollen-robotics.com/', NULL, NULL, '["robots","hardware","research","company-news"]', 'weekly', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO sources (
  id, name, publisher, region, kind, trust_tier, automation_status, connector,
  url, feed_url, api_url, scope_json, cadence, enabled, created_at, updated_at
) VALUES ('huggingface-lerobot', 'LeRobot', 'Hugging Face', 'global', 'repository', 'official', 'registered', 'github', 'https://github.com/huggingface/lerobot', NULL, NULL, '["robots","models","research"]', 'daily', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agent_browser_protocol', 'agent-browser-protocol', 'tool', 'Agent Browser Protocol', 'Deterministic browser automation protocol for Claude, Codex, OpenCode, and MCP-style agent workflows.', 'Agent Browser Protocol is an open-source browser automation project that exposes deterministic browser actions for agent tools. It is aimed at developers who want a cleaner control surface between coding agents and a real browser.', NULL, NULL, 'active', 'public', 'open-source', 'BSD-3-Clause', 'https://github.com/theredsix/agent-browser-protocol', 'https://github.com/theredsix/agent-browser-protocol', NULL, 'https://github.com/theredsix.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agent-browser-protocol', 'res_agent_browser_protocol', 'github', NULL, 'theredsix/agent-browser-protocol', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agent_browser_protocol', 471, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agent_rules_books', 'agent-rules-books', 'tool', 'Agent Rules Books', 'AGENTS.md rules and skills distilled from classic engineering books such as Clean Code, DDD, and DDIA.', 'Agent Rules Books is an open-source agent skill resource focused on agents.md rules and skills distilled from classic engineering books such as clean code, ddd, and ddia.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/ciembor/agent-rules-books', 'https://github.com/ciembor/agent-rules-books', NULL, 'https://opengraph.githubassets.com/openagentbot/ciembor/agent-rules-books', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agent-rules-books', 'res_agent_rules_books', 'github', NULL, 'ciembor/agent-rules-books', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agent_rules_books', 1743, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agent_skill_creator', 'agent-skill-creator', 'tool', 'Agent Skill Creator', 'Workflow for turning repeated procedures into reusable AI agent skills across multiple tools.', 'Agent Skill Creator is an open-source agent skill resource focused on workflow for turning repeated procedures into reusable ai agent skills across multiple tools.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/FrancyJGLisboa/agent-skill-creator', 'https://github.com/FrancyJGLisboa/agent-skill-creator', NULL, 'https://opengraph.githubassets.com/openagentbot/FrancyJGLisboa/agent-skill-creator', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agent-skill-creator', 'res_agent_skill_creator', 'github', NULL, 'FrancyJGLisboa/agent-skill-creator', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agent_skill_creator', 1321, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agentic_commerce_skills', 'agentic-commerce-skills', 'tool', 'Agentic Commerce Skills', 'Open skills and plugins for agentic commerce protocols, checkout, and ecommerce workflows.', 'Agentic Commerce Skills is an open repository from OrcaQubits covering commerce-focused agent skills and plugins for protocols, checkout, payments, and ecommerce integrations.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://orcaqubits-ai.com/', 'https://github.com/OrcaQubits/agentic-commerce-skills-plugins', NULL, 'https://github.com/OrcaQubits.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agentic-commerce-skills', 'res_agentic_commerce_skills', 'github', NULL, 'OrcaQubits/agentic-commerce-skills-plugins', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agentmemory', 'agentmemory', 'tool', 'AgentMemory', 'Persistent memory for AI coding agents, with benchmarks and local-first workflows.', 'AgentMemory is an open-source persistent memory layer for AI coding agents. It focuses on helping tools like Claude Code, Codex, Cursor, and related coding agents remember project context, decisions, and reusable knowledge across sessions.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://agent-memory.dev', 'https://github.com/rohitg00/agentmemory', NULL, 'https://github.com/rohitg00.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agentmemory', 'res_agentmemory', 'github', NULL, 'rohitg00/agentmemory', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agentmemory', 22013, 1806, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agentql_mcp', 'agentql-mcp', 'tool', 'AgentQL MCP', 'Model Context Protocol server that exposes AgentQL data extraction capabilities to AI agents.', 'AgentQL MCP is an open-source Model Context Protocol server that integrates AgentQL''s data extraction capabilities. It is relevant for agents that need structured web data extraction through an MCP-compatible tool surface.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://docs.agentql.com/integrations/mcp', 'https://github.com/tinyfish-io/agentql-mcp', NULL, 'https://github.com/tinyfish-io.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agentql-mcp', 'res_agentql_mcp', 'github', NULL, 'tinyfish-io/agentql-mcp', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agentql_mcp', 174, 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_agnix', 'agnix', 'tool', 'Agnix', 'Linter and language-server tooling for CLAUDE.md, AGENTS.md, SKILL.md, hooks, and MCP project files.', 'Agnix is an open-source agent skill resource focused on linter and language-server tooling for claude.md, agents.md, skill.md, hooks, and mcp project files.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/agent-sh/agnix', 'https://github.com/agent-sh/agnix', NULL, 'https://opengraph.githubassets.com/openagentbot/agent-sh/agnix', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_agnix', 'res_agnix', 'github', NULL, 'agent-sh/agnix', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_agnix', 267, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ai_agents_skills', 'ai-agents-skills', 'tool', 'AI Agents Skills', 'Curated open repository of specialized skills for coding agents and AI assistants.', 'AI Agents Skills is a public collection of reusable skill files for coding agents such as GitHub Copilot, Cursor, Windsurf, and related assistant environments.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/hoodini/ai-agents-skills', 'https://github.com/hoodini/ai-agents-skills', NULL, 'https://github.com/hoodini.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ai-agents-skills', 'res_ai_agents_skills', 'github', NULL, 'hoodini/ai-agents-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_aider', 'aider', 'agent', 'Aider', 'AI pair programming in your terminal that maps your codebase, auto-commits to git, and works with 100+ languages and any LLM provider.', 'Aider is an open-source terminal tool for AI pair programming that works with any LLM provider, maps your codebase with a repository map, and automatically commits changes to git. It supports over 100 programming languages and integrates with local and cloud models through a flexible provider system.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://aider.chat', 'https://github.com/Aider-AI/aider', 'https://aider.chat/docs', 'https://github.com/Aider-AI.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_aider', 'res_aider', 'github', NULL, 'Aider-AI/aider', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_aider', 45400, 3200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_aira', 'aira', 'agent', 'AIRA', '3D-printable 7-DoF robotic arm with native LeRobot integration for ACT, Diffusion, PI0, and GR00T.', 'AIRA is a fully 3D-printable, 7-degree-of-freedom (6-DoF + 1-DoF gripper) robotic arm designed as a native LeRobot plugin. It plugs directly into the LeRobot ecosystem — ACT, Diffusion Policy, PI0, GR00T N1.5, and every other policy in the LeRobot framework work out of the box. With an interactive setup wizard, Damiao CAN bus motors, and MIT impedance control, AIRA is designed for makers, researchers, and educators who want an open, affordable platform for robot learning.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://www.nextis.tech/hardware', 'https://github.com/robertorobotics/Nextis-AIRA-3D', NULL, NULL, '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_aira', 'res_aira', 'github', NULL, 'robertorobotics/Nextis-AIRA-3D', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_aira', 212, 18, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_anthropic_cybersecurity_skills', 'anthropic-cybersecurity-skills', 'tool', 'Anthropic Cybersecurity Skills', 'Cybersecurity skill collection for AI agents mapped to MITRE, NIST, and practical security workflows.', 'Anthropic Cybersecurity Skills is an open-source agent skill resource focused on cybersecurity skill collection for ai agents mapped to mitre, nist, and practical security workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/mukul975/Anthropic-Cybersecurity-Skills', 'https://github.com/mukul975/Anthropic-Cybersecurity-Skills', NULL, 'https://opengraph.githubassets.com/openagentbot/mukul975/Anthropic-Cybersecurity-Skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_anthropic-cybersecurity-skills', 'res_anthropic_cybersecurity_skills', 'github', NULL, 'mukul975/Anthropic-Cybersecurity-Skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_anthropic_cybersecurity_skills', 14164, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_antigravity_awesome_skills', 'antigravity-awesome-skills', 'tool', 'Antigravity Awesome Skills', 'Large installable library of agentic skills for Claude Code, Cursor, Codex CLI, Gemini CLI, and Antigravity.', 'Antigravity Awesome Skills is an open-source agent skill resource focused on large installable library of agentic skills for claude code, cursor, codex cli, gemini cli, and antigravity.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/sickn33/antigravity-awesome-skills', 'https://github.com/sickn33/antigravity-awesome-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/sickn33/antigravity-awesome-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_antigravity-awesome-skills', 'res_antigravity_awesome_skills', 'github', NULL, 'sickn33/antigravity-awesome-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_antigravity_awesome_skills', 39721, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_argent', 'argent', 'agent', 'Argent', 'Agentic toolkit that gives AI assistants direct access to iOS Simulators and Android Emulators.', 'Argent is an agentic toolkit by Software Mansion that connects AI coding assistants directly to iOS Simulators and Android Emulators. It enables agents to tap, swipe, type, launch apps, inspect view hierarchies, read console logs, capture crash reports, profile React Native and Xcode Instruments sessions, and debug mobile apps — all from within the CLI without switching context. It ships as an MCP server and supports Claude Code, Cursor, Copilot, Codex, Gemini, OpenCode, Windsurf, and Zed.', NULL, NULL, 'active', 'public', 'unknown', 'Apache-2.0 with proprietary binaries', 'https://argent.swmansion.com', 'https://github.com/software-mansion/argent', NULL, 'https://github.com/software-mansion.png', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_argent', 'res_argent', 'github', NULL, 'software-mansion/argent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_argent', 3200, 90, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_astrbot', 'astrbot', 'agent', 'AstrBot', 'Multi-platform AI agent assistant framework for IM platforms, LLMs, plugins, and AI features.', 'AstrBot is an open-source AI bot project focused on multi-platform ai agent assistant framework for im platforms, llms, plugins, and ai features.', NULL, NULL, 'active', 'public', 'open-source', 'AGPL-3.0', 'https://github.com/AstrBotDevs/AstrBot', 'https://github.com/AstrBotDevs/AstrBot', NULL, 'https://opengraph.githubassets.com/openagentbot/AstrBotDevs/AstrBot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_astrbot', 'res_astrbot', 'github', NULL, 'AstrBotDevs/AstrBot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_astrbot', 33820, 2321, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_autogen', 'autogen', 'agent', 'AutoGen', 'Multi-agent AI framework from Microsoft Research for building conversational agent systems with AgentChat, Core API, and Extensions.', 'AutoGen is Microsoft Research''s open-source framework for building multi-agent AI systems. It provides three layers — AgentChat for quick prototyping, Core API for fine-grained control, and Extensions for ecosystem integrations — giving developers a flexible foundation for agent collaboration patterns.', NULL, NULL, 'active', 'public', 'open-source', 'CC-BY-4.0', 'https://microsoft.github.io/autogen/', 'https://github.com/microsoft/autogen', 'https://microsoft.github.io/autogen/docs/', 'https://github.com/microsoft.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_autogen', 'res_autogen', 'github', NULL, 'microsoft/autogen', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_autogen', 58400, 8500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_awesome_design_skills', 'awesome-design-skills', 'tool', 'Awesome Design Skills', 'Curated collection of DESIGN.md and SKILL.md files for design-oriented AI agents.', 'Awesome Design Skills is an open-source agent skill resource focused on curated collection of design.md and skill.md files for design-oriented ai agents.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/bergside/awesome-design-skills', 'https://github.com/bergside/awesome-design-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/bergside/awesome-design-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_awesome-design-skills', 'res_awesome_design_skills', 'github', NULL, 'bergside/awesome-design-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_awesome_design_skills', 1124, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_awesome_finance_skills', 'awesome-finance-skills', 'tool', 'Awesome Finance Skills', 'Finance-focused agent skills for research, analysis, and financial workflow automation.', 'Awesome Finance Skills is an open-source agent skill resource focused on finance-focused agent skills for research, analysis, and financial workflow automation.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/RKiding/Awesome-finance-skills', 'https://github.com/RKiding/Awesome-finance-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/RKiding/Awesome-finance-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_awesome-finance-skills', 'res_awesome_finance_skills', 'github', NULL, 'RKiding/Awesome-finance-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_awesome_finance_skills', 2415, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_browser_act_skills', 'browser-act-skills', 'tool', 'Browser Act Skills', 'Browser automation CLI and skill set built for AI agents that need repeatable web actions.', 'Browser Act Skills is an open-source agent skill resource focused on browser automation cli and skill set built for ai agents that need repeatable web actions.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/browser-act/skills', 'https://github.com/browser-act/skills', NULL, 'https://opengraph.githubassets.com/openagentbot/browser-act/skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_browser-act-skills', 'res_browser_act_skills', 'github', NULL, 'browser-act/skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_browser_act_skills', 1814, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_browser_use', 'browser-use', 'agent', 'browser-use', 'Open-source browser automation agent framework that makes websites accessible to AI agents.', 'browser-use is an MIT-licensed Python project for connecting AI agents to browser actions, making it useful for teams prototyping web automation, browser agents, and task execution over real websites.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://browser-use.com', 'https://github.com/browser-use/browser-use', 'https://docs.browser-use.com/', 'https://github.com/browser-use.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_browser-use', 'res_browser_use', 'github', NULL, 'browser-use/browser-use', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_browser_use', 88493, 10154, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_browseros', 'browseros', 'agent', 'BrowserOS', 'Open-source agentic browser positioned as an alternative to AI-native browsers and browser assistants.', 'BrowserOS is an open-source agentic browser project built around the idea that the browser itself can be the AI agent workspace. It is relevant for teams comparing browser agents, browser automation tools, and AI-native browsing environments.', NULL, NULL, 'active', 'public', 'open-source', 'AGPL-3.0', 'https://BrowserOS.com', 'https://github.com/browseros-ai/BrowserOS', NULL, 'https://github.com/browseros-ai.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_browseros', 'res_browseros', 'github', NULL, 'browseros-ai/BrowserOS', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_browseros', 11316, 1153, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_cc_skills_golang', 'cc-skills-golang', 'tool', 'CC Skills Golang', 'Golang-focused agent skill pack for Claude Code and compatible coding-agent workflows.', 'CC Skills Golang is an open-source agent skill resource focused on golang-focused agent skill pack for claude code and compatible coding-agent workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/samber/cc-skills-golang', 'https://github.com/samber/cc-skills-golang', NULL, 'https://opengraph.githubassets.com/openagentbot/samber/cc-skills-golang', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_cc-skills-golang', 'res_cc_skills_golang', 'github', NULL, 'samber/cc-skills-golang', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_cc_skills_golang', 1965, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ccpoke', 'ccpoke', 'agent', 'ccpoke', 'Bridge between AI coding agents and your phone with notifications, two-way chat, and permission handling.', 'ccpoke is an open-source AI bot project focused on bridge between ai coding agents and your phone with notifications, two-way chat, and permission handling.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/kaida-palooza/ccpoke', 'https://github.com/kaida-palooza/ccpoke', NULL, 'https://opengraph.githubassets.com/openagentbot/kaida-palooza/ccpoke', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ccpoke', 'res_ccpoke', 'github', NULL, 'kaida-palooza/ccpoke', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ccpoke', 102, 42, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_chibi', 'chibi', 'agent', 'Chibi', 'Self-hosted Telegram companion orchestrating multiple AI providers with autonomous agent capabilities, MCP integrations, and async tasks.', 'Chibi is an open-source AI bot project focused on self-hosted telegram companion orchestrating multiple ai providers with autonomous agent capabilities, mcp integrations, and async tasks.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/s-nagaev/chibi', 'https://github.com/s-nagaev/chibi', NULL, 'https://opengraph.githubassets.com/openagentbot/s-nagaev/chibi', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_chibi', 'res_chibi', 'github', NULL, 's-nagaev/chibi', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_chibi', 50, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_claude_code', 'claude-code', 'agent', 'Claude Code', 'Agentic coding tool from Anthropic that lives in your terminal, understands codebases, and handles complex development tasks through natural language.', 'Claude Code is an agentic coding tool from Anthropic that runs in the terminal, reads your entire codebase, and executes multi-step development tasks through natural language instructions. It supports MCP integrations, git workflows, and works directly against your local files without requiring a cloud IDE.', NULL, NULL, 'active', 'public', 'unknown', 'Proprietary', 'https://docs.anthropic.com/en/docs/claude-code', 'https://github.com/anthropics/claude-code', NULL, 'https://github.com/anthropics.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_claude-code', 'res_claude_code', 'github', NULL, 'anthropics/claude-code', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_claude_code', 127000, 7200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_cline', 'cline', 'agent', 'Cline', 'Open-source autonomous coding agent for VS Code that creates and edits files, executes commands, and uses a browser — all with human approval at every step.', 'Cline is an open-source autonomous coding agent that runs as a VS Code extension with 5M+ installs and 58K+ GitHub stars. It can create and edit files, execute terminal commands, use a headless browser for testing, and integrate with MCP tools. Every action requires human approval, keeping developers in control while automating complex development workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://cline.bot', 'https://github.com/cline/cline', 'https://docs.cline.bot', 'https://github.com/cline.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_cline', 'res_cline', 'github', NULL, 'cline/cline', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_cline', 58600, 5100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_codebuff', 'codebuff', 'agent', 'Codebuff', 'Terminal-native AI coding agent that understands your entire codebase and makes precise, style-consistent edits from natural language instructions.', 'Codebuff is a terminal-based AI coding agent that deeply understands your entire codebase — structure, dependencies, and patterns — to make precise, style-consistent edits. It coordinates specialized sub-agents (File Explorer, Planner, Editor, Reviewer) for better results, supports any model on OpenRouter, and persists project knowledge in markdown files that evolve with every session.', NULL, NULL, 'active', 'public', 'unknown', 'Proprietary', 'https://codebuff.com', 'https://github.com/CodebuffAI/codebuff', 'https://codebuff.com/docs', 'https://github.com/CodebuffAI.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_codebuff', 'res_codebuff', 'github', NULL, 'CodebuffAI/codebuff', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_codebuff', 4500, 200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_codex_cli', 'codex-cli', 'agent', 'Codex CLI', 'Lightweight coding agent from OpenAI that runs locally in your terminal, built in Rust, works with ChatGPT plans or API keys.', 'Codex CLI is OpenAI''s open-source terminal coding agent, built in Rust for speed and minimal overhead. It connects to OpenAI models through ChatGPT plans or API keys, supports local file editing and shell execution, and is designed as a lightweight alternative to heavier agent frameworks.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/openai/codex', 'https://github.com/openai/codex', NULL, 'https://github.com/openai.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_codex-cli', 'res_codex_cli', 'github', NULL, 'openai/codex', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_codex_cli', 86100, 5400, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_cognee', 'cognee', 'tool', 'Cognee', 'Open-source memory and data infrastructure for AI applications that need reliable context.', 'Cognee is an open-source memory and data layer for AI applications, focused on turning data into structured, retrievable context for agents and LLM systems.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://www.cognee.ai/', 'https://github.com/topoteretes/cognee', 'https://docs.cognee.ai/', 'https://github.com/topoteretes.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_cognee', 'res_cognee', 'github', NULL, 'topoteretes/cognee', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_comis', 'comis', 'agent', 'Comis', 'Self-hosted AI agent teams inside messaging apps.', 'Comis is an open-source AI bot project focused on self-hosted ai agent teams inside messaging apps.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/comisai/comis', 'https://github.com/comisai/comis', NULL, 'https://opengraph.githubassets.com/openagentbot/comisai/comis', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_comis', 'res_comis', 'github', NULL, 'comisai/comis', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_comis', 4, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_continue', 'continue', 'agent', 'Continue', 'Open-source AI code agent for VS Code and JetBrains that combines chat, edit, agent, and autocomplete modes with source-controlled AI checks enforceable in CI.', 'Continue is an open-source AI code agent that runs as a VS Code and JetBrains extension with four modes: Chat for questions, Edit for targeted changes, Agent for autonomous task execution, and Autocomplete for inline suggestions. It recently pivoted to focus on source-controlled AI checks that run as GitHub status checks, enforceable in CI pipelines.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://continue.dev', 'https://github.com/continuedev/continue', 'https://docs.continue.dev', 'https://github.com/continuedev.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_continue', 'res_continue', 'github', NULL, 'continuedev/continue', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_continue', 31800, 1600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_cowagent', 'cowagent', 'tool', 'CowAgent', 'Open-source AI assistant with multi-model support, task planning, tool execution, and persistent memory.', 'CowAgent (formerly chatgpt-on-wechat) is an open-source AI assistant harness that connects multiple LLM backends across chat channels. It features task planning, tool execution, skill management, and autonomous memory growth — all in a lightweight, extensible package with a one-line install.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://cowagent.ai', 'https://github.com/zhayujie/CowAgent', NULL, 'https://opengraph.githubassets.com/openagentbot/zhayujie/CowAgent', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_cowagent', 'res_cowagent', 'github', NULL, 'zhayujie/CowAgent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_cowagent', 45035, 10166, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_crawl4ai', 'crawl4ai', 'agent', 'crawl4ai', 'Open-source LLM-friendly web crawler and scraper for extracting clean, structured content from any website.', 'crawl4ai is an open-source web crawling and scraping framework designed specifically for LLM data pipelines. It extracts clean, structured content from websites — handling JavaScript rendering, pagination, and complex selectors — and outputs data ready for RAG systems, AI training datasets, and agent research workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://crawl4ai.com', 'https://github.com/unclecode/crawl4ai', NULL, 'https://opengraph.githubassets.com/openagentbot/unclecode/crawl4ai', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_crawl4ai', 'res_crawl4ai', 'github', NULL, 'unclecode/crawl4ai', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_crawl4ai', 67682, 6913, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_crewai', 'crewai', 'agent', 'CrewAI', 'Multi-agent orchestration framework where role-playing autonomous AI agents collaborate to execute complex workflows.', 'CrewAI is an open-source Python framework for building multi-agent systems where role-playing AI agents collaborate to complete complex tasks. It provides a structured approach to agent orchestration with roles, goals, backstories, and tools, making it one of the most accessible frameworks for multi-agent workflow design.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://crewai.com', 'https://github.com/crewAIInc/crewAI', 'https://docs.crewai.com', 'https://github.com/crewAIInc.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_crewai', 'res_crewai', 'github', NULL, 'crewAIInc/crewAI', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_crewai', 52300, 7100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_deepeval', 'deepeval', 'tool', 'DeepEval', 'Open-source LLM evaluation framework for testing RAG pipelines, agent workflows, and LLM outputs with metrics and CI/CD integration.', 'DeepEval is an MIT-licensed LLM evaluation framework that provides over 15 built-in metrics for testing RAG pipelines, agentic workflows, retrieval quality, hallucination detection, and conversation safety with Pytest integration for CI/CD.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://www.confident-ai.com', 'https://github.com/confident-ai/deepeval', 'https://docs.confident-ai.com', 'https://github.com/confident-ai.png', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_deepeval', 'res_deepeval', 'github', NULL, 'confident-ai/deepeval', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_deepeval', 42000, 2200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_deepseek_r1', 'deepseek-r1', 'model', 'DeepSeek-R1', 'Open reasoning model family for developers testing long-form reasoning, coding, and local AI workflows.', 'DeepSeek-R1 is an MIT-licensed open reasoning model release from DeepSeek, widely used by developers who want to evaluate transparent reasoning behavior, distilled model variants, and local or self-hosted inference paths.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://www.deepseek.com/', 'https://github.com/deepseek-ai/DeepSeek-R1', NULL, 'https://github.com/deepseek-ai.png', '2026-04-19T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_deepseek-r1', 'res_deepseek_r1', 'github', NULL, 'deepseek-ai/DeepSeek-R1', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_deepseek-r1', 'res_deepseek_r1', 'huggingface', NULL, 'deepseek-ai/DeepSeek-R1', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_deepseek_r1', 91963, 11727, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_deepseek_v4', 'deepseek-v4', 'model', 'DeepSeek V4', 'Open DeepSeek V4 model family for million-token context, coding, reasoning, and agent workflows.', 'DeepSeek V4 is DeepSeek''s current open model family, with V4-Pro and V4-Flash variants surfaced through DeepSeek''s official API docs and DeepSeek AI''s Hugging Face release pages.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://www.deepseek.com/', NULL, 'https://api-docs.deepseek.com/news/news260424', 'https://api-docs.deepseek.com/img/deepseek-social-card.jpeg', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_deepseek-v4', 'res_deepseek_v4', 'huggingface', NULL, 'collections/deepseek-ai/deepseek-v4', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_discollama', 'discollama', 'agent', 'Discollama', 'AI-powered Discord bot designed to run from a local machine with local or hosted LLMs.', 'Discollama is an open-source AI bot project focused on ai-powered discord bot designed to run from a local machine with local or hosted llms.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/mxyng/discollama', 'https://github.com/mxyng/discollama', NULL, 'https://opengraph.githubassets.com/openagentbot/mxyng/discollama', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_discollama', 'res_discollama', 'github', NULL, 'mxyng/discollama', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_discollama', 168, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_dograh', 'dograh', 'agent', 'Dograh', 'Open-source self-hosted voice AI platform with visual workflows, MCP support, BYOK model routing, and telephony.', 'Dograh is an open-source voice AI platform positioned as a self-hosted alternative to hosted voice-agent products. It supports on-premise deployment, BYOK model choices, speech-to-speech or modular LLM/STT/TTS workflows, visual workflow building, MCP-native integrations, and telephony support.', NULL, NULL, 'active', 'public', 'open-source', 'BSD-2-Clause', 'https://app.dograh.com', 'https://github.com/dograh-hq/dograh', NULL, 'https://github.com/dograh-hq.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_dograh', 'res_dograh', 'github', NULL, 'dograh-hq/dograh', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_dograh', 4313, 897, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ecc', 'ecc', 'tool', 'ECC', 'Agent harness for Claude Code, Codex, Opencode, Cursor, and other coding agents focused on performance, memory, and security.', 'ECC is an open-source agent skill resource focused on agent harness for claude code, codex, opencode, cursor, and other coding agents focused on performance, memory, and security.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/affaan-m/ECC', 'https://github.com/affaan-m/ECC', NULL, 'https://opengraph.githubassets.com/openagentbot/affaan-m/ECC', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ecc', 'res_ecc', 'github', NULL, 'affaan-m/ECC', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ecc', 207180, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_famclaw', 'famclaw', 'agent', 'FamClaw', 'Self-hosted family AI gateway with parental controls for Telegram, Discord, and web, designed for homelab and local/cloud LLM use.', 'FamClaw is an open-source AI bot project focused on self-hosted family ai gateway with parental controls for telegram, discord, and web, designed for homelab and local/cloud llm use.', NULL, NULL, 'active', 'public', 'open-source', 'AGPL-3.0', 'https://github.com/famclaw/famclaw', 'https://github.com/famclaw/famclaw', NULL, 'https://opengraph.githubassets.com/openagentbot/famclaw/famclaw', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_famclaw', 'res_famclaw', 'github', NULL, 'famclaw/famclaw', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_famclaw', 2, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_fastmcp', 'fastmcp', 'tool', 'FastMCP', 'Pythonic framework for building MCP servers and clients.', 'FastMCP is an Apache-2.0 Python project for building Model Context Protocol servers and clients with a developer-friendly API.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://gofastmcp.com', 'https://github.com/PrefectHQ/fastmcp', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_fastmcp', 'res_fastmcp', 'github', NULL, 'PrefectHQ/fastmcp', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_fastmcp', 25429, 2045, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_fingpt', 'fingpt', 'model', 'FinGPT', 'Open-source financial large language model project for finance sentiment, analysis, and domain adaptation.', 'FinGPT is an open-source financial LLM project from AI4Finance Foundation. It focuses on finance-specific language modeling, sentiment analysis, and domain workflows where general LLMs often need adaptation.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://fingpt.io', 'https://github.com/AI4Finance-Foundation/FinGPT', NULL, 'https://github.com/AI4Finance-Foundation.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_fingpt', 'res_fingpt', 'github', NULL, 'AI4Finance-Foundation/FinGPT', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_fingpt', 20446, 2900, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_future_agi', 'future-agi', 'tool', 'Future AGI', 'Open-source platform for evaluating, observing, and improving LLM and AI agent applications.', 'Future AGI is an open-source platform for evaluating, observing, and improving LLM and AI agent applications. It covers tracing, evals, simulations, datasets, gateway workflows, guardrails, and self-hostable deployment.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://futureagi.com', 'https://github.com/future-agi/future-agi', NULL, 'https://github.com/future-agi.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_future-agi', 'res_future_agi', 'github', NULL, 'future-agi/future-agi', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_future_agi', 1127, 240, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_garden_skills', 'garden-skills', 'tool', 'Garden Skills', 'Open-source agent skills collection for web design, retrieval, image generation, and creative workflows.', 'Garden Skills is an open-source skills collection for AI agents. It packages reusable instructions and workflows for web design, knowledge retrieval, image generation, and related tasks.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/ConardLi/garden-skills', 'https://github.com/ConardLi/garden-skills', NULL, 'https://github.com/ConardLi.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_garden-skills', 'res_garden_skills', 'github', NULL, 'ConardLi/garden-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_garden_skills', 7602, 1037, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gbrain', 'gbrain', 'tool', 'GBrain', 'Open context and memory layer for giving agents a more durable project brain.', 'GBrain is an open project around structured agent memory and context, useful for builders exploring how agents can preserve working knowledge across sessions.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/garrytan/gbrain', 'https://github.com/garrytan/gbrain', NULL, 'https://github.com/garrytan.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gbrain', 'res_gbrain', 'github', NULL, 'garrytan/gbrain', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gemini_cli', 'gemini-cli', 'agent', 'Gemini CLI', 'Open-source AI agent from Google that brings Gemini models into the terminal with file operations, shell commands, and Google Search grounding.', 'Gemini CLI is an open-source terminal agent from Google that runs Gemini models locally with file editing, shell execution, and built-in Google Search grounding. It supports MCP servers, works with large codebases, and offers a generous free tier through Gemini API access.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/google-gemini/gemini-cli', 'https://github.com/google-gemini/gemini-cli', NULL, 'https://github.com/google-gemini.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gemini-cli', 'res_gemini_cli', 'github', NULL, 'google-gemini/gemini-cli', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_gemini_cli', 105000, 10800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gemma_4', 'gemma-4', 'model', 'Gemma 4', 'Google DeepMind''s open model family for local, multimodal, and agentic AI workflows.', 'Gemma 4 is a family of Apache 2.0 open models from Google DeepMind, designed for reasoning, multimodal inputs, edge deployments, and developer workflows that need more control than hosted-only APIs.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://deepmind.google/models/gemma/gemma-4/', NULL, 'https://ai.google.dev/gemma', 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Social_Image_G4_12B.width-1300.png', '2026-04-18T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-04-18T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_gemma-4', 'res_gemma_4', 'huggingface', NULL, 'collections/google/gemma-4', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gemma_4_12b', 'gemma-4-12b', 'model', 'Gemma 4 12B', 'Google DeepMind''s 12B open multimodal model for local agentic workflows on laptops.', 'Gemma 4 12B is a mid-sized Apache 2.0 open model from Google DeepMind, designed to bring multimodal and agentic intelligence to consumer laptops with a reduced memory footprint.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://deepmind.google/models/gemma/gemma-4/', NULL, 'https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12b/', 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Social_Image_G4_12B.width-1300.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_gemma-4-12b', 'res_gemma_4_12b', 'huggingface', NULL, 'collections/google/gemma-4', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_genesis', 'genesis', 'agent', 'Genesis', 'Universal physics engine and simulation platform for robotics and embodied AI at 430,000x real-time speed.', 'Genesis is a universal physics platform re-built from the ground up for general-purpose robotics, embodied AI, and physical AI applications. It integrates a high-performance physics engine, photo-realistic rendering, and a generative data engine into one Pythonic framework. Supported by a generative agent framework, Genesis can transform natural language prompts into multimodal training data at unprecedented speed.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://genesis-world.readthedocs.io', 'https://github.com/Genesis-Embodied-AI/Genesis', NULL, NULL, '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_genesis', 'res_genesis', 'github', NULL, 'Genesis-Embodied-AI/Genesis', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_genesis', 28799, 2708, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_github_mcp_server', 'github-mcp-server', 'tool', 'GitHub MCP Server', 'Official GitHub Model Context Protocol server that connects AI agents to GitHub repositories, issues, pull requests, and code.', 'GitHub MCP Server is the official Model Context Protocol server from GitHub that lets AI agents browse repositories, create and manage issues, review pull requests, search code, and interact with GitHub''s API through standardized MCP tool calls.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/modelcontextprotocol/servers/tree/main/src/github', 'https://github.com/modelcontextprotocol/servers/tree/main/src/github', 'https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#github', 'https://github.com/modelcontextprotocol.png', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_github-mcp-server', 'res_github_mcp_server', 'github', NULL, 'modelcontextprotocol/servers/tree/main/src/github', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_github_mcp_server', 32000, 1200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_glm_5', 'glm-5', 'model', 'GLM-5', 'Open model line from Z.ai focused on agentic engineering and longer coding workflows.', 'GLM-5 is Z.ai''s open model line positioned around agentic engineering: workflows where a model reasons across files, tools, tests, and implementation steps rather than only completing code snippets.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://chat.z.ai/', 'https://github.com/zai-org/GLM-5', NULL, 'https://github.com/zai-org.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_glm-5', 'res_glm_5', 'github', NULL, 'zai-org/GLM-5', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_glm_ocr', 'glm-ocr', 'model', 'GLM-OCR', 'Open OCR model and pipeline for turning complex document images into usable text.', 'GLM-OCR is an open OCR model and document pipeline from Z.ai, focused on accurate, fast, and comprehensive image-to-text extraction for documents, tables, formulas, and complex layouts.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT model / Apache-2.0 code', 'https://github.com/zai-org/GLM-OCR', 'https://github.com/zai-org/GLM-OCR', NULL, 'https://github.com/zai-org.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_glm-ocr', 'res_glm_ocr', 'github', NULL, 'zai-org/GLM-OCR', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_google_adk', 'google-adk', 'agent', 'Google ADK', 'Google''s open-source Agent Development Kit for building multi-agent systems with Python, TypeScript, Go, and Java.', NULL, NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/google/adk-python', 'https://github.com/google/adk-python', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_google-adk', 'res_google_adk', 'github', NULL, 'google/adk-python', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_google_adk', 20000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_goose', 'goose', 'agent', 'Goose', 'Open-source AI agent from Block (now Linux Foundation) that automates engineering tasks via CLI and desktop app, with native MCP integration and any-LLM support.', 'Goose is an open-source AI agent originally built by Block (Square) and now governed by the Linux Foundation''s Agentic AI Foundation. It runs as a CLI, desktop app, and API on macOS, Linux, and Windows, supporting 15+ LLM providers and 70+ MCP extensions. Goose goes beyond code suggestions to install dependencies, run commands, execute tests, and edit files autonomously.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://block.github.io/goose', 'https://github.com/block/goose', 'https://block.github.io/goose/docs', 'https://github.com/block.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_goose', 'res_goose', 'github', NULL, 'block/goose', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_goose', 45200, 4600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gpt_shell', 'gpt-shell', 'agent', 'GPT-Shell', 'Open-source Discord AI companion with ChatGPT-style conversations and image generation, evolved into Erin.', 'GPT-Shell is an open-source AI bot project focused on open-source discord ai companion with chatgpt-style conversations and image generation, evolved into erin.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/firtoz/GPT-Shell', 'https://github.com/firtoz/GPT-Shell', NULL, 'https://opengraph.githubassets.com/openagentbot/firtoz/GPT-Shell', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gpt-shell', 'res_gpt_shell', 'github', NULL, 'firtoz/GPT-Shell', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_gpt_shell', 152, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gpt4all', 'gpt4all', 'model', 'gpt4all', 'Run large language models locally on consumer hardware with a desktop application and Python library.', 'GPT4All by Nomic AI is an open-source ecosystem for running large language models on local consumer hardware. It provides a cross-platform desktop application, a Python library, and a growing model zoo — all optimized for CPU and GPU inference without requiring a cloud connection.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://nomic.ai/gpt4all', 'https://github.com/nomic-ai/gpt4all', NULL, 'https://opengraph.githubassets.com/openagentbot/nomic-ai/gpt4all', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gpt4all', 'res_gpt4all', 'github', NULL, 'nomic-ai/gpt4all', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_gpt4all', 77357, 8325, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_graphiti', 'graphiti', 'tool', 'Graphiti', 'Temporal knowledge graph memory system for agents that need facts, entities, and time-aware context.', 'Graphiti is an open-source temporal knowledge graph system from Zep for building agent memory that tracks entities, relationships, and changing facts over time.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/getzep/graphiti', 'https://github.com/getzep/graphiti', 'https://help.getzep.com/graphiti', 'https://github.com/getzep.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_graphiti', 'res_graphiti', 'github', NULL, 'getzep/graphiti', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gstack', 'gstack', 'tool', 'GStack', 'Open agent skill stack for planning, browsing, QA, shipping, and product workflows.', 'GStack is a collection of agent skills and workflows that package repeatable planning, browsing, QA, design, review, and shipping behavior into reusable instructions.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://gstacks.org/', 'https://github.com/garrytan/gstack', NULL, 'https://github.com/garrytan.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gstack', 'res_gstack', 'github', NULL, 'garrytan/gstack', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_gudastudio_skills', 'gudastudio-skills', 'tool', 'GudaStudio Skills', 'Reusable Agent Skills collection from GudaStudio for agent workflows and task automation.', 'GudaStudio Skills is an open-source agent skill resource focused on reusable agent skills collection from gudastudio for agent workflows and task automation.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/GuDaStudio/skills', 'https://github.com/GuDaStudio/skills', NULL, 'https://opengraph.githubassets.com/openagentbot/GuDaStudio/skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_gudastudio-skills', 'res_gudastudio_skills', 'github', NULL, 'GuDaStudio/skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_gudastudio_skills', 2012, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_haystack', 'haystack', 'tool', 'haystack', 'Open-source AI orchestration framework for building production-ready LLM applications with modular pipelines and RAG.', 'Haystack by deepset is an open-source framework for building production-ready LLM applications. It provides modular pipeline architecture for retrieval-augmented generation, semantic search, question answering, and agent workflows — with built-in support for dozens of model providers, vector databases, and document stores.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://haystack.deepset.ai', 'https://github.com/deepset-ai/haystack', NULL, 'https://opengraph.githubassets.com/openagentbot/deepset-ai/haystack', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_haystack', 'res_haystack', 'github', NULL, 'deepset-ai/haystack', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_haystack', 25447, 2827, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_hermes_agent', 'hermes-agent', 'agent', 'Hermes Agent', 'MIT-licensed self-improving agent from Nous Research with persistent memory, skills, and always-on workflow channels.', 'Hermes Agent is an open-source AI agent from Nous Research built around persistent memory, a learning loop, reusable skills, and gateways for terminal, messaging, cron, and self-hosted workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://hermes-agent.ai/', 'https://github.com/NousResearch/hermes-agent', 'https://hermes-agent.ai/how-to/install-hermes-agent', 'https://github.com/NousResearch.png', '2026-04-19T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_hermes-agent', 'res_hermes_agent', 'github', NULL, 'NousResearch/hermes-agent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_html_anything', 'html-anything', 'tool', 'HTML Anything', 'Agentic HTML editor and skill system spanning many surfaces for UI generation and content transformation.', 'HTML Anything is an open-source agent skill resource focused on agentic html editor and skill system spanning many surfaces for ui generation and content transformation.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/nexu-io/html-anything', 'https://github.com/nexu-io/html-anything', NULL, 'https://opengraph.githubassets.com/openagentbot/nexu-io/html-anything', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_html-anything', 'res_html_anything', 'github', NULL, 'nexu-io/html-anything', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_html_anything', 6057, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_html_video', 'html-video', 'tool', 'HTML Video', 'Agent skill pack for generating HTML videos with liquid backgrounds, VFX overlays, and cinematic hero animations using local AI coding agents.', 'HTML Video is an open-source skill pack by nexu-io that enables AI coding agents to generate HTML5 videos with liquid/fluid backgrounds, VFX overlays, poster frames, and cinematic hero animations. It includes templates like frame-liquid-bg-hero and works with any local AI agent supporting HTML output.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/nexu-io/html-video', 'https://github.com/nexu-io/html-video', NULL, 'https://github.com/nexu-io.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_html-video', 'res_html_video', 'github', NULL, 'nexu-io/html-video', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_html_video', 162, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_hugging_face_skills', 'hugging-face-skills', 'tool', 'Hugging Face Skills', 'Open-source skill collection that gives agents reusable access to Hugging Face ecosystem capabilities.', 'Hugging Face Skills is an Apache-licensed repository for packaging reusable agent capabilities around Hugging Face tools, models, and workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/huggingface/skills', 'https://github.com/huggingface/skills', NULL, 'https://github.com/huggingface.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_hugging-face-skills', 'res_hugging_face_skills', 'github', NULL, 'huggingface/skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_hugging-face-skills', 'res_hugging_face_skills', 'huggingface', NULL, 'https://huggingface.co', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_hugging_face_skills', 10216, 637, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_isaac_gr00t', 'isaac-gr00t', 'agent', 'NVIDIA Isaac GR00T', 'Open foundation model for generalist humanoid robots — VLA with real-time whole-body control.', 'NVIDIA Isaac GR00T is an open vision-language-action (VLA) foundation model family for generalized humanoid and manipulation robot skills. It takes multimodal input — language and images — and outputs joint-level action sequences for diverse robot embodiments. GR00T N1.7 supports zero-shot inference, fine-tuning on custom robot data, and real-time deployment with TensorRT acceleration. Built on the LeRobot dataset format and fully commercially licensable under Apache 2.0.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://developer.nvidia.com/isaac/gr00t', 'https://github.com/NVIDIA/Isaac-GR00T', NULL, NULL, '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_isaac-gr00t', 'res_isaac_gr00t', 'github', NULL, 'NVIDIA/Isaac-GR00T', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_isaac_gr00t', 7236, 1232, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_kilo_code', 'kilo-code', 'agent', 'Kilo Code', 'Open-source AI coding agent for VS Code, JetBrains, and CLI with 500+ models, specialized modes, and cloud agent deployment.', 'Kilo Code is an open-source AI coding agent that works across VS Code, JetBrains, CLI, and Slack with 500+ models via the Kilo Gateway. It features specialized agent modes (Code, Architect, Debug, Ask), cloud-based agent deployment (KiloClaw), AI-powered code review, and a marketplace of MCP servers and modes.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://kilo.ai', 'https://github.com/Kilo-Org/kilocode', 'https://kilo.ai/docs', 'https://github.com/Kilo-Org.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_kilo-code', 'res_kilo_code', 'github', NULL, 'Kilo-Org/kilocode', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_kilo_code', 19800, 2600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_kimi_k2_5', 'kimi-k2-5', 'model', 'Kimi K2.5', 'Moonshot AI''s open-weight multimodal model for agentic and tool-using workflows.', 'Kimi K2.5 is Moonshot AI''s powerful open-weight model line, positioned for multimodal and agentic workflows with API access and public model materials.', NULL, NULL, 'active', 'public', 'unknown', 'Modified MIT', 'https://platform.moonshot.ai/', 'https://github.com/MoonshotAI/Kimi-K2.5', NULL, 'https://github.com/MoonshotAI.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_kimi-k2-5', 'res_kimi_k2_5', 'github', NULL, 'MoonshotAI/Kimi-K2.5', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_kirara_ai', 'kirara-ai', 'agent', 'Kirara AI', 'DIY multimodal AI chatbot connecting WeChat, QQ, Telegram, and other chat platforms with DeepSeek, Claude, Ollama, Gemini, and OpenAI.', 'Kirara AI is an open-source AI bot project focused on diy multimodal ai chatbot connecting wechat, qq, telegram, and other chat platforms with deepseek, claude, ollama, gemini, and openai.', NULL, NULL, 'active', 'public', 'open-source', 'AGPL-3.0', 'https://github.com/lss233/kirara-ai', 'https://github.com/lss233/kirara-ai', NULL, 'https://opengraph.githubassets.com/openagentbot/lss233/kirara-ai', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_kirara-ai', 'res_kirara_ai', 'github', NULL, 'lss233/kirara-ai', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_kirara_ai', 18784, 1834, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_langbot', 'langbot', 'agent', 'LangBot', 'Production-grade platform for building agentic IM bots across Discord, Slack, Telegram, LINE, WeChat, Feishu, DingTalk, and more.', 'LangBot is an open-source AI bot project focused on production-grade platform for building agentic im bots across discord, slack, telegram, line, wechat, feishu, dingtalk, and more.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/langbot-app/LangBot', 'https://github.com/langbot-app/LangBot', NULL, 'https://opengraph.githubassets.com/openagentbot/langbot-app/LangBot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_langbot', 'res_langbot', 'github', NULL, 'langbot-app/LangBot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_langbot', 16210, 1432, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_langchain', 'langchain', 'agent', 'LangChain', 'Framework for building LLM-powered applications with chains, agents, tools, and 100+ integrations.', NULL, NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/langchain-ai/langchain', 'https://github.com/langchain-ai/langchain', 'https://python.langchain.com', NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_langchain', 'res_langchain', 'github', NULL, 'langchain-ai/langchain', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_langchain', 122000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_langfuse', 'langfuse', 'tool', 'Langfuse', 'LLM engineering platform for observability, evals, prompt management, datasets, and traces.', 'Langfuse is a source-available LLM engineering platform that helps teams observe, evaluate, and improve LLM and agent applications with traces, metrics, prompts, datasets, and integrations.', NULL, NULL, 'active', 'public', 'unknown', 'See repository', 'https://langfuse.com/docs', 'https://github.com/langfuse/langfuse', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_langfuse', 'res_langfuse', 'github', NULL, 'langfuse/langfuse', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_langfuse', 28327, 2919, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_langgraph', 'langgraph', 'agent', 'LangGraph', 'Framework for building long-running, stateful agents with controllable workflows.', 'LangGraph is an open-source framework for building stateful, durable agent workflows where developers need explicit control over graphs, state, checkpoints, and human-in-the-loop behavior.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://www.langchain.com/langgraph', 'https://github.com/langchain-ai/langgraph', 'https://langchain-ai.github.io/langgraph/', 'https://github.com/langchain-ai.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_langgraph', 'res_langgraph', 'github', NULL, 'langchain-ai/langgraph', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_last30days_skill', 'last30days-skill', 'tool', 'last30days', 'Open-source agent skill for researching what people said about any topic across Reddit, X, YouTube, HN, Polymarket, GitHub, and the web in the last 30 days.', 'last30days is an open-source AI agent skill that searches recent public signals across social, developer, prediction-market, and web sources, then synthesizes a grounded brief. It is designed for recency-sensitive research where upvotes, likes, comments, transcripts, odds, commits, and discussions matter more than static search results.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/mvanhorn/last30days-skill', 'https://github.com/mvanhorn/last30days-skill', NULL, 'https://github.com/mvanhorn.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_last30days-skill', 'res_last30days_skill', 'github', NULL, 'mvanhorn/last30days-skill', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_last30days_skill', 37233, 3025, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_lelab', 'lelab', 'agent', 'LeLab', 'A web UI for training and running real-world robotics policies from Hugging Face LeRobot.', 'LeLab is the official graphical interface for LeRobot, Hugging Face''s open-source robotics library. It turns the full robot learning workflow — calibrate, teleoperate, record, train, replay — into a single browser UI. Plug in a robotic arm, open the app, and go from unboxing to training your first policy in minutes.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/huggingface/leLab', 'https://github.com/huggingface/leLab', NULL, 'https://github.com/huggingface.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_lelab', 'res_lelab', 'github', NULL, 'huggingface/leLab', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_lelab', 'res_lelab', 'huggingface', NULL, 'spaces/lerobot/LeLab', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_lelab', 36, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_letta', 'letta', 'tool', 'Letta', 'Platform for stateful agents with advanced memory, personalization, and learning over time.', 'Letta is an open-source platform for building stateful agents that remember users, maintain memory blocks, and interact through APIs and SDKs.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://www.letta.com/', 'https://github.com/letta-ai/letta', 'https://docs.letta.com/', 'https://github.com/letta-ai.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_letta', 'res_letta', 'github', NULL, 'letta-ai/letta', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_letta_skills', 'letta-skills', 'tool', 'Letta Skills', 'Shared skills repository for Letta Code, Claude Code, Codex CLI, and other coding agents.', 'Letta Skills is an open-source agent skill resource focused on shared skills repository for letta code, claude code, codex cli, and other coding agents.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/letta-ai/skills', 'https://github.com/letta-ai/skills', NULL, 'https://opengraph.githubassets.com/openagentbot/letta-ai/skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_letta-skills', 'res_letta_skills', 'github', NULL, 'letta-ai/skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_letta_skills', 111, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_litellm', 'litellm', 'tool', 'LiteLLM', 'AI gateway and Python SDK for calling many LLM providers through OpenAI-compatible or native formats.', 'LiteLLM is a Python SDK and proxy server used by AI builders to route requests across many model providers, track cost, add logging, and manage gateway behavior.', NULL, NULL, 'active', 'public', 'unknown', 'See repository', 'https://docs.litellm.ai/docs/', 'https://github.com/BerriAI/litellm', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_litellm', 'res_litellm', 'github', NULL, 'BerriAI/litellm', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_litellm', 48958, 8536, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_litert_lm', 'litert-lm', 'model', 'LiteRT-LM', 'Google''s open-source inference framework for deploying large language models on edge devices.', 'LiteRT-LM is Google''s open-source, production-oriented inference framework for running LLMs on edge devices. It is relevant for teams evaluating local, mobile, and on-device agent stacks where latency, privacy, and hardware constraints matter.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://ai.google.dev/edge/litert-lm', 'https://github.com/google-ai-edge/LiteRT-LM', NULL, 'https://github.com/google-ai-edge.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_litert-lm', 'res_litert_lm', 'github', NULL, 'google-ai-edge/LiteRT-LM', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_litert_lm', 5524, 571, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_llama_4', 'llama-4', 'model', 'Llama 4', 'Meta''s flagship open MoE model family with Scout (109B, 10M context) and Maverick (400B, rivaling GPT-5 on coding).', 'Meta''s flagship open MoE model family with Scout (109B, 10M context) and Maverick (400B, rivaling GPT-5 on coding).', NULL, NULL, 'active', 'public', 'open-weights', 'Llama 4 Community License', 'https://github.com/meta-llama/llama-models', 'https://github.com/meta-llama/llama-models', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_llama-4', 'res_llama_4', 'github', NULL, 'meta-llama/llama-models', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_llama_4', 7500, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_llamaindex', 'llamaindex', 'agent', 'LlamaIndex', 'Data framework for connecting LLMs to external data with RAG, agents, and structured retrieval.', NULL, NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/run-llama/llama_index', 'https://github.com/run-llama/llama_index', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_llamaindex', 'res_llamaindex', 'github', NULL, 'run-llama/llama_index', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_llamaindex', 46000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_llmcord', 'llmcord', 'agent', 'llmcord', 'Discord frontend for LLMs that supports OpenAI-compatible APIs including Ollama, Gemini, xAI, and OpenRouter.', 'llmcord is an open-source AI bot project focused on discord frontend for llms that supports openai-compatible apis including ollama, gemini, xai, and openrouter.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/jakobdylanc/llmcord', 'https://github.com/jakobdylanc/llmcord', NULL, 'https://opengraph.githubassets.com/openagentbot/jakobdylanc/llmcord', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_llmcord', 'res_llmcord', 'github', NULL, 'jakobdylanc/llmcord', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_llmcord', 807, 193, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_lottie', 'lottie', 'tool', 'Text-To-Lottie', 'Open-source agent skill and preview harness for generating production-ready Lottie animations with Codex or Claude Code.', 'Text-To-Lottie is an open-source skill and harness from Diffusion Studio for generating Lottie animations with AI coding agents. The project includes a Skia CanvasKit / Skottie player, React + TypeScript controls, and a workflow where the agent writes `public/lottie.json` while the dev server hot-reloads the animation.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://x.com/konstipaulus/status/2064011863889788972?s=46', 'https://github.com/diffusionstudio/lottie', NULL, 'https://github.com/diffusionstudio.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_lottie', 'res_lottie', 'github', NULL, 'diffusionstudio/lottie', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_lottie', 844, 53, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_magicskills', 'magicskills', 'tool', 'MagicSkills', 'Composable SKILL.md folders for reusable agent capabilities.', 'MagicSkills is an open-source agent skill resource focused on composable skill.md folders for reusable agent capabilities.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/Narwhal-Lab/MagicSkills', 'https://github.com/Narwhal-Lab/MagicSkills', NULL, 'https://opengraph.githubassets.com/openagentbot/Narwhal-Lab/MagicSkills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_magicskills', 'res_magicskills', 'github', NULL, 'Narwhal-Lab/MagicSkills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_magicskills', 298, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_marketing_skills', 'marketing-skills', 'tool', 'Marketing Skills', 'Reusable marketing skill pack for Claude Code and other coding agents handling growth, positioning, and content workflows.', 'Marketing Skills is an open-source agent skill resource focused on reusable marketing skill pack for claude code and other coding agents handling growth, positioning, and content workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/coreyhaines31/marketingskills', 'https://github.com/coreyhaines31/marketingskills', NULL, 'https://opengraph.githubassets.com/openagentbot/coreyhaines31/marketingskills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_marketing-skills', 'res_marketing_skills', 'github', NULL, 'coreyhaines31/marketingskills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_marketing_skills', 31942, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_matrix_comms', 'matrix-comms', 'agent', 'Matrix Comms', 'Run an AI agent such as Claude or another LLM as a Matrix bot with streaming, sessions, room history, and error recovery.', 'Matrix Comms is an open-source AI bot project focused on run an ai agent such as claude or another llm as a matrix bot with streaming, sessions, room history, and error recovery.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/nicdavidson/matrix-comms', 'https://github.com/nicdavidson/matrix-comms', NULL, 'https://opengraph.githubassets.com/openagentbot/nicdavidson/matrix-comms', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_matrix-comms', 'res_matrix_comms', 'github', NULL, 'nicdavidson/matrix-comms', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_matrix_comms', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mcp_inspector', 'mcp-inspector', 'tool', 'MCP Inspector', 'Visual testing tool for Model Context Protocol servers.', 'MCP Inspector is a developer tool from the Model Context Protocol project for testing MCP servers visually while building or debugging agent integrations.', NULL, NULL, 'active', 'public', 'unknown', 'See repository', 'https://modelcontextprotocol.io', 'https://github.com/modelcontextprotocol/inspector', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mcp-inspector', 'res_mcp_inspector', 'github', NULL, 'modelcontextprotocol/inspector', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mcp_inspector', 9954, 1345, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mda_markdown_agent', 'mda-markdown-agent', 'tool', 'MDA', 'Markdown superset that compiles agent-facing documents such as SKILL.md, AGENTS.md, MCP-SERVER.md, and CLAUDE.md.', 'MDA is an open-source agent skill resource focused on markdown superset that compiles agent-facing documents such as skill.md, agents.md, mcp-server.md, and claude.md.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/sno-ai/mda', 'https://github.com/sno-ai/mda', NULL, 'https://opengraph.githubassets.com/openagentbot/sno-ai/mda', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mda-markdown-agent', 'res_mda_markdown_agent', 'github', NULL, 'sno-ai/mda', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mda_markdown_agent', 565, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mem0', 'mem0', 'tool', 'Mem0', 'Open-source memory layer for AI agents and assistants that need personalized recall.', 'Mem0 is an open-source memory layer for AI applications, designed to store, retrieve, and update user or agent memories across conversations and workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/mem0ai/mem0', 'https://github.com/mem0ai/mem0', 'https://docs.mem0.ai/open-source', 'https://github.com/mem0ai.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mem0', 'res_mem0', 'github', NULL, 'mem0ai/mem0', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_memori', 'memori', 'tool', 'Memori', 'Open-source memory engine for LLM apps and agents that need persistent context injection.', 'Memori is an open-source memory engine from GibsonAI for giving LLM applications and agents persistent memory, context injection, and configurable recall behavior.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://gibsonai.github.io/memori/', 'https://github.com/GibsonAI/memori', 'https://gibsonai.github.io/memori/core-concepts/overview/', 'https://github.com/GibsonAI.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_memori', 'res_memori', 'github', NULL, 'GibsonAI/memori', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_metagpt', 'metagpt', 'agent', 'MetaGPT', 'Multi-agent framework that simulates a software company with PM, architect, engineer, and QA roles.', NULL, NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/geekan/MetaGPT', 'https://github.com/geekan/MetaGPT', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_metagpt', 'res_metagpt', 'github', NULL, 'geekan/MetaGPT', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_metagpt', 50000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mistral_large_3', 'mistral-large-3', 'model', 'Mistral Large 3', 'Europe''s most powerful open model, 675B MoE (41B active), agentic-tuned, strong multilingual performance.', 'Europe''s most powerful open model, 675B MoE (41B active), agentic-tuned, strong multilingual performance.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://github.com/mistralai/mistral-large', 'https://github.com/mistralai/mistral-large', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mistral-large-3', 'res_mistral_large_3', 'github', NULL, 'mistralai/mistral-large', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mistral_large_3', 10000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mistral_small_3_2', 'mistral-small-3-2', 'model', 'Mistral Small 3.2', 'Apache-licensed small open model for practical instruction following, local inference, and agent experiments.', 'Mistral Small 3.2 is a compact open model release from Mistral AI, useful for teams that want a practical model candidate for local inference, instruction-following tests, and cost-sensitive AI workflows.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://mistral.ai/', 'https://github.com/mistralai/mistral-inference', 'https://docs.mistral.ai/', 'https://github.com/mistralai.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mistral-small-3-2', 'res_mistral_small_3_2', 'github', NULL, 'mistralai/mistral-inference', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_mistral-small-3-2', 'res_mistral_small_3_2', 'huggingface', NULL, 'mistralai/Mistral-Small-3.2-24B-Instruct-2506', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mlflow', 'mlflow', 'tool', 'MLflow', 'Open-source AI engineering platform for experiments, evaluations, observability, and model management.', 'MLflow is an open-source AI engineering platform for tracking experiments, evaluating agents and LLM apps, managing models, and monitoring production systems. It is increasingly relevant to teams moving agents from prototypes into production.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://mlflow.org', 'https://github.com/mlflow/mlflow', 'https://mlflow.org/docs/latest/index.html', 'https://github.com/mlflow.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mlflow', 'res_mlflow', 'github', NULL, 'mlflow/mlflow', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mlflow', 26374, 5821, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mnemo_cortex', 'mnemo-cortex', 'tool', 'Mnemo Cortex', 'Open-source memory coprocessor for AI agents with persistent recall, semantic search, and crash-safe capture.', 'Mnemo Cortex is an open-source memory coprocessor for AI agents. It focuses on persistent recall, semantic search, crash-safe capture, and sidecar-style memory without requiring hooks.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/GuyMannDude/mnemo-cortex', 'https://github.com/GuyMannDude/mnemo-cortex', NULL, 'https://github.com/GuyMannDude.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mnemo-cortex', 'res_mnemo_cortex', 'github', NULL, 'GuyMannDude/mnemo-cortex', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mnemo_cortex', 135, 32, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_model_context_protocol_python_sdk', 'model-context-protocol-python-sdk', 'tool', 'Model Context Protocol Python SDK', 'Official Python SDK for building MCP servers and clients.', 'The Model Context Protocol Python SDK is an official MIT-licensed SDK for building MCP servers and clients in Python.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://modelcontextprotocol.github.io/python-sdk/', 'https://github.com/modelcontextprotocol/python-sdk', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_model-context-protocol-python-sdk', 'res_model_context_protocol_python_sdk', 'github', NULL, 'modelcontextprotocol/python-sdk', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_model_context_protocol_python_sdk', 23199, 3496, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_model_context_protocol_typescript_sdk', 'model-context-protocol-typescript-sdk', 'tool', 'Model Context Protocol TypeScript SDK', 'Official TypeScript SDK for MCP servers and clients.', 'The Model Context Protocol TypeScript SDK is the official SDK for building MCP servers and clients in TypeScript.', NULL, NULL, 'active', 'public', 'unknown', 'See repository', 'https://modelcontextprotocol.io', 'https://github.com/modelcontextprotocol/typescript-sdk', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_model-context-protocol-typescript-sdk', 'res_model_context_protocol_typescript_sdk', 'github', NULL, 'modelcontextprotocol/typescript-sdk', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_model_context_protocol_typescript_sdk', 12581, 1890, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_mongodb_mcp_server', 'mongodb-mcp-server', 'tool', 'MongoDB MCP Server', 'Model Context Protocol server for connecting AI assistants to MongoDB databases and Atlas clusters.', 'MongoDB MCP Server is an open-source Model Context Protocol server that connects AI assistants and agent tools to MongoDB databases and MongoDB Atlas clusters. It gives agents a structured way to inspect and work with MongoDB data through MCP.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/mongodb-js/mongodb-mcp-server', 'https://github.com/mongodb-js/mongodb-mcp-server', NULL, 'https://github.com/mongodb-js.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_mongodb-mcp-server', 'res_mongodb_mcp_server', 'github', NULL, 'mongodb-js/mongodb-mcp-server', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_mongodb_mcp_server', 1045, 259, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_musebot', 'musebot', 'agent', 'MuseBot', 'Multi-platform LLM bot supporting Telegram, Discord, Slack, Lark, DingTalk, WeChat, QQ, image generation, and video creation.', 'MuseBot is an open-source AI bot project focused on multi-platform llm bot supporting telegram, discord, slack, lark, dingtalk, wechat, qq, image generation, and video creation.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/yincongcyincong/MuseBot', 'https://github.com/yincongcyincong/MuseBot', NULL, 'https://opengraph.githubassets.com/openagentbot/yincongcyincong/MuseBot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_musebot', 'res_musebot', 'github', NULL, 'yincongcyincong/MuseBot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_musebot', 1592, 233, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_nanobot', 'nanobot', 'tool', 'nanobot', 'Lightweight open-source AI agent that connects to your tools, chats, and workflows for automation.', 'nanobot is a lightweight open-source AI agent from the University of Hong Kong (HKU) designed for tool orchestration and workflow automation. It provides a minimal surface area for connecting AI to everyday tools, chats, and processes — with support for extensible tool integrations.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://nanobot.wiki', 'https://github.com/HKUDS/nanobot', NULL, 'https://opengraph.githubassets.com/openagentbot/HKUDS/nanobot', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_nanobot', 'res_nanobot', 'github', NULL, 'HKUDS/nanobot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_nanobot', 43570, 7711, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_notebooklm_py', 'notebooklm-py', 'tool', 'notebooklm-py', 'Unofficial Python API and agentic skill for Google NotebookLM, with CLI and agent workflow support.', 'notebooklm-py is an open-source unofficial Python API and agentic skill for Google NotebookLM. It provides programmatic access, CLI workflows, and integration positioning for agents such as Claude Code, Codex, and OpenClaw.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/teng-lin/notebooklm-py', 'https://github.com/teng-lin/notebooklm-py', NULL, 'https://github.com/teng-lin.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_notebooklm-py', 'res_notebooklm_py', 'github', NULL, 'teng-lin/notebooklm-py', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_notebooklm_py', 16224, 2211, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_odysseus', 'odysseus', 'agent', 'Odysseus', 'Self-hosted AI workspace for chat, autonomous agents, deep research, email, documents, and more — local-first, privacy-first, no telemetry.', 'Odysseus is a self-hosted AI workspace that unifies chat, autonomous agents, deep research, email triage, document editing, calendar, notes, memory, and model serving into a single local-first interface. It runs on your own hardware against your own endpoints — no telemetry, no cloud dependency, and full data privacy.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://pewdiepie-archdaemon.github.io/odysseus/', 'https://github.com/pewdiepie-archdaemon/odysseus', NULL, 'https://github.com/pewdiepie-archdaemon.png', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_odysseus', 'res_odysseus', 'github', NULL, 'pewdiepie-archdaemon/odysseus', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_odysseus', 36300, 4300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ok_skills', 'ok-skills', 'tool', 'OK Skills', 'Curated AI coding-agent skills and AGENTS.md playbooks for repeatable development workflows.', 'OK Skills is an open-source agent skill resource focused on curated ai coding-agent skills and agents.md playbooks for repeatable development workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/mxyhi/ok-skills', 'https://github.com/mxyhi/ok-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/mxyhi/ok-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ok-skills', 'res_ok_skills', 'github', NULL, 'mxyhi/ok-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ok_skills', 405, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_olmo_2', 'olmo-2', 'model', 'OLMo 2', 'Fully open language model family from AI2 for transparent research, training, and evaluation.', 'OLMo 2 is part of AI2''s open language model program, giving researchers and builders access to model artifacts, training code, and evaluation context that are unusually transparent for modern LLM work.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://allenai.org/olmo', 'https://github.com/allenai/OLMo', NULL, 'https://github.com/allenai.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_olmo-2', 'res_olmo_2', 'github', NULL, 'allenai/OLMo', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_olmo-2', 'res_olmo_2', 'huggingface', NULL, 'allenai', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_olmo_2', 6482, 751, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_open_design', 'open-design', 'agent', 'Open Design', 'Local-first open-source design agent for prototypes, decks, dashboards, images, video, and agent-driven design systems.', 'Open Design is a local-first, open-source design agent and desktop studio from nexu-io. It turns coding agents and model routers into a design workflow for web, desktop, mobile prototypes, live dashboards, slide decks, images, videos, and reusable design systems.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://open-design.ai', 'https://github.com/nexu-io/open-design', NULL, 'https://github.com/nexu-io.png', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_open-design', 'res_open_design', 'github', NULL, 'nexu-io/open-design', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_open_design', 57656, 6512, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_open_swe', 'open-swe', 'agent', 'Open SWE', 'LangChain''s open-source asynchronous coding agent for internal software engineering workflows.', 'Open SWE is an open-source asynchronous coding agent from LangChain. It is designed for internal coding-agent workflows where tasks can run in the background, produce code changes, and fit into software engineering review loops.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://www.langchain.com/blog/open-swe-an-open-source-framework-for-internal-coding-agents', 'https://github.com/langchain-ai/open-swe', NULL, 'https://github.com/langchain-ai.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_open-swe', 'res_open_swe', 'github', NULL, 'langchain-ai/open-swe', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_open_swe', 9944, 1131, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openai_agents_python', 'openai-agents-python', 'agent', 'OpenAI Agents SDK', 'Lightweight Python framework for building multi-agent workflows with handoffs, tools, tracing, and guardrails.', 'OpenAI Agents SDK is an MIT-licensed Python framework for building agent workflows that can use tools, hand off between agents, trace execution, and apply guardrails.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://openai.github.io/openai-agents-python/', 'https://github.com/openai/openai-agents-python', NULL, 'https://github.com/openai.png', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openai-agents-python', 'res_openai_agents_python', 'github', NULL, 'openai/openai-agents-python', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openai_agents_python', 26833, 4138, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openaibot', 'openaibot', 'agent', 'Openaibot', 'Out-of-box ChatGPT-style bot framework for Discord, Slack, Kook, and Telegram with ToolCall and plugin support.', 'Openaibot is an open-source AI bot project focused on out-of-box chatgpt-style bot framework for discord, slack, kook, and telegram with toolcall and plugin support.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/LlmKira/Openaibot', 'https://github.com/LlmKira/Openaibot', NULL, 'https://opengraph.githubassets.com/openagentbot/LlmKira/Openaibot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openaibot', 'res_openaibot', 'github', NULL, 'LlmKira/Openaibot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openaibot', 1970, 223, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openclaw', 'openclaw', 'agent', 'OpenClaw', 'Open-source agent platform for browser, tool, and workflow automation that actually takes actions.', 'OpenClaw is an open-source agent platform for running action-oriented AI workflows across browser automation, tools, skills, local execution, and connected services.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://openclawdoc.com/', 'https://github.com/openclaw/openclaw', NULL, 'https://github.com/openclaw.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openclaw', 'res_openclaw', 'github', NULL, 'openclaw/openclaw', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_opencode', 'opencode', 'agent', 'OpenCode', 'Open-source AI coding agent that connects to 75+ AI providers and runs in your terminal, IDE, or desktop with LSP integration and multi-session support.', 'OpenCode is an open-source AI coding agent built in Go that connects to 75+ AI providers including Anthropic, OpenAI, Google, and local models via Ollama. It runs as a terminal TUI, VS Code extension, and desktop app with features like LSP integration, multi-session support, session sharing, and privacy-first design where no code or context data is stored.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://opencode.ai', 'https://github.com/anomalyco/opencode', 'https://opencode.ai/docs', 'https://github.com/anomalyco.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_opencode', 'res_opencode', 'github', NULL, 'anomalyco/opencode', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_opencode', 160000, 9000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openeai', 'openeai', 'agent', 'OpenEAI', 'Complete open-source hardware-software platform for real-world embodied AI from arm to VLA policy.', 'OpenEAI is a fully open-source hardware-software unified platform for real-world embodied manipulation. It consists of two repositories: OpenEAI-Arm, a low-cost 6-DoF desktop robotic arm with complete manufacturing files, and OpenEAI-VLA, an end-to-end vision-language-action policy trained with a two-stage recipe (large-scale pretraining + task-specific fine-tuning). The platform covers the full pipeline — hardware design, low-level control, data collection, dataset processing, VLA training, and real-time deployment.', NULL, NULL, 'active', 'public', 'open-source', 'BSD-3-Clause', 'https://github.com/eai-yeslab/OpenEAI-Arm', 'https://github.com/eai-yeslab/OpenEAI-Arm', NULL, NULL, '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openeai', 'res_openeai', 'github', NULL, 'eai-yeslab/OpenEAI-Arm', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openeai', 622, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openhands', 'openhands', 'agent', 'OpenHands', 'Open-source AI software development agent for coding tasks, repositories, and developer workflows.', 'OpenHands is an open-source AI-driven development project for letting agents work on software tasks, inspect repositories, modify code, and support developer workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://openhands.dev', 'https://github.com/OpenHands/OpenHands', 'https://docs.openhands.dev/', 'https://github.com/OpenHands.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openhands', 'res_openhands', 'github', NULL, 'OpenHands/OpenHands', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openhands', 71464, 8996, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openlit', 'openlit', 'tool', 'OpenLIT', 'OpenTelemetry-native open-source AI engineering platform for LLM observability, evaluations, guardrails, prompts, and GPU monitoring.', 'OpenLIT is an open-source AI engineering platform for observability, evaluations, guardrails, prompt management, vault workflows, playgrounds, and GPU monitoring. It integrates with many LLM providers, vector databases, and agent frameworks.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://docs.openlit.io', 'https://github.com/openlit/openlit', NULL, 'https://github.com/openlit.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openlit', 'res_openlit', 'github', NULL, 'openlit/openlit', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openlit', 2516, 293, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_openlore', 'openlore', 'tool', 'OpenLore', 'Persistent architectural memory for AI coding agents using queryable codebase knowledge graphs and MCP tools.', 'OpenLore is an open-source memory layer for AI coding agents. It turns codebases into queryable knowledge graphs with static analysis, living specs, drift detection, and MCP tools so agents can recover architectural context instead of re-discovering it every session.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/clay-good/OpenLore', 'https://github.com/clay-good/OpenLore', NULL, 'https://github.com/clay-good.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_openlore', 'res_openlore', 'github', NULL, 'clay-good/OpenLore', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_openlore', 163, 22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_opensoul', 'opensoul', 'agent', 'opensoul', 'Self-hosted AI companion agent across 30+ messaging channels for everyday conversation and complex tasks.', 'opensoul is an open-source AI bot project focused on self-hosted ai companion agent across 30+ messaging channels for everyday conversation and complex tasks.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/NJX-njx/opensoul', 'https://github.com/NJX-njx/opensoul', NULL, 'https://opengraph.githubassets.com/openagentbot/NJX-njx/opensoul', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_opensoul', 'res_opensoul', 'github', NULL, 'NJX-njx/opensoul', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_opensoul', 47, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_phi_4', 'phi-4', 'model', 'Phi-4', 'Microsoft''s compact 14B dense reasoning model, MIT-licensed, tops MMLU in its size class with 16K context.', 'Microsoft''s compact 14B dense reasoning model, MIT-licensed, tops MMLU in its size class with 16K context.', NULL, NULL, 'active', 'public', 'open-weights', 'MIT', 'https://huggingface.co/microsoft/phi-4', NULL, NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_phi-4', 'res_phi_4', 'huggingface', NULL, 'microsoft/phi-4', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_phi_4', 12000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_pilotdeck', 'pilotdeck', 'agent', 'PilotDeck', 'Open-source agent operating system with WorkSpace isolation, white-box memory, smart routing, and always-on execution.', 'PilotDeck is an open-source agent OS from Tsinghua THUNLP, ModelBest, OpenBMB, and AI9Stars, built around WorkSpace-level isolation for files, memory, and skills across projects.', NULL, NULL, 'active', 'public', 'open-source', 'AGPL-3.0', 'https://pilotdeck.openbmb.cn', 'https://github.com/OpenBMB/PilotDeck', 'https://pilotdeck.openbmb.cn/pilotdeck.github.io/docs/en/introduction', 'https://github.com/OpenBMB.png', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_pilotdeck', 'res_pilotdeck', 'github', NULL, 'OpenBMB/PilotDeck', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_pilotdeck', 2873, 287, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_playwright_mcp', 'playwright-mcp', 'tool', 'Playwright MCP', 'Model Context Protocol server that exposes Playwright browser automation capabilities to AI agents for web interaction and testing.', 'Playwright MCP is an open-source Model Context Protocol server from Microsoft that provides AI agents with browser automation capabilities through standardized MCP tools. It enables agents to navigate pages, click elements, fill forms, take screenshots, and run Playwright tests.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/microsoft/playwright-mcp', 'https://github.com/microsoft/playwright-mcp', 'https://github.com/microsoft/playwright-mcp?tab=readme-ov-file#readme', 'https://github.com/microsoft.png', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_playwright-mcp', 'res_playwright_mcp', 'github', NULL, 'microsoft/playwright-mcp', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_playwright_mcp', 18000, 600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-24T00:00:00.000Z', '2026-06-24T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_promptfoo', 'promptfoo', 'tool', 'promptfoo', 'Open-source tool for testing prompts, agents, RAG systems, and AI security behavior.', 'promptfoo is an MIT-licensed testing and red-teaming tool for prompts, agents, RAG pipelines, and AI application behavior, with declarative configs and CI/CD-friendly workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://promptfoo.dev', 'https://github.com/promptfoo/promptfoo', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_promptfoo', 'res_promptfoo', 'github', NULL, 'promptfoo/promptfoo', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_promptfoo', 21787, 1923, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_python_whatsapp_bot', 'python-whatsapp-bot', 'agent', 'Python WhatsApp Bot', 'Pure Python reference project for building AI WhatsApp bots.', 'Python WhatsApp Bot is an open-source AI bot project focused on pure python reference project for building ai whatsapp bots.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/daveebbelaar/python-whatsapp-bot', 'https://github.com/daveebbelaar/python-whatsapp-bot', NULL, 'https://opengraph.githubassets.com/openagentbot/daveebbelaar/python-whatsapp-bot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_python-whatsapp-bot', 'res_python_whatsapp_bot', 'github', NULL, 'daveebbelaar/python-whatsapp-bot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_python_whatsapp_bot', 1491, 843, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_qwen3_5', 'qwen3-5', 'model', 'Qwen3.5', 'Alibaba''s flagship open model with 397B-A17B MoE architecture, 8.6× decoding improvement over Qwen3, multimodal, 256K context.', 'Alibaba''s flagship open model with 397B-A17B MoE architecture, 8.6× decoding improvement over Qwen3, multimodal, 256K context.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://github.com/QwenLM/Qwen3', 'https://github.com/QwenLM/Qwen3', NULL, NULL, '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_qwen3-5', 'res_qwen3_5', 'github', NULL, 'QwenLM/Qwen3', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_qwen3_5', 27000, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_qwen3_6', 'qwen3-6', 'model', 'Qwen3.6', 'Qwen''s open model line focused on stronger coding, agentic tasks, and real-world stability.', 'Qwen3.6 is the Qwen team''s current open model series, useful for builders evaluating open models for coding, agentic workflows, and local or self-hosted experimentation.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://qwen.ai/', 'https://github.com/QwenLM/Qwen3.6', 'https://qwen.readthedocs.io/', 'https://github.com/QwenLM.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_qwen3-6', 'res_qwen3_6', 'github', NULL, 'QwenLM/Qwen3.6', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_qwen3_vl', 'qwen3-vl', 'model', 'Qwen3-VL', 'Open vision-language model family for images, screens, documents, and multimodal workflows.', 'Qwen3-VL is Qwen''s open vision-language model line for multimodal tasks such as image understanding, document interpretation, screen context, and visual reasoning.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://qwen.ai/', 'https://github.com/QwenLM/Qwen3-VL', NULL, 'https://github.com/QwenLM.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_qwen3-vl', 'res_qwen3_vl', 'github', NULL, 'QwenLM/Qwen3-VL', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ragas', 'ragas', 'tool', 'Ragas', 'Open-source evaluation framework for LLM applications and RAG workflows.', 'Ragas is an Apache-2.0 evaluation framework for LLM applications, especially retrieval-augmented generation workflows that need structured quality checks.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://docs.ragas.io', 'https://github.com/vibrantlabsai/ragas', NULL, NULL, '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ragas', 'res_ragas', 'github', NULL, 'vibrantlabsai/ragas', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ragas', 14187, 1452, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-02T00:00:00.000Z', '2026-06-02T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ragflow', 'ragflow', 'tool', 'ragflow', 'Open-source Retrieval-Augmented Generation engine that combines deep document understanding with agent capabilities.', 'RAGFlow is an open-source RAG engine that goes beyond simple vector search by combining deep document understanding, layout analysis, and agent-based orchestration. It processes complex documents (PDFs, images, tables) with layout-aware parsing, then uses agent capabilities to route, filter, and augment retrieval results — creating a production-ready context layer for LLM applications.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://ragflow.io', 'https://github.com/infiniflow/ragflow', NULL, 'https://opengraph.githubassets.com/openagentbot/infiniflow/ragflow', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ragflow', 'res_ragflow', 'github', NULL, 'infiniflow/ragflow', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ragflow', 81809, 9414, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_rapid_mlx', 'rapid-mlx', 'model', 'Rapid-MLX', 'Apple Silicon local AI engine with OpenAI-compatible API, tool calling, prompt cache, and MLX acceleration.', 'Rapid-MLX is an open-source local AI engine for Apple Silicon. It is positioned as a fast OpenAI-compatible replacement with MLX acceleration, tool calling support, prompt caching, reasoning separation, cloud routing, and compatibility with coding agents such as Claude Code, Cursor, and Aider.', NULL, NULL, 'active', 'public', 'open-weights', 'Apache-2.0', 'https://github.com/raullenchai/Rapid-MLX', 'https://github.com/raullenchai/Rapid-MLX', NULL, 'https://github.com/raullenchai.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_rapid-mlx', 'res_rapid_mlx', 'github', NULL, 'raullenchai/Rapid-MLX', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_rapid_mlx', 2733, 338, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_react_native_agent_skills', 'react-native-agent-skills', 'tool', 'React Native Agent Skills', 'React Native-focused skills for helping coding agents work on mobile app projects.', 'React Native Agent Skills is a Callstack Incubator repository of agent-optimized skills for coding assistants working in React Native projects.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://skills.sh/callstackincubator', 'https://github.com/callstackincubator/agent-skills', NULL, 'https://github.com/callstackincubator.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_react-native-agent-skills', 'res_react_native_agent_skills', 'github', NULL, 'callstackincubator/agent-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_rlinf', 'rlinf', 'agent', 'RLinf', 'Production-grade reinforcement learning infrastructure for embodied and agentic AI.', 'RLinf is a flexible and scalable open-source RL infrastructure designed for Embodied and Agentic AI. It supports real-world robot RL on Franka, XSquare Turtle2, and DOS-W1 arms, multiple simulation backends (ManiSkill, LIBERO, MetaWorld, IsaacLab, RoboCasa), and state-of-the-art VLA model fine-tuning (Pi0, Pi0.5, GR00T, OpenVLA). It also extends to agentic AI with support for Search-R1, rStar2, and multi-agent RL.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://rlinf.readthedocs.io/en/latest/', 'https://github.com/RLinf/RLinf', NULL, NULL, '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_rlinf', 'res_rlinf', 'github', NULL, 'RLinf/RLinf', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_rlinf', 3161, 411, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_robotics_agent_skills', 'robotics-agent-skills', 'tool', 'Robotics Agent Skills', 'Reusable robotics agent skills for ROS1, ROS2, and embodied AI development workflows.', 'Robotics Agent Skills is an open-source agent skill resource focused on reusable robotics agent skills for ros1, ros2, and embodied ai development workflows.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/arpitg1304/robotics-agent-skills', 'https://github.com/arpitg1304/robotics-agent-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/arpitg1304/robotics-agent-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_robotics-agent-skills', 'res_robotics_agent_skills', 'github', NULL, 'arpitg1304/robotics-agent-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_robotics_agent_skills', 259, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_ruflo', 'ruflo', 'agent', 'ruflo', 'Open-source agent meta-harness for orchestrating multi-agent swarms with Claude, adaptive memory, and RAG integration.', 'ruflo is an open-source meta-harness for orchestrating multi-agent swarms, primarily designed for Claude-based workflows. It features adaptive memory, self-learning swarm intelligence, RAG integration, and native integration with Claude Code and Codex CLI for coordinated autonomous workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://Cognitum.One', 'https://github.com/ruvnet/ruflo', NULL, 'https://opengraph.githubassets.com/openagentbot/ruvnet/ruflo', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_ruflo', 'res_ruflo', 'github', NULL, 'ruvnet/ruflo', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_ruflo', 57619, 6588, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_scientific_agent_skills', 'scientific-agent-skills', 'tool', 'Scientific Agent Skills', 'Open-source ready-to-use agent skills for research, science, engineering, analysis, finance, and writing.', 'Scientific Agent Skills is an MIT-licensed collection of reusable skills for research and technical work, aimed at agents that need more structured procedures than a single prompt can provide.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://k-dense.ai', 'https://github.com/K-Dense-AI/scientific-agent-skills', NULL, 'https://github.com/K-Dense-AI.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_scientific-agent-skills', 'res_scientific_agent_skills', 'github', NULL, 'K-Dense-AI/scientific-agent-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_scientific_agent_skills', 18824, 2112, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_security_skills_claude_code', 'security-skills-claude-code', 'tool', 'Security Skills for Claude Code', 'Security-focused skills, plugins, and automation pipelines for Claude Code review and hardening workflows.', 'Security Skills for Claude Code is an open-source agent skill resource focused on security-focused skills, plugins, and automation pipelines for claude code review and hardening workflows.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/Security-Phoenix-demo/security-skills-claude-code', 'https://github.com/Security-Phoenix-demo/security-skills-claude-code', NULL, 'https://opengraph.githubassets.com/openagentbot/Security-Phoenix-demo/security-skills-claude-code', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_security-skills-claude-code', 'res_security_skills_claude_code', 'github', NULL, 'Security-Phoenix-demo/security-skills-claude-code', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_security_skills_claude_code', 43, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_seo_geo_claude_skills', 'seo-geo-claude-skills', 'tool', 'SEO GEO Claude Skills', 'SEO and generative-engine-optimization skill pack for Claude Code, Cursor, Codex, and related coding agents.', 'SEO GEO Claude Skills is an open-source agent skill resource focused on seo and generative-engine-optimization skill pack for claude code, cursor, codex, and related coding agents.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/aaron-he-zhu/seo-geo-claude-skills', 'https://github.com/aaron-he-zhu/seo-geo-claude-skills', NULL, 'https://opengraph.githubassets.com/openagentbot/aaron-he-zhu/seo-geo-claude-skills', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_seo-geo-claude-skills', 'res_seo_geo_claude_skills', 'github', NULL, 'aaron-he-zhu/seo-geo-claude-skills', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_seo_geo_claude_skills', 1994, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_skill_seekers', 'skill-seekers', 'tool', 'Skill Seekers', 'Tooling that converts docs, GitHub repositories, and PDFs into Claude AI skills.', 'Skill Seekers is an open-source agent skill resource focused on tooling that converts docs, github repositories, and pdfs into claude ai skills.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/yusufkaraaslan/Skill_Seekers', 'https://github.com/yusufkaraaslan/Skill_Seekers', NULL, 'https://opengraph.githubassets.com/openagentbot/yusufkaraaslan/Skill_Seekers', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_skill-seekers', 'res_skill_seekers', 'github', NULL, 'yusufkaraaslan/Skill_Seekers', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_skill_seekers', 13944, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_skillhub', 'skillhub', 'tool', 'SkillHub', 'Self-hosted open-source registry for publishing, versioning, and governing enterprise agent skills.', 'SkillHub is an open-source agent skill registry for enterprises. It focuses on publishing and versioning skill packages, governance with RBAC and audit logs, and self-hosted deployment with Docker or Kubernetes.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://skill.xfyun.cn', 'https://github.com/iflytek/skillhub', NULL, 'https://github.com/iflytek.png', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_skillhub', 'res_skillhub', 'github', NULL, 'iflytek/skillhub', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_skillhub', 3421, 481, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_skillopt', 'skillopt', 'tool', 'SkillOpt', 'Microsoft research project for optimizing reusable natural-language skills for frozen LLM agents.', 'SkillOpt is an open-source agent skill resource focused on microsoft research project for optimizing reusable natural-language skills for frozen llm agents.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/microsoft/SkillOpt', 'https://github.com/microsoft/SkillOpt', NULL, 'https://opengraph.githubassets.com/openagentbot/microsoft/SkillOpt', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_skillopt', 'res_skillopt', 'github', NULL, 'microsoft/SkillOpt', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_skillopt', 4894, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_smolagents', 'smolagents', 'agent', 'smolagents', 'Lightweight Hugging Face library for agents that reason and act through code.', 'smolagents is a lightweight open-source agent library from Hugging Face, focused on simple code-agent patterns and practical integrations without a heavy framework surface.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/huggingface/smolagents', 'https://github.com/huggingface/smolagents', NULL, 'https://github.com/huggingface.png', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z', '2026-04-19T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_smolagents', 'res_smolagents', 'github', NULL, 'huggingface/smolagents', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_hf_smolagents', 'res_smolagents', 'huggingface', NULL, 'docs/smolagents', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_super_homunculus_bot', 'super-homunculus-bot', 'agent', 'Super Homunculus Bot', 'AI-powered multi-platform chat assistant using Claude Agent SDK across Telegram and Discord.', 'Super Homunculus Bot is an open-source AI bot project focused on ai-powered multi-platform chat assistant using claude agent sdk across telegram and discord.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/jskjw157/super_homunculus_bot', 'https://github.com/jskjw157/super_homunculus_bot', NULL, 'https://opengraph.githubassets.com/openagentbot/jskjw157/super_homunculus_bot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_super-homunculus-bot', 'res_super_homunculus_bot', 'github', NULL, 'jskjw157/super_homunculus_bot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_super_homunculus_bot', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_swe_agent', 'swe-agent', 'agent', 'SWE-agent', 'Autonomous coding agent that takes GitHub issues and fixes them using LLMs, achieving state-of-the-art results on SWE-bench.', 'SWE-agent is an open-source autonomous coding agent that takes GitHub issues as input and produces pull request fixes using large language models. It achieves state-of-the-art results on the SWE-bench benchmark and provides a configurable agent-computer interface (ACI) for optimizing how LLMs interact with development environments.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://swe-agent.com', 'https://github.com/SWE-agent/SWE-agent', 'https://swe-agent.com/docs', 'https://github.com/SWE-agent.png', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_swe-agent', 'res_swe_agent', 'github', NULL, 'SWE-agent/SWE-agent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_swe_agent', 19300, 1800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-05-27T00:00:00.000Z', '2026-05-27T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_synapse_oss', 'synapse-oss', 'agent', 'Synapse OSS', 'Self-hosted AI assistant with hybrid memory, evolving personality, and multi-channel support across WhatsApp, Telegram, Discord, and Slack.', 'Synapse OSS is an open-source AI bot project focused on self-hosted ai assistant with hybrid memory, evolving personality, and multi-channel support across whatsapp, telegram, discord, and slack.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/UpayanGhosh/Synapse-OSS', 'https://github.com/UpayanGhosh/Synapse-OSS', NULL, 'https://opengraph.githubassets.com/openagentbot/UpayanGhosh/Synapse-OSS', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_synapse-oss', 'res_synapse_oss', 'github', NULL, 'UpayanGhosh/Synapse-OSS', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_synapse_oss', 13, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_tabby', 'tabby', 'agent', 'Tabby', 'Self-hosted AI coding assistant with code completion, chat, and agent capabilities that runs entirely on your infrastructure.', 'Tabby is an open-source, self-hosted AI coding assistant that provides code completion, chat, and agent capabilities without any external dependencies or data leaving your infrastructure. It supports VS Code, JetBrains, Vim, Emacs, and other editors, and works with self-hosted models for fully air-gapped operation.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://tabby.tabbyml.com', 'https://github.com/TabbyML/tabby', 'https://tabby.tabbyml.com/docs', 'https://github.com/TabbyML.png', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_tabby', 'res_tabby', 'github', NULL, 'TabbyML/tabby', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_tabby', 32200, 1600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-04T00:00:00.000Z', '2026-06-04T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_telechat', 'telechat', 'agent', 'TeleChat', 'AI Telegram bot with web search, image generation, Groq, Gemini, Claude, and OpenAI model support.', 'TeleChat is an open-source AI bot project focused on ai telegram bot with web search, image generation, groq, gemini, claude, and openai model support.', NULL, NULL, 'active', 'public', 'open-source', 'GPL-3.0', 'https://github.com/yym68686/ChatGPT-Telegram-Bot', 'https://github.com/yym68686/ChatGPT-Telegram-Bot', NULL, 'https://opengraph.githubassets.com/openagentbot/yym68686/ChatGPT-Telegram-Bot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_telechat', 'res_telechat', 'github', NULL, 'yym68686/ChatGPT-Telegram-Bot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_telechat', 1251, 404, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_telegram_ai_agent', 'telegram-ai-agent', 'agent', 'Telegram AI Agent', 'Generic Claude and Codex Telegram bot runtime for controlling coding agents from chat.', 'Telegram AI Agent is an open-source AI bot project focused on generic claude and codex telegram bot runtime for controlling coding agents from chat.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/pavel-molyanov/telegram-ai-agent', 'https://github.com/pavel-molyanov/telegram-ai-agent', NULL, 'https://opengraph.githubassets.com/openagentbot/pavel-molyanov/telegram-ai-agent', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_telegram-ai-agent', 'res_telegram_ai_agent', 'github', NULL, 'pavel-molyanov/telegram-ai-agent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_telegram_ai_agent', 55, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_telegram_llm_bot', 'telegram-llm-bot', 'agent', 'Telegram LLM Bot', 'Telegram LLM bot backed by OpenAI, Whisper, Beam, LLaMA, Weaviate, MinIO, and MongoDB.', 'Telegram LLM Bot is an open-source AI bot project focused on telegram llm bot backed by openai, whisper, beam, llama, weaviate, minio, and mongodb.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/ma2za/telegram-llm-bot', 'https://github.com/ma2za/telegram-llm-bot', NULL, 'https://opengraph.githubassets.com/openagentbot/ma2za/telegram-llm-bot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_telegram-llm-bot', 'res_telegram_llm_bot', 'github', NULL, 'ma2za/telegram-llm-bot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_telegram_llm_bot', 111, 13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_tiledesk', 'tiledesk', 'agent', 'Tiledesk', 'Open-source customer support and AI agent builder with human-in-the-loop workflows.', 'Tiledesk is an open-source platform for building customer support chatbots and LLM-powered agents. It combines live chat, AI automation, and human-in-the-loop escalation for support teams.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://www.tiledesk.com', 'https://github.com/Tiledesk/tiledesk-server', NULL, 'https://github.com/Tiledesk.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_tiledesk', 'res_tiledesk', 'github', NULL, 'Tiledesk/tiledesk-server', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_tiledesk', 382, 147, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_wandbot', 'wandbot', 'agent', 'wandbot', 'Technical support bot for Weights & Biases developer tools that can run in Discord, Slack, ChatGPT, and Zendesk.', 'wandbot is an open-source AI bot project focused on technical support bot for weights & biases developer tools that can run in discord, slack, chatgpt, and zendesk.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://github.com/wandb/wandbot', 'https://github.com/wandb/wandbot', NULL, 'https://opengraph.githubassets.com/openagentbot/wandb/wandbot', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_wandbot', 'res_wandbot', 'github', NULL, 'wandb/wandbot', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_wandbot', 310, 56, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_webwright', 'webwright', 'agent', 'Webwright', 'Microsoft''s open-source browser agent framework for long-horizon web tasks.', 'Webwright is an open-source browser agent framework from Microsoft that targets SWE-style, long-horizon web tasks. It is useful for teams comparing browser-use style agents, Playwright-based automation, and agent frameworks that need repeatable web task execution.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/microsoft/Webwright', 'https://github.com/microsoft/Webwright', NULL, 'https://github.com/microsoft.png', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_webwright', 'res_webwright', 'github', NULL, 'microsoft/Webwright', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_webwright', 5239, 314, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-09T00:00:00.000Z', '2026-06-09T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_wegent', 'wegent', 'agent', 'Wegent', 'Open-source AI-native operating system for defining, organizing, and running intelligent agent teams.', 'Wegent is an open-source AI-native operating system for defining, organizing, and running intelligent agent teams. It is relevant to bot and agent-team workflows where multiple assistants, roles, or chat-oriented agents need structure.', NULL, NULL, 'active', 'public', 'open-source', 'Apache-2.0', 'https://wecode-ai.github.io/wegent-docs', 'https://github.com/wecode-ai/Wegent', NULL, 'https://github.com/wecode-ai.png', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_wegent', 'res_wegent', 'github', NULL, 'wecode-ai/Wegent', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_wegent', 580, 102, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-11T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR REPLACE INTO entities (
  id, slug, kind, name, summary, description, organization, country, lifecycle, visibility,
  openness_status, license_spdx, canonical_url, repository_url, documentation_url, logo_url,
  first_seen_at, last_seen_at, last_verified_at, created_at, updated_at
) VALUES ('res_zulipmcp', 'zulipmcp', 'agent', 'Zulip MCP', 'Run AI agents in Zulip as mentionable bots, or wire Zulip into MCP-compatible clients.', 'Zulip MCP is an open-source AI bot project focused on run ai agents in zulip as mentionable bots, or wire zulip into mcp-compatible clients.', NULL, NULL, 'active', 'public', 'open-source', 'MIT', 'https://github.com/windborne/zulipmcp', 'https://github.com/windborne/zulipmcp', NULL, 'https://opengraph.githubassets.com/openagentbot/windborne/zulipmcp', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

INSERT OR REPLACE INTO source_subscriptions (
  id, entity_id, source_id, external_id, locator, enabled, last_synced_at, next_sync_at, created_at, updated_at
) VALUES ('sub_github_zulipmcp', 'res_zulipmcp', 'github', NULL, 'windborne/zulipmcp', 1, NULL, datetime('now'), datetime('now'), datetime('now'));

INSERT OR REPLACE INTO entity_metrics_current (
  entity_id, stars, forks, watchers, downloads_30d, dependents, contributors, open_issues,
  last_release_at, last_commit_at, source_id, observed_at, updated_at
) VALUES ('res_zulipmcp', 9, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'github', '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z');

-- Third evidence-backed openness batch. Twenty-three repositories passed the
-- automated policy. Five more were manually resolved: four source moves or
-- replacements, plus Tabby's explicit open-core split. ROS 2 and AI Agents
-- Skills remain unresolved because no precise root code license was found.
INSERT INTO entity_license_scopes (
  id,entity_id,source_id,scope,path,license_identifier,status,source_url,
  observed_at,updated_at
) VALUES
  ('verify_20260831_b3_aira','res_aira','github','core repository','LICENSE','Apache-2.0','open','https://github.com/robertorobotics/Nextis-AIRA-3D/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_openeai','res_openeai','github','core repository','LICENSE','BSD-3-Clause','open','https://github.com/eai-yeslab/OpenEAI-Arm/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_ccpoke','res_ccpoke','github','core repository','LICENSE','MIT','open','https://github.com/kaida-palooza/ccpoke/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_matrix_comms','res_matrix_comms','github','core repository','LICENSE','MIT','open','https://github.com/nicdavidson/matrix-comms/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_super_homunculus_bot','res_super_homunculus_bot','github','core repository','LICENSE','MIT','open','https://github.com/jskjw157/super_homunculus_bot/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_smolagents','res_smolagents','github','core repository','LICENSE','Apache-2.0','open','https://github.com/huggingface/smolagents/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_agent_skill_creator','res_agent_skill_creator','github','core repository','LICENSE','MIT','open','https://github.com/FrancyJGLisboa/agent-skill-creator/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_gstack','res_gstack','github','core repository','LICENSE','MIT','open','https://github.com/garrytan/gstack/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_ragflow','res_ragflow','github','core repository','LICENSE','Apache-2.0','open','https://github.com/infiniflow/ragflow/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_anthropic_cybersecurity_skills','res_anthropic_cybersecurity_skills','github','core repository','LICENSE','Apache-2.0','open','https://github.com/mukul975/Anthropic-Cybersecurity-Skills/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_seo_geo_claude_skills','res_seo_geo_claude_skills','github','core repository','LICENSE','Apache-2.0','open','https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_opensoul','res_opensoul','github','core repository','LICENSE','MIT','open','https://github.com/NJX-njx/opensoul/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_synapse_oss','res_synapse_oss','github','core repository','LICENSE','MIT','open','https://github.com/UpayanGhosh/Synapse-OSS/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_hermes_agent','res_hermes_agent','github','core repository','LICENSE','MIT','open','https://github.com/NousResearch/hermes-agent/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_langchain','res_langchain','github','core repository','LICENSE','MIT','open','https://github.com/langchain-ai/langchain/blob/master/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_crewai','res_crewai','github','core repository','LICENSE','MIT','open','https://github.com/crewAIInc/crewAI/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_langgraph','res_langgraph','github','core repository','LICENSE','MIT','open','https://github.com/langchain-ai/langgraph/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_cognee','res_cognee','github','core repository','LICENSE','Apache-2.0','open','https://github.com/topoteretes/cognee/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_openai_agents_python','res_openai_agents_python','github','core repository','LICENSE','MIT','open','https://github.com/openai/openai-agents-python/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_lerobot','robotics_lerobot','github','core repository','LICENSE','Apache-2.0','open','https://github.com/huggingface/lerobot/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_letta','res_letta','github','core repository','LICENSE','Apache-2.0','open','https://github.com/letta-ai/letta/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_model_context_protocol_python_sdk','res_model_context_protocol_python_sdk','github','core repository','LICENSE','MIT','open','https://github.com/modelcontextprotocol/python-sdk/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_langbot','res_langbot','github','core repository','LICENSE','Apache-2.0','open','https://github.com/langbot-app/LangBot/blob/master/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_github_mcp_server','res_github_mcp_server','github','core repository','LICENSE','MIT','open','https://github.com/github/github-mcp-server/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_memori','res_memori','github','core repository','LICENSE','Apache-2.0','open','https://github.com/MemoriLabs/Memori/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_odysseus','res_odysseus','github','core repository','LICENSE','AGPL-3.0','open','https://github.com/odysseus-dev/odysseus/blob/dev/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_antigravity','res_antigravity_awesome_skills','github','core repository','LICENSE','MIT','open','https://github.com/sickn33/agentic-awesome-skills/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_tabby_core','res_tabby','github','open-source core','LICENSE','Apache-2.0','open','https://github.com/TabbyML/tabby/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('verify_20260831_b3_tabby_ee','res_tabby','github','enterprise directory','ee/LICENSE','Tabby-Enterprise','restricted','https://github.com/TabbyML/tabby/blob/main/ee/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z')
ON CONFLICT(entity_id,scope,path) DO UPDATE SET
  source_id=excluded.source_id,license_identifier=excluded.license_identifier,
  status=excluded.status,source_url=excluded.source_url,
  observed_at=excluded.observed_at,updated_at=excluded.updated_at;

INSERT INTO openness_facets (
  entity_id,facet,status,license_or_terms,source_id,source_url,
  evidence_confidence,observed_at,updated_at
)
SELECT entity_id,'code','open',license_identifier,source_id,source_url,
       'verified',observed_at,updated_at
FROM entity_license_scopes
WHERE id LIKE 'verify_20260831_b3_%' AND entity_id!='res_tabby'
ON CONFLICT(entity_id,facet) DO UPDATE SET
  status=excluded.status,license_or_terms=excluded.license_or_terms,
  source_id=excluded.source_id,source_url=excluded.source_url,
  evidence_confidence=excluded.evidence_confidence,
  observed_at=excluded.observed_at,updated_at=excluded.updated_at;

INSERT INTO openness_facets (
  entity_id,facet,status,license_or_terms,source_id,source_url,
  evidence_confidence,observed_at,updated_at
) VALUES (
  'res_tabby','code','partial','Apache-2.0 core; Tabby Enterprise License under ee/',
  'github','https://github.com/TabbyML/tabby/blob/main/LICENSE','verified',
  '2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'
)
ON CONFLICT(entity_id,facet) DO UPDATE SET
  status=excluded.status,license_or_terms=excluded.license_or_terms,
  source_id=excluded.source_id,source_url=excluded.source_url,
  evidence_confidence=excluded.evidence_confidence,
  observed_at=excluded.observed_at,updated_at=excluded.updated_at;

-- Correct two GitHub facts that the aggregate License API cannot represent.
INSERT OR IGNORE INTO observations (
  id,entity_id,source_id,sync_run_id,fact_key,value_json,value_hash,source_url,
  confidence,observed_at,created_at
) VALUES
  ('obs_github_mcp_license_20260831','res_github_mcp_server','github',NULL,'license_spdx','"MIT"','529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1','https://github.com/github/github-mcp-server/blob/main/LICENSE',1.0,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('obs_memori_license_20260831','res_memori','github',NULL,'license_spdx','"Apache-2.0"','570920a3762044f20f915aa337f9eace3e8dcc04c7774a774af88f93ad8e3074','https://github.com/MemoriLabs/Memori/blob/main/LICENSE',1.0,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z');

INSERT INTO current_facts (
  entity_id,fact_key,observation_id,source_id,value_json,value_hash,confidence,
  observed_at,updated_at
) VALUES
  ('res_github_mcp_server','license_spdx','obs_github_mcp_license_20260831','github','"MIT"','529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1',1.0,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('res_memori','license_spdx','obs_memori_license_20260831','github','"Apache-2.0"','570920a3762044f20f915aa337f9eace3e8dcc04c7774a774af88f93ad8e3074',1.0,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z')
ON CONFLICT(entity_id,fact_key) DO UPDATE SET
  observation_id=excluded.observation_id,source_id=excluded.source_id,
  value_json=excluded.value_json,value_hash=excluded.value_hash,
  confidence=excluded.confidence,observed_at=excluded.observed_at,
  updated_at=excluded.updated_at;

-- Preserve source identity history for three repository moves and the GitHub
-- MCP Server's move from an ecosystem example to GitHub's official repository.
INSERT OR IGNORE INTO source_binding_events (
  id,entity_id,source_id,source_role,old_locator,new_locator,reason,changed_at
) VALUES
  ('binding_res_github_mcp_server_20260831','res_github_mcp_server','github','primary','modelcontextprotocol/servers','github/github-mcp-server','Replaced the historical MCP example binding with GitHub official standalone server repository.','2026-08-31T01:06:13.374Z'),
  ('binding_res_memori_github_20260831','res_memori','github','primary','GibsonAI/memori','MemoriLabs/Memori','Official GitHub repository redirect and resolved full_name.','2026-08-31T01:06:13.374Z'),
  ('binding_res_odysseus_github_20260831','res_odysseus','github','primary','pewdiepie-archdaemon/odysseus','odysseus-dev/odysseus','Official GitHub repository redirect and resolved full_name.','2026-08-31T01:06:13.374Z'),
  ('binding_res_antigravity_github_20260831','res_antigravity_awesome_skills','github','primary','sickn33/antigravity-awesome-skills','sickn33/agentic-awesome-skills','Official GitHub repository redirect and resolved full_name.','2026-08-31T01:06:13.374Z');

UPDATE source_subscriptions
SET enabled=0,valid_until='2026-08-31T01:06:13.374Z',next_sync_at=NULL,
    updated_at='2026-08-31T01:06:13.374Z'
WHERE id IN (
  'sub_github_github-mcp-server','sub_github_memori','sub_github_odysseus',
  'sub_github_antigravity-awesome-skills'
);

INSERT OR IGNORE INTO source_subscriptions (
  id,entity_id,source_id,external_id,locator,enabled,last_synced_at,next_sync_at,
  created_at,updated_at,error_count,last_error,source_role,valid_from,valid_until
) VALUES
  ('sub_github_github_mcp_official','res_github_mcp_server','github','942771284','github/github-mcp-server',1,NULL,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z',0,NULL,'primary','2026-08-31T01:06:13.374Z',NULL),
  ('sub_github_memori_labs','res_memori','github','1025381911','MemoriLabs/Memori',1,NULL,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z',0,NULL,'primary','2026-08-31T01:06:13.374Z',NULL),
  ('sub_github_odysseus_dev','res_odysseus','github','1255180606','odysseus-dev/odysseus',1,NULL,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z',0,NULL,'primary','2026-08-31T01:06:13.374Z',NULL),
  ('sub_github_antigravity_agentic','res_antigravity_awesome_skills','github','1134426800','sickn33/agentic-awesome-skills',1,NULL,'2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z',0,NULL,'primary','2026-08-31T01:06:13.374Z',NULL);

UPDATE history_subscriptions
SET locator=CASE id
  WHEN 'sub_release_res_github_mcp_server' THEN 'github/github-mcp-server'
  WHEN 'sub_release_res_memori' THEN 'MemoriLabs/Memori'
  WHEN 'sub_release_res_odysseus' THEN 'odysseus-dev/odysseus'
  WHEN 'sub_release_res_antigravity_awesome_skills' THEN 'sickn33/agentic-awesome-skills'
END,next_sync_at='2026-08-31T01:06:13.374Z',updated_at='2026-08-31T01:06:13.374Z'
WHERE id IN (
  'sub_release_res_github_mcp_server','sub_release_res_memori',
  'sub_release_res_odysseus','sub_release_res_antigravity_awesome_skills'
);

INSERT OR IGNORE INTO change_events (
  id,entity_id,source_id,observation_id,fact_key,change_type,
  previous_value_json,next_value_json,source_url,detected_at,created_at
) VALUES
  ('change_github_mcp_repo_20260831','res_github_mcp_server','github',NULL,'repository_url','updated','"https://github.com/modelcontextprotocol/servers/tree/main/src/github"','"https://github.com/github/github-mcp-server"','https://github.com/github/github-mcp-server','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_github_mcp_canonical_20260831','res_github_mcp_server','github',NULL,'canonical_url','updated','"https://github.com/modelcontextprotocol/servers/tree/main/src/github"','"https://github.com/github/github-mcp-server"','https://github.com/github/github-mcp-server','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_github_mcp_docs_20260831','res_github_mcp_server','github',NULL,'documentation_url','updated','"https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#github"','"https://github.com/github/github-mcp-server#readme"','https://github.com/github/github-mcp-server','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_github_mcp_license_20260831','res_github_mcp_server','github','obs_github_mcp_license_20260831','license_spdx','updated','"NOASSERTION"','"MIT"','https://github.com/github/github-mcp-server/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_memori_repo_20260831','res_memori','github',NULL,'repository_url','updated','"https://github.com/GibsonAI/memori"','"https://github.com/MemoriLabs/Memori"','https://github.com/MemoriLabs/Memori','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_memori_canonical_20260831','res_memori','github',NULL,'canonical_url','updated','"https://gibsonai.github.io/memori/"','"https://memorilabs.ai/"','https://github.com/MemoriLabs/Memori','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_memori_docs_20260831','res_memori','github',NULL,'documentation_url','updated','"https://gibsonai.github.io/memori/core-concepts/overview/"','"https://memorilabs.ai/docs/memori-byodb/"','https://github.com/MemoriLabs/Memori/blob/main/README.md','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_memori_license_20260831','res_memori','github','obs_memori_license_20260831','license_spdx','updated','"NOASSERTION"','"Apache-2.0"','https://github.com/MemoriLabs/Memori/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_odysseus_repo_20260831','res_odysseus','github',NULL,'repository_url','updated','"https://github.com/pewdiepie-archdaemon/odysseus"','"https://github.com/odysseus-dev/odysseus"','https://github.com/odysseus-dev/odysseus','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_odysseus_canonical_20260831','res_odysseus','github',NULL,'canonical_url','updated','"https://pewdiepie-archdaemon.github.io/odysseus/"','"https://odysseus-dev.github.io/odysseus/"','https://github.com/odysseus-dev/odysseus','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_odysseus_docs_20260831','res_odysseus','github',NULL,'documentation_url','created',NULL,'"https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md"','https://github.com/odysseus-dev/odysseus/blob/dev/README.md','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_odysseus_license_20260831','res_odysseus','github',NULL,'license_spdx','updated','"MIT"','"AGPL-3.0"','https://github.com/odysseus-dev/odysseus/blob/dev/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_antigravity_repo_20260831','res_antigravity_awesome_skills','github',NULL,'repository_url','updated','"https://github.com/sickn33/antigravity-awesome-skills"','"https://github.com/sickn33/agentic-awesome-skills"','https://github.com/sickn33/agentic-awesome-skills','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_antigravity_canonical_20260831','res_antigravity_awesome_skills','github',NULL,'canonical_url','updated','"https://github.com/sickn33/antigravity-awesome-skills"','"https://sickn33.github.io/agentic-awesome-skills/"','https://github.com/sickn33/agentic-awesome-skills','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_antigravity_docs_20260831','res_antigravity_awesome_skills','github',NULL,'documentation_url','created',NULL,'"https://github.com/sickn33/agentic-awesome-skills/blob/main/docs/users/aas-core.md"','https://github.com/sickn33/agentic-awesome-skills/blob/main/README.md','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_tabby_openness_20260831','res_tabby','github',NULL,'openness_status','updated','"open-source"','"open-core"','https://github.com/TabbyML/tabby/blob/main/LICENSE','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z'),
  ('change_tabby_canonical_20260831','res_tabby','github',NULL,'canonical_url','updated','"https://tabby.tabbyml.com"','"https://www.tabbyml.com/"','https://github.com/TabbyML/tabby','2026-08-31T01:06:13.374Z','2026-08-31T01:06:13.374Z');

UPDATE entities SET
  repository_url='https://github.com/github/github-mcp-server',
  canonical_url='https://github.com/github/github-mcp-server',
  documentation_url='https://github.com/github/github-mcp-server#readme',
  license_spdx='MIT',last_verified_at='2026-08-31T01:06:13.374Z',
  updated_at='2026-08-31T01:06:13.374Z'
WHERE id='res_github_mcp_server';

UPDATE entities SET
  repository_url='https://github.com/MemoriLabs/Memori',
  canonical_url='https://memorilabs.ai/',
  documentation_url='https://memorilabs.ai/docs/memori-byodb/',
  license_spdx='Apache-2.0',last_verified_at='2026-08-31T01:06:13.374Z',
  updated_at='2026-08-31T01:06:13.374Z'
WHERE id='res_memori';

UPDATE entities SET
  repository_url='https://github.com/odysseus-dev/odysseus',
  canonical_url='https://odysseus-dev.github.io/odysseus/',
  documentation_url='https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md',
  license_spdx='AGPL-3.0',last_verified_at='2026-08-31T01:06:13.374Z',
  updated_at='2026-08-31T01:06:13.374Z'
WHERE id='res_odysseus';

UPDATE entities SET
  repository_url='https://github.com/sickn33/agentic-awesome-skills',
  canonical_url='https://sickn33.github.io/agentic-awesome-skills/',
  documentation_url='https://github.com/sickn33/agentic-awesome-skills/blob/main/docs/users/aas-core.md',
  last_verified_at='2026-08-31T01:06:13.374Z',updated_at='2026-08-31T01:06:13.374Z'
WHERE id='res_antigravity_awesome_skills';

UPDATE entities SET
  openness_status='open-core',canonical_url='https://www.tabbyml.com/',
  documentation_url='https://tabby.tabbyml.com/docs/',
  last_verified_at='2026-08-31T01:06:13.374Z',updated_at='2026-08-31T01:06:13.374Z'
WHERE id='res_tabby';

-- Second evidence-backed code-openness batch. Twenty-six rows passed the
-- automated GitHub audit. AutoGen, MetaGPT and Kilo Code were then manually
-- reviewed because they respectively use a code-specific license file, a
-- redirected repository, and a stale projected license. ROS 2 remains
-- unresolved: its umbrella repository has no single root code license.
INSERT INTO entity_license_scopes (
  id, entity_id, source_id, scope, path, license_identifier, status,
  source_url, observed_at, updated_at
) VALUES
  ('verify_20260831_b2_autogen','res_autogen','github','repository code','LICENSE-CODE','MIT','open','https://github.com/microsoft/autogen/blob/main/LICENSE-CODE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_webwright','res_webwright','github','core repository','LICENSE','MIT','open','https://github.com/microsoft/Webwright/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_skillhub','res_skillhub','github','core repository','LICENSE','Apache-2.0','open','https://github.com/iflytek/skillhub/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_wegent','res_wegent','github','core repository','LICENSE','Apache-2.0','open','https://github.com/wecode-ai/Wegent/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_lelab','res_lelab','github','core repository','LICENSE','Apache-2.0','open','https://github.com/huggingface/leLab/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_famclaw','res_famclaw','github','core repository','LICENSE','AGPL-3.0','open','https://github.com/famclaw/famclaw/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_agentql_mcp','res_agentql_mcp','github','core repository','LICENSE','MIT','open','https://github.com/tinyfish-io/agentql-mcp/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_promptfoo','res_promptfoo','github','core repository','LICENSE','MIT','open','https://github.com/promptfoo/promptfoo/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_musebot','res_musebot','github','core repository','LICENSE','MIT','open','https://github.com/yincongcyincong/MuseBot/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_metagpt','res_metagpt','github','core repository','LICENSE','MIT','open','https://github.com/FoundationAgents/MetaGPT/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_nanobot','res_nanobot','github','core repository','LICENSE','MIT','open','https://github.com/HKUDS/nanobot/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_marketing_skills','res_marketing_skills','github','core repository','LICENSE','MIT','open','https://github.com/coreyhaines31/marketingskills/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_astrbot','res_astrbot','github','core repository','LICENSE','AGPL-3.0','open','https://github.com/AstrBotDevs/AstrBot/blob/master/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_continue','res_continue','github','core repository','LICENSE','Apache-2.0','open','https://github.com/continuedev/continue/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_genesis','res_genesis','github','core repository','LICENSE','Apache-2.0','open','https://github.com/Genesis-Embodied-AI/genesis-world/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_mlflow','res_mlflow','github','core repository','LICENSE.txt','Apache-2.0','open','https://github.com/mlflow/mlflow/blob/master/LICENSE.txt','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_agentmemory','res_agentmemory','github','core repository','LICENSE','Apache-2.0','open','https://github.com/rohitg00/agentmemory/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_fastmcp','res_fastmcp','github','core repository','LICENSE','Apache-2.0','open','https://github.com/PrefectHQ/fastmcp/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_kilo_code','res_kilo_code','github','core repository','LICENSE','MIT','open','https://github.com/Kilo-Org/kilocode/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_swe_agent','res_swe_agent','github','core repository','LICENSE','MIT','open','https://github.com/SWE-agent/SWE-agent/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_notebooklm_py','res_notebooklm_py','github','core repository','LICENSE','MIT','open','https://github.com/teng-lin/notebooklm-py/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_garden_skills','res_garden_skills','github','core repository','LICENSE','MIT','open','https://github.com/ConardLi/garden-skills/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_html_anything','res_html_anything','github','core repository','LICENSE','Apache-2.0','open','https://github.com/nexu-io/html-anything/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_dograh','res_dograh','github','core repository','LICENSE','BSD-2-Clause','open','https://github.com/dograh-hq/dograh/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_html_video','res_html_video','github','core repository','LICENSE','Apache-2.0','open','https://github.com/nexu-io/html-video/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_openlit','res_openlit','github','core repository','LICENSE','Apache-2.0','open','https://github.com/openlit/openlit/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_future_agi','res_future_agi','github','core repository','LICENSE','Apache-2.0','open','https://github.com/future-agi/future-agi/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_agnix','res_agnix','github','core repository','LICENSE-APACHE','Apache-2.0','open','https://github.com/agent-sh/agnix/blob/main/LICENSE-APACHE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('verify_20260831_b2_wandbot','res_wandbot','github','core repository','LICENSE','Apache-2.0','open','https://github.com/wandb/wandbot/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z')
ON CONFLICT(entity_id, scope, path) DO UPDATE SET
  source_id=excluded.source_id,
  license_identifier=excluded.license_identifier,
  status=excluded.status,
  source_url=excluded.source_url,
  observed_at=excluded.observed_at,
  updated_at=excluded.updated_at;

INSERT INTO openness_facets (
  entity_id, facet, status, license_or_terms, source_id, source_url,
  evidence_confidence, observed_at, updated_at
)
SELECT entity_id,'code','open',license_identifier,source_id,source_url,
       'verified',observed_at,updated_at
FROM entity_license_scopes
WHERE id LIKE 'verify_20260831_b2_%'
ON CONFLICT(entity_id,facet) DO UPDATE SET
  status=excluded.status,
  license_or_terms=excluded.license_or_terms,
  source_id=excluded.source_id,
  source_url=excluded.source_url,
  evidence_confidence=excluded.evidence_confidence,
  observed_at=excluded.observed_at,
  updated_at=excluded.updated_at;

-- GitHub's aggregate license field sees AutoGen's documentation license.
-- LICENSE-CODE explicitly assigns MIT to the repository code, so preserve that
-- scoped observation as the current code-license fact.
INSERT OR IGNORE INTO observations (
  id,entity_id,source_id,sync_run_id,fact_key,value_json,value_hash,source_url,
  confidence,observed_at,created_at
) VALUES (
  'obs_autogen_code_license_20260831','res_autogen','github',NULL,'license_spdx',
  '"MIT"','529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1',
  'https://github.com/microsoft/autogen/blob/main/LICENSE-CODE',1.0,
  '2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'
);

INSERT INTO current_facts (
  entity_id,fact_key,observation_id,source_id,value_json,value_hash,confidence,
  observed_at,updated_at
) VALUES (
  'res_autogen','license_spdx','obs_autogen_code_license_20260831','github','"MIT"',
  '529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1',
  1.0,'2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'
)
ON CONFLICT(entity_id,fact_key) DO UPDATE SET
  observation_id=excluded.observation_id,source_id=excluded.source_id,
  value_json=excluded.value_json,value_hash=excluded.value_hash,
  confidence=excluded.confidence,observed_at=excluded.observed_at,
  updated_at=excluded.updated_at;

INSERT OR IGNORE INTO change_events (
  id,entity_id,source_id,observation_id,fact_key,change_type,
  previous_value_json,next_value_json,source_url,detected_at,created_at
) VALUES
  ('change_autogen_code_license_20260831','res_autogen','github','obs_autogen_code_license_20260831','license_spdx','updated','"CC-BY-4.0"','"MIT"','https://github.com/microsoft/autogen/blob/main/LICENSE-CODE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('change_kilo_license_projection_20260831','res_kilo_code','github',NULL,'license_spdx','updated','"Apache-2.0"','"MIT"','https://github.com/Kilo-Org/kilocode/blob/main/LICENSE','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z');

UPDATE entities
SET license_spdx='MIT',last_verified_at='2026-08-31T00:53:36.158Z',updated_at='2026-08-31T00:53:36.158Z'
WHERE id IN ('res_autogen','res_kilo_code');

-- GitHub resolves the historical geekan/MetaGPT locator to
-- FoundationAgents/MetaGPT. Preserve the old binding interval.
INSERT OR IGNORE INTO source_binding_events (
  id,entity_id,source_id,source_role,old_locator,new_locator,reason,changed_at
) VALUES (
  'binding_res_metagpt_github_20260831','res_metagpt','github','primary',
  'geekan/MetaGPT','FoundationAgents/MetaGPT',
  'Official GitHub repository redirect and resolved full_name.',
  '2026-08-31T00:53:36.158Z'
);

UPDATE source_subscriptions
SET enabled=0,valid_until='2026-08-31T00:53:36.158Z',next_sync_at=NULL,
    updated_at='2026-08-31T00:53:36.158Z'
WHERE id='sub_github_metagpt' AND locator='geekan/MetaGPT';

INSERT OR IGNORE INTO source_subscriptions (
  id,entity_id,source_id,external_id,locator,enabled,last_synced_at,next_sync_at,
  created_at,updated_at,error_count,last_error,source_role,valid_from,valid_until
) VALUES (
  'sub_github_metagpt_foundation','res_metagpt','github','660551251',
  'FoundationAgents/MetaGPT',1,NULL,'2026-08-31T00:53:36.158Z',
  '2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z',0,NULL,'primary',
  '2026-08-31T00:53:36.158Z',NULL
);

UPDATE history_subscriptions
SET locator='FoundationAgents/MetaGPT',next_sync_at='2026-08-31T00:53:36.158Z',
    updated_at='2026-08-31T00:53:36.158Z'
WHERE id='sub_release_res_metagpt' AND locator='geekan/MetaGPT';

INSERT OR IGNORE INTO change_events (
  id,entity_id,source_id,observation_id,fact_key,change_type,
  previous_value_json,next_value_json,source_url,detected_at,created_at
) VALUES
  ('change_metagpt_repository_20260831','res_metagpt','github',NULL,'repository_url','updated','"https://github.com/geekan/MetaGPT"','"https://github.com/FoundationAgents/MetaGPT"','https://github.com/FoundationAgents/MetaGPT','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('change_metagpt_homepage_20260831','res_metagpt','github',NULL,'canonical_url','updated','"https://github.com/geekan/MetaGPT"','"https://atoms.dev/"','https://github.com/FoundationAgents/MetaGPT','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z'),
  ('change_metagpt_docs_20260831','res_metagpt','github',NULL,'documentation_url','created',NULL,'"https://docs.deepwisdom.ai/main/en/"','https://github.com/FoundationAgents/MetaGPT/blob/main/README.md','2026-08-31T00:53:36.158Z','2026-08-31T00:53:36.158Z');

UPDATE entities
SET repository_url='https://github.com/FoundationAgents/MetaGPT',
    canonical_url='https://atoms.dev/',
    documentation_url='https://docs.deepwisdom.ai/main/en/',
    last_verified_at='2026-08-31T00:53:36.158Z',
    updated_at='2026-08-31T00:53:36.158Z'
WHERE id='res_metagpt';

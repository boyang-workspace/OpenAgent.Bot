-- First evidence-backed code-openness batch, prioritized by observed traffic,
-- agent access and repository adoption. Every row was matched against the
-- GitHub Repository License API and reviewed for root-level restricted-scope
-- signals on 2026-08-31. AutoGen is intentionally excluded because CC-BY-4.0
-- is not approved for automated open-code classification.
INSERT INTO entity_license_scopes (
  id, entity_id, source_id, scope, path, license_identifier, status,
  source_url, observed_at, updated_at
) VALUES
  ('verify_20260831_cline','res_cline','github','core repository','LICENSE','Apache-2.0','open','https://github.com/cline/cline/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_gbrain','res_gbrain','github','core repository','LICENSE','MIT','open','https://github.com/garrytan/gbrain/blob/master/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_open_design','res_open_design','github','core repository','LICENSE','Apache-2.0','open','https://github.com/nexu-io/open-design/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_ecc','res_ecc','github','core repository','LICENSE','MIT','open','https://github.com/affaan-m/ECC/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_codex_cli','res_codex_cli','github','core repository','LICENSE','Apache-2.0','open','https://github.com/openai/codex/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_kirara_ai','res_kirara_ai','github','core repository','LICENSE','AGPL-3.0','open','https://github.com/lss233/kirara-ai/blob/master/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_agent_browser_protocol','res_agent_browser_protocol','github','core repository','LICENSE','BSD-3-Clause','open','https://github.com/theredsix/agent-browser-protocol/blob/dev/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_telegram_llm_bot','res_telegram_llm_bot','github','core repository','LICENSE','MIT','open','https://github.com/ma2za/telegram-llm-bot/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_pilotdeck','res_pilotdeck','github','core repository','LICENSE','AGPL-3.0','open','https://github.com/OpenBMB/PilotDeck/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_google_adk','res_google_adk','github','core repository','LICENSE','Apache-2.0','open','https://github.com/google/adk-python/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_agent_rules_books','res_agent_rules_books','github','core repository','LICENSE','MIT','open','https://github.com/ciembor/agent-rules-books/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_gemini_cli','res_gemini_cli','github','core repository','LICENSE','Apache-2.0','open','https://github.com/google-gemini/gemini-cli/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_mem0','res_mem0','github','core repository','LICENSE','Apache-2.0','open','https://github.com/mem0ai/mem0/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_goose','res_goose','github','core repository','LICENSE','Apache-2.0','open','https://github.com/aaif-goose/goose/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_hugging_face_skills','res_hugging_face_skills','github','core repository','LICENSE','Apache-2.0','open','https://github.com/huggingface/skills/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_gudastudio_skills','res_gudastudio_skills','github','core repository','LICENSE','MIT','open','https://github.com/GuDaStudio/skills/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_python_whatsapp_bot','res_python_whatsapp_bot','github','core repository','LICENCE.txt','MIT','open','https://github.com/daveebbelaar/python-whatsapp-bot/blob/main/LICENCE.txt','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_openlore','res_openlore','github','core repository','LICENSE','MIT','open','https://github.com/clay-good/OpenLore/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_telegram_ai_agent','res_telegram_ai_agent','github','core repository','LICENSE','MIT','open','https://github.com/pavel-molyanov/telegram-ai-agent/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_security_skills','res_security_skills_claude_code','github','core repository','LICENSE','MIT','open','https://github.com/Security-Phoenix-demo/security-skills-claude-code/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_mda','res_mda_markdown_agent','github','core repository','LICENSE','Apache-2.0','open','https://github.com/sno-ai/mda/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_browser_use','res_browser_use','github','core repository','LICENSE','MIT','open','https://github.com/browser-use/browser-use/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_playwright_mcp','res_playwright_mcp','github','core repository','LICENSE','Apache-2.0','open','https://github.com/microsoft/playwright-mcp/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_rlinf','res_rlinf','github','core repository','LICENSE','Apache-2.0','open','https://github.com/RLinf/RLinf/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_unitree_sdk2','robotics_unitree_sdk2','github','core repository','LICENSE','BSD-3-Clause','open','https://github.com/unitreerobotics/unitree_sdk2/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_crawl4ai','res_crawl4ai','github','core repository','LICENSE','Apache-2.0','open','https://github.com/unclecode/crawl4ai/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_llamaindex','res_llamaindex','github','core repository','LICENSE','MIT','open','https://github.com/run-llama/llama_index/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_graphiti','res_graphiti','github','core repository','LICENSE','Apache-2.0','open','https://github.com/getzep/graphiti/blob/main/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('verify_20260831_skill_seekers','res_skill_seekers','github','core repository','LICENSE','MIT','open','https://github.com/yusufkaraaslan/Skill_Seekers/blob/development/LICENSE','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z')
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
WHERE id LIKE 'verify_20260831_%'
ON CONFLICT(entity_id,facet) DO UPDATE SET
  status=excluded.status,
  license_or_terms=excluded.license_or_terms,
  source_id=excluded.source_id,
  source_url=excluded.source_url,
  evidence_confidence=excluded.evidence_confidence,
  observed_at=excluded.observed_at,
  updated_at=excluded.updated_at;

-- GitHub resolves the historical block/goose repository to aaif-goose/goose.
-- Preserve the old binding interval and record the binding change separately
-- from repository language or other project facts.
INSERT OR IGNORE INTO source_binding_events (
  id,entity_id,source_id,source_role,old_locator,new_locator,reason,changed_at
) VALUES (
  'binding_res_goose_github_20260831','res_goose','github','primary',
  'block/goose','aaif-goose/goose','Official GitHub repository redirect and resolved full_name.','2026-08-31T00:38:34.659Z'
);

UPDATE source_subscriptions
SET enabled=0,valid_until='2026-08-31T00:38:34.659Z',next_sync_at=NULL,updated_at='2026-08-31T00:38:34.659Z'
WHERE id='sub_github_goose' AND locator='block/goose';

INSERT OR IGNORE INTO source_subscriptions (
  id,entity_id,source_id,external_id,locator,enabled,last_synced_at,next_sync_at,
  created_at,updated_at,error_count,last_error,source_role,valid_from,valid_until
) VALUES (
  'sub_github_goose_aaif','res_goose','github','846698999','aaif-goose/goose',1,NULL,
  '2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z',
  0,NULL,'primary','2026-08-31T00:38:34.659Z',NULL
);

UPDATE history_subscriptions
SET locator='aaif-goose/goose',next_sync_at='2026-08-31T00:38:34.659Z',updated_at='2026-08-31T00:38:34.659Z'
WHERE id='sub_release_res_goose' AND locator='block/goose';

INSERT OR IGNORE INTO change_events (
  id,entity_id,source_id,observation_id,fact_key,change_type,
  previous_value_json,next_value_json,source_url,detected_at,created_at
) VALUES
  ('change_goose_repository_20260831','res_goose','github',NULL,'repository_url','updated','"https://github.com/block/goose"','"https://github.com/aaif-goose/goose"','https://github.com/aaif-goose/goose','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('change_goose_homepage_20260831','res_goose','github',NULL,'canonical_url','updated','"https://block.github.io/goose"','"https://goose-docs.ai/"','https://github.com/aaif-goose/goose','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z'),
  ('change_goose_docs_20260831','res_goose','github',NULL,'documentation_url','updated','"https://block.github.io/goose/docs"','"https://goose-docs.ai/"','https://github.com/aaif-goose/goose','2026-08-31T00:38:34.659Z','2026-08-31T00:38:34.659Z');

UPDATE entities
SET repository_url='https://github.com/aaif-goose/goose',
    canonical_url='https://goose-docs.ai/',
    documentation_url='https://goose-docs.ai/',
    last_verified_at='2026-08-31T00:38:34.659Z',
    updated_at='2026-08-31T00:38:34.659Z'
WHERE id='res_goose';

-- Correct subscriptions that target repository subpaths or unsupported
-- Hugging Face collection/space/organization endpoints.
UPDATE source_subscriptions
SET locator = 'modelcontextprotocol/servers', updated_at = datetime('now')
WHERE source_id = 'github'
  AND locator = 'modelcontextprotocol/servers/tree/main/src/github';

UPDATE source_subscriptions
SET enabled = 0, updated_at = datetime('now')
WHERE source_id = 'huggingface'
  AND locator IN (
    'collections/deepseek-ai/deepseek-v4',
    'collections/google/gemma-4',
    'https://huggingface.co',
    'spaces/lerobot/LeLab',
    'allenai',
    'docs/smolagents'
  );

-- Remove the one known case-only SPDX event generated before connector
-- normalization. D1 time travel remains available if this cleanup is audited.
DELETE FROM change_events
WHERE fact_key = 'license_spdx'
  AND lower(trim(previous_value_json, '"')) = lower(trim(next_value_json, '"'));

UPDATE current_facts
SET value_json = '"MIT"',
    value_hash = '529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1',
    updated_at = datetime('now')
WHERE fact_key = 'license_spdx'
  AND lower(trim(value_json, '"')) = 'mit';

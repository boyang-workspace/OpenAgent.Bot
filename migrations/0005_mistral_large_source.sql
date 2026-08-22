-- Mistral Large 3 is distributed through Mistral's official Hugging Face
-- repository, not the nonexistent GitHub repository used by the initial seed.
UPDATE entities
SET canonical_url = 'https://mistral.ai/news/mistral-3/',
    repository_url = 'https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512',
    updated_at = datetime('now')
WHERE id = 'res_mistral_large_3';

UPDATE source_subscriptions
SET source_id = 'huggingface',
    locator = 'mistralai/Mistral-Large-3-675B-Instruct-2512',
    last_synced_at = NULL,
    next_sync_at = datetime('now'),
    updated_at = datetime('now')
WHERE entity_id = 'res_mistral_large_3'
  AND source_id = 'github';

-- The seeded GitHub star count was attached to the nonexistent repository.
-- Clear it before the Hugging Face connector writes observed model metrics.
UPDATE entity_metrics_current
SET stars = NULL,
    forks = NULL,
    watchers = NULL,
    open_issues = NULL,
    source_id = 'huggingface',
    updated_at = datetime('now')
WHERE entity_id = 'res_mistral_large_3';

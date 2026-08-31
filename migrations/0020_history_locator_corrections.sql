-- Verified source-locator corrections discovered by the history backfill.
-- Tiledesk/tiledesk-server no longer exists; the active, MIT-licensed official
-- repository is Tiledesk/tiledesk.

UPDATE entities
SET repository_url = 'https://github.com/Tiledesk/tiledesk',
    updated_at = datetime('now'),
    last_verified_at = datetime('now')
WHERE id = 'res_tiledesk'
  AND repository_url = 'https://github.com/Tiledesk/tiledesk-server';

UPDATE source_subscriptions
SET locator = 'Tiledesk/tiledesk',
    last_synced_at = NULL,
    next_sync_at = datetime('now'),
    error_count = 0,
    last_error = NULL,
    updated_at = datetime('now')
WHERE entity_id = 'res_tiledesk'
  AND source_id = 'github'
  AND locator = 'Tiledesk/tiledesk-server';

UPDATE history_subscriptions
SET locator = 'Tiledesk/tiledesk',
    last_synced_at = NULL,
    next_sync_at = datetime('now'),
    error_count = 0,
    last_error = NULL,
    updated_at = datetime('now')
WHERE entity_id = 'res_tiledesk'
  AND source_id = 'github-releases'
  AND locator = 'Tiledesk/tiledesk-server';

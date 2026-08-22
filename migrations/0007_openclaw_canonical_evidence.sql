-- Align the curated identity with the homepage currently declared by the
-- canonical repository and attach direct license-file evidence.
UPDATE entities
SET canonical_url = 'https://openclaw.ai',
    organization = 'OpenClaw Foundation',
    updated_at = datetime('now')
WHERE id = 'res_openclaw';

INSERT INTO openness_facets (
  entity_id, facet, status, license_or_terms, source_id, source_url, observed_at, updated_at
) VALUES (
  'res_openclaw', 'code', 'open', 'MIT', 'github',
  'https://github.com/openclaw/openclaw/blob/main/LICENSE',
  datetime('now'), datetime('now')
)
ON CONFLICT(entity_id, facet) DO UPDATE SET
  status = excluded.status,
  license_or_terms = excluded.license_or_terms,
  source_id = excluded.source_id,
  source_url = excluded.source_url,
  observed_at = excluded.observed_at,
  updated_at = excluded.updated_at;

-- Normalize SPDX identifiers seeded before connector-level normalization so
-- casing corrections do not appear as product changes in the public timeline.
UPDATE current_facts
SET value_json = CASE lower(trim(value_json, '"'))
      WHEN 'mit' THEN '"MIT"'
      WHEN 'apache-2.0' THEN '"Apache-2.0"'
      WHEN 'bsd-3-clause' THEN '"BSD-3-Clause"'
      WHEN 'bsd-2-clause' THEN '"BSD-2-Clause"'
      WHEN 'mpl-2.0' THEN '"MPL-2.0"'
      WHEN 'gpl-3.0' THEN '"GPL-3.0"'
      WHEN 'agpl-3.0' THEN '"AGPL-3.0"'
    END,
    value_hash = CASE lower(trim(value_json, '"'))
      WHEN 'mit' THEN '529fc91e3f97d3b2c3fe5102bea89059d6aa65c9e44d6bbb86591bb31aa783e1'
      WHEN 'apache-2.0' THEN '570920a3762044f20f915aa337f9eace3e8dcc04c7774a774af88f93ad8e3074'
      WHEN 'bsd-3-clause' THEN 'e41167670d4a4ba8c4d6ddc9988bbc62f5e601d392eda7d0ea3088f16e893b31'
      WHEN 'bsd-2-clause' THEN 'a9b944c7af5b44aebb603079ddf7b12fea4e0d956b57987d1fe82d66f6d81d10'
      WHEN 'mpl-2.0' THEN 'cc7601412a0b2ba1b48f378cce148c50e19872c14ed05de36e51f18e83f29cca'
      WHEN 'gpl-3.0' THEN '3572f69bfc985d12c0745c08df1fb14bec79af12ed9252ba082730428726ea1d'
      WHEN 'agpl-3.0' THEN 'c336f4a30a3ac1702b8186fa9dcd06db28fd6e71b2122ef47374d0af4ee90051'
    END,
    updated_at = datetime('now')
WHERE fact_key = 'license_spdx'
  AND lower(trim(value_json, '"')) IN (
    'mit', 'apache-2.0', 'bsd-3-clause', 'bsd-2-clause',
    'mpl-2.0', 'gpl-3.0', 'agpl-3.0'
  );

-- Remove casing-only events already emitted during the first production
-- baseline. D1 Time Travel remains available if this cleanup is audited.
DELETE FROM change_events
WHERE fact_key = 'license_spdx'
  AND lower(trim(previous_value_json, '"')) = lower(trim(next_value_json, '"'));

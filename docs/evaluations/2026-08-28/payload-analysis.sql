-- Inputs: ?1 = before.json text; ?2 = after.json text.
-- Measured bytes originate in evaluations/knowledge-agent-tasks.ts; this query
-- computes paired reductions and reconciles identical full-document baselines.
WITH baseline AS (
  SELECT json_extract(value, '$.slug') AS project,
         json_extract(value, '$.knowledgeJsonBytes') AS before_full_bytes
  FROM json_each(?1, '$.payloads')
), paired AS (
  SELECT json_extract(a.value, '$.slug') AS project,
         json_extract(a.value, '$.question') AS question,
         json_extract(a.value, '$.legacyJsonBytes') AS legacyBytes,
         json_extract(a.value, '$.knowledgeJsonBytes') AS fullBytes,
         json_extract(a.value, '$.taskJsonBytes') AS taskBytes,
         b.before_full_bytes AS beforeFullBytes,
         1.0 - (1.0 * json_extract(a.value, '$.taskJsonBytes') /
           NULLIF(json_extract(a.value, '$.knowledgeJsonBytes'), 0)) AS reduction
  FROM json_each(?2, '$.payloads') a
  JOIN baseline b ON b.project = json_extract(a.value, '$.slug')
), representations(representation, ordinal) AS (
  VALUES ('旧版完整 JSON', 1), ('完整 Knowledge JSON', 2), ('单任务 Knowledge JSON', 3)
)
SELECT paired.*, representation, ordinal,
       CASE ordinal WHEN 1 THEN legacyBytes WHEN 2 THEN fullBytes ELSE taskBytes END AS bytes
FROM paired CROSS JOIN representations
ORDER BY project, ordinal;

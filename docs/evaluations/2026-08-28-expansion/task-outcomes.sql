-- Bind ?1, ?2, ?3 to the full before.json, data-only.json, after.json texts.
-- Original HTTP checks are executed in evaluations/knowledge-expansion.ts.
-- This aggregation compares the same frozen task IDs, not real agent success.
WITH stages(stageOrder, stage, raw) AS (
  VALUES (1, '补数前', ?1), (2, '仅补数', ?2), (3, '迭代后', ?3)
), outcomes AS (
  SELECT stageOrder, stage, json_extract(t.value, '$.id') AS taskId,
         json_extract(t.value, '$.passed') AS passed,
         CASE substr(json_extract(t.value, '$.id'), 1, 1)
           WHEN 'D' THEN '接口查询' WHEN 'S' THEN '边界判断'
           WHEN 'F' THEN '事实证据' WHEN 'X' THEN '字段发现'
           WHEN 'R' THEN '版本资源' ELSE '历史边界' END AS taskGroup
  FROM stages, json_each(stages.raw, '$.tasks') t
)
SELECT taskGroup, stage, stageOrder, SUM(passed) AS passed, COUNT(*) AS total,
       1.0 * SUM(passed) / COUNT(*) AS passRate
FROM outcomes GROUP BY taskGroup, stage, stageOrder ORDER BY taskGroup, stageOrder;

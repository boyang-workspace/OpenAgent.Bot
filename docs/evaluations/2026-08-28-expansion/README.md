# Knowledge expansion — 2026-08-28

本轮完成：四个已有项目补数 → 同题复测 → 按失败补两个查询能力。
项目为 OpenHands、LangGraph、LeRobot、Playwright MCP；它们已成为补数样本，
不能再当作未见测试集。没有部署、生产数据写入或第三方软件／机器人执行。

- 新增 8 个 documented 接口、11 个资源、16 条业务事实；不把 curated 元数据计入事实数。
- 相同 30 个确定性任务：补数前 3/30，仅补数据 23/30，接口迭代后 30/30。
- 新增严格 domain 过滤和 section=fields 字段键发现；保留未知、未实测和部分历史语义。
- 全量回归 149/149，类型检查零错误／警告，构建通过。
- 值得继续小规模真实客户端验证；不是通用准确率、需求或付费验证。

主报告：[report.html](report.html)。分析伴随文件：[analysis.ipynb](analysis.ipynb)。
Notebook 的 4 个代码单元已用 Python 标准库顺序执行并保存输出；
Jupyter、nbformat、nbclient 未安装，未验证 Jupyter 内核和界面。

## Evidence and reproduction

- [before.json](before.json)、[data-only.json](data-only.json)、[after.json](after.json)
  保存每题 HTTP 请求、响应、断言与代码／数据指纹。
- [sources.json](sources.json) 保存只读获取的官方仓库提交、文件路径、Git blob SHA-1、
  大小和观测时间。摘要不是原文件 SHA-256；此文件也不是永久源文件镜像。
- [task-outcomes.sql](task-outcomes.sql) 对三个完整 JSON 参数执行分组聚合；
  notebook 核对任务 ID、分母、阶段汇总与指纹后运行 SQL。
- [verification.json](verification.json) 保存本轮测试、构建及未执行范围。
- [artifact.json](artifact.json) 是 HTML 的规范输入，HTML 由既有便携报告渲染器生成。

```bash
npm run knowledge:check
npm run knowledge:evaluate:expansion -- after
npm test
npm run check
npm run build
```

当前 evaluator 的 before 模式只省略四个新 manifest，data-only 模式会加载它们；
两者都运行当前 query 代码，因此不等于历史 API 实现。历史对比以保留的
原始响应及指纹为准，不覆盖旧结果。相同任务定义和 evaluator 指纹贯穿三阶段；
仅补数前后 query 指纹相同，仅补数与迭代后 manifest 指纹相同。

## Interpretation boundaries

S1 和 S7 在缺数据时也返回空集；H1 明确报告时点还原不可用，因此补数前有 3 个
通过。这不表示平台当时可以回答三个正向事实问题。其余通过数来自实际结构化结果。
7 个安全／未知边界题全部通过只是已定义检查，没有证明任意任务都安全。

四个字段发现序列包含所有分页和最后的事实读取，总计各 4–5 请求、7,320–9,890
未压缩 JSON 字节；不代表 token、网络、延迟或真实 agent 成本节省。

数据保留原项目 ID、域分类、订阅身份及历史指标。OpenHands 的描述更正为当前主仓库
Agent Canvas，并明确 SDK／Agent Server 属于其他仓库；未把相关仓库的指标或接口混入。
来源检查不构成字段 TTL；所有接口都没有独立运行测试报告。LeRobot 的物理动作能力
明确标记；Playwright 隔离配置不等于只读；第三方数据与模型许可保持未知。

现有 intake 首次新增事实只记录 observation 与 publication 审计，不逐字段发出
first-seen change event；未回填真实上游历史，未建立任意时点复原或备份恢复保证。
这是下一轮需要单独设计和验证的能力，不以空历史冒充完整历史。

## Report design and validation notes

Audience: product stakeholders; delivery: portable HTML in Codex, no Sites publication.
Required structure: title → Executive Summary → definitions/findings/chart → data and
scope findings → implemented changes/regression → next steps → further questions → caveats.
The six executive roles are all retained; evidence is split into independently editable sections.

Chart contract: compare the same tasks within six question groups across three discrete phases.
Use a grouped horizontal bar chart, fractional pass rate, group-specific denominator retained
in source rows. Eighteen aggregate rows are sufficient; no invented temporal trend. Categorical
gold/blue/orange palette, explicit stage legend and category labels; no color-only meaning.
Single full-width chart; precise per-project counts remain in narrative because their role is
audit lookup, not ranking. All chart rows come from the executed SQL and captured HTTP checks.
The packaged renderer verifies desktop/narrow layout, payload identity and source affordances;
no custom chart runtime or screenshots are used as delivery substitutes.

No inference token counts, elapsed agent-task times, independent clients, payment signals,
production traffic or real upstream history metrics are available. These omissions are material
to deciding whether to scale beyond the current local preview.

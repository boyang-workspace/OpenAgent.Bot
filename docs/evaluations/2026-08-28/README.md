# Agent 任务评估与第二批迭代

结论：值得继续一个小规模验证批次。当前价值是可约束查询、带来源的小答案和
可追踪变更，不是“知识库足够大”。真实客户端省时、复用意愿和付费需求尚未验证。

## 实测结果

| 标准 | 改动前 | 本轮迭代后 |
| --- | --- | --- |
| 条件查询 | 6/6 本地筛选用例；没有新产品查询接口 | 6/6 本地 HTTP handler 用例；严格参数校验 |
| 简短结果 | 完整 Knowledge JSON 13,319–33,148 字节 | 6 个指定详情任务 1,519–2,384 字节；保留来源与未知状态 |
| 明确未知 | 10/10 合成边界案例返回 unknown | 保持 10/10；要求 fresh/tested 时不误判为匹配 |
| 历史追踪 | 26 条模拟变化只暴露最近 20 条 | 6 页取回 26 条，无重复；仍无任意时点复原 |

6 个详情任务的字节减少中位数为 91.53%（相对完整 Knowledge JSON）。这来自按需
选取子集，不是无损压缩，也不是 token、网络传输或任务完成时间改善。前置发现
slug/id 的成本没有计入。旧 JSON 也是对照，避免只与更大的新文档比较。

复现范围：162 个隔离库项目；6 条样板记录来自 vgpu、OpenCode、Microduck 四个
相关项目，另检查 OpenHands、LangGraph、LeRobot、Playwright MCP 四条非样板
记录。后四者均缺结构化 interfaces/resources；这是定向抽样，不能外推全库覆盖率。
所有样板接口都缺字段有效期和版本限定的独立测试报告。

## 资料对照的发现

- 线上旧 API 对 access/authentication 额外参数返回同一 vgpu 结果；这些过滤器
  本就不是旧接口承诺的功能。新严格接口独立版本化，不改变旧语义。
- vgpu 的托管 MCP 确实声明只读且无需认证；本地模式默认只读，写入要明确配置。
  因此 local-write-opt-in 表示潜在能力，不是当前运行权限。新接口明确标注此边界，
  未把它强行合并进严格只读结果。[官方 MCP 文档](https://vgpu.sh/docs/mcp.md)
- OpenCode HTTP server 的 basic auth 是可选配置，不等于模型提供方凭据。
  [官方 server 文档](https://opencode.ai/docs/server/)
- Microduck 的固定版本 README 与已有策略输入/输出形状、来源和托管状态记录
  一致；声明形状不等于实测兼容或机器人安全认证。
  [固定版本策略文档](https://github.com/pollen-robotics/microduck/blob/590b986bd8c0d50ae02cb3ea2f59c463b6828168/policies/README.md)

vgpu 已有 13,220 字节 Markdown，Microduck 这份 README 为 3,547 字节。不用完整
网页框架代码体积夸大平台优势。线上请求耗时仅为单次诊断，不据此报告平均值/P95。

## 完成的迭代

`KnowledgeQueryService` 加三个只读入口：`search.json`、`project.json`、`history.json`，
位于 `/api/knowledge/v1/`。同一接口上的严格约束匹配、未知候选计数、证据去重、
精确资源/接口读取、绑定过滤器的游标、历史 append window、D1 失败返回 503，
并更新 API 与 llms.txt 说明。详见 [API 语义](../../KNOWLEDGE_API.md)。

不新增数据库、迁移或生产依赖；不执行 shader、MCP 命令、策略文件或机器人动作。
本轮未部署、未发布 OpenCode intake、未打开 CI。已有用户改动保留。

## 验证与可复现材料

- `npm test`：114/114；Knowledge 定向测试 55/55，其中本轮新增 33 项。
- `npm run check`：94 files，0 errors / warnings / hints。
- `npm run build`：成功。未进行真实 Worker/D1 网络边界或负载验证。
- [before.json](before.json)：改动前固定记录；不可用后测结果覆盖。
- [after.json](after.json)：本地 HTTP handler 复测原始结果。
- [source-checks.json](source-checks.json)：公开 API 探测与人工官方源对照。
- [analysis.ipynb](analysis.ipynb)：3 个代码单元按顺序执行，输出已保存。
  环境缺 nbformat/nbclient；使用 Python 标准库执行，不宣称验证过 Jupyter UI/内核。
- [payload-analysis.sql](payload-analysis.sql)：实际执行的成对字节分析，两个参数
  是 before.json / after.json 原文。原始测量代码在 evaluations/knowledge-agent-tasks.ts。
- [artifact.json](artifact.json)：规范化报告源；[report.html](report.html) 为打包输出。
- [verification.json](verification.json)：验证回执。HTML 已通过规范校验、打包和
  1,440 / 390 像素浏览器检查，来源弹窗通过。未认证多浏览器、触控或打印一致性。

仓库根目录运行 `npm run knowledge:evaluate -- after` 可重新计算；`before` 参数保留
原评估方式，重跑不会自动覆盖固定 before.json。时间与观测 ID 每次可能不同；
任务答案、字节数和模拟历史计数应保持一致。

图形选择：只有一个六项目三响应类型的分组条形图，回答响应大小比较；原始字节
审计表用于精确核对。不是趋势图，不存在时间序列或随机总体。颜色区分响应类型，
同时保留图例文字；HTML 使用统一报告渲染器，无自制图表脚本。

## 下一步投入门槛（建议，尚未达成）

下一轮：30 个真实任务、至少 10 个非样板项目、两个独立客户端，冻结答案与任务
后再对照平台和官方资料。纳入否定条件、运行配置、版本迁移、旧数据与空结果。
应先补样板外记录和字段复核，再决定 MCP 包装、缓存与规模化采集。

继续投入需要：约束正确性不劣于官方资料基线、危险误判为零；至少一项端到端
指标（时间或输入 token）在成功任务中的中位数改善 25%，且至少两个客户端重复
使用。同时报告全部任务的失败率、回退原站比例与维护成本，不能只报告成功样本。

本轮不证明：自动冲突治理、全网覆盖、长期可恢复数据库、任意时点重建、生产
可靠性、机器人安全、商业需求。若真实任务主要仍依赖回原站且维护成本高，应收缩
到少数高价值领域，而不是继续按条目数扩张。

# vgpu 收录建议与数据库覆盖评估

状态：方案已获批准；本轮实现 vgpu 内容包、通用审核收录、工具接口索引、GitHub Releases / npm 采集。以下“当前能力与缺口”保留为实施前评估，实际操作和剩余边界见 [收录手册](REGISTRY_INTAKE.md)。Microduck 已独立完成发布。

## 结论

现有数据库可以容纳 Microduck 和 vgpu；无需新增一级领域或更换数据库。
但“可以存储”不等于“可以自动、可靠地持续收录”。当前瓶颈是字段治理、资源归属和采集审核，不是数据库引擎。
本次评估检查了实际 schema、查询、同步器和详情页；没有做容量压测，不承诺未来所有类型或任意数据规模都已覆盖。

## vgpu：核实结果

- [官方仓库](https://github.com/vercel-labs/vgpu)：Vercel Labs 的 TypeScript / WebGPU 库，MIT 许可，提供 WGSL 模块化和跨运行环境支持。它供 coding agent 与人类开发者使用，本身不是 autonomous agent，也不是机器人或模型。
- [官方 agent manifest](https://vgpu.sh/agents.md)：将产品归为 Developer tools，明确列出 coding agents 为使用者，且链接 CLI、文档、示例 API 和 MCP。
- [MCP 文档](https://vgpu.sh/docs/mcp)：托管 HTTP 服务无认证、只读；本地 stdio 的文件下载需要单独授权输出目录。两者不能合并为一个笼统的“安全/只读”布尔值。本轮只核验文档，未安装软件、执行 shader 或调用 MCP 工具。
- [v0.3.1 release](https://github.com/vercel-labs/vgpu/releases/tag/v0.3.1)：2026-08-26 发布；npm `latest` 也是 0.3.1。[历史 changelog](https://github.com/vercel-labs/vgpu/blob/main/CHANGELOG.md) 已有更早版本。因此用户提供的 8 月 27 日消息不能直接视为首次发布/开源时间；公开宣传时间需另找原帖。
- [当前 README](https://github.com/vercel-labs/vgpu/blob/main/README.md) 写的是完整 fullscreen effect 的 25 KB gzip 构建预算，不是库的通用下载体积。新闻的 11 KB 尚缺版本、构建输入、压缩方式等条件，暂不进入规格表或性能排行榜。

## 建议收录映射

| 维度 | 建议 |
| --- | --- |
| 主记录 | vgpu，一条 canonical project |
| kind | tool |
| domain | agent；表示服务于 agent 生态，不代表产品本身就是 agent |
| 细分类型 | 开发工具 / WebGPU 与 shader 库；不增加一级导航 |
| use cases | Shader development、GPU rendering、Agent-assisted development，逐项附官方证据 |
| 维护者与许可 | Vercel Labs；MIT |
| 主要身份 | GitHub vercel-labs/vgpu；npm vgpu；官网 vgpu.sh |
| 配套资源 | CLI、MCP 文档及发现入口、LLM 文档、示例 API、版本与包清单 |
| 指标所有权 | GitHub 热度归仓库；npm 下载量归具体 package；不可相加后称“用户数” |

MCP、CLI 和每个 monorepo 包先作为带类型的资源；只有具备独立用户选择价值、身份、许可或发布周期时才升格为实体。新闻是发现线索或有来源的事件，不是另一个产品记录。

## 当前能力与缺口

| 能力 | 当前实现 | 缺口 |
| --- | --- | --- |
| 实体类型与领域 | kind 与 entity_domains 分离；支持多领域 | 默认规则只是 provisional，tool 需要证据分类 |
| 机器人层次 | platform / intelligence / stack；本轮加入 biped | 无需为 Microduck 新建 use-case 类别 |
| 使用场景 | 本轮加入多对多 entity_use_cases，网页/API 可过滤 | 场景词表仍需人工治理，不能任意生成近义词 |
| 来源与历史 | observations、current_facts、changes、openness_facets | 缺少字段级校验规则和冲突来源优先级 |
| 资源文件 | resources.* 在事实账本存储，JSON 输出带版本与来源 | 未形成统一 package/release/artifact 身份与版本生命周期 |
| 关联 | 双向显示并保留证据 | 现有 depends-on 不宜代替 trained-with、part-of 等所有语义 |
| Agent 工具接口 | 可以存在 facts 中 | 缺少跨项目可筛选的接口、认证、运行环境和读写能力字段 |
| 自动更新 | GitHub 仓库元数据、HF models、RSS | 未覆盖 npm 版本/下载、GitHub Releases、HF datasets/spaces、产品规格和资源清单 |
| 新项目收录 | 本轮通过 reviewed seed migration | 应与数据库结构迁移解耦，建立幂等 intake 与审核流程 |
| 展示一致性 | 事实账本 + entities/robotics metadata 展示投影 | 同步 facts 不会自动刷新全部投影，存在长期漂移风险 |

## 建议的最小流程

```text
官网 / GitHub / 包仓库 / HF / 新闻线索
                 ↓
        候选发现 → 身份去重 → 差异审核
                 ↓
       有来源的事实、资源版本和关联
                 ↓
        统一生成展示字段与分类索引
          ↙          ↓          ↘
       详情页       API       同类排行榜
```

## ADR：增量完善现有关系型 registry

### 状态

Accepted，2026-08-28。采用增量完善现有关系型 registry 的方案。

### 背景与约束

要能同时表达真实机器人、软件、模型、数据和 agent 原生工具；同时保持来源可追溯、不重复计数、可审核、维护成本可控。保留已上线 URL 和历史记录，不为了少量新类型引入新的服务。

### 决策建议

1. **先制定字段契约，再增加采集源。** 通用字段覆盖资源类型、外部身份、版本、许可、运行环境；工具接口覆盖 CLI/API/MCP/SDK、认证、读写范围和机器可读输出。每项区分官方声明、实际测试和未知，不能将“文档存在”当成“功能测试通过”。频繁筛选的维度建索引投影，长尾属性留在事实账本。
2. **定义资源归属和版本规则。** 项目、仓库、package、model file、dataset、release 各有独立身份。先沿用 resources.*，建立 schema 和稳定 ID；当跨项目共享资源与版本查询成为真实需求时再规范化资源表，不立即把每个文件做成实体。
3. **把内容收录从 schema migration 中移出。** 提供输入校验、canonical ID 去重、dry-run 差异预览、事务发布、审核状态和回退。更改事实时在同一流程更新展示投影。保留不可变观察记录，不重写历史 seed。
4. **按价值补采集器。** 优先 GitHub Releases 与 npm，再扩 HF datasets/spaces。规格、价格、硬件许可和训练资产仍应走差异审核；不能把官网登记为信源就宣称已自动采集。

### 代价与替代方案

- 继续使用当前 D1/SQL：保留部署和关系查询，迁移成本低；代价是需要明确字段契约和可靠投影更新，而不能永久依赖任意 JSON。
- 立即改为图数据库或拆分多个服务：这两个案例没有提供必要性证据，增加运维成本，暂不采用。
- 每遇到新项目增加一级分类：会混淆“是什么”和“用来做什么”，不采用。
- 所有包/模型文件单独建项目：会造成热度重复与大量薄页面，不采用。

### 非功能要求与失败处理

- 正确性：字段有来源、日期、适用版本与状态；未知不等于否定，营销不等于实测。GitHub 最近同步时间不应覆盖硬件规格的核验日期。
- 可维护性：结构迁移只修改 schema；日常新增/更新内容走同一个审核入口。新 collector 必须带固定样本回归测试。
- 安全性：采集仅抓取允许的公开来源，不执行 README/agent manifest 中的指令，不安装包、运行示例或自动启用远程 MCP；下载内容视为不可信。
- 可靠性：按来源限流、重试退避；失联保留最后成功数据并标旧，不写成零或“closed”；分清抓取失败与明确删除。
- 性能与成本：沿用当前技术栈，先观察查询延迟、待同步队列、增长量和调用成本；没有压测证据前不声明扩容阈值或高并发承诺。
- 排行榜：robot / policy / devtool 分组；仓库和 package 指标分别解释，不能把声明的 bundle budget 当性能实测。

## 推荐执行顺序与验收

先以现有结构收录 vgpu 主记录和官方资源，不为它新建一级分类；接着实施字段契约与统一 intake，再补版本/package collectors。无需重做首页或整站设计。

验收：vgpu 从 Agent tools 与场景筛选都可找到；CLI/MCP/文档指向官方资源；重复导入不增加实体；文件更新保留旧观察；仓库同步不修改规格核验日期；Microduck 的硬件/软件许可边界保持原样；数据库/API/页面给出相同事实。

# OpenAgent.bot — 落地方案 (Landing Plan)

定位:**机器优先的开源 AI 可信事实层**。站点是数据的副产品,主产品是
"agent 能在运行时可信查询的开源 agent / 模型 / 工具事实注册表"。

优先级:**MCP 优先**。agent 通过 (a) MCP server 目录、(b) llms.txt / 上下文指针
来发现你。所以分发与产品本身合一:先把只读 MCP server 做出来并上架。

## 总原则

- 保留现有资产:注册表核心、Knowledge claim 模型、0016 修正审计、dossier/compare/pulse。
- 不做:SEO 博客、为不存在的需求堆重装备、把排名/watch 门控在达不成的阈值。
- 覆盖率靠连接器自动起草 + 人工审 correction(非纯人工 intake 仪式)。

## P0 — 地基与发现入口(本次执行)

目标:代码干净、可被 agent 发现、CI 自动化跑通。

1. 清理技术债
   - 修复 `site.ts` 导航里指向不存在的 `/agents`、`/robotics`(404),改为真实页面。
   - 移除其它死引用;保留被引用的组件与脚本。
2. `llms.txt` 升级为"方位入口"
   - 包含 API base、MCP server 说明与启动方式、顶层实体索引、fact-key 清单。
   - 让任何抓 `/llms.txt` 的 agent 拿到完整 orientation(无需猜)。
3. 只读 MCP server(基于已上线的 `/api/v1`)
   - 工具:`search_entities`、`get_entity`、`get_stats`。
   - 零新增依赖,stdio JSON-RPC,默认指向 `https://www.openagent.bot`。
   - `package.json` 增加 `mcp` 脚本 + `mcp/manifest.json`(上架目录用)。
4. 自动化
   - CI 增加 `npm run knowledge:check` + `npm test`,覆盖新批次。
   - 保留每日 Registry Sync;文档化运行方式。
5. 验证:`check` + `test` + `build` 全绿。

## P1 — 知识层上线(需你提供凭据)

- 应用 migration `0016` 到生产 D1。
- 部署 `/api/knowledge/v1` 只读 API 到 Worker。
- 经审核发布 OpenCode + 4 个扩展 manifest(OpenHands/LangGraph/LeRobot/Playwright MCP)。
- 把新端点接入 `/api` 与 `/llms.txt`。

## P2 — 打破覆盖率瓶颈

- 连接器(GitHub/HF/npm/PyPI)自动起草记录 → 人工只审 correction/争议。
- 降低排名/watch 门槛到可达成范围,先小范围发,用回访喂数据。

## P3 — 放大发现

- GEO / 实体页 JSON-LD,让检索型 agent 引用你。
- 上架 MCP 目录(mcp.so / 官方目录)。
- 框架合作:让 agent 框架把 OpenAgent 作为默认可信上游。

## 执行状态(2026-08-29)

- ✅ P0 全部完成并**已部署到生产**:`www.openagent.bot` 已上线;`/llms.txt` 含 MCP 发现入口;`/mcp/manifest.json` 可访问;Knowledge API 实测返回 `schemaVersion:0.1.0`(证明 `0016` 已在生产);`astro check`/`test`(170)/`knowledge:check`(109)/`build` 全绿。
- ⏸️ P1 发布 manifest **被阻塞**:`opencode`/`openhands`/`langgraph`/`lerobot`/`playwright-mcp` 五个 manifest 是未提交文件,且生产发布需 `REGISTRY_SYNC_TOKEN`(本机会话没有)。两条解阻塞路径任选其一后我即可自动跑完:
  1. 本地设 `REGISTRY_SYNC_TOKEN` 后:`npm run registry:intake -- content/intake/opencode.json`(preview 拿 hash)→ 同命令加 `--publish --base-hash … --payload-hash … --reviewer …`;其余 4 个同理。
  2. 允许我把这 5 个 manifest 提交并推到 `main`,再用 `gh workflow run registry-intake.yml` 走服务端审核发布。

## 需要你提供的凭据(我无法代做)

- Cloudflare `wrangler deploy` + `SYNC_TOKEN` / `GITHUB_TOKEN` 密钥。
- MCP 目录上架账号。
- 生产 D1 的 migration 应用权限。
以上步骤我会写好 runbook,你执行或授权后我可代为跑。

## Runbook(你或授权后我执行的确切命令)

### P1 — 知识层上线
```bash
# 1) 应用所有待定迁移(含 0016 修正审计)到生产 D1
npm run d1:migrations:remote
# 2) 部署 Worker(构建 + 发布)
npm run deploy
# 3) 经审核发布 OpenCode 与 4 个扩展 manifest(以 OpenCode 为例):
#    先 preview 拿 base_hash / payload_hash,再 publish
npm run registry:intake -- content/intake/opencode.json
npm run registry:intake -- content/intake/opencode.json --publish \
  --base-hash <PREVIEW_BASE_HASH> --payload-hash <PREVIEW_PAYLOAD_HASH> --reviewer <你的名>
#    其余:openhands / langgraph / lerobot / playwright-mcp 同理
#    或在 GitHub Actions "Reviewed Registry Intake" 里选 manifest 走可视化 preview→publish
```

### P3 — 放大发现(上架 MCP)
- 目录提交:`public/mcp/manifest.json` 已可被抓取;提交到 mcp.so / 官方 MCP 目录。
- 框架自助接入:任何 agent 运行 `npm run mcp`(即 `node mcp/server.mjs`)即可把
  OpenAgent 作为只读 MCP server 加入;设置 `OPENAGENT_API_BASE` 可指向自建/本地。

### 每日自动化(已存在,无需改动)
- GitHub Actions `registry-sync.yml` 每日 02:17 UTC 调 `/api/internal/sync.json` 同步
  GitHub / Hugging Face / NVIDIA 源(每批 ≤20,带 SYNC_TOKEN)。
- CI(`ci.yml`)在 push main / PR 时跑 `check` + `test` + `knowledge:check` + `build`。

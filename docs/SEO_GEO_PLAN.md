# OpenAgent.Bot 90-Day SEO/GEO Execution Plan

Goal: organic traffic → ad revenue. 3 products: Directory, Blog, Discovery Pipeline.

---

## Week 1-2: Foundation

### 1.1 Bulk SEO pass on all 49 resource pages

**Problem**: every resource page has generic titles like "OpenClaw: Agents resource for open AI builders". Google reads these as thin pages.

**Action** — write a script to batch-update `seo.title` + `seo.description` in all `content/resources/published/*.json`:

- Pattern for `seoTitle`: `"{ToolName}: {what it actually does} | OpenAgent.bot"`
- Example: `"browser-use: 开源浏览器自动化工具，让 AI 操作网页"`
- Example: `"OpenHands: 开源 AI 编程助手，自动完成 GitHub 任务"`  
- Pattern for `seoDescription`: `"了解 {ToolName} 是什么、适合谁、怎么用。包含官方链接、开源状态、替代方案和使用场景。"`

SEO scoring: each page becomes a landing page for 3-5 long-tail keywords.

### 1.2 Fix interlinking: blog → directory

**Problem**: blog posts have some directory links, but directory pages don't link to related blog posts, and there's no "related tools" section.

**Action**:
- Add `related_resources` field to blog JSON schema (list of slugs)
- Add `related_posts` section at bottom of each resource detail page
- Add "see also" sidebar to category pages
- Internal link graph: every page links to 2-5 other pages

### 1.3 Move content from legacy to new path

**Status update**: published resources now live in `content/resources/published/` as ResourceV1. Admin/editorial drafts can still start in `content/projects/drafts/`, but public pages read the unified resource source.

**Action**: migrate legacy files to new format/path. Verify `getPublishedResources()` still finds them. Remove adapter code.

### 1.4 Verify GA4 data pipeline

**Problem**: GA4 is configured but no one has looked at the numbers.

**Action**: set up a weekly GA4 export or dashboard bookmark. Track:
- Top 20 pages by views
- Bounce rate per page
- Search queries (Google Search Console if available)
- ChatGPT referral traffic trend

---

## Week 3-4: Content Engine

### 2.1 Activate discovery pipeline

**Problem**: pipeline fully coded but never run.

**Action**:
- Run `npm run discovery:daily -- --dry-run` first to verify
- Fix any issues (env vars, API tokens, file paths)
- Enable daily GitHub Actions workflow
- Set expectations: 1-3 drafts/day, 1 topic/day

PH and X collectors are stubs. Prioritize fixing them later; GitHub + HN is enough to start.

### 2.2 Blog workflow: comparison posts (weekly cadence)

**Problem**: 18 posts, 10 about OpenClaw/Open Design. Need content people actually search for.

**Action** — write 1 comparison post per week:
- "OpenHands vs AutoGen vs CrewAI" (your eval page already has 12 views, 33% bounce)
- "Gemini CLI vs Claude Code vs Codex CLI" (3 × 100K+ star projects)
- "Mem0 vs Letta vs Cognee: AI 记忆系统对比"
- "MCP vs Function Calling: 选哪个？"
- "Langfuse vs Promptfoo vs Ragas: AI 评测工具对比"

Each post already has resource pages → link heavily to them.

Format: comparison table + 3-5 section deep dives + FAQ + "适合谁" decision guide.

### 2.3 Blog workflow: scenario guides (bi-weekly)

- "用开源 AI 搭建自动客服——5 个免费工具推荐"
- "2026 年最好的免费 AI 编程助手"
- "不需要 GPU：6 个可以本地运行的轻量模型"
- "AI 浏览器自动化入门：选 browser-use 还是 OpenClaw？"

### 2.4 Add /llms.txt + /index.json pages

**Problem**: README claims these exist but routes are missing.

**Action**: create Astro endpoint pages:
- `/llms.txt` — full list of resources in markdown
- `/index.json` — full list in JSON

Critical for GEO (ChatGPT/Claude/Gemini training data ingestion).

---

## Week 5-6: GEO & Structured Data

### 3.1 FAQ structured data audit

**Problem**: FAQ JSON-LD is already rendered on detail pages (via `profile.faq`), but content quality varies.

**Action**: audit all 49 FAQ sections. Each must have 4-6 real questions that someone searching Google would ask:
- "What is X?"
- "Who is X for?"
- "How is X different from Y?"
- "Is X free/open-source?"
- "How do I install X?"
- "What are X's limitations?"

**GEO bonus**: ChatGPT prioritizes pages with clear FAQ structure.

### 3.2 Add "HowTo" structured data to resource pages

Each tool page should also have a `HowTo` JSON-LD for "how to get started":
- name: "用 {ToolName} 快速开始"
- description + tool URL + steps

This unlocks rich snippets in search results.

### 3.3 Category pages: add editorial guides

Current category pages have generic descriptions. Add:
- "For developers" section
- "For non-technical users" section  
- "Top 5 picks" quick links
- FAQ per category

Makes category pages standalone landing pages, not just index listings.

---

## Week 7-8: Scale & Automation

### 4.1 Resource count to 100+

Discovery pipeline + manual additions. Target: enough pages for Google to see the site as authoritative in the niche.

### 4.2 Optimize for ChatGPT/GEO

Add to every page:
- Clear `<meta name="description">` within 160 chars
- Bullet-point summaries (ChatGPT likes extracting these)
- Source attribution (ChatGPT favors pages that cite sources)
- `/llms.txt` periodically checked for freshness

### 4.3 Fix Product Hunt collector

PH collector is a stub. Product Hunt is where new AI tools launch — this is the best signal for "new tool nobody knows about yet". Without it, the pipeline misses the most valuable candidates.

---

## Week 9-12: Monetization Prep

### 5.1 Traffic assessment

Target: 5K-10K monthly PV before AdSense/ad network integration.

### 5.2 Ad placement strategy

When traffic hits target:
- Sidebar banner (300×250)
- In-content (after article, before FAQ)
- Category page header
- No popups, no interstitials (destroys SEO)

### 5.3 Sponsor/listing evaluation

If directory authority grows, consider:
- Sponsored listings (like `isSponsored` field already exists in schema)
- Newsletter (weekly digest = recurring engagement)
- Affiliate links (for SaaS tools that do have partner programs)

---

## Quick Wins Priority Matrix

| Task | Effort | Traffic Impact | GEO Impact |
|------|--------|---------------|------------|
| SEO titles batch fix | 1h | ⭐⭐⭐ | ⭐ |
| Blog → directory interlinking | 4h | ⭐⭐⭐ | ⭐ |
| Discovery pipeline activation | 2h | ⭐⭐⭐ | ⭐⭐ |
| 1 comparison post | 3h | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| /llms.txt + /index.json | 2h | ⭐ | ⭐⭐⭐⭐⭐ |
| FAQ structured data audit | 6h | ⭐⭐ | ⭐⭐⭐⭐ |
| Category page editorial | 4h | ⭐⭐⭐ | ⭐⭐ |
| Product Hunt collector | 4h | ⭐⭐ | ⭐⭐ |

**Immediate actions** (this week):
1. SEO titles batch fix
2. Discovery pipeline dry-run
3. /llms.txt + /index.json routes
4. First comparison post

---

## Files to touch per phase

### Week 1-2
- `scripts/content/` — new script: `batch-update-seo.ts`
- `content/resources/published/*.json` — batch update `seo.title`/`seo.description`
- `src/lib/content/blog.ts` — add `related_resources` field
- `src/pages/[category]/[slug].astro` — add related posts section
- `src/pages/[category]/index.astro` — add see-also links

### Week 3-4
- `.github/workflows/daily-discovery.yml` — enable (currently exists?)
- `scripts/discovery/run-daily.ts` — verify first run
- `src/pages/llms.txt.ts` — new file
- `src/pages/index.json.ts` — new file
- `src/lib/content/resource-schema.ts` — verify ResourceV1 has all fields needed

### Week 5-6
- `content/resources/published/*.json` — FAQ content audit
- `src/pages/[category]/index.astro` — add editorial guide sections
- `src/lib/content/resource-schema.ts` — add HowTo schema interface

### Week 7-8
- `scripts/discovery/collect-producthunt.ts` — implement
- `.github/workflows/daily-discovery.yml` — verify consistent output

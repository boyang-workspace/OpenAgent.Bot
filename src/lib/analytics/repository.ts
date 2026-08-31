import type { RegistryDatabase } from "@/lib/registry/repository";
import { isSocialReferrerSource } from "./privacy";

type Row = Record<string, string | number | null>;

export type AnalyticsOverview = {
  totals: { browserVisitors: number; pageviews: number; browserViews: number; suspectedAutomationViews: number; machineRequests: number; apiRequests: number; outboundClicks: number };
  trend: Array<{ date: string; browser: number; suspected: number; search: number; ai: number; api: number }>;
  mix: Array<{ type: string; requests: number }>;
};

export class AnalyticsRepository {
  constructor(private readonly db: RegistryDatabase) {}

  private async rows(sql: string, ...values: unknown[]): Promise<Row[]> {
    return (await this.db.prepare(sql).bind(...values).all<Row>()).results ?? [];
  }

  async overview(days: number): Promise<AnalyticsOverview> {
    const rows = await this.rows("SELECT * FROM analytics_daily WHERE date >= date('now', ?1) ORDER BY date", `-${days - 1} days`);
    const sum = (key: string) => rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
    const search = sum("search_bot_requests"), crawlers = sum("ai_crawler_requests"), agents = sum("ai_agent_requests"), api = sum("api_requests"), unknown = sum("unknown_bot_requests");
    return {
      totals: { browserVisitors: sum("human_visitors"), pageviews: sum("pageviews"), browserViews: sum("human_pageviews"), suspectedAutomationViews: sum("suspected_automation_pageviews"), machineRequests: search + crawlers + agents + api + unknown, apiRequests: api, outboundClicks: sum("outbound_clicks") },
      trend: rows.map((row) => ({ date: String(row.date), browser: Number(row.human_pageviews), suspected: Number(row.suspected_automation_pageviews), search: Number(row.search_bot_requests), ai: Number(row.ai_crawler_requests) + Number(row.ai_agent_requests), api: Number(row.api_requests) })),
      mix: [
        { type: "Browser-like", requests: sum("human_pageviews") }, { type: "Search bots", requests: search },
        { type: "AI crawlers", requests: crawlers }, { type: "AI agents", requests: agents },
        { type: "API clients", requests: api }, { type: "Unknown bots", requests: unknown }
      ]
    };
  }

  async content(days: number) {
    const modifier = `-${days - 1} days`;
    const [pages, entities] = await Promise.all([
      this.rows(`SELECT path, route_type, SUM(pageviews) AS pageviews, SUM(human_pageviews) AS browser_views, SUM(suspected_automation_pageviews) AS suspected_automation_views, SUM(agent_pageviews) AS agent_views, SUM(visitors) AS visitors FROM analytics_page_daily WHERE date >= date('now', ?1) GROUP BY path, route_type ORDER BY (SUM(human_pageviews) - SUM(suspected_automation_pageviews) + SUM(agent_pageviews)) DESC LIMIT 100`, modifier),
      this.rows(`SELECT entity_type, entity_slug, SUM(human_views) AS browser_views, SUM(suspected_automation_views) AS suspected_automation_views, SUM(agent_views) AS agent_views, SUM(evidence_clicks) AS evidence_clicks, SUM(source_clicks) AS source_clicks, SUM(outbound_clicks) AS outbound_clicks FROM analytics_entity_daily WHERE date >= date('now', ?1) GROUP BY entity_type, entity_slug ORDER BY (SUM(human_views) - SUM(suspected_automation_views) + SUM(agent_views)) DESC LIMIT 100`, modifier)
    ]);
    return {
      pages: pages.map((row) => ({ ...row, audience_views: Math.max(Number(row.browser_views ?? 0) - Number(row.suspected_automation_views ?? 0), 0) })),
      entities: entities.map((row) => {
        const audienceViews = Math.max(Number(row.browser_views ?? 0) - Number(row.suspected_automation_views ?? 0), 0);
        return { ...row, audience_views: audienceViews, interest_ratio: Number(row.agent_views ?? 0) / Math.max(audienceViews, 1) };
      })
    };
  }

  async acquisition(days: number) {
    const sessionSources = await this.rows(`SELECT source, SUM(sessions) AS sessions FROM analytics_session_acquisition_daily WHERE date >= date('now', ?1) GROUP BY source ORDER BY sessions DESC`, `-${days - 1} days`);
    const sources = sessionSources.filter((row) => String(row.source) !== "internal");
    const social = sources.filter((row) => isSocialReferrerSource(String(row.source)));
    return {
      sources,
      internalSessions: sessionSources.filter((row) => String(row.source) === "internal").reduce((sum, row) => sum + Number(row.sessions ?? 0), 0),
      social,
      socialTotals: {
        sessions: social.reduce((sum, row) => sum + Number(row.sessions ?? 0), 0),
        channels: social.length
      }
    };
  }

  async agents(days: number) {
    const modifier = `-${days - 1} days`;
    const [actors, entities] = await Promise.all([
      this.rows(`SELECT actor_type, actor_name, SUM(requests) AS requests FROM analytics_actor_daily WHERE date >= date('now', ?1) AND actor_type IN ('ai_crawler','ai_agent','api_client') GROUP BY actor_type, actor_name ORDER BY requests DESC`, modifier),
      this.rows(`SELECT entity_slug, SUM(agent_views) AS agent_views, SUM(human_views) AS human_views FROM analytics_entity_daily WHERE date >= date('now', ?1) GROUP BY entity_slug ORDER BY agent_views DESC LIMIT 100`, modifier)
    ]);
    return { actors, entities: entities.map((row) => ({ ...row, interest_ratio: Number(row.agent_views ?? 0) / Math.max(Number(row.human_views ?? 0), 1) })) };
  }

  async search(days: number) {
    const rows = await this.rows(`SELECT query, SUM(searches) AS searches, SUM(zero_results) AS zero_results, SUM(result_clicks) AS result_clicks FROM analytics_search_daily WHERE date >= date('now', ?1) GROUP BY query ORDER BY searches DESC LIMIT 100`, `-${days - 1} days`);
    const totals = rows.reduce<{ searches: number; zeroResults: number; resultClicks: number }>((result, row) => ({ searches: result.searches + Number(row.searches), zeroResults: result.zeroResults + Number(row.zero_results), resultClicks: result.resultClicks + Number(row.result_clicks) }), { searches: 0, zeroResults: 0, resultClicks: 0 });
    return { totals, queries: rows };
  }

  async health() {
    const [state, counts] = await Promise.all([
      this.db.prepare("SELECT * FROM analytics_rollup_state WHERE id='global'").first<Row>(),
      this.db.prepare("SELECT COALESCE(SUM(requests),0) AS requests, COALESCE(SUM(unknown_bot_requests),0) AS unknown_bots FROM analytics_daily WHERE date=date('now')").first<Row>()
    ]);
    return { state, eventsToday: Number(counts?.requests ?? 0), unknownBotRate: Number(counts?.requests ?? 0) ? Number(counts?.unknown_bots ?? 0) / Number(counts?.requests ?? 1) : 0 };
  }
}

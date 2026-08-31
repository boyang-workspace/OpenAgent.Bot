import type { D1Statement, RegistryDatabase } from "@/lib/registry/repository";
import { AnalyticsEngineQuery, sqlTimestamp, type AnalyticsSqlRow } from "./query";
import { acquisitionSource } from "./privacy";

type RollupGroups = {
  actors: AnalyticsSqlRow[];
  visitors: AnalyticsSqlRow[];
  events: AnalyticsSqlRow[];
  pages: AnalyticsSqlRow[];
  referrers: AnalyticsSqlRow[];
  entities: AnalyticsSqlRow[];
  searches: AnalyticsSqlRow[];
  outbound: AnalyticsSqlRow[];
  visitorPages?: AnalyticsSqlRow[];
  sessionEntries?: AnalyticsSqlRow[];
};

const number = (value: unknown) => Number(value ?? 0) || 0;

type VisitorPageActivity = { requests: number; paths: Set<string>; projectPaths: Set<string>; maxPathRequests: number; actorName: string };

function suspectedAutomation(rows: AnalyticsSqlRow[]): Set<string> {
  const visitors = new Map<string, VisitorPageActivity>();
  for (const row of rows) {
    const visitorId = String(row.visitor_id || "");
    if (!visitorId) continue;
    const activity = visitors.get(visitorId) ?? { requests: 0, paths: new Set(), projectPaths: new Set(), maxPathRequests: 0, actorName: String(row.actor_name || "Browser") };
    const requests = number(row.requests), path = String(row.path || "");
    activity.requests += requests;
    activity.maxPathRequests = Math.max(activity.maxPathRequests, requests);
    activity.paths.add(path);
    if (String(row.route_type) === "project") activity.projectPaths.add(path);
    visitors.set(visitorId, activity);
  }
  // This is a review signal, not a claim about a specific visitor. It requires
  // a strong repeated or enumerating pattern before excluding it from audience KPIs.
  return new Set([...visitors].filter(([, activity]) =>
    activity.requests >= 30 ||
    (activity.actorName === "Browser" && activity.requests >= 10 && (activity.projectPaths.size > 0 || activity.paths.size >= 3)) ||
    (activity.maxPathRequests >= 12 && activity.requests >= 12) ||
    (activity.projectPaths.size >= 10 && activity.requests >= 20)
  ).map(([visitorId]) => visitorId));
}

export type DailyRollup = {
  daily: Record<string, number | string>;
  pages: Array<Record<string, number | string>>;
  actors: Array<Record<string, number | string>>;
  referrers: Array<Record<string, number | string>>;
  entities: Array<Record<string, number | string>>;
  events: Array<Record<string, number | string>>;
  searches: Array<Record<string, number | string>>;
  outbound: Array<Record<string, number | string>>;
  acquisition: Array<Record<string, number | string>>;
};

function accumulate<T extends Record<string, number | string>>(map: Map<string, T>, key: string, initial: T, updates: Partial<Record<keyof T, number>>): void {
  const value = map.get(key) ?? initial;
  for (const [field, increment] of Object.entries(updates)) value[field as keyof T] = (number(value[field as keyof T]) + number(increment)) as T[keyof T];
  map.set(key, value);
}

export function buildDailyRollup(date: string, groups: RollupGroups, updatedAt = new Date().toISOString()): DailyRollup {
  const actorCounts = groups.actors.reduce<Record<string, number>>((counts, row) => {
    const actorType = String(row.actor_type);
    counts[actorType] = (counts[actorType] ?? 0) + number(row.requests);
    return counts;
  }, {});
  const eventCounts = Object.fromEntries(groups.events.map((row) => [String(row.event_type), number(row.events)]));
  const requests = Object.values(actorCounts).reduce((sum, value) => sum + number(value), 0);
  const pageRows = groups.pages.filter((row) => String(row.route_type) !== "api");
  const pageviews = pageRows.reduce((sum, row) => sum + number(row.pageviews), 0);
  const humanPageviews = pageRows.reduce((sum, row) => sum + (String(row.actor_type) === "human" ? number(row.pageviews) : 0), 0);
  const visitorPageRows = groups.visitorPages ?? [];
  const suspiciousVisitors = suspectedAutomation(visitorPageRows);
  const suspiciousPageviews = new Map<string, number>();
  const suspiciousProjectViews = new Map<string, number>();
  for (const row of visitorPageRows) {
    if (!suspiciousVisitors.has(String(row.visitor_id || ""))) continue;
    const path = String(row.path || ""), requests = number(row.requests);
    suspiciousPageviews.set(path, (suspiciousPageviews.get(path) ?? 0) + requests);
    const project = path.match(/^\/project\/([a-z0-9-]+)$/);
    if (project) suspiciousProjectViews.set(project[1], (suspiciousProjectViews.get(project[1]) ?? 0) + requests);
  }
  const suspectedAutomationPageviews = [...suspiciousPageviews.values()].reduce((sum, value) => sum + value, 0);
  const daily = {
    date, requests, pageviews,
    human_pageviews: humanPageviews, human_visitors: groups.visitors.reduce((sum, row) => sum + number(row.visitors), 0),
    search_bot_requests: number(actorCounts.search_bot), ai_crawler_requests: number(actorCounts.ai_crawler), ai_agent_requests: number(actorCounts.ai_agent),
    api_requests: number(actorCounts.api_client), unknown_bot_requests: number(actorCounts.unknown_bot),
    outbound_clicks: number(eventCounts.outbound_click), evidence_clicks: number(eventCounts.evidence_click), searches: number(eventCounts.internal_search),
    suspected_automation_pageviews: suspectedAutomationPageviews, suspected_automation_visitors: suspiciousVisitors.size, updated_at: updatedAt
  };

  const pages = new Map<string, Record<string, number | string>>();
  for (const row of pageRows) {
    const key = String(row.path), actor = String(row.actor_type), count = number(row.pageviews);
    accumulate(pages, key, { date, path: key, route_type: String(row.route_type), pageviews: 0, human_pageviews: 0, agent_pageviews: 0, suspected_automation_pageviews: 0, visitors: 0 }, {
      pageviews: count,
      human_pageviews: actor === "human" ? count : 0,
      agent_pageviews: actor === "ai_agent" || actor === "ai_crawler" ? count : 0,
      visitors: actor === "human" ? number(row.visitors) : 0
    });
    if (actor === "human" && suspiciousPageviews.has(key)) accumulate(pages, key, { date, path: key, route_type: String(row.route_type), pageviews: 0, human_pageviews: 0, agent_pageviews: 0, suspected_automation_pageviews: 0, visitors: 0 }, { suspected_automation_pageviews: suspiciousPageviews.get(key) ?? 0 });
  }

  const entities = new Map<string, Record<string, number | string>>();
  for (const row of groups.entities) {
    const slug = String(row.entity_slug), type = String(row.entity_type || "project"), key = `${type}:${slug}`, actor = String(row.actor_type), event = String(row.event_type), count = number(row.events);
    accumulate(entities, key, { date, entity_type: type, entity_slug: slug, human_views: 0, agent_views: 0, suspected_automation_views: 0, evidence_clicks: 0, source_clicks: 0, outbound_clicks: 0 }, {
      human_views: event === "request" && actor === "human" ? count : 0,
      agent_views: event === "request" && (actor === "ai_agent" || actor === "ai_crawler") ? count : 0,
      evidence_clicks: event === "evidence_click" ? count : 0,
      source_clicks: event === "source_click" ? count : 0,
      outbound_clicks: event === "outbound_click" ? count : 0
    });
  }
  for (const [slug, views] of suspiciousProjectViews) {
    const key = `project:${slug}`;
    accumulate(entities, key, { date, entity_type: "project", entity_slug: slug, human_views: 0, agent_views: 0, suspected_automation_views: 0, evidence_clicks: 0, source_clicks: 0, outbound_clicks: 0 }, { suspected_automation_views: views });
  }

  const searches = new Map<string, Record<string, number | string>>();
  for (const row of groups.searches) {
    const query = String(row.query), event = String(row.event_type), count = number(row.events);
    accumulate(searches, query, { date, query, searches: 0, zero_results: 0, result_clicks: 0 }, {
      searches: event === "internal_search" ? count : 0,
      zero_results: event === "internal_search" && number(row.numeric_value) === 0 ? count : 0,
      result_clicks: event === "search_result_click" ? count : 0
    });
  }

  return {
    daily,
    pages: [...pages.values()],
    actors: groups.actors.map((row) => ({ date, actor_type: String(row.actor_type), actor_name: String(row.actor_name || "Unknown"), requests: number(row.requests) })),
    referrers: (() => {
      const referrers = new Map<string, Record<string, number | string>>();
      for (const row of groups.referrers) {
        const source = acquisitionSource(String(row.source || "direct"), typeof row.utm_source === "string" ? row.utm_source : undefined);
        accumulate(referrers, source, { date, source, visits: 0, pageviews: 0 }, { visits: number(row.visits), pageviews: number(row.pageviews) });
      }
      return [...referrers.values()];
    })(),
    entities: [...entities.values()],
    events: groups.events.map((row) => ({ date, event_type: String(row.event_type), events: number(row.events) })),
    searches: [...searches.values()],
    outbound: groups.outbound.map((row) => ({ date, source: String(row.source || "site"), destination: String(row.destination || "other"), clicks: number(row.clicks) })),
    acquisition: (() => {
      const entries = new Map<string, { source: string; firstSeen: string }>();
      for (const row of groups.sessionEntries ?? []) {
        const sessionId = String(row.session_id || "");
        if (!sessionId) continue;
        const firstSeen = String(row.first_seen || "");
        const source = acquisitionSource(String(row.source || "direct"), typeof row.utm_source === "string" ? row.utm_source : undefined);
        const existing = entries.get(sessionId);
        if (!existing || firstSeen < existing.firstSeen) entries.set(sessionId, { source, firstSeen });
      }
      const sources = new Map<string, number>();
      for (const entry of entries.values()) sources.set(entry.source, (sources.get(entry.source) ?? 0) + 1);
      return [...sources].map(([source, sessions]) => ({ date, source, sessions }));
    })()
  };
}

async function queryGroups(query: AnalyticsEngineQuery, start: Date, end: Date): Promise<RollupGroups> {
  const where = `timestamp >= toDateTime('${sqlTimestamp(start)}') AND timestamp < toDateTime('${sqlTimestamp(end)}')`;
  const [actors, visitors, events, pages, referrers, entities, searches, outbound, visitorPages, sessionEntries] = await Promise.all([
    query.run(`SELECT blob2 AS actor_type, blob3 AS actor_name, SUM(_sample_interval) AS requests FROM openagent_events WHERE ${where} AND blob1='request' GROUP BY actor_type, actor_name`),
    query.run(`SELECT blob17 AS visitor_id, 1 AS visitors FROM openagent_events WHERE ${where} AND blob1='request' AND blob2='human' AND blob17 != '' GROUP BY visitor_id`),
    query.run(`SELECT blob1 AS event_type, SUM(_sample_interval) AS events FROM openagent_events WHERE ${where} GROUP BY event_type`),
    query.run(`SELECT blob4 AS path, blob5 AS route_type, blob2 AS actor_type, SUM(_sample_interval) AS pageviews, COUNT(DISTINCT blob17) AS visitors FROM openagent_events WHERE ${where} AND blob1='request' GROUP BY path, route_type, actor_type`),
    query.run(`SELECT blob8 AS source, blob12 AS utm_source, COUNT(DISTINCT blob17) AS visits, SUM(_sample_interval) AS pageviews FROM openagent_events WHERE ${where} AND blob1='request' AND blob2='human' GROUP BY source, utm_source`),
    query.run(`SELECT blob6 AS entity_type, blob7 AS entity_slug, blob2 AS actor_type, blob1 AS event_type, SUM(_sample_interval) AS events FROM openagent_events WHERE ${where} AND blob7 != '' GROUP BY entity_type, entity_slug, actor_type, event_type`),
    query.run(`SELECT blob16 AS query, blob1 AS event_type, double5 AS numeric_value, SUM(_sample_interval) AS events FROM openagent_events WHERE ${where} AND blob1 IN ('internal_search','search_result_click') AND blob16 != '' GROUP BY query, event_type, numeric_value`),
    query.run(`SELECT blob7 AS source, blob15 AS destination, SUM(_sample_interval) AS clicks FROM openagent_events WHERE ${where} AND blob1='outbound_click' GROUP BY source, destination`),
    query.run(`SELECT blob17 AS visitor_id, blob3 AS actor_name, blob4 AS path, blob5 AS route_type, SUM(_sample_interval) AS requests FROM openagent_events WHERE ${where} AND blob1='request' AND blob2='human' AND blob17 != '' AND blob5 != 'api' GROUP BY visitor_id, actor_name, path, route_type`),
    query.run(`SELECT blob18 AS session_id, blob8 AS source, blob12 AS utm_source, MIN(timestamp) AS first_seen FROM openagent_events WHERE ${where} AND blob1='page_view' AND blob2='human' AND blob18 != '' GROUP BY session_id, source, utm_source`)
  ]);
  return { actors, visitors, events, pages, referrers, entities, searches, outbound, visitorPages, sessionEntries };
}

function insert(db: RegistryDatabase, table: string, row: Record<string, number | string>): D1Statement {
  const keys = Object.keys(row);
  return db.prepare(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map((_, index) => `?${index + 1}`).join(",")})`).bind(...Object.values(row));
}

export async function replaceDailyRollup(db: RegistryDatabase, rollup: DailyRollup): Promise<void> {
  const date = String(rollup.daily.date);
  const tables = ["analytics_daily", "analytics_page_daily", "analytics_actor_daily", "analytics_referrer_daily", "analytics_entity_daily", "analytics_event_daily", "analytics_search_daily", "analytics_outbound_daily", "analytics_session_acquisition_daily"];
  const statements: D1Statement[] = tables.map((table) => db.prepare(`DELETE FROM ${table} WHERE date=?1`).bind(date));
  statements.push(insert(db, "analytics_daily", rollup.daily));
  for (const [table, rows] of [["analytics_page_daily", rollup.pages], ["analytics_actor_daily", rollup.actors], ["analytics_referrer_daily", rollup.referrers], ["analytics_entity_daily", rollup.entities], ["analytics_event_daily", rollup.events], ["analytics_search_daily", rollup.searches], ["analytics_outbound_daily", rollup.outbound]] as const) for (const row of rows) statements.push(insert(db, table, row));
  for (const row of rollup.acquisition) statements.push(insert(db, "analytics_session_acquisition_daily", row));
  await db.batch(statements);
}

async function updateState(db: RegistryDatabase, values: { hourly?: string; reconciliation?: string; success?: string; error?: string | null }): Promise<void> {
  await db.prepare(`UPDATE analytics_rollup_state SET last_hourly_rollup=COALESCE(?1,last_hourly_rollup), last_daily_reconciliation=COALESCE(?2,last_daily_reconciliation), last_success=COALESCE(?3,last_success), last_error=?4, updated_at=?5 WHERE id='global'`)
    .bind(values.hourly ?? null, values.reconciliation ?? null, values.success ?? null, values.error ?? null, new Date().toISOString()).run();
}

export async function runAnalyticsRollup(environment: Pick<Env, "DB" | "CLOUDFLARE_ACCOUNT_ID" | "ANALYTICS_API_TOKEN">, now = new Date()): Promise<void> {
  const query = new AnalyticsEngineQuery(environment.CLOUDFLARE_ACCOUNT_ID, environment.ANALYTICS_API_TOKEN);
  if (!query.configured()) { await updateState(environment.DB, { error: "Analytics Engine read credentials are not configured." }); return; }
  const end = new Date(now); end.setUTCMinutes(0, 0, 0);
  try {
    if (end.getUTCHours() > 0) {
      const start = new Date(end); start.setUTCHours(0, 0, 0, 0);
      const date = start.toISOString().slice(0, 10);
      await replaceDailyRollup(environment.DB, buildDailyRollup(date, await queryGroups(query, start, end), now.toISOString()));
    }
    let reconciliation: string | undefined;
    if (end.getUTCHours() === 0) {
      const previousEnd = new Date(end), previousStart = new Date(end); previousStart.setUTCDate(previousStart.getUTCDate() - 1);
      const date = previousStart.toISOString().slice(0, 10);
      await replaceDailyRollup(environment.DB, buildDailyRollup(date, await queryGroups(query, previousStart, previousEnd), now.toISOString()));
      reconciliation = date;
    }
    await updateState(environment.DB, { hourly: end.toISOString(), reconciliation, success: now.toISOString(), error: null });
  } catch (error) {
    await updateState(environment.DB, { error: error instanceof Error ? error.message.slice(0, 500) : "Unknown rollup error" });
    throw error;
  }
}

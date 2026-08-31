import { describe, expect, it } from "vitest";
import { buildDailyRollup } from "../src/lib/analytics/rollup";

describe("analytics daily rollup", () => {
  it("keeps request traffic separate from pageviews and preserves meaningful events", () => {
    const rollup = buildDailyRollup("2026-08-30", {
      actors: [
        { actor_type: "human", actor_name: "Chrome", requests: 10 },
        { actor_type: "human", actor_name: "Safari", requests: 3 },
        { actor_type: "ai_agent", actor_name: "ChatGPT", requests: 4 },
        { actor_type: "api_client", actor_name: "curl", requests: 7 }
      ],
      visitors: [{ visitor_id: "a", visitors: 1 }, { visitor_id: "b", visitors: 1 }],
      events: [{ event_type: "request", events: 21 }, { event_type: "outbound_click", events: 3 }, { event_type: "internal_search", events: 2 }],
      pages: [
        { path: "/agents", route_type: "agents_index", actor_type: "human", pageviews: 10, visitors: 2 },
        { path: "/agents", route_type: "agents_index", actor_type: "ai_agent", pageviews: 4, visitors: 0 },
        { path: "/api/knowledge/search", route_type: "api", actor_type: "api_client", pageviews: 7, visitors: 0 }
      ],
      referrers: [{ source: "google", visits: 2, pageviews: 4 }, { source: "direct", utm_source: "linkedin", visits: 1, pageviews: 2 }],
      entities: [{ entity_type: "project", entity_slug: "opencode", actor_type: "human", event_type: "request", events: 5 }],
      searches: [
        { query: "agent", event_type: "internal_search", numeric_value: 0, events: 1 },
        { query: "robot", event_type: "internal_search", numeric_value: -1, events: 1 },
        { query: "agent", event_type: "search_result_click", numeric_value: -1, events: 1 }
      ],
      outbound: [{ source: "opencode", destination: "github", clicks: 3 }]
    }, "2026-08-30T12:00:00.000Z");

    expect(rollup.daily).toMatchObject({ requests: 24, pageviews: 14, human_pageviews: 10, human_visitors: 2, api_requests: 7, outbound_clicks: 3, searches: 2 });
    expect(rollup.pages).toEqual([{ date: "2026-08-30", path: "/agents", route_type: "agents_index", pageviews: 14, human_pageviews: 10, agent_pageviews: 4, suspected_automation_pageviews: 0, visitors: 2 }]);
    expect(rollup.referrers).toEqual(expect.arrayContaining([{ date: "2026-08-30", source: "linkedin", visits: 1, pageviews: 2 }]));
    expect(rollup.searches).toContainEqual({ date: "2026-08-30", query: "agent", searches: 1, zero_results: 1, result_clicks: 1 });
    expect(rollup.searches).toContainEqual({ date: "2026-08-30", query: "robot", searches: 1, zero_results: 0, result_clicks: 0 });
  });

  it("flags strong browser-like enumeration without changing the raw browser total", () => {
    const rollup = buildDailyRollup("2026-08-31", {
      actors: [{ actor_type: "human", actor_name: "Browser", requests: 12 }],
      visitors: [{ visitor_id: "browser-bot", visitors: 1 }],
      events: [{ event_type: "request", events: 12 }],
      pages: [{ path: "/project/opencode", route_type: "project", actor_type: "human", pageviews: 12, visitors: 1 }],
      referrers: [], entities: [{ entity_type: "project", entity_slug: "opencode", actor_type: "human", event_type: "request", events: 12 }], searches: [], outbound: [],
      visitorPages: [{ visitor_id: "browser-bot", actor_name: "Browser", path: "/project/opencode", route_type: "project", requests: 12 }],
      sessionEntries: [{ session_id: "session-1", source: "direct", utm_source: "linkedin", first_seen: "2026-08-31 00:00:00" }]
    });

    expect(rollup.daily).toMatchObject({ human_pageviews: 12, suspected_automation_pageviews: 12, suspected_automation_visitors: 1 });
    expect(rollup.pages[0]).toMatchObject({ suspected_automation_pageviews: 12 });
    expect(rollup.entities[0]).toMatchObject({ suspected_automation_views: 12 });
    expect(rollup.acquisition).toEqual([{ date: "2026-08-31", source: "linkedin", sessions: 1 }]);
  });
});

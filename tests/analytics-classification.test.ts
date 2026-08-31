import { describe, expect, it } from "vitest";
import { classifyActor, classifyRoute, deviceType, isTrackableRequest } from "../src/lib/analytics/classify";

describe("analytics classification", () => {
  it("maps public routes without treating assets or admin traffic as content", () => {
    expect(classifyRoute("/project/open-hands")).toMatchObject({ routeType: "project", entitySlug: "open-hands" });
    expect(classifyRoute("/project/open-hands.json")).toMatchObject({ routeType: "api", entitySlug: "open-hands" });
    expect(classifyRoute("/agents").routeType).toBe("agents_index");
    expect(classifyRoute("/models").routeType).toBe("models_index");
    expect(classifyRoute("/robots").routeType).toBe("robots_index");
    expect(classifyRoute("/compare/a-vs-b").routeType).toBe("compare");
    expect(classifyRoute("/_astro/app.js").routeType).toBe("excluded");
    expect(classifyRoute("/admin/analytics/overview").routeType).toBe("admin");
  });

  it("separates people, search crawlers, AI crawlers, AI agents and API clients", () => {
    expect(classifyActor({ userAgent: "Mozilla/5.0 Chrome/126.0", pathname: "/" })).toMatchObject({ actorType: "human", actorName: "Chrome" });
    expect(classifyActor({ userAgent: "Googlebot/2.1", pathname: "/agents" })).toMatchObject({ actorType: "search_bot", actorName: "Googlebot" });
    expect(classifyActor({ userAgent: "GPTBot/1.2", pathname: "/models" })).toMatchObject({ actorType: "ai_crawler", actorName: "GPTBot" });
    expect(classifyActor({ userAgent: "ChatGPT-User/1.0", pathname: "/project/opencode" })).toMatchObject({ actorType: "ai_agent", actorName: "ChatGPT" });
    expect(classifyActor({ userAgent: "curl/8.7", pathname: "/api/knowledge/search" })).toMatchObject({ actorType: "api_client" });
    expect(classifyActor({ userAgent: "mystery-spider", pathname: "/" }).actorType).toBe("unknown_bot");
    expect(deviceType("Mozilla/5.0 (iPhone) Mobile")).toBe("mobile");
  });

  it("excludes internal telemetry and privileged routes", () => {
    expect(isTrackableRequest(new Request("https://openagent.bot/api/analytics/event", { method: "POST" }))).toBe(false);
    expect(isTrackableRequest(new Request("https://openagent.bot/api/internal/sync", { method: "POST" }))).toBe(false);
    expect(isTrackableRequest(new Request("https://openagent.bot/project/opencode"))).toBe(true);
  });
});

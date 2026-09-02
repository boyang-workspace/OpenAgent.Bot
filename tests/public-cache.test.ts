import { describe, expect, it } from "vitest";
import { cacheableDocumentResponse, isPublicDocumentRequest } from "../src/lib/http/public-cache";

describe("public document cache policy", () => {
  it("caches only canonical public HTML routes", () => {
    expect(isPublicDocumentRequest(new Request("https://www.openagent.bot/agents"))).toBe(true);
    expect(isPublicDocumentRequest(new Request("https://www.openagent.bot/project/openclaw"))).toBe(true);
    expect(isPublicDocumentRequest(new Request("https://www.openagent.bot/database?q=agent"))).toBe(false);
    expect(isPublicDocumentRequest(new Request("https://www.openagent.bot/api/v1/entities.json"))).toBe(false);
    expect(isPublicDocumentRequest(new Request("https://www.openagent.bot/models", { method: "HEAD" }))).toBe(false);
  });

  it("adds shared-cache headers only to successful HTML", () => {
    const html = cacheableDocumentResponse(new Response("<html></html>", { headers: { "content-type": "text/html; charset=utf-8" } }));
    expect(html?.headers.get("cache-control")).toContain("s-maxage=300");
    expect(cacheableDocumentResponse(new Response("{}", { headers: { "content-type": "application/json" } }))).toBeUndefined();
    expect(cacheableDocumentResponse(new Response("missing", { status: 404, headers: { "content-type": "text/html" } }))).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { analyticsCookie, authorizeAnalyticsRequest, createAnalyticsSession, verifyAnalyticsSession } from "../src/lib/analytics/auth";
import { acquisitionSource, dailyVisitorId, isSocialReferrerSource, normalizeReferrer, safeSearchValue, socialUtmSource, truncateIp, validSessionId } from "../src/lib/analytics/privacy";

describe("privacy-preserving analytics", () => {
  it("creates stable daily pseudonyms without retaining the raw IP", async () => {
    const first = await dailyVisitorId("test-secret", "2026-08-30", "203.0.113.99", "Example Browser");
    const repeat = await dailyVisitorId("test-secret", "2026-08-30", "203.0.113.42", "Example Browser");
    const tomorrow = await dailyVisitorId("test-secret", "2026-08-31", "203.0.113.99", "Example Browser");
    expect(first).toBe(repeat);
    expect(first).not.toBe(tomorrow);
    expect(first).toMatch(/^[a-f0-9]{32}$/);
    expect(first).not.toContain("203");
    expect(truncateIp("2001:db8:abcd:1234:5678::1")).toBe("2001:db8:abcd:1234::");
  });

  it("reduces referrers to source labels and rejects sensitive searches", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=private", "openagent.bot")).toBe("google");
    expect(normalizeReferrer("https://openagent.bot/database?q=agent", "openagent.bot")).toBe("internal");
    expect(normalizeReferrer("https://www.linkedin.com/posts/example", "openagent.bot")).toBe("linkedin");
    expect(normalizeReferrer("https://bsky.app/profile/openagent.bot", "openagent.bot")).toBe("bluesky");
    expect(normalizeReferrer("https://news.ycombinator.com/item?id=1", "openagent.bot")).toBe("hacker_news");
    expect(socialUtmSource("Twitter")).toBe("x");
    expect(acquisitionSource("direct", "linkedin")).toBe("linkedin");
    expect(acquisitionSource("google", "twitter")).toBe("google");
    expect(isSocialReferrerSource("discord")).toBe(true);
    expect(isSocialReferrerSource("google")).toBe(false);
    expect(safeSearchValue("Open source robot")).toBe("open source robot");
    expect(safeSearchValue("me@example.com")).toBeUndefined();
    expect(safeSearchValue("token=abc123")).toBeUndefined();
    expect(safeSearchValue("sk-1234567890abcdef")).toBeUndefined();
    expect(validSessionId("2d3c5fa4-5944-4f60-8ee7-0b25dd92c605")).toBeTruthy();
    expect(validSessionId("not-a-session")).toBeUndefined();
  });

  it("protects the private dashboard with signed, expiring sessions", async () => {
    const now = Date.UTC(2026, 7, 30, 10);
    const token = await createAnalyticsSession("owner-secret", now);
    expect(await verifyAnalyticsSession(token, "owner-secret", now + 1_000)).toBe(true);
    expect(await verifyAnalyticsSession(`${token}x`, "owner-secret", now + 1_000)).toBe(false);
    expect(await verifyAnalyticsSession(token, "owner-secret", now + 13 * 60 * 60 * 1_000)).toBe(false);
    const currentToken = await createAnalyticsSession("owner-secret");
    const cookieRequest = new Request("https://openagent.bot/admin/analytics", { headers: { cookie: `${analyticsCookie}=${currentToken}` } });
    expect(await authorizeAnalyticsRequest(cookieRequest, "owner-secret")).toBe(true);
    expect(await authorizeAnalyticsRequest(new Request("https://openagent.bot/admin/analytics"), "owner-secret")).toBe(false);
  });
});

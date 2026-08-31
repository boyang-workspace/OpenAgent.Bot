import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dashboard = readFileSync(new URL("../src/components/AdminAnalyticsDashboard.astro", import.meta.url), "utf8");

describe("analytics acquisition dashboard", () => {
  it("uses session entry sources and excludes internal referrals from acquisition", () => {
    expect(dashboard).toContain("Social &amp; community");
    expect(dashboard).toContain("Social entry sessions");
    expect(dashboard).toContain("External session entry sources");
    expect(dashboard).toContain("Internal referrals are deliberately excluded from acquisition");
    expect(dashboard).toContain("Active social channels");
  });
});

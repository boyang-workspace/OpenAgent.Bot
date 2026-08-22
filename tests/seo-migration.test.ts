import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSeo } from "../src/lib/seo";

describe("SEO consolidation", () => {
  it("builds canonical metadata on the www origin", () => {
    const seo = buildSeo({ path: "/project/openclaw" });
    expect(seo.canonical).toBe("https://www.openagent.bot/project/openclaw");
    expect(seo.image.startsWith("https://www.openagent.bot/")).toBe(true);
  });

  it("keeps legacy product paths on non-404 destinations", () => {
    const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
    expect(redirects).toContain("/agents/:slug /project/:slug 301");
    expect(redirects).toContain("/evaluations /methodology 301");
    expect(redirects).toContain("/recommendations/* /database 301");
  });
});

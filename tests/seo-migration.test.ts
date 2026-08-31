import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSeo } from "../src/lib/seo";

describe("SEO consolidation", () => {
  it("builds canonical metadata on the www origin", () => {
    const seo = buildSeo({ path: "/project/openclaw" });
    expect(seo.canonical).toBe("https://www.openagent.bot/project/openclaw");
    expect(seo.image.startsWith("https://www.openagent.bot/")).toBe(true);
  });

  it("uses an X-compatible 1200 × 630 PNG as the default social card", () => {
    const seo = buildSeo({ title: "Open models", path: "/models" });
    expect(seo.image).toBe("https://www.openagent.bot/og-openagent-x.png");
    expect(seo.imageType).toBe("image/png");
    expect(seo.imageWidth).toBe(1200);
    expect(seo.imageHeight).toBe(630);
    expect(seo.imageAlt).toContain("Open models");
    expect(existsSync(new URL("../public/og-openagent-x.png", import.meta.url))).toBe(true);
  });

  it("keeps generated search snippets within practical title and description limits", () => {
    const seo = buildSeo({
      title: "A very long project name with activity openness evidence and a deliberately verbose qualifier",
      description: "A deliberately long description ".repeat(10)
    });
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.title.endsWith(" | OpenAgent.bot")).toBe(true);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });

  it("keeps legacy product paths on non-404 destinations", () => {
    const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
    expect(redirects).toContain("/agents/:slug /project/:slug 301");
    expect(redirects).toContain("/evaluations /methodology 301");
    expect(redirects).toContain("/recommendations/* /database 301");
    expect(redirects).not.toContain("/blog/* /changes 301");
    expect(redirects).not.toContain("/blog/*");
    expect(redirects).toContain("/blog/langfuse-vs-mlflow /compare/langfuse-vs-mlflow 301");
    expect(redirects).not.toContain("/prototypes / 301");
    expect(redirects).not.toContain("/prototypes/* / 301");
  });

  it("preserves extensions when redirecting legacy machine-readable entity URLs", () => {
    const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
    expect(redirects).toContain("/agents/:slug /project/:slug 301");
    expect(redirects).toContain("/models/:slug /project/:slug 301");
    expect(redirects).not.toContain("/agents/:slug /database");
    expect(redirects).not.toContain("/project/genesis-world.json /project/genesis.json 301");
  });
});

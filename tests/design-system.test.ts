import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("shared product design system", () => {
  it("uses the same header and footer in both layouts", () => {
    const baseLayout = read("../src/layouts/BaseLayout.astro");
    const indexLayout = read("../src/layouts/IndexLayout.astro");
    for (const layout of [baseLayout, indexLayout]) {
      expect(layout).toContain("<Header />");
      expect(layout).toContain("<Footer />");
      expect(layout).toContain("@/styles/global.css");
    }
  });

  it("keeps the homepage from reintroducing a private navigation shell", () => {
    const homepage = read("../src/pages/index.astro");
    expect(homepage).not.toContain("index-header");
    expect(homepage).not.toContain("index-footer");
  });

  it("places verified open agent usage on the homepage with a full usage route", () => {
    const homepage = read("../src/pages/index.astro");
    expect(homepage).toContain('getUsage().pageData("app", { openOnly: true, days: 7 })');
    expect(homepage).toContain("Open agent usage");
    expect(homepage).toContain('/usage?kind=app&scope=open&days=30');
    expect(homepage).toContain("previous complete UTC day");
  });

  it("uses one product navigation on every route", () => {
    const header = read("../src/components/Header.astro");
    const site = read("../src/config/site.ts");
    expect(header).not.toContain("isHome ? [");
    expect(site).toContain('{ label: "Models", href: "/models" }');
    expect(site).toContain('{ label: "Agents", href: "/agents" }');
    expect(site).toContain('{ label: "Robot Models", href: "/robot-models" }');
    expect(site).toContain('{ label: "Robots", href: "/robots" }');
    expect(site).toContain('{ label: "Changes", href: "/changes" }');
    expect(site).toContain('{ label: "Database", href: "/database" }');
  });

  it("publishes canonical ranking and change-feed routes", () => {
    expect(existsSync(new URL("../src/pages/rankings.astro", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../src/pages/changes.astro", import.meta.url))).toBe(true);
    const sitemap = read("../src/pages/sitemap.xml.ts");
    const redirects = read("../public/_redirects");
    expect(sitemap).toMatch(/"\/rankings"/);
    expect(sitemap).toMatch(/"\/changes"/);
    expect(redirects).not.toMatch(/^\/rankings /m);
    expect(redirects).not.toMatch(/^\/changes /m);
  });

  it("uses the homepage type system globally", () => {
    const baseLayout = read("../src/layouts/BaseLayout.astro");
    const globalCss = read("../src/styles/global.css");
    expect(baseLayout).toContain("Inter:wght");
    expect(globalCss).toContain('--sans: "Inter"');
    expect(`${baseLayout}${globalCss}`).not.toMatch(/IBM Plex|Instrument Serif/);
  });

  it("publishes four explicit primary database routes", () => {
    for (const path of ["models.astro", "agents.astro", "robot-models.astro", "robots.astro"]) {
      expect(existsSync(new URL(`../src/pages/${path}`, import.meta.url))).toBe(true);
    }
    const redirects = read("../public/_redirects");
    expect(redirects).not.toMatch(/^\/models /m);
  });
});

describe("database workspace", () => {
  it("keeps desktop results and the inspector in bounded scroll panes", () => {
    const database = read("../src/pages/database/index.astro");
    const table = read("../src/components/RegistryTable.astro");
    const inspector = read("../src/components/RecordInspector.astro");
    expect(database).toContain("height: calc(100dvh - var(--header-height))");
    expect(table).toContain("overscroll-behavior: contain");
    expect(inspector).toContain("overflow-y: auto");
  });

  it("keeps the Database status strip compact", () => {
    const database = read("../src/pages/database/index.astro");
    expect(database).toContain("min-height: 44px");
    expect(database).toContain("aria-label=\"Database domains\"");
    expect(database).not.toContain("<dl>");
    expect(database).not.toContain("Registry explorer");
  });
});

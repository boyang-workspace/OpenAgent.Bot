import { readFileSync } from "node:fs";
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

  it("uses the homepage type system globally", () => {
    const baseLayout = read("../src/layouts/BaseLayout.astro");
    const globalCss = read("../src/styles/global.css");
    expect(baseLayout).toContain("Spline+Sans");
    expect(baseLayout).toContain("Azeret+Mono");
    expect(`${baseLayout}${globalCss}`).not.toMatch(/IBM Plex|Instrument Serif/);
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
});

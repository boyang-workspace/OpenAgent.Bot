import { describe, expect, it } from "vitest";
import { canonicalRedirect } from "../src/lib/http/canonical";

describe("canonical domain redirect", () => {
  it("redirects the apex domain to https www while preserving path and query", () => {
    expect(canonicalRedirect("https://openagent.bot/project/openclaw?view=history")?.toString())
      .toBe("https://www.openagent.bot/project/openclaw?view=history");
  });

  it("does not redirect the canonical host", () => {
    expect(canonicalRedirect("https://www.openagent.bot/database?kind=robot")).toBeUndefined();
  });
});

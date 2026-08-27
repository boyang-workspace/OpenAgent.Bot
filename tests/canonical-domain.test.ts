import { describe, expect, it } from "vitest";
import { canonicalPath, canonicalRedirect } from "../src/lib/http/canonical";

describe("canonical domain redirect", () => {
  it("redirects the apex domain to https www while preserving path and query", () => {
    expect(canonicalRedirect("https://openagent.bot/project/openclaw?view=history")?.toString())
      .toBe("https://www.openagent.bot/project/openclaw?view=history");
  });

  it("does not redirect the canonical host", () => {
    expect(canonicalRedirect("https://www.openagent.bot/database?kind=robot")).toBeUndefined();
  });

  it("normalizes trailing slashes on canonical pages", () => {
    expect(canonicalRedirect("https://www.openagent.bot/project/openclaw/")?.toString())
      .toBe("https://www.openagent.bot/project/openclaw");
  });

  it("moves legacy entity URLs to their one canonical project URL", () => {
    expect(canonicalRedirect("http://openagent.bot/agents/hermes-agent/?ref=old")?.toString())
      .toBe("https://www.openagent.bot/project/hermes-agent?ref=old");
    expect(canonicalPath("/skills/lottie/")).toBe("/project/lottie");
    expect(canonicalPath("/robot/openarm/")).toBe("/project/openarm");
    expect(canonicalPath("/robots/reachy-2/")).toBe("/project/reachy-2");
  });

  it("preserves high-intent comparisons instead of sending them to a generic page", () => {
    expect(canonicalPath("/blog/langfuse-vs-mlflow/")).toBe("/compare/langfuse-vs-mlflow");
  });

  it("consolidates the shorter agent landing alias", () => {
    expect(canonicalPath("/open-source-agents/")).toBe("/agents");
    expect(canonicalPath("/open-source-ai-agents/")).toBe("/agents");
  });
});

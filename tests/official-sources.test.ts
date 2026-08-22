import { describe, expect, it } from "vitest";
import { officialSources } from "../src/lib/registry/official-sources";

describe("official source catalog", () => {
  it("uses unique stable identifiers", () => {
    const ids = officialSources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers global, US and Chinese official publishers", () => {
    expect(officialSources.some((source) => source.publisher === "NVIDIA")).toBe(true);
    expect(officialSources.filter((source) => source.region === "us").length).toBeGreaterThanOrEqual(5);
    expect(officialSources.filter((source) => source.region === "cn").length).toBeGreaterThanOrEqual(8);
  });

  it("does not claim every registered website has an active connector", () => {
    const active = officialSources.filter((source) => source.automationStatus === "active");
    expect(active.every((source) => source.connector !== "html")).toBe(true);
  });
});

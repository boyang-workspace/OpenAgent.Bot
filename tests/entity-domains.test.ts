import { describe, expect, it } from "vitest";
import { domainLabel, parseEntityDomains } from "../src/lib/registry/domains";

describe("entity domains", () => {
  it("parses unique supported fields and ignores unknown values", () => {
    expect(parseEntityDomains("robotics|agent|robotics|unknown")).toEqual(["robotics", "agent"]);
  });

  it("uses product-facing labels", () => {
    expect(domainLabel("agent")).toBe("Agent");
    expect(domainLabel("robotics")).toBe("Robotics");
    expect(domainLabel("shared-infrastructure")).toBe("Shared infrastructure");
  });
});

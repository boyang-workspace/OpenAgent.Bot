import { describe, expect, it } from "vitest";
import { deriveFactChange, stableStringify } from "../src/lib/registry/observations";

describe("registry observations", () => {
  it("treats objects with different key order as the same fact", () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
    expect(deriveFactChange({ b: 2, a: 1 }, { a: 1, b: 2 })).toBeUndefined();
  });

  it("classifies fact lifecycle changes", () => {
    expect(deriveFactChange(undefined, "MIT")).toEqual({ changeType: "created", nextValue: "MIT" });
    expect(deriveFactChange("MIT", "Apache-2.0")).toEqual({
      changeType: "updated",
      previousValue: "MIT",
      nextValue: "Apache-2.0"
    });
    expect(deriveFactChange("MIT", undefined)).toEqual({ changeType: "removed", previousValue: "MIT" });
  });
});

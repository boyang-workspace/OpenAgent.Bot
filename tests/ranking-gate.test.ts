import { describe, expect, it } from "vitest";
import { evaluateRankingGate } from "../src/lib/registry/rankings";

describe("ranking publication gate", () => {
  it("keeps rankings in collection before history and coverage thresholds", () => {
    const result = evaluateRankingGate({ historyDays: 12, coverage: 0.72, entityCount: 50 });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toHaveLength(2);
  });

  it("publishes only sufficiently broad, mature cohorts", () => {
    expect(evaluateRankingGate({ historyDays: 30, coverage: 0.8, entityCount: 10 })).toEqual({
      eligible: true,
      reasons: []
    });
  });
});

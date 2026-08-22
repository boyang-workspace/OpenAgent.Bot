export type RankingGateInput = {
  historyDays: number;
  coverage: number;
  entityCount: number;
  minimumHistoryDays?: number;
  minimumCoverage?: number;
};

export type RankingGateResult = {
  eligible: boolean;
  reasons: string[];
};

export function evaluateRankingGate(input: RankingGateInput): RankingGateResult {
  const minimumHistoryDays = input.minimumHistoryDays ?? 30;
  const minimumCoverage = input.minimumCoverage ?? 0.8;
  const reasons: string[] = [];
  if (input.historyDays < minimumHistoryDays) reasons.push(`needs ${minimumHistoryDays - input.historyDays} more history days`);
  if (input.coverage < minimumCoverage) reasons.push(`coverage ${(input.coverage * 100).toFixed(1)}% is below ${(minimumCoverage * 100).toFixed(1)}%`);
  if (input.entityCount < 10) reasons.push("cohort has fewer than 10 entities");
  return { eligible: reasons.length === 0, reasons };
}

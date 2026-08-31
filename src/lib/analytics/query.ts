export type AnalyticsSqlRow = Record<string, string | number | null>;

export class AnalyticsQueryError extends Error {}

export class AnalyticsEngineQuery {
  constructor(private readonly accountId?: string, private readonly token?: string, private readonly fetcher: typeof fetch = fetch) {}

  configured(): boolean { return Boolean(this.accountId && this.token); }

  async run(sql: string): Promise<AnalyticsSqlRow[]> {
    if (!this.accountId || !this.token) throw new AnalyticsQueryError("Analytics Engine read credentials are not configured.");
    // Workers native functions require their original global receiver. Reading
    // the function into a local avoids calling it as `this.fetcher(...)`.
    const fetcher = this.fetcher;
    const response = await fetcher(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/analytics_engine/sql`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "text/plain; charset=utf-8" },
      body: sql
    });
    if (!response.ok) throw new AnalyticsQueryError(`Analytics Engine query failed (${response.status}).`);
    const payload = await response.json() as unknown;
    if (Array.isArray(payload)) return payload as AnalyticsSqlRow[];
    if (payload && typeof payload === "object") {
      const record = payload as { data?: AnalyticsSqlRow[]; result?: { data?: AnalyticsSqlRow[] } | AnalyticsSqlRow[] };
      if (Array.isArray(record.data)) return record.data;
      if (Array.isArray(record.result)) return record.result;
      if (record.result && !Array.isArray(record.result) && Array.isArray(record.result.data)) return record.result.data;
    }
    return [];
  }
}

export function analyticsWindow(days: number): number {
  return [1, 7, 30, 90].includes(days) ? days : 30;
}

export function sqlTimestamp(value: Date): string {
  return value.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

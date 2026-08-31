/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare/types" />

type OpenAgentD1PreparedStatement = import("./lib/registry/repository").D1Statement;

interface D1Database {
  prepare(query: string): OpenAgentD1PreparedStatement;
  batch(statements: OpenAgentD1PreparedStatement[]): Promise<Array<import("./lib/registry/repository").D1Result<unknown>>>;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface AnalyticsEngineDataPoint {
  indexes?: string[];
  blobs?: string[];
  doubles?: number[];
}

interface AnalyticsEngineDataset {
  writeDataPoint(event: AnalyticsEngineDataPoint): void;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
}

interface ScheduledController {
  scheduledTime: number;
  cron: string;
  noRetry(): void;
}

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  PUBLIC_SITE_URL: string;
  ANALYTICS?: AnalyticsEngineDataset;
  ANALYTICS_SECRET?: string;
  ANALYTICS_ADMIN_SECRET?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  ANALYTICS_API_TOKEN?: string;
  SYNC_TOKEN?: string;
  GITHUB_TOKEN?: string;
  OPENROUTER_API_KEY?: string;
  HUMANITY_HASH_SALT?: string;
}

declare module "cloudflare:workers" {
  export const env: Env;
}

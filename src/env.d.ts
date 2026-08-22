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

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  PUBLIC_SITE_URL: string;
  SYNC_TOKEN?: string;
  GITHUB_TOKEN?: string;
}

declare module "cloudflare:workers" {
  export const env: Env;
}

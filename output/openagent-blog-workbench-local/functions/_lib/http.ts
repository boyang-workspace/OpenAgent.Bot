import type { Env } from "./types";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {})
    }
  });
}

export function error(message: string, status = 400): Response {
  return json({ ok: false, error: message }, { status });
}

export function ok(data: Record<string, unknown> = {}): Response {
  return json({ ok: true, ...data });
}

export function requireAdmin(request: Request, env: Env): Response | undefined {
  if (!env.ADMIN_EMAIL) return undefined;

  const email = request.headers.get("cf-access-authenticated-user-email");
  // Cloudflare Access protects /admin* before the request reaches Pages.
  // The authenticated email header is not consistently visible to Pages Functions,
  // so treat it as an extra check only when Cloudflare forwards it.
  if (!email) return undefined;

  if (email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
    return undefined;
  }

  return error("Admin access required.", 401);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}

export function actorFromRequest(request: Request): "human" | "codex" | "automation" {
  const actor = request.headers.get("x-openagent-actor")?.toLowerCase();
  if (actor === "codex" || actor === "automation") return actor;
  return "human";
}

export function boolParam(request: Request, key: string): boolean {
  return new URL(request.url).searchParams.get(key) === "true";
}

export async function hashIp(request: Request): Promise<string | undefined> {
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip) return undefined;

  const encoded = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

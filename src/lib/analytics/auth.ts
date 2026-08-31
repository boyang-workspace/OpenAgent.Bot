const encoder = new TextEncoder();
export const analyticsCookie = "openagent_analytics_admin";

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signature(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(left)), crypto.subtle.digest("SHA-256", encoder.encode(right))]);
  const aa = new Uint8Array(a), bb = new Uint8Array(b);
  let mismatch = aa.length ^ bb.length;
  for (let index = 0; index < Math.min(aa.length, bb.length); index++) mismatch |= aa[index] ^ bb[index];
  return mismatch === 0;
}

export async function createAnalyticsSession(secret: string, now = Date.now()): Promise<string> {
  const expires = Math.floor((now + 12 * 60 * 60 * 1000) / 1000);
  const value = `v1.${expires}`;
  return `${value}.${await signature(secret, value)}`;
}

export async function verifyAnalyticsSession(token: string | undefined, secret: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !secret) return false;
  const [version, expiresText, supplied] = token.split(".");
  if (version !== "v1" || !/^\d{10}$/.test(expiresText ?? "") || !supplied || Number(expiresText) * 1000 <= now) return false;
  return timingSafeEqual(supplied, await signature(secret, `${version}.${expiresText}`));
}

function cookieValue(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

export async function authorizeAnalyticsRequest(request: Request, secret: string | undefined): Promise<boolean> {
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && await timingSafeEqual(bearer, secret)) return true;
  return verifyAnalyticsSession(cookieValue(request, analyticsCookie), secret);
}

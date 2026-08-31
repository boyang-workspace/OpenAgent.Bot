const encoder = new TextEncoder();

export const socialReferrerSources = new Set([
  "x", "reddit", "linkedin", "facebook", "instagram", "youtube", "tiktok",
  "discord", "telegram", "bluesky", "mastodon", "wechat", "zhihu",
  "hacker_news", "product_hunt", "medium", "substack", "dev_to"
]);

const socialSourceAliases = new Map<string, string>([
  ["x", "x"], ["twitter", "x"], ["t.co", "x"],
  ["reddit", "reddit"], ["linkedin", "linkedin"],
  ["facebook", "facebook"], ["fb", "facebook"],
  ["instagram", "instagram"], ["ig", "instagram"], ["youtube", "youtube"],
  ["tiktok", "tiktok"], ["discord", "discord"], ["telegram", "telegram"],
  ["bluesky", "bluesky"], ["bsky", "bluesky"], ["mastodon", "mastodon"],
  ["wechat", "wechat"], ["weixin", "wechat"], ["zhihu", "zhihu"],
  ["hacker_news", "hacker_news"], ["hackernews", "hacker_news"], ["hn", "hacker_news"],
  ["product_hunt", "product_hunt"], ["producthunt", "product_hunt"],
  ["medium", "medium"], ["substack", "substack"], ["dev_to", "dev_to"], ["devto", "dev_to"]
]);

async function hmac(key: BufferSource, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
}

function hex(value: ArrayBuffer): string {
  return [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function truncateIp(ip: string | null): string {
  if (!ip) return "unknown";
  if (ip.includes(".")) return ip.split(".").slice(0, 3).concat("0").join(".");
  if (ip.includes(":")) return `${ip.split(":").slice(0, 4).join(":")}::`;
  return "unknown";
}

export async function dailyVisitorId(secret: string | undefined, date: string, ip: string | null, userAgent: string | null): Promise<string | undefined> {
  if (!secret) return undefined;
  const dailySalt = await hmac(encoder.encode(secret), date);
  return hex(await hmac(dailySalt, `${truncateIp(ip)}|${(userAgent ?? "").toLowerCase().replace(/\s+/g, " ").slice(0, 300)}`)).slice(0, 32);
}

export function normalizeReferrer(referrer: string | null, siteHost: string): string {
  if (!referrer) return "direct";
  let host: string;
  try { host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, ""); } catch { return "other"; }
  if (host === siteHost.replace(/^www\./, "")) return "internal";
  if (host.includes("google.")) return "google";
  if (host.includes("bing.")) return "bing";
  if (["x.com", "twitter.com", "t.co"].includes(host)) return "x";
  if (host.endsWith("reddit.com")) return "reddit";
  if (host.endsWith("linkedin.com")) return "linkedin";
  if (host.endsWith("facebook.com") || host === "fb.com") return "facebook";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "youtube";
  if (host.endsWith("tiktok.com")) return "tiktok";
  if (host.endsWith("discord.com") || host === "discord.gg") return "discord";
  if (host.endsWith("telegram.org") || host === "t.me") return "telegram";
  if (host.endsWith("bsky.app")) return "bluesky";
  if (/(?:^|\.)mastodon\.|(?:^|\.)mstdn\.|(?:^|\.)fosstodon\./.test(host)) return "mastodon";
  if (host.endsWith("weixin.qq.com") || host.endsWith("wechat.com")) return "wechat";
  if (host.endsWith("zhihu.com")) return "zhihu";
  if (host === "news.ycombinator.com") return "hacker_news";
  if (host.endsWith("producthunt.com")) return "product_hunt";
  if (host.endsWith("medium.com")) return "medium";
  if (host.endsWith("substack.com")) return "substack";
  if (host === "dev.to" || host.endsWith("dev.to")) return "dev_to";
  if (host === "github.com") return "github";
  if (host.endsWith("huggingface.co")) return "huggingface";
  if (host.includes("chatgpt.com") || host.includes("openai.com")) return "chatgpt";
  if (host.includes("claude.ai") || host.includes("anthropic.com")) return "claude";
  if (host.includes("perplexity.ai")) return "perplexity";
  return "other";
}

export function socialUtmSource(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return normalized ? socialSourceAliases.get(normalized) : undefined;
}

export function acquisitionSource(referrerSource: string, utmSource: string | null | undefined): string {
  return ["direct", "other", ""].includes(referrerSource) ? (socialUtmSource(utmSource) ?? referrerSource) || "direct" : referrerSource;
}

export function isSocialReferrerSource(source: string): boolean {
  return socialReferrerSources.has(source);
}

export function cleanDimension(value: unknown, max = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  return cleaned || undefined;
}

export function safeSearchValue(value: unknown): string | undefined {
  const cleaned = cleanDimension(value, 100)?.toLowerCase();
  if (!cleaned) return undefined;
  if (/@|https?:\/\/|bearer\s|(?:token|key|secret|password)\s*[:=]|\bsk-[a-z0-9_-]{12,}/i.test(cleaned)) return undefined;
  return cleaned;
}

export function validSessionId(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;
}

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { classifyActor, classifyRoute, deviceType } from "@/lib/analytics/classify";
import { writeAnalyticsEvent } from "@/lib/analytics/events";
import { cleanDimension, dailyVisitorId, normalizeReferrer, safeSearchValue, validSessionId } from "@/lib/analytics/privacy";
import type { ClientAnalyticsPayload } from "@/lib/analytics/types";

const allowedEvents = new Set<ClientAnalyticsPayload["eventType"]>(["page_view", "internal_search", "search_result_click", "filter_change", "compare_open", "compare_add_project", "outbound_click", "evidence_click", "source_click", "api_docs_click", "api_copy", "project_related_click"]);
const targetTypes = new Set(["github", "huggingface", "official_site", "docs", "paper", "source", "evidence", "other", "filter", "project", "compare", "api"]);

export const POST: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return Response.json({ error: "Payload too large" }, { status: 413 });
  let payload: ClientAnalyticsPayload;
  try { payload = await request.json() as ClientAnalyticsPayload; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!payload || !allowedEvents.has(payload.eventType) || typeof payload.path !== "string" || !payload.path.startsWith("/")) return Response.json({ error: "Invalid event" }, { status: 400 });

  const path = new URL(payload.path, requestUrl.origin).pathname.slice(0, 300);
  const route = classifyRoute(path);
  if (route.routeType === "admin" || route.routeType === "excluded") return new Response(null, { status: 204 });
  const userAgent = request.headers.get("user-agent");
  const actor = classifyActor({ userAgent, pathname: path, accept: request.headers.get("accept") });
  const entitySlug = typeof payload.entitySlug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.entitySlug) ? payload.entitySlug : route.entitySlug;
  const eventTarget = cleanDimension(payload.eventTarget, 40);
  const eventValue = payload.eventType === "internal_search" || payload.eventType === "search_result_click"
    ? safeSearchValue(payload.eventValue)
    : cleanDimension(payload.eventValue, 100)?.replace(/[?#].*$/, "");
  const visitorId = actor.actorType === "human" ? await dailyVisitorId(env.ANALYTICS_SECRET, new Date().toISOString().slice(0, 10), request.headers.get("cf-connecting-ip"), userAgent) : undefined;
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  writeAnalyticsEvent(env.ANALYTICS, {
    eventType: payload.eventType,
    ...actor,
    path,
    routeType: route.routeType,
    entityType: entitySlug ? "project" : route.entityType,
    entitySlug,
    referrerSource: normalizeReferrer(typeof payload.referrer === "string" ? payload.referrer.slice(0, 2048) : request.headers.get("referer"), requestUrl.hostname),
    country: cleanDimension(cf?.country ?? request.headers.get("cf-ipcountry"), 8),
    deviceType: deviceType(userAgent),
    browser: actor.actorType === "human" ? actor.actorName : undefined,
    utmSource: cleanDimension(payload.utmSource, 80),
    utmMedium: cleanDimension(payload.utmMedium, 80),
    utmCampaign: cleanDimension(payload.utmCampaign, 100),
    eventTarget: eventTarget && targetTypes.has(eventTarget) ? eventTarget : eventTarget ? "other" : undefined,
    eventValue,
    visitorId,
    sessionId: validSessionId(payload.sessionId),
    method: request.method,
    numericValue: Number.isFinite(payload.numericValue) ? Math.max(0, Math.min(Number(payload.numericValue), 1_000_000)) : undefined
  });
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
};

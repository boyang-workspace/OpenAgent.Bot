import type { AnalyticsEvent } from "./types";
import { classifyActor, classifyRoute, deviceType } from "./classify";
import { cleanDimension, dailyVisitorId, normalizeReferrer } from "./privacy";

export function writeAnalyticsEvent(dataset: AnalyticsEngineDataset | undefined, event: AnalyticsEvent): void {
  if (!dataset) return;
  try {
    dataset.writeDataPoint({
      indexes: ["openagent"],
      blobs: [
        event.eventType, event.actorType, event.actorName ?? "", event.path, event.routeType,
        event.entityType ?? "", event.entitySlug ?? "", event.referrerSource ?? "", event.country ?? "",
        event.deviceType ?? "", event.browser ?? "", event.utmSource ?? "", event.utmMedium ?? "",
        event.utmCampaign ?? "", event.eventTarget ?? "", event.eventValue ?? "", event.visitorId ?? "",
        event.sessionId ?? "", event.method ?? "", ""
      ],
      doubles: [event.status ?? 0, event.responseMs ?? 0, event.responseBytes ?? 0, event.actorConfidence ?? 0, event.numericValue ?? -1]
    });
  } catch {
    // Telemetry must never affect a public response.
  }
}

export async function requestAnalyticsEvent(request: Request, response: Response, responseMs: number, secret: string | undefined): Promise<AnalyticsEvent> {
  const url = new URL(request.url);
  const route = classifyRoute(url.pathname);
  const userAgent = request.headers.get("user-agent");
  const actor = classifyActor({ userAgent, pathname: url.pathname, accept: request.headers.get("accept") });
  const date = new Date().toISOString().slice(0, 10);
  const visitorId = actor.actorType === "human" ? await dailyVisitorId(secret, date, request.headers.get("cf-connecting-ip"), userAgent) : undefined;
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  return {
    eventType: "request",
    ...actor,
    path: url.pathname,
    routeType: route.routeType,
    entityType: route.entityType,
    entitySlug: route.entitySlug,
    referrerSource: normalizeReferrer(request.headers.get("referer"), url.hostname),
    country: cleanDimension(cf?.country ?? request.headers.get("cf-ipcountry"), 8),
    deviceType: deviceType(userAgent),
    browser: actor.actorType === "human" ? actor.actorName : undefined,
    utmSource: cleanDimension(url.searchParams.get("utm_source"), 80),
    utmMedium: cleanDimension(url.searchParams.get("utm_medium"), 80),
    utmCampaign: cleanDimension(url.searchParams.get("utm_campaign"), 100),
    visitorId,
    method: request.method,
    status: response.status,
    responseMs,
    responseBytes: Number(response.headers.get("content-length") ?? 0) || undefined
  };
}

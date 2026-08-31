import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { canonicalRedirect } from "@/lib/http/canonical";
import { classifyRoute, isTrackableRequest } from "@/lib/analytics/classify";
import { requestAnalyticsEvent, writeAnalyticsEvent } from "@/lib/analytics/events";

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  const redirect = canonicalRedirect(request.url);
  if (redirect) return Response.redirect(redirect, 301);
  const route = classifyRoute(new URL(request.url).pathname);
  if (!isTrackableRequest(request, route)) return next();
  const startedAt = performance.now();
  const response = await next();
  const telemetry = requestAnalyticsEvent(request, response, performance.now() - startedAt, env.ANALYTICS_SECRET)
    .then((event) => writeAnalyticsEvent(env.ANALYTICS, event))
    .catch(() => undefined);
  locals.cfContext.waitUntil(telemetry);
  return response;
});

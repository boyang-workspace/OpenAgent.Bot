import { handle } from "@astrojs/cloudflare/handler";
import { runAnalyticsRollup } from "@/lib/analytics/rollup";
import { isTrackableRequest } from "@/lib/analytics/classify";
import { requestAnalyticsEvent, writeAnalyticsEvent } from "@/lib/analytics/events";
import { cacheableDocumentResponse, isPublicDocumentRequest } from "@/lib/http/public-cache";

// The Workers runtime exposes caches.default while the DOM CacheStorage type
// used by Astro only declares open()/keys()/match().
const edgeCache = (globalThis.caches as CacheStorage & { default: Cache }).default;

function trackRequest(request: Request, response: Response, environment: Env, context: ExecutionContext, startedAt: number) {
  if (!isTrackableRequest(request)) return;
  context.waitUntil(requestAnalyticsEvent(request, response, performance.now() - startedAt, environment.ANALYTICS_SECRET)
    .then((event) => writeAnalyticsEvent(environment.ANALYTICS, event))
    .catch(() => undefined));
}

export default {
  async fetch(request: Request, environment: Env, context: ExecutionContext) {
    const startedAt = performance.now();
    const canCache = isPublicDocumentRequest(request);
    const cached = canCache ? await edgeCache.match(request) : undefined;
    if (cached) {
      trackRequest(request, cached, environment, context, startedAt);
      return cached;
    }

    const response = await handle(request, environment, context);
    const cacheable = canCache ? cacheableDocumentResponse(response) : undefined;
    if (cacheable) context.waitUntil(edgeCache.put(request, cacheable.clone()).catch(() => undefined));
    trackRequest(request, cacheable ?? response, environment, context, startedAt);
    return cacheable ?? response;
  },
  async scheduled(_controller: ScheduledController, environment: Env, context: ExecutionContext) {
    context.waitUntil(runAnalyticsRollup(environment));
  }
};

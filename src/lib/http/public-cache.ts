const CACHEABLE_PATH = /^\/(?:$|agents$|models$|robot-models$|robots$|robotics$|database$|rankings$|pulse$|changes$|sources$|usage$|project\/[a-z0-9-]+$|compare(?:\/[a-z0-9-]+)?$)/;

export function isPublicDocumentRequest(request: Request): boolean {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  // Query variants are intentionally left uncached. This avoids an unbounded
  // cache keyspace from search/filter bots while preserving exact user views.
  return !url.search && CACHEABLE_PATH.test(url.pathname);
}

export function cacheableDocumentResponse(response: Response): Response | undefined {
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return undefined;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

import type { APIRoute } from "astro";
import { entityDomains, entityKinds, opennessStatuses, type EntityDomain, type EntityKind, type OpennessStatus } from "@/lib/registry/types";
import { getRegistry } from "@/lib/registry/runtime";

export const GET: APIRoute = async ({ url }) => {
  const requestedKind = url.searchParams.get("kind") ?? "";
  const requestedOpenness = url.searchParams.get("openness") ?? "";
  const requestedDomain = url.searchParams.get("domain") ?? "";
  const kind = entityKinds.includes(requestedKind as EntityKind) ? requestedKind as EntityKind : undefined;
  const openness = opennessStatuses.includes(requestedOpenness as OpennessStatus) ? requestedOpenness as OpennessStatus : undefined;
  const domain = entityDomains.includes(requestedDomain as EntityDomain) ? requestedDomain as EntityDomain : undefined;
  const sort = url.searchParams.get("sort") === "stars" ? "stars" : url.searchParams.get("sort") === "name" ? "name" : "updated";
  const requestedLimit = Number(url.searchParams.get("limit") ?? 40);
  const requestedOffset = Number(url.searchParams.get("offset") ?? 0);
  const result = await getRegistry().listEntities({
    q: url.searchParams.get("q") ?? undefined,
    domains: domain ? [domain] : undefined,
    kinds: kind ? [kind] : undefined,
    openness: openness ? [openness] : undefined,
    sort,
    limit: Number.isFinite(requestedLimit) ? requestedLimit : 40,
    offset: Number.isFinite(requestedOffset) ? requestedOffset : 0
  });
  return Response.json({ apiVersion: "v1", ...result }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
};

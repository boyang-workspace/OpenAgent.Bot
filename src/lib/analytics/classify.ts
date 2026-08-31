import { botRegistry } from "./bot-registry";
import type { ActorClassification, RouteClassification } from "./types";

const staticExtension = /\.(?:js|css|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|map|xml|txt)$/i;
const apiClientPattern = /curl|wget|python-requests|python-httpx|go-http-client|postmanruntime|insomnia|axios|node-fetch|undici|okhttp/i;
const unknownBotPattern = /bot|crawler|spider|scrapy|headless|lighthouse|validator|monitor|uptime/i;

export function classifyRoute(pathname: string): RouteClassification {
  const path = pathname.replace(/\/{2,}/g, "/");
  if (path.startsWith("/_astro/") || path.startsWith("/assets/") || path.startsWith("/images/") || path.startsWith("/fonts/") || staticExtension.test(path) || ["/robots.txt", "/sitemap.xml"].includes(path)) return { routeType: "excluded" };
  if (path === "/") return { routeType: "home" };
  if (path === "/agents") return { routeType: "agents_index" };
  if (path === "/models") return { routeType: "models_index" };
  if (path === "/robots") return { routeType: "robots_index" };
  if (path === "/robot-models") return { routeType: "robot_models_index" };
  const project = path.match(/^\/project\/([a-z0-9-]+)(?:\.(?:json|md))?$/);
  if (project) return { routeType: path.endsWith(".json") || path.endsWith(".md") ? "api" : "project", entityType: "project", entitySlug: project[1] };
  if (path === "/compare" || path.startsWith("/compare/")) return { routeType: "compare" };
  if (path === "/changes") return { routeType: "changes" };
  if (path === "/sources") return { routeType: "sources" };
  if (path === "/database") return { routeType: "database" };
  if (path === "/usage") return { routeType: "usage" };
  if (path === "/search") return { routeType: "search" };
  if (path.startsWith("/blog/")) return { routeType: "blog" };
  if (path === "/api" || path.startsWith("/api/")) return { routeType: "api" };
  if (path === "/admin" || path.startsWith("/admin/")) return { routeType: "admin" };
  return { routeType: "other" };
}

function browserName(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  return "Browser";
}

export function classifyActor(input: { userAgent?: string | null; pathname: string; accept?: string | null }): ActorClassification {
  const userAgent = input.userAgent?.slice(0, 500) ?? "";
  for (const signature of botRegistry) if (signature.pattern.test(userAgent)) return { actorType: signature.actorType, actorName: signature.actorName, confidence: signature.confidence };
  const route = classifyRoute(input.pathname);
  if (route.routeType === "api" || /application\/(?:json|ld\+json)/i.test(input.accept ?? "") || apiClientPattern.test(userAgent)) return { actorType: "api_client", actorName: apiClientPattern.test(userAgent) ? userAgent.match(apiClientPattern)?.[0] ?? "API client" : "API client", confidence: .9 };
  if (!userAgent || unknownBotPattern.test(userAgent)) return { actorType: "unknown_bot", actorName: "Unknown bot", confidence: userAgent ? .7 : .5 };
  return { actorType: "human", actorName: browserName(userAgent), confidence: .98 };
}

export function deviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function isTrackableRequest(request: Request, route = classifyRoute(new URL(request.url).pathname)): boolean {
  if (route.routeType === "excluded" || route.routeType === "admin") return false;
  const path = new URL(request.url).pathname;
  if (path.startsWith("/api/admin/") || path.startsWith("/api/internal/") || path === "/api/analytics/event") return false;
  return ["GET", "HEAD"].includes(request.method) || route.routeType === "api";
}

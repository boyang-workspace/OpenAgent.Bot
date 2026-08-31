export const actorTypes = ["human", "search_bot", "ai_crawler", "ai_agent", "api_client", "unknown_bot"] as const;
export type ActorType = (typeof actorTypes)[number];

export type ActorClassification = {
  actorType: ActorType;
  actorName: string;
  confidence: number;
};

export type RouteClassification = {
  routeType: "home" | "agents_index" | "models_index" | "robots_index" | "robot_models_index" | "project" | "compare" | "changes" | "sources" | "database" | "usage" | "search" | "blog" | "api" | "admin" | "other" | "excluded";
  entityType?: string;
  entitySlug?: string;
};

export type AnalyticsEvent = {
  eventType: string;
  actorType: ActorType;
  actorName?: string;
  actorConfidence?: number;
  path: string;
  routeType: string;
  entityType?: string;
  entitySlug?: string;
  referrerSource?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  eventTarget?: string;
  eventValue?: string;
  visitorId?: string;
  sessionId?: string;
  method?: string;
  status?: number;
  responseMs?: number;
  responseBytes?: number;
  numericValue?: number;
};

export type ClientAnalyticsPayload = {
  eventType: "page_view" | "internal_search" | "search_result_click" | "filter_change" | "compare_open" | "compare_add_project" | "outbound_click" | "evidence_click" | "source_click" | "api_docs_click" | "api_copy" | "project_related_click";
  path: string;
  entitySlug?: string;
  eventTarget?: string;
  eventValue?: string;
  numericValue?: number;
  sessionId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

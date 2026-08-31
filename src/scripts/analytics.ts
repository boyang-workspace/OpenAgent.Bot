export {};
type EventPayload = { eventType: string; path: string; entitySlug?: string; eventTarget?: string; eventValue?: string; numericValue?: number; sessionId?: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string };

const endpoint = "/api/analytics/event";

function sessionId(): string | undefined {
  try {
    const key = "openagent:analytics-session";
    let value = sessionStorage.getItem(key);
    if (!value) { value = crypto.randomUUID(); sessionStorage.setItem(key, value); }
    return value;
  } catch { return undefined; }
}

function track(eventType: string, payload: Omit<EventPayload, "eventType" | "path" | "sessionId"> = {}): void {
  const body = JSON.stringify({ eventType, path: location.pathname, sessionId: sessionId(), ...payload });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch(endpoint, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true, credentials: "same-origin" });
}

function landingPayload(): Pick<EventPayload, "referrer" | "utmSource" | "utmMedium" | "utmCampaign"> {
  const params = new URLSearchParams(location.search);
  return {
    referrer: document.referrer || undefined,
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined
  };
}

function projectSlug(href: string): string | undefined {
  try { return new URL(href, location.href).pathname.match(/^\/project\/([a-z0-9-]+)/)?.[1]; } catch { return undefined; }
}

function outboundTarget(url: URL, anchor: HTMLAnchorElement): string {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "github.com") return "github";
  if (host.endsWith("huggingface.co")) return "huggingface";
  if (/docs|documentation/i.test(anchor.textContent ?? "")) return "docs";
  if (/paper|arxiv/i.test(`${anchor.textContent} ${host}`)) return "paper";
  if (anchor.closest("#evidence, #robot-evidence, .evidence")) return "evidence";
  if (/official/i.test(anchor.textContent ?? "")) return "official_site";
  return "other";
}

document.addEventListener("click", (event) => {
  const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) return;
  const url = new URL(anchor.href, location.href);
  const entitySlug = projectSlug(anchor.href) ?? location.pathname.match(/^\/project\/([a-z0-9-]+)/)?.[1];
  if (url.origin !== location.origin) {
    const target = outboundTarget(url, anchor);
    track(target === "evidence" ? "evidence_click" : target === "other" && anchor.closest(".source-link, .source-map") ? "source_click" : "outbound_click", { entitySlug, eventTarget: target, eventValue: url.hostname.replace(/^www\./, "") });
  } else if (url.pathname.startsWith("/compare")) {
    track("compare_open", { entitySlug, eventTarget: "compare" });
  } else if (location.search.includes("q=") && url.pathname.startsWith("/project/")) {
    track("search_result_click", { entitySlug, eventTarget: "project", eventValue: new URLSearchParams(location.search).get("q") ?? undefined });
  } else if (location.pathname.startsWith("/project/") && url.pathname.startsWith("/project/")) {
    track("project_related_click", { entitySlug: projectSlug(anchor.href), eventTarget: "project" });
  } else if (url.pathname === "/api" || url.pathname.startsWith("/api/knowledge/")) {
    track("api_docs_click", { eventTarget: "api" });
  }
});

document.addEventListener("change", (event) => {
  const checkbox = (event.target as Element | null)?.closest<HTMLInputElement>("[data-compare-item]");
  if (checkbox?.checked) track("compare_add_project", { entitySlug: checkbox.value, eventTarget: "project" });
});

document.addEventListener("submit", (event) => {
  const form = event.target as HTMLFormElement;
  const search = form.querySelector<HTMLInputElement>('input[type="search"][name="q"]');
  const resultCount = form.dataset.analyticsResults;
  if (search?.value.trim()) track("internal_search", { eventValue: search.value.trim(), numericValue: resultCount === undefined ? undefined : Number(resultCount) });
  const filters = [...new FormData(form).keys()].filter((key) => !["q", "page"].includes(String(key)));
  if (filters.length) track("filter_change", { eventTarget: "filter", eventValue: filters.sort().join(",") });
});

declare global { interface Window { openagentTrack?: typeof track } }
track("page_view", landingPayload());
window.openagentTrack = track;

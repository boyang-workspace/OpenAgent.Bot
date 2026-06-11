type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    openAgentTrack?: (eventName: string, payload?: AnalyticsPayload) => void;
  }
}

const legacyEventNames: Record<string, string> = {
  resource: "click_resource",
  category: "click_category",
  blog: "click_blog",
  evaluation: "click_evaluation",
  signal: "click_signal",
  nav: "click_nav",
  cta: "click_cta"
};

function parsePayload(value: string | null): AnalyticsPayload {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizePayload(payload: AnalyticsPayload = {}): AnalyticsPayload {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
  );
}

function outboundType(url: URL): string {
  if (url.hostname.includes("github.com")) return "github";
  if (url.hostname.includes("huggingface.co")) return "huggingface";
  if (url.hostname.includes("npmjs.com")) return "npm";
  if (url.pathname.endsWith(".json")) return "json";
  if (url.pathname.endsWith(".md")) return "markdown";
  return "external";
}

export function track(eventName: string, payload: AnalyticsPayload = {}): void {
  window.gtag?.("event", eventName, normalizePayload(payload));
}

export function setupOpenAgentAnalytics(): void {
  window.openAgentTrack = track;

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics]") : null;
    if (!target) return;

    const analyticsType = target.getAttribute("data-analytics") ?? "custom";
    const payload = parsePayload(target.getAttribute("data-analytics-payload"));
    const eventName = target.getAttribute("data-analytics-event") ?? legacyEventNames[analyticsType] ?? "click_custom";
    track(eventName, payload);
  });

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return;
    const payload = parsePayload(link.getAttribute("data-analytics-payload"));

    track("source_outbound_click", {
      ...payload,
      resource_slug: payload.resource_slug ?? payload.slug,
      outbound_type: outboundType(url),
      link_url: url.href,
      link_text: link.textContent?.trim().slice(0, 80),
      page_path: window.location.pathname
    });
  });

  document.addEventListener("submit", (event) => {
    const form = event.target instanceof Element ? event.target.closest<HTMLFormElement>("[data-analytics=search]") : null;
    if (!form) return;
    const query = new FormData(form).get("q");
    const searchTerm = query?.toString().trim();
    if (!searchTerm) return;
    track("search", { search_term: searchTerm });
  });

  const viewTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-analytics-view]"));
  if (!viewTargets.length) return;
  const seen = new WeakSet<HTMLElement>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement) || seen.has(entry.target)) continue;
        seen.add(entry.target);
        track(entry.target.getAttribute("data-analytics-view") ?? "view_custom", parsePayload(entry.target.getAttribute("data-analytics-payload")));
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.35 }
  );
  viewTargets.forEach((target) => observer.observe(target));
}

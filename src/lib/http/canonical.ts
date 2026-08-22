import { site } from "@/config/site";

const canonicalUrl = new URL(site.url);

export function canonicalRedirect(requestUrl: string | URL): URL | undefined {
  const url = new URL(requestUrl);
  if (url.hostname !== "openagent.bot") return undefined;

  url.protocol = canonicalUrl.protocol;
  url.hostname = canonicalUrl.hostname;
  url.port = canonicalUrl.port;
  return url;
}

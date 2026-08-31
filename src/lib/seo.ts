import { site } from "@/config/site";
import { canonicalPath } from "@/lib/http/canonical";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
};

function shorten(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const candidate = normalized.slice(0, maxLength - 1);
  const wordBoundary = candidate.lastIndexOf(" ");
  const end = wordBoundary >= Math.floor(maxLength * 0.7) ? wordBoundary : candidate.length;
  return `${candidate.slice(0, end).trimEnd()}…`;
}

export function buildSeo(input: SeoInput = {}) {
  const title = input.title
    ? input.title.includes(site.name)
      ? shorten(input.title, 60)
      : `${shorten(input.title, 60 - site.name.length - 3)} | ${site.name}`
    : site.title;
  const description = shorten(input.description ?? site.description, 160);
  const path = canonicalPath(input.path ?? "/");
  const canonical = new URL(path, site.url).toString();
  const usesDefaultImage = !input.image;
  const image = input.image ?? `${site.url}/og-openagent-x.png`;
  const imageType = image.endsWith(".png") ? "image/png" : image.endsWith(".jpg") || image.endsWith(".jpeg") ? "image/jpeg" : image.endsWith(".svg") ? "image/svg+xml" : undefined;

  return {
    title,
    description,
    canonical,
    image,
    imageAlt: input.imageAlt ?? `${title} — OpenAgent.bot preview`,
    imageType,
    imageWidth: usesDefaultImage ? 1200 : undefined,
    imageHeight: usesDefaultImage ? 630 : undefined,
    noindex: input.noindex ?? false
  };
}

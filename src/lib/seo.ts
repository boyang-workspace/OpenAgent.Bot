import { site } from "@/config/site";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
};

export function buildSeo(input: SeoInput = {}) {
  const title = input.title ? `${input.title} | ${site.name}` : site.title;
  const description = input.description ?? site.description;
  const path = input.path ?? "/";
  const canonical = new URL(path, site.url).toString();
  const image = input.image ?? `${site.url}/og-default.svg`;

  return {
    title,
    description,
    canonical,
    image,
    noindex: input.noindex ?? false
  };
}

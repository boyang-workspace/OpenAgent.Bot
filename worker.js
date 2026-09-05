const LEGACY_ROUTES = new Map([
  ["/yup/reactions", "/yup/stickers/"],
  ["/yup/reactions/", "/yup/stickers/"],
  ["/yup/sightings", "/yup/memes/"],
  ["/yup/sightings/", "/yup/memes/"],
  ["/yup/gallery", "/yup/archive/"],
  ["/yup/gallery/", "/yup/archive/"],
  ["/reactions", "/yup/stickers/"],
  ["/reactions/", "/yup/stickers/"],
  ["/stickers", "/yup/stickers/"],
  ["/stickers/", "/yup/stickers/"],
  ["/sightings", "/yup/memes/"],
  ["/sightings/", "/yup/memes/"],
  ["/memes", "/yup/memes/"],
  ["/memes/", "/yup/memes/"],
  ["/origin", "/yup/origin/"],
  ["/origin/", "/yup/origin/"],
  ["/archive", "/yup/archive/"],
  ["/archive/", "/yup/archive/"],
  ["/search", "/yup/search/"],
  ["/search/", "/yup/search/"]
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "openagent.bot") {
      url.hostname = "www.openagent.bot";
      return Response.redirect(url, 308);
    }

    const destination = LEGACY_ROUTES.get(url.pathname);
    if (destination) {
      url.pathname = destination;
      return Response.redirect(url, 308);
    }

    return env.ASSETS.fetch(request);
  }
};

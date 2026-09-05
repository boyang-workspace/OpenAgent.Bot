const LEGACY_ROUTES = new Map([
  ["/yup", "/"],
  ["/yup/", "/"],
  ["/yup/origin", "/origin/"],
  ["/yup/origin/", "/origin/"],
  ["/yup/stickers", "/stickers/"],
  ["/yup/stickers/", "/stickers/"],
  ["/yup/reactions", "/stickers/"],
  ["/yup/reactions/", "/stickers/"],
  ["/yup/memes", "/memes/"],
  ["/yup/memes/", "/memes/"],
  ["/yup/sightings", "/memes/"],
  ["/yup/sightings/", "/memes/"],
  ["/yup/gallery", "/archive/"],
  ["/yup/gallery/", "/archive/"],
  ["/yup/archive", "/archive/"],
  ["/yup/archive/", "/archive/"],
  ["/yup/search", "/search/"],
  ["/yup/search/", "/search/"],
  ["/reactions", "/stickers/"],
  ["/reactions/", "/stickers/"],
  ["/sightings", "/memes/"],
  ["/sightings/", "/memes/"]
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

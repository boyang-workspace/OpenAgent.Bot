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

const RETIRED_DATABASE_ROUTES = [
  "/about",
  "/agents",
  "/api",
  "/blog",
  "/changes",
  "/compare",
  "/corrections",
  "/database",
  "/humanity",
  "/labs",
  "/llms.txt",
  "/memory-systems",
  "/methodology",
  "/models",
  "/open-source-agent-frameworks",
  "/open-source-humanoid-robots",
  "/open-source-robots",
  "/open-source-vla-models",
  "/plugins",
  "/project",
  "/prototypes",
  "/pulse",
  "/rankings",
  "/robot-models",
  "/robotics",
  "/robots",
  "/skills",
  "/sources",
  "/support",
  "/tools",
  "/usage"
];

export function isRetiredDatabasePath(pathname) {
  return RETIRED_DATABASE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

function retiredResponse() {
  return new Response("This OpenAgent Database page has been permanently retired.\n", {
    status: 410,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

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

    if (isRetiredDatabasePath(url.pathname)) return retiredResponse();

    return env.ASSETS.fetch(request);
  }
};

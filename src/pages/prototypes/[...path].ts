import type { APIRoute } from "astro";

export const GET: APIRoute = () => new Response("This obsolete prototype surface has been removed.\n", {
  status: 410,
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "X-Robots-Tag": "noindex, nofollow"
  }
});

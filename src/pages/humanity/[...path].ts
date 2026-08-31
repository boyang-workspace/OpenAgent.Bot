import type { APIRoute } from "astro";

const retired = () => new Response("This experimental surface has been retired.\n", {
  status: 410,
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "X-Robots-Tag": "noindex, nofollow"
  }
});

export const GET: APIRoute = retired;
export const HEAD: APIRoute = retired;

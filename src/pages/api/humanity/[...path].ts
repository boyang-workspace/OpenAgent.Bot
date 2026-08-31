import type { APIRoute } from "astro";

const retired = () => new Response(JSON.stringify({ error: "This experimental API has been retired." }), {
  status: 410,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "X-Robots-Tag": "noindex, nofollow"
  }
});

export const GET: APIRoute = retired;
export const POST: APIRoute = retired;

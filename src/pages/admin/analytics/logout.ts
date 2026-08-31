import type { APIRoute } from "astro";
import { analyticsCookie } from "@/lib/analytics/auth";

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(analyticsCookie, { path: "/admin" });
  return redirect("/admin/analytics/login", 302);
};

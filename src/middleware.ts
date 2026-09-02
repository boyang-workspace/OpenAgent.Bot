import { defineMiddleware } from "astro:middleware";
import { canonicalRedirect } from "@/lib/http/canonical";

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const redirect = canonicalRedirect(request.url);
  if (redirect) return Response.redirect(redirect, 301);
  return next();
});

import { defineMiddleware } from "astro:middleware";

// Development serves the same static shell that hosting rewrites to in production.
export const onRequest = defineMiddleware((context, next) => {
  if (/^\/don-hang\/[^/]+\/?$/.test(context.url.pathname)) return next("/don-hang");
  return next();
});

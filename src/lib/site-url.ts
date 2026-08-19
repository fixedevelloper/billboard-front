// Resolves this site's own public base URL from the incoming request's headers rather than
// NEXT_PUBLIC_APP_URL, which - like every NEXT_PUBLIC_ variable - gets inlined into the JS bundle
// at `next build` time, not read at server start. Changing it in the production environment after
// building has no effect until a rebuild; deriving it from the request instead makes
// sitemap.xml/robots.txt correct on any domain without ever needing a rebuild for that reason.
// x-forwarded-* is what the VPS's own Nginx sets in front of this app (see the identical
// trusted-proxy comment on the backend's RateLimitFilter).
// Interface structurelle minimale : satisfaite à la fois par le Headers natif (Route Handlers,
// voir sitemap.xml/route.ts) et par ReadonlyHeaders de next/headers (Server Components, voir
// generateMetadata sur billboards/[id]/page.tsx), sans lier ce module à l'un ou l'autre.
interface ReadableHeaders {
  get(name: string): string | null;
}

export function getRequestBaseUrl(headers: ReadableHeaders): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  const protocol = headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

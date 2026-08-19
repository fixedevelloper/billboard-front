import { getRequestBaseUrl } from "@/lib/site-url";
import { renderUrlset, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

// Uniquement les pages publiques, indexables sans connexion (voir SecurityConfiguration côté
// backend pour la liste des endpoints GET publics dont ces pages dépendent). Le reste (dashboard,
// admin, profil, réservations...) est spécifique à l'utilisateur connecté et n'a rien à faire
// dans un sitemap public.
const STATIC_ROUTES: SitemapEntry[] = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/billboards", changeFrequency: "daily", priority: 0.9 },
  { href: "/become-advertiser", changeFrequency: "monthly", priority: 0.6 },
  { href: "/become-owner", changeFrequency: "monthly", priority: 0.6 },
  { href: "/become-mediabuyer", changeFrequency: "monthly", priority: 0.5 },
  { href: "/register", changeFrequency: "monthly", priority: 0.5 },
  { href: "/login", changeFrequency: "yearly", priority: 0.3 },
  { href: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { href: "/help-center", changeFrequency: "monthly", priority: 0.4 },
  { href: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { href: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request.headers);
  return xmlResponse(renderUrlset(STATIC_ROUTES, baseUrl));
}

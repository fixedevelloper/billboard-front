import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Espaces authentifiés (dashboard annonceur/propriétaire/media buyer/admin, profil, réservations,
// portefeuille...) : jamais indexables, contenu propre à chaque utilisateur connecté. La liste
// reflète les groupes de routes protégés par (advertiser)/(owner)/(mediabuyer)/(admin) plus les
// quelques pages publiques top-level qui nécessitent malgré tout une session (profile, wallet...).
const DISALLOWED_PREFIXES = [
  "/dashboard",
  "/bookings",
  "/campaigns",
  "/owner-dashboard",
  "/my-billboards",
  "/media-buyer",
  "/admin",
  "/space",
  "/profile",
  "/wallet",
  "/verify-email",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = DISALLOWED_PREFIXES.flatMap((path) => [path, `/en${path}`]);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

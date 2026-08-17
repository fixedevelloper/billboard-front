import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { listAllBillboards } from "@/lib/api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Uniquement les pages publiques, indexables sans connexion (voir SecurityConfiguration côté
// backend pour la liste des endpoints GET publics dont ces pages dépendent). Le reste (dashboard,
// admin, profil, réservations...) est spécifique à l'utilisateur connecté et n'a rien à faire
// dans un sitemap public.
const STATIC_ROUTES: Array<{
  href: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/billboards", changeFrequency: "daily", priority: 0.9 },
  { href: "/become-advertiser", changeFrequency: "monthly", priority: 0.6 },
  { href: "/become-owner", changeFrequency: "monthly", priority: 0.6 },
  { href: "/become-mediabuyer", changeFrequency: "monthly", priority: 0.5 },
  { href: "/register", changeFrequency: "monthly", priority: 0.5 },
  { href: "/login", changeFrequency: "yearly", priority: 0.3 },
];

// Régénéré au plus une fois par heure : évite de solliciter le backend à chaque passage de
// robot d'indexation pour une donnée (liste des panneaux) qui ne change pas seconde par seconde.
export const revalidate = 3600;

function buildEntry(
  href: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href })}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}${getPathname({ locale, href })}`])
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_ROUTES.map(({ href, changeFrequency, priority }) =>
    buildEntry(href, changeFrequency, priority)
  );

  let billboardEntries: MetadataRoute.Sitemap = [];
  try {
    const billboards = await listAllBillboards();
    billboardEntries = billboards
      .filter((billboard) => billboard.status === "AVAILABLE")
      .map((billboard) => buildEntry(`/billboards/${billboard.id}`, "weekly", 0.7));
  } catch {
    // Backend injoignable au moment de la génération : on renvoie quand même un sitemap valide
    // (pages statiques seulement) plutôt que de faire échouer toute la route /sitemap.xml.
  }

  return [...staticEntries, ...billboardEntries];
}

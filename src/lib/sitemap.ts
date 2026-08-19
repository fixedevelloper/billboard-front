import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

export interface SitemapEntry {
  href: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

// Sous-sitemap au format <urlset>, un par type de contenu (pages, billboards...), à la manière
// des sitemaps de WordPress (page-sitemap.xml, post-sitemap.xml...).
export function renderUrlset(entries: SitemapEntry[], baseUrl: string): string {
  const lastmod = new Date().toISOString();

  const urls = entries
    .map(({ href, changeFrequency, priority }) => {
      const loc = `${baseUrl}${getPathname({ locale: routing.defaultLocale, href })}`;
      const alternates = [
        ...routing.locales.map(
          (locale) =>
            `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(
              `${baseUrl}${getPathname({ locale, href })}`
            )}" />`
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />`,
      ].join("\n");

      return `<url>
<loc>${escapeXml(loc)}</loc>
${alternates}
<lastmod>${lastmod}</lastmod>
<changefreq>${changeFrequency}</changefreq>
<priority>${priority}</priority>
</url>`;
    })
    .join("\n");

  // Le PI xml-stylesheet permet d'afficher un tableau lisible dans un navigateur (via
  // /sitemap.xsl, dans public/) tout en laissant un document XML valide pour les robots -
  // les navigateurs Chromium récents n'affichent plus d'arbre pour du XML navigué directement,
  // donc sans lui un rechargement montre juste du texte brut (ce n'est pas un signe de XML invalide).
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

// Sitemap racine au format <sitemapindex>, comme sitemap_index.xml chez WordPress : il ne liste
// que les sous-sitemaps par type de contenu, chacun avec sa propre date de dernière génération.
export function renderSitemapIndex(subSitemaps: string[], baseUrl: string): string {
  const lastmod = new Date().toISOString();

  const sitemaps = subSitemaps
    .map(
      (name) => `<sitemap>
<loc>${baseUrl}/${name}</loc>
<lastmod>${lastmod}</lastmod>
</sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

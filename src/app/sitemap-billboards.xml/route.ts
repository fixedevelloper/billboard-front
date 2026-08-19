import { getRequestBaseUrl } from "@/lib/site-url";
import { listAllBillboards } from "@/lib/api";
import { renderUrlset, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

export async function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request.headers);

  let entries: SitemapEntry[] = [];
  try {
    const billboards = await listAllBillboards();
    entries = billboards
      .filter((billboard) => billboard.status === "AVAILABLE")
      .map((billboard) => ({
        href: `/billboards/${billboard.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // Backend injoignable au moment de la génération : on renvoie quand même un sitemap valide
    // (vide) plutôt que de faire échouer toute la route /sitemap-billboards.xml.
  }

  return xmlResponse(renderUrlset(entries, baseUrl));
}

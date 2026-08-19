import { getRequestBaseUrl } from "@/lib/site-url";
import { renderSitemapIndex, xmlResponse } from "@/lib/sitemap";

const SUB_SITEMAPS = ["sitemap-pages.xml", "sitemap-billboards.xml"];

export function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request.headers);
  return xmlResponse(renderSitemapIndex(SUB_SITEMAPS, baseUrl));
}

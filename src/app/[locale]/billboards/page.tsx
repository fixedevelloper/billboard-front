import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestBaseUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/JsonLd";
import { BillboardsSearchClient } from "./BillboardsSearchClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "billboards.search" });
  const baseUrl = getRequestBaseUrl(await headers());
  const canonical = `${baseUrl}${getPathname({ locale, href: "/billboards" })}`;
  const description =
    "Recherchez parmi des centaines de panneaux publicitaires disponibles par ville et réservez instantanément vos espaces sur Guen's Pub.";

  return {
    title: t("title"),
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}${getPathname({ locale: l, href: "/billboards" })}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function BillboardsSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const baseUrl = getRequestBaseUrl(await headers());

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Panneaux",
        item: `${baseUrl}${getPathname({ locale: routing.defaultLocale, href: "/billboards" })}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <BillboardsSearchClient />
    </>
  );
}

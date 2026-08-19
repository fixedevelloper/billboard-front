import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestBaseUrl } from "@/lib/site-url";
import { BecomeMediaBuyerClient } from "./BecomeMediaBuyerClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mediaBuyerBecome" });
  const baseUrl = getRequestBaseUrl(await headers());
  const canonical = `${baseUrl}${getPathname({ locale, href: "/become-mediabuyer" })}`;
  const title = `${t("title")} | Guen's Pub`;

  return {
    title,
    description: t("subtitle"),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}${getPathname({ locale: l, href: "/become-mediabuyer" })}`])
      ),
    },
    openGraph: { title, description: t("subtitle"), url: canonical, type: "website" },
  };
}

export default async function BecomeMediaBuyerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BecomeMediaBuyerClient />;
}

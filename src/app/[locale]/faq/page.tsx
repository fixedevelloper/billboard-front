import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestBaseUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { MessageCircleQuestion } from "lucide-react";

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const baseUrl = getRequestBaseUrl(await headers());
  const canonical = `${baseUrl}${getPathname({ locale, href: "/faq" })}`;

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}${getPathname({ locale: l, href: "/faq" })}`])
      ),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical,
      type: "website",
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`q${key}`),
      acceptedAnswer: { "@type": "Answer", text: t(`a${key}`) },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <MessageCircleQuestion className="h-4 w-4" />
            <span>{t("eyebrow")}</span>
          </div>
          <h1 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-12">
          <FaqAccordion />
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-muted/30 px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">{t("contactPrompt")}</p>
          <Button asChild className="gap-2">
            <Link href="/contact">{t("contactCta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

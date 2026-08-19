import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/ContactForm";
import { LifeBuoy, Mail, MessageCircleQuestion, Sparkles } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" />
          <span>{t("eyebrow")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">{t("title")}</h1>
        <p className="max-w-xl text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="mt-2">{t("emailLabel")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <a
                href={`mailto:${t("emailValue")}`}
                className="text-lg font-semibold text-foreground hover:underline"
              >
                {t("emailValue")}
              </a>
              <p className="text-sm text-muted-foreground">{t("emailHint")}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/30">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                <LifeBuoy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="mt-2">{t("helpLabel")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{t("helpHint")}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/help-center">
                    <LifeBuoy className="h-3.5 w-3.5" />
                    {t("helpCta")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/faq">
                    <MessageCircleQuestion className="h-3.5 w-3.5" />
                    {t("faqCta")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 p-6 sm:p-8">
          <CardHeader className="p-0">
            <CardTitle className="text-xl">{t("formTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("formSubtitle")}</p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

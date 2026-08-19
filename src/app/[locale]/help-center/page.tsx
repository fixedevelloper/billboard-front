import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  LifeBuoy,
  Megaphone,
  MessageCircleQuestion,
  Users,
  Wallet,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpCenter" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface HelpCategory {
  key: "advertiser" | "owner" | "mediaBuyer" | "account";
  icon: LucideIcon;
  accent: string;
  links: Array<{ labelKey: "link1" | "link2" | "link3"; href: string }>;
}

const CATEGORIES: HelpCategory[] = [
  {
    key: "advertiser",
    icon: Megaphone,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    links: [
      { labelKey: "link1", href: "/billboards" },
      { labelKey: "link2", href: "/become-advertiser" },
      { labelKey: "link3", href: "/campaigns" },
    ],
  },
  {
    key: "owner",
    icon: Building2,
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    links: [
      { labelKey: "link1", href: "/become-owner" },
      { labelKey: "link2", href: "/my-billboards" },
      { labelKey: "link3", href: "/my-billboards/bookings" },
    ],
  },
  {
    key: "mediaBuyer",
    icon: Users,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    links: [
      { labelKey: "link1", href: "/become-mediabuyer" },
      { labelKey: "link2", href: "/media-buyer/payments" },
    ],
  },
  {
    key: "account",
    icon: Wallet,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    links: [
      { labelKey: "link1", href: "/profile" },
      { labelKey: "link2", href: "/wallet" },
    ],
  },
];

export default async function HelpCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("helpCenter");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <LifeBuoy className="h-4 w-4" />
          <span>{t("eyebrow")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">{t("title")}</h1>
        <p className="max-w-xl text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CATEGORIES.map(({ key, icon: Icon, accent, links }) => (
          <Card
            key={key}
            className="border-border/60 p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
          >
            <CardHeader className="p-0">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3 text-lg">{t(`${key}.title`)}</CardTitle>
              <p className="text-sm text-muted-foreground">{t(`${key}.description`)}</p>
            </CardHeader>
            <CardContent className="mt-4 flex flex-col gap-1 border-t border-border/60 p-0 pt-4">
              {links.map(({ labelKey, href }) => (
                <Link
                  key={labelKey}
                  href={href}
                  className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span>{t(`${key}.${labelKey}`)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-muted/30 px-6 py-10 text-center">
        <p className="text-lg font-semibold text-foreground">{t("moreHelp")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/faq">
              <MessageCircleQuestion className="h-4 w-4" />
              {t("faqCta")}
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/contact">{t("contactCta")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

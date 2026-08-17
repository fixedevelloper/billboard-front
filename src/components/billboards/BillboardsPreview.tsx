"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { ArrowRight, Eye, MapPin, Sparkles, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listAllBillboards } from "@/lib/api";
import { BillboardThumbnail } from "@/components/billboards/BillboardThumbnail";
import { TypeBadge } from "@/components/billboards/TypeBadge";

const PREVIEW_COUNT = 6;

export function BillboardsPreview() {
  const t = useTranslations("home.billboards");
  const { data: billboards, isLoading } = useSWR("home-billboards-preview", listAllBillboards);

  const available = (billboards ?? []).filter((billboard) => billboard.status === "AVAILABLE").slice(0, PREVIEW_COUNT);

  if (!isLoading && available.length === 0) {
    return null;
  }

  return (
    <section id="billboards-preview" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" />
          <span>{t("eyebrow")}</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("title")}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/60 p-0">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="space-y-2 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            ))
          : available.map((billboard) => (
              <Card
                key={billboard.id}
                className="group flex flex-col overflow-hidden border-border/60 p-0 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <BillboardThumbnail
                    billboardId={billboard.id}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <TypeBadge type={billboard.type} />
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="line-clamp-1 text-base font-bold transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {billboard.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="line-clamp-1">{billboard.address || billboard.city}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-end gap-3 p-4 pt-2">
                  <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{t("dailyRate")}</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {billboard.dailyRate} <span className="text-xs font-normal text-muted-foreground">{billboard.currency}/jour</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs font-medium hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <Link href={`/billboards/${billboard.id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t("viewDetails")}</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" className="gap-2 px-8">
          <Link href="/billboards">
            <span>{t("viewMore")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

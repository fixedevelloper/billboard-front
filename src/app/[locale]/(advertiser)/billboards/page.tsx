"use client";

import { FormEvent, useState } from "react";
import { Search, MapPin, Loader2, Sparkles, AlertCircle, ArrowRight, Eye, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BillboardResponse, extractErrorMessage, searchBillboardsByCity } from "@/lib/api";
import { BillboardThumbnail } from "@/components/billboards/BillboardThumbnail";
import { CityCombobox } from "@/components/billboards/CityCombobox";
import { cn } from "@/lib/utils";

// Standard UI Badges for Billboard Types
const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  DIGITAL: {
    label: "Digital",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  STATIC: {
    label: "Statique",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  TRIVISION: {
    label: "Trivision",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  LED_SCREEN: {
    label: "Écran LED",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] || {
    label: type,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
      <span
          className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
              style.className
          )}
      >
      {style.label}
    </span>
  );
}

export default function BillboardsSearchPage() {
  const t = useTranslations("billboards.search");

  const [city, setCity] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BillboardResponse[]>([]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const billboards = await searchBillboardsByCity(city);
      setResults(billboards);
      setSearched(true);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {/* Search Header Banner */}
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Trouvez l'emplacement parfait</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Recherchez parmi des centaines de panneaux publicitaires disponibles par ville et réservez instantanément vos espaces.
          </p>
        </div>

        {/* Search Form Card */}
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <form className="flex flex-col sm:flex-row items-end gap-3" onSubmit={handleSubmit}>
              <div className="w-full flex-1 space-y-1.5">
                <label htmlFor="city" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t("cityLabel")}</span>
                </label>
                <CityCombobox
                    value={city}
                    onSelect={(selected) => setCity(selected.name)}
                    placeholder={t("cityPlaceholder")}
                />
              </div>

              <Button
                  type="submit"
                  disabled={loading || !city.trim()}
                  className="h-11 w-full sm:w-auto px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 gap-2 shrink-0"
              >
                {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Recherche...</span>
                    </>
                ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>{t("submit")}</span>
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
        )}

        {/* Initial State */}
        {!searched && !error && !loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Saisissez une ville pour démarrer</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {t("initial")}
              </p>
            </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-border/60">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader className="space-y-2 p-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-9 w-full rounded-md" />
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}

        {/* No Results State */}
        {searched && results.length === 0 && !error && !loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Aucun panneau trouvé</h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {t("noResults")}
              </p>
            </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>{results.length} emplacement(s) disponible(s)</span>
                <span>Résultats pour « <strong className="text-foreground">{city}</strong> »</span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((billboard) => (
                    <Card
                        key={billboard.id}
                        className="group flex flex-col overflow-hidden border-border/60 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <BillboardThumbnail
                            billboardId={billboard.id}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <TypeBadge type={billboard.type} />
                        </div>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {billboard.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="line-clamp-1">{billboard.address || billboard.city}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 p-4 pt-2 flex flex-col justify-end gap-3">
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
                        <Button asChild variant="outline" size="sm" className="w-full gap-1.5 text-xs font-medium hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                          <Link href={`/billboards/${billboard.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t("viewDetails")}</span>
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            </div>
        )}
      </div>
  );
}
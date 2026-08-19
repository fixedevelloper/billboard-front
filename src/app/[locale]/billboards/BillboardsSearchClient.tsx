"use client";

import { FormEvent, useMemo, useState } from "react";
import { Search, MapPin, Loader2, Sparkles, AlertCircle, ArrowRight, Eye, Tag, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BillboardResponse, BillboardType, extractErrorMessage, searchBillboardsByCity } from "@/lib/api";
import { BillboardThumbnail } from "@/components/billboards/BillboardThumbnail";
import { CityCombobox } from "@/components/billboards/CityCombobox";
import { TypeBadge } from "@/components/billboards/TypeBadge";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

const PAGE_SIZE = 9;
const BILLBOARD_TYPES: BillboardType[] = ["DIGITAL", "STATIC", "TRIVISION", "LED_SCREEN"];

export function BillboardsSearchClient() {
  const t = useTranslations("billboards.search");

  const [city, setCity] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BillboardResponse[]>([]);

  // Filtres appliqués côté client sur les résultats déjà chargés pour la ville recherchée.
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const filtersActive = Boolean(typeFilter || minPrice || maxPrice);

  function resetFilters() {
    setTypeFilter("");
    setMinPrice("");
    setMaxPrice("");
  }

  const filteredResults = useMemo(() => {
    return results.filter((billboard) => {
      if (typeFilter && billboard.type !== typeFilter) return false;
      const price = Number(billboard.dailyRate);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    });
  }, [results, typeFilter, minPrice, maxPrice]);

  const { visibleItems: visibleResults, hasMore, sentinelRef } = useInfiniteScroll(filteredResults, PAGE_SIZE);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const billboards = await searchBillboardsByCity(city);
      setResults(billboards);
      setSearched(true);
      resetFilters();
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setLoading(false);
    }
  }

  return (
      <section aria-labelledby="billboards-search-heading" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {/* Search Header Banner */}
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Trouvez l&apos;emplacement parfait</span>
          </div>
          <h1 id="billboards-search-heading" className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
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

        {/* Filtres : visibles dès qu'il y a des résultats bruts pour la ville, même si les
            filtres actuels les excluent tous (pour pouvoir les ajuster). */}
        {!loading && searched && results.length > 0 && (
            <Card className="border-border/60 bg-card shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <div className="flex items-center gap-1.5 pb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </div>

                  <div className="w-full space-y-1.5 sm:w-48">
                    <label className="text-xs font-medium text-foreground">{t("filterType")}</label>
                    <Select
                        value={typeFilter || "all"}
                        onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t("filterAllTypes")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filterAllTypes")}</SelectItem>
                        {BILLBOARD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              <TypeBadge type={type} />
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full space-y-1.5 sm:w-32">
                    <label className="text-xs font-medium text-foreground">{t("filterPriceMin")}</label>
                    <Input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        placeholder="0"
                        className="h-10"
                    />
                  </div>

                  <div className="w-full space-y-1.5 sm:w-32">
                    <label className="text-xs font-medium text-foreground">{t("filterPriceMax")}</label>
                    <Input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="—"
                        className="h-10"
                    />
                  </div>

                  {filtersActive && (
                      <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>{t("filterReset")}</span>
                      </Button>
                  )}
                </div>
              </CardContent>
            </Card>
        )}

        {/* Filtered Empty State : la ville a des résultats mais les filtres actuels n'en gardent aucun. */}
        {!loading && searched && results.length > 0 && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{t("filteredEmpty")}</h3>
              <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="mt-4 gap-1.5 text-xs">
                <X className="h-3.5 w-3.5" />
                <span>{t("filteredEmptyReset")}</span>
              </Button>
            </div>
        )}

        {/* Results Grid */}
        {!loading && filteredResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>{filteredResults.length} emplacement(s) disponible(s)</span>
                <span>Résultats pour « <strong className="text-foreground">{city}</strong> »</span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleResults.map((billboard) => (
                    <Card
                        key={billboard.id}
                        className="group flex flex-col overflow-hidden border-border/60 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <BillboardThumbnail
                            billboardId={billboard.id}
                            title={billboard.title}
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

              {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
              )}
            </div>
        )}
      </section>
  );
}
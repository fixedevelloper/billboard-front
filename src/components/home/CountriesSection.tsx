"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Globe2, MapPin } from "lucide-react";
import { getCities, listAllBillboards } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const COUNTRY_FLAGS: Record<string, string> = {
  "Côte d'Ivoire": "🇨🇮",
  "Sénégal": "🇸🇳",
  "Mali": "🇲🇱",
  "Cameroun": "🇨🇲",
  "Bénin": "🇧🇯",
  "Togo": "🇹🇬",
  "Burkina Faso": "🇧🇫",
  "Gabon": "🇬🇦",
  "Guinée": "🇬🇳",
  "Guinée-Bissau": "🇬🇼",
  "RD Congo": "🇨🇩",
  "Congo": "🇨🇬",
  "Niger": "🇳🇪",
  "Ghana": "🇬🇭",
  "Nigeria": "🇳🇬",
  "Maroc": "🇲🇦",
  "France": "🇫🇷",
};

export function CountriesSection() {
  const t = useTranslations("home.countries");
  const { data: billboards, isLoading: loadingBillboards } = useSWR(
    "home-countries-billboards",
    listAllBillboards
  );
  const { data: cities, isLoading: loadingCities } = useSWR("home-countries-cities", () => getCities());
  const isLoading = loadingBillboards || loadingCities;

  // Présence réelle : dérivée des panneaux disponibles rapprochés du référentiel de villes
  // (pour retrouver le pays), plutôt que du référentiel de villes seul qui peut contenir des
  // villes sans aucun panneau publié.
  const countries = useMemo(() => {
    if (!billboards || !cities) return [];

    const cityToCountry = new Map(cities.map((city) => [city.name.toLowerCase(), city.country]));
    const byCountry = new Map<string, Set<string>>();

    billboards
      .filter((billboard) => billboard.status === "AVAILABLE" && billboard.city)
      .forEach((billboard) => {
        const country = cityToCountry.get(billboard.city!.toLowerCase());
        if (!country) return;
        if (!byCountry.has(country)) byCountry.set(country, new Set());
        byCountry.get(country)!.add(billboard.city!);
      });

    return Array.from(byCountry.entries())
      .map(([country, citySet]) => ({ country, cities: Array.from(citySet) }))
      .sort((a, b) => b.cities.length - a.cities.length);
  }, [billboards, cities]);

  if (!isLoading && countries.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          <Globe2 className="h-4 w-4" />
          <span>{t("eyebrow")}</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("title")}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border/60 p-5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          : countries.map(({ country, cities: countryCities }) => (
              <div
                key={country}
                className="group flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5"
              >
                <span className="text-3xl">{COUNTRY_FLAGS[country] ?? "🌍"}</span>
                <span className="font-semibold text-foreground">{country}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {t("citiesCount", { count: countryCities.length })}
                </span>
              </div>
            ))}
      </div>
    </section>
  );
}

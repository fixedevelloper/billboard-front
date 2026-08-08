"use client";

import useSWR from "swr";
import {
  Building2,
  CheckCircle2,
  Plus,
  CalendarCheck,
  Layers,
  ArrowRight,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/dashboard/StatTile";
import { BillboardThumbnail } from "@/components/billboards/BillboardThumbnail";
import { getBillboardsByOwner } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// ---------------- COMPOSANT EMPTY STATE ----------------
interface DashboardEmptyStateProps {
  title: string;
  description?: string;
  addLabel: string;
}

function DashboardEmptyState({ title, description, addLabel }: DashboardEmptyStateProps) {
  return (
      <div className="flex flex-col items-center justify-center border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-10 rounded-2xl shadow-sm">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
          <Layers className="h-8 w-8 stroke-[1.5]" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <h3 className="text-base font-bold text-foreground sm:text-lg">{title}</h3>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description ||
              "Vous n'avez encore aucun panneau configuré dans votre catalogue. Ajoutez votre premier emplacement pour commencer à recevoir des réservations."}
        </p>

        <Button asChild className="mt-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20" size="sm">
          <Link href="/my-billboards/new">
            <Plus className="h-4 w-4" />
            <span>{addLabel}</span>
          </Link>
        </Button>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground border border-border/40">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Besoin d'aide pour publier un emplacement ? Consultez le guide propriétaire.</span>
        </div>
      </div>
  );
}

// ---------------- PAGE DASHBOARD ----------------
export default function OwnerDashboardPage() {
  const t = useTranslations("ownerDashboard");
  const { email, ownerId } = useAuth();

  const { data: billboards, isLoading } = useSWR(
      ownerId ? ["my-billboards", ownerId] : null,
      () => getBillboardsByOwner(ownerId as string)
  );

  const available = billboards?.filter((b) => b.status === "AVAILABLE").length ?? 0;
  const booked = billboards?.filter((b) => b.status === "BOOKED").length ?? 0;

  return (
      <div className="flex flex-col gap-6">
        {/* Header Dashboard */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("greeting")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{email}</p>
          </div>

          <Button asChild size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Link href="/my-billboards/new">
              <Plus className="h-4 w-4" />
              <span>{t("addBillboard")}</span>
            </Link>
          </Button>
        </div>

        {/* Cartes Métriques (StatTiles) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isLoading ? (
              <>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
          ) : (
              <>
                <StatTile
                    label={t("totalLabel")}
                    value={billboards?.length ?? 0}
                    icon={Building2}
                    accent="emerald"
                />
                <StatTile
                    label={t("availableLabel")}
                    value={available}
                    icon={CheckCircle2}
                    accent="emerald"
                />
                <StatTile
                    label={t("bookedLabel")}
                    value={booked}
                    icon={CalendarCheck}
                    accent="emerald"
                />
              </>
          )}
        </div>

        {/* Carte des Panneaux Récents */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              {t("recentBillboards")}
            </CardTitle>
            {billboards && billboards.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/my-billboards">
                    <span>{t("viewAll")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Squelettes lors du chargement */}
            {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                  ))}
                </div>
            )}

            {/* Etat Vide (Empty State) */}
            {!isLoading && billboards && billboards.length === 0 && (
                <DashboardEmptyState
                    title={t("noBillboards", { defaultValue: "Aucun panneau enregistré" })}
                    addLabel={t("addBillboard", { defaultValue: "Ajouter un panneau" })}
                />
            )}

            {/* Grille des Panneaux Récents */}
            {!isLoading && billboards && billboards.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {billboards.slice(0, 6).map((billboard) => (
                      <Link
                          key={billboard.id}
                          href={`/my-billboards/${billboard.id}`}
                          className="group flex flex-col gap-2 rounded-xl border border-border/50 p-2.5 transition-all duration-200 hover:border-border hover:shadow-sm"
                      >
                        <div className="relative overflow-hidden rounded-lg">
                          <BillboardThumbnail
                              billboardId={billboard.id}
                              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <Badge
                              variant="outline"
                              className={cn(
                                  "absolute top-2 right-2 backdrop-blur-md text-[10px] font-semibold uppercase px-2 py-0.5",
                                  billboard.status === "AVAILABLE"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              )}
                          >
                            {billboard.status}
                          </Badge>
                        </div>

                        <div className="flex flex-col min-w-0 px-0.5">
                    <span className="truncate text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {billboard.title}
                    </span>
                          {billboard.city && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                                <span className="truncate">{billboard.city}</span>
                              </div>
                          )}
                        </div>
                      </Link>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
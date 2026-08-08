"use client";

import useSWR from "swr";
import {
  CalendarCheck,
  Megaphone,
  Search,
  PlusCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/dashboard/StatTile";
import { getBookingsByAdvertiser, getCampaignsByAdvertiser, BookingResponse } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED"]);
const ACTIVE_CAMPAIGN_STATUSES = new Set(["SUBMITTED", "APPROVED", "ACTIVE"]);

// Visual mapping for booking status badges
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  COMPLETED: {
    label: "Terminée",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

function BookingStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
      <span
          className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
              style.className
          )}
      >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {style.label}
    </span>
  );
}

export default function AdvertiserDashboardPage() {
  const t = useTranslations("advertiserDashboard");
  const tCommon = useTranslations("common");
  const { advertiserId, email } = useAuth();

  const { data: bookings, isLoading: isLoadingBookings } = useSWR(
      advertiserId ? ["bookings", advertiserId] : null,
      ([, id]) => getBookingsByAdvertiser(id)
  );

  const { data: campaigns, isLoading: isLoadingCampaigns } = useSWR(
      advertiserId ? ["campaigns", advertiserId] : null,
      ([, id]) => getCampaignsByAdvertiser(id)
  );

  const activeBookings = bookings?.filter((b) => ACTIVE_BOOKING_STATUSES.has(b.status)).length ?? 0;
  const activeCampaigns = campaigns?.filter((c) => ACTIVE_CAMPAIGN_STATUSES.has(c.status)).length ?? 0;

  return (
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:p-8">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("greeting")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/campaigns/new">
                <PlusCircle className="h-4 w-4" />
                <span>Créer une campagne</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20">
              <Link href="/billboards">
                <Search className="h-4 w-4" />
                <span>{t("findBillboard")}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
              label={t("bookingsLabel")}
              value={isLoadingBookings ? "..." : (bookings?.length ?? 0)}
              icon={Layers}
              accent="blue"
          />
          <StatTile
              label={t("activeBookingsLabel")}
              value={isLoadingBookings ? "..." : activeBookings}
              icon={CalendarCheck}
              accent="emerald"
          />
          <StatTile
              label={t("activeCampaignsLabel")}
              value={isLoadingCampaigns ? "..." : activeCampaigns}
              icon={Megaphone}
              accent="violet"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Bookings List (Takes 2/3 space on desktop) */}
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-bold">{t("recentBookings")}</CardTitle>
                <CardDescription className="text-xs">
                  Aperçu de vos 5 réservations d'espaces publicitaires les plus récentes.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Link href="/my-bookings" className="flex items-center gap-1">
                  <span>Voir tout</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {isLoadingBookings && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
              )}

              {!isLoadingBookings && bookings && bookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-muted/20 my-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{t("noBookings")}</h3>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Explorez nos panneaux disponibles pour trouver l'emplacement idéal pour votre prochaine campagne.
                    </p>
                    <Button asChild size="sm" className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Link href="/billboards">
                        <Search className="h-3.5 w-3.5" />
                        <span>{t("findBillboard")}</span>
                      </Link>
                    </Button>
                  </div>
              )}

              {!isLoadingBookings &&
                  bookings?.slice(0, 5).map((booking: BookingResponse) => (
                      <div
                          key={booking.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 p-3.5 transition-all hover:border-emerald-500/40 hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground">
                              {booking.startDate} &rarr; {booking.endDate}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              ID: <span className="font-mono">{booking.id.slice(0, 8)}...</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <BookingStatusBadge status={booking.status} />
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs opacity-90 group-hover:opacity-100">
                            <Link href={`/bookings/${booking.id}`}>Détails</Link>
                          </Button>
                        </div>
                      </div>
                  ))}
            </CardContent>
          </Card>

          {/* Quick Tips & Campaign Insight (Takes 1/3 space on desktop) */}
          <div className="flex flex-col gap-4">
            <Card className="border-border/60 bg-gradient-to-br from-emerald-950/10 via-background to-background dark:from-emerald-950/20 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Optimisez vos campagnes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Avez-vous pensé à associer des visuels dynamiques à vos espaces digitaux ? Les campagnes interactives génèrent jusqu'à <strong>40% d'engagement en plus</strong>.
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full text-xs">
                    <Link href="/campaigns">Gérer mes campagnes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
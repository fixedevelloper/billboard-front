"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  CalendarCheck,
  Calendar,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelBooking, confirmBooking, extractErrorMessage, getBookingsByAdvertiser, BookingResponse } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// Mapping des badges de statut de réservation
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

export default function BookingsPage() {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { advertiserId, hydrated } = useAuth();

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !advertiserId) {
      router.replace("/become-advertiser");
    }
  }, [hydrated, advertiserId, router]);

  const {
    data: bookings,
    error,
    isLoading,
    mutate,
  } = useSWR(
      advertiserId ? ["bookings", advertiserId] : null,
      ([, id]) => getBookingsByAdvertiser(id)
  );

  async function handleConfirm(bookingId: string) {
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await confirmBooking(bookingId);
      await mutate();
    } catch (err) {
      setActionError(extractErrorMessage(err, t("confirm")));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(bookingId: string) {
    setActionLoadingId(bookingId);
    setActionError(null);
    try {
      await cancelBooking(bookingId);
      await mutate();
    } catch (err) {
      setActionError(extractErrorMessage(err, t("cancel")));
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!hydrated || !advertiserId) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        {/* En-tête de la page */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gérez l'ensemble de vos réservations d'emplacements publicitaires et suivez leur statut.
            </p>
          </div>
          <Button
              asChild
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 shrink-0 self-start sm:self-auto"
          >
            <Link href="/billboards">
              <Search className="h-4 w-4" />
              <span>Réserver un panneau</span>
            </Link>
          </Button>
        </div>

        {/* Erreurs de chargement ou d'action */}
        {(error || actionError) && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError || error?.message}</span>
            </div>
        )}

        {/* Chargement par Skeleton */}
        {isLoading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border/60">
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-24 rounded-md" />
                        <Skeleton className="h-8 w-32 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}

        {/* État vide */}
        {!isLoading && bookings && bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Aucune réservation pour le moment</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {t("empty")}
              </p>
              <Button
                  asChild
                  size="sm"
                  className="mt-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Link href="/billboards">
                  <Search className="h-4 w-4" />
                  <span>Explorer le catalogue</span>
                </Link>
              </Button>
            </div>
        )}

        {/* Liste des réservations */}
        {!isLoading && bookings && bookings.length > 0 && (
            <div className="flex flex-col gap-4">
              {bookings.map((booking: BookingResponse) => {
                const isProcessing = actionLoadingId === booking.id;

                return (
                    <Card
                        key={booking.id}
                        className="group border-border/60 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
                    >
                      <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between space-y-0 border-b border-border/40 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                              <span>{t("dates")}:</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                          {booking.startDate} &rarr; {booking.endDate}
                        </span>
                            </CardTitle>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              ID Réservation: <span className="font-mono">{booking.id}</span>
                            </p>
                          </div>
                        </div>

                        <BookingStatusBadge status={booking.status} />
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-4 w-4 text-foreground/70" />
                            <span>{t("total")}:</span>
                            <strong className="text-sm font-bold text-foreground">
                              {booking.totalPrice} {booking.currency}
                            </strong>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                          {booking.status === "PENDING" && (
                              <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isProcessing}
                                  onClick={() => handleConfirm(booking.id)}
                                  className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              >
                                {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <span>{t("confirm")}</span>
                              </Button>
                          )}

                          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                              <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isProcessing}
                                  onClick={() => handleCancel(booking.id)}
                                  className="h-8 text-xs gap-1.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                              >
                                {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                )}
                                <span>{t("cancel")}</span>
                              </Button>
                          )}

                          <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1.5 ml-auto sm:ml-0"
                          >
                            <Link href={`/bookings/${booking.id}`}>
                              <span>{t("viewDetails")}</span>
                            </Link>
                          </Button>

                          <Button
                              asChild
                              size="sm"
                              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                          >
                            <Link href={`/campaigns/new?bookingId=${booking.id}`}>
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>{t("createCampaign")}</span>
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                );
              })}
            </div>
        )}
      </div>
  );
}
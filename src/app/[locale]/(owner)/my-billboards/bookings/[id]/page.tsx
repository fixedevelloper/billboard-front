"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  Megaphone,
  Phone,
  User,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Check,
  X,
  BadgeAlert,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  cancelBooking,
  confirmBooking,
  extractErrorMessage,
  getAdvertiser,
  getBillboard,
  getBooking,
  getCampaignsByBooking,
  getContractByBooking,
  getPaymentsByReference,
  CampaignResponse,
  PaymentTransactionResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// Formatage monétaire
function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

interface TrackingStepProps {
  icon: React.ElementType;
  title: string;
  done: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

function TrackingStep({ icon: Icon, title, done, isLast, children }: TrackingStepProps) {
  return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
              className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors shadow-sm",
                  done
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                      : "border-border bg-muted/50 text-muted-foreground"
              )}
          >
            {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
          </div>
          {!isLast && <div className="w-0.5 flex-1 bg-border/60 my-1.5" />}
        </div>
        <div className={cn("flex-1", !isLast && "pb-6")}>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <div className="mt-1.5 text-xs text-muted-foreground">{children}</div>
        </div>
      </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("ownerBookings");
  const tTracking = useTranslations("bookingTracking");

  const [runningAction, setRunningAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: booking,
    mutate: mutateBooking,
    isLoading: loadingBooking,
  } = useSWR(["booking", id], () => getBooking(id));

  const { data: billboard } = useSWR(
      booking ? ["billboard", booking.billboardId] : null,
      () => getBillboard(booking!.billboardId)
  );

  const { data: advertiser } = useSWR(
      booking ? ["advertiser", booking.advertiserId] : null,
      () => getAdvertiser(booking!.advertiserId)
  );

  const { data: tracking, isLoading: loadingTracking } = useSWR(
      booking ? ["booking-tracking", booking.id] : null,
      async () => {
        const [campaigns, contract, payments] = await Promise.all([
          getCampaignsByBooking(booking!.id),
          getContractByBooking(booking!.id).catch(() => null),
          getPaymentsByReference(booking!.id),
        ]);
        return { campaigns, contract, payments };
      }
  );

  async function handleConfirm() {
    setRunningAction(true);
    setError(null);
    try {
      await confirmBooking(id);
      await mutateBooking();
    } catch (err) {
      setError(extractErrorMessage(err, t("confirm")));
    } finally {
      setRunningAction(false);
    }
  }

  async function handleCancel() {
    setRunningAction(true);
    setError(null);
    try {
      await cancelBooking(id);
      await mutateBooking();
    } catch (err) {
      setError(extractErrorMessage(err, t("cancel")));
    } finally {
      setRunningAction(false);
    }
  }

  return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        {/* Bouton de retour */}
        <div>
          <Link
              href="/my-billboards/bookings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("title")}</span>
          </Link>
        </div>

        {/* Notification d'erreur */}
        {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Colonne gauche : détails de la réservation et de l'annonceur */}
          <div className="flex flex-col gap-6">
            {/* Carte Réservation */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {loadingBooking && (
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-2/3 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded-lg" />
                      <Skeleton className="h-4 w-1/3 rounded-lg" />
                    </div>
                )}

                {booking && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("colBillboard")}</p>
                        <p className="text-base font-extrabold text-foreground">
                          {billboard?.title ?? booking.billboardId}
                        </p>
                        {billboard?.city && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>{billboard.city}</span>
                            </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/30 p-3.5">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{t("colDates")}</span>
                          </p>
                          <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                            {booking.startDate} → {booking.endDate}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {t("colTotal")}
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {formatCurrency(Number(booking.totalPrice), booking.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{t("colStatus")}</span>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Actions sur la réservation */}
                      {(booking.status === "PENDING" ||
                          (booking.status !== "CANCELLED" && booking.status !== "COMPLETED")) && (
                          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                            {booking.status === "PENDING" && (
                                <Button
                                    size="sm"
                                    disabled={runningAction}
                                    onClick={handleConfirm}
                                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 text-xs"
                                >
                                  {runningAction ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                      <Check className="h-3.5 w-3.5" />
                                  )}
                                  <span>{t("confirm")}</span>
                                </Button>
                            )}

                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={runningAction}
                                    onClick={handleCancel}
                                    className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                                >
                                  {runningAction ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                      <X className="h-3.5 w-3.5" />
                                  )}
                                  <span>{t("cancel")}</span>
                                </Button>
                            )}
                          </div>
                      )}
                    </>
                )}
              </CardContent>
            </Card>

            {/* Carte Annonceur */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span>{tTracking("stepAdvertiser")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {!advertiser && <Skeleton className="h-12 w-full rounded-xl" />}
                {advertiser && (
                    <>
                      <p className="text-sm font-bold text-foreground">{advertiser.companyName}</p>
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span>{advertiser.contactEmail}</span>
                        </div>
                        {advertiser.contactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span>{advertiser.contactPhone}</span>
                            </div>
                        )}
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite : Suivi de la commande (Tracking Stepper) */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold">{tTracking("title")}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {tTracking("description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {(loadingBooking || loadingTracking) && (
                  <div className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
              )}

              {booking && !loadingTracking && (
                  <div className="flex flex-col">
                    {/* Étape 1 : Réservation */}
                    <TrackingStep icon={CalendarCheck} title={tTracking("stepBooking")} done>
                      <div className="space-y-1.5">
                        <p className="text-muted-foreground font-mono">
                          {booking.startDate} → {booking.endDate} ·{" "}
                          <span className="font-semibold text-foreground">
                        {formatCurrency(Number(booking.totalPrice), booking.currency)}
                      </span>
                        </p>
                        <StatusBadge status={booking.status} />
                      </div>
                    </TrackingStep>

                    {/* Étape 2 : Contrat */}
                    <TrackingStep
                        icon={FileText}
                        title={tTracking("stepContract")}
                        done={!!tracking?.contract}
                    >
                      <div className="flex items-center gap-2 pt-1">
                        {tracking?.contract ? (
                            <StatusBadge status={tracking.contract.status} />
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {tTracking("notStarted")}
                            </Badge>
                        )}
                        <Link
                            href={`/my-billboards/bookings/${id}/contract`}
                            className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          {tTracking("viewContract")}
                        </Link>
                      </div>
                    </TrackingStep>

                    {/* Étape 3 : Paiement */}
                    <TrackingStep
                        icon={CreditCard}
                        title={tTracking("stepPayment")}
                        done={!!tracking && tracking.payments.length > 0}
                    >
                      {tracking && tracking.payments.length > 0 ? (
                          <div className="flex flex-col gap-2 pt-1">
                            {tracking.payments.map((payment: PaymentTransactionResponse) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2 border border-border/40"
                                >
                          <span className="font-bold text-foreground">
                            {formatCurrency(Number(payment.amount), payment.currency)}
                          </span>
                                  <StatusBadge status={payment.status} />
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="pt-1">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {tTracking("notStarted")}
                            </Badge>
                          </div>
                      )}
                    </TrackingStep>

                    {/* Étape 4 : Campagne */}
                    <TrackingStep
                        icon={Megaphone}
                        title={tTracking("stepCampaign")}
                        done={!!tracking && tracking.campaigns.length > 0}
                        isLast
                    >
                      {tracking && tracking.campaigns.length > 0 ? (
                          <div className="flex flex-col gap-2 pt-1">
                            {tracking.campaigns.map((campaign: CampaignResponse) => (
                                <div
                                    key={campaign.id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-2 border border-border/40"
                                >
                          <span className="font-semibold text-foreground truncate">
                            {campaign.name}
                          </span>
                                  <StatusBadge status={campaign.status} />
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="pt-1">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              {tTracking("notStarted")}
                            </Badge>
                          </div>
                      )}
                    </TrackingStep>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
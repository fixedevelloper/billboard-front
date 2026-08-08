"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  PlusCircle,
  User,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  cancelBooking,
  extractErrorMessage,
  getBillboard,
  getBooking,
  getCampaignsByBooking,
  getContractByBooking,
  getOwner,
  getPaymentsByReference,
  getUnpaidExpirationDays,
} from "@/lib/api";

interface TrackingStepProps {
  icon: React.ElementType;
  title: string;
  done: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

function TrackingStep({ icon: Icon, title, done, isLast, children }: TrackingStepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={
            "flex size-8 shrink-0 items-center justify-center rounded-full border " +
            (done
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-border bg-muted/40 text-muted-foreground")
          }
        >
          {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/70" />}
      </div>
      <div className={isLast ? "flex-1" : "flex-1 pb-6"}>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="mt-1.5 text-sm">{children}</div>
      </div>
    </div>
  );
}

function addDays(isoDate: string, days: number): Date {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date;
}

export default function AdvertiserBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("bookings");
  const tTracking = useTranslations("bookingTracking");
  const tCommon = useTranslations("common");

  const [runningAction, setRunningAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: booking, mutate: mutateBooking, isLoading: loadingBooking } = useSWR(
    ["booking", id],
    () => getBooking(id),
  );

  const { data: billboard } = useSWR(
    booking ? ["billboard", booking.billboardId] : null,
    () => getBillboard(booking!.billboardId),
  );

  const { data: owner } = useSWR(
    billboard ? ["owner", billboard.ownerId] : null,
    () => getOwner(billboard!.ownerId),
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
    },
  );

  const { data: expirationDays } = useSWR("unpaid-expiration-days", getUnpaidExpirationDays);

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

  const hasCompletedPayment = !!tracking && tracking.payments.some((p) => p.status === "SUCCESSFUL");
  const isExpirable = booking && (booking.status === "PENDING" || booking.status === "CONFIRMED");
  const showExpirationReminder = isExpirable && !hasCompletedPayment && !!expirationDays && !!booking;
  const expirationDate = showExpirationReminder ? addDays(booking!.createdAt, expirationDays!) : null;

  const latestCampaign = tracking?.campaigns[tracking.campaigns.length - 1];
  const contractSigned = tracking?.contract?.status === "SIGNED";

  // Étape suivante du parcours : réservation → contrat → paiement → campagne
  const nextStep = !tracking
    ? null
    : !tracking.contract
      ? { href: `/bookings/${id}/contract`, label: t("generateContract") }
      : !contractSigned
        ? { href: `/bookings/${id}/contract`, label: t("viewContract") }
        : !hasCompletedPayment
          ? { href: `/bookings/${id}/payment`, label: t("goToPayment") }
          : latestCampaign
            ? { href: `/campaigns/${latestCampaign.id}`, label: t("viewCampaign") }
            : { href: `/campaigns/new?bookingId=${id}`, label: t("createCampaign") };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <Link
        href="/bookings"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t("title")}</span>
      </Link>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showExpirationReminder && expirationDate && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          <Clock className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("expirationReminderTitle")}</p>
            <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
              {t("expirationReminderBody", {
                date: expirationDate.toLocaleDateString(),
                days: expirationDays ?? 0,
              })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Colonne gauche : détails */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {loadingBooking && (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              )}

              {booking && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">{tTracking("stepBooking")}</p>
                    <p className="text-base font-semibold text-foreground">{billboard?.title ?? booking.billboardId}</p>
                    {billboard?.city && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        <span>
                          {billboard.address ? `${billboard.address}, ` : ""}
                          {billboard.city}
                        </span>
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">{t("dates")}</p>
                    <p className="text-sm font-medium text-foreground">
                      {booking.startDate} → {booking.endDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">{t("total")}</p>
                    <p className="text-sm font-medium text-foreground">
                      {booking.totalPrice} {booking.currency}
                    </p>
                    {billboard?.dailyRate && (
                      <p className="text-xs text-muted-foreground">
                        {billboard.dailyRate} {billboard.currency} / jour
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">{t("status")}</p>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && booking.status !== "EXPIRED" && (
                      <Button size="sm" variant="outline" loading={runningAction} disabled={runningAction} onClick={handleCancel}>
                        {t("cancel")}
                      </Button>
                    )}
                    {!loadingTracking &&
                      nextStep &&
                      booking.status !== "CANCELLED" &&
                      booking.status !== "EXPIRED" && (
                        <Button asChild size="sm">
                          <Link href={nextStep.href}>
                            <PlusCircle className="size-4" />
                            {nextStep.label}
                          </Link>
                        </Button>
                      )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4 text-muted-foreground" />
                {t("owner")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {!owner && <Skeleton className="h-10 w-full" />}
              {owner && (
                <>
                  <p className="text-base font-semibold text-foreground">{owner.companyName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-3.5" />
                    <span>{owner.contactEmail}</span>
                  </div>
                  {owner.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-3.5" />
                      <span>{owner.phoneNumber}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : suivi de la commande */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tTracking("title")}</CardTitle>
            <p className="text-xs text-muted-foreground">{tTracking("description")}</p>
          </CardHeader>
          <CardContent>
            {(loadingBooking || loadingTracking) && (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            )}

            {booking && !loadingTracking && (
              <div className="flex flex-col">
                <TrackingStep icon={CalendarCheck} title={tTracking("stepBooking")} done>
                  <p className="text-muted-foreground">
                    {booking.startDate} → {booking.endDate} · {booking.totalPrice} {booking.currency}
                  </p>
                  <StatusBadge status={booking.status} />
                </TrackingStep>

                <TrackingStep icon={FileText} title={tTracking("stepContract")} done={!!tracking?.contract}>
                  <div className="flex items-center gap-2">
                    {tracking?.contract ? (
                      <StatusBadge status={tracking.contract.status} />
                    ) : (
                      <Badge tone="neutral">{tTracking("notStarted")}</Badge>
                    )}
                    <Link
                      href={`/bookings/${id}/contract`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {tracking?.contract ? t("viewContract") : t("generateContract")}
                    </Link>
                  </div>
                </TrackingStep>

                <TrackingStep
                  icon={CreditCard}
                  title={tTracking("stepPayment")}
                  done={!!tracking && tracking.payments.length > 0}
                >
                  {tracking && tracking.payments.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {tracking.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {payment.amount} {payment.currency}
                          </span>
                          <StatusBadge status={payment.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{tTracking("notStarted")}</Badge>
                      {contractSigned && (
                        <Link
                          href={`/bookings/${id}/payment`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("goToPayment")}
                        </Link>
                      )}
                    </div>
                  )}
                </TrackingStep>

                <TrackingStep
                  icon={Megaphone}
                  title={tTracking("stepCampaign")}
                  done={!!tracking && tracking.campaigns.length > 0}
                  isLast
                >
                  {tracking && tracking.campaigns.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {tracking.campaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center gap-2">
                          <Link href={`/campaigns/${campaign.id}`} className="font-medium text-foreground hover:underline">
                            {campaign.name}
                          </Link>
                          <StatusBadge status={campaign.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{tTracking("notStarted")}</Badge>
                      {hasCompletedPayment && (
                        <Link
                          href={`/campaigns/new?bookingId=${booking.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("createCampaign")}
                        </Link>
                      )}
                    </div>
                  )}
                </TrackingStep>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!loadingBooking && !booking && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
    </div>
  );
}

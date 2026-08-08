"use client";

import { FormEvent, use, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MediaBuyerResponse,
  PaymentMethod,
  PaymentTransactionResponse,
  completePayment,
  extractErrorMessage,
  getAdvertiser,
  getBillboard,
  getBooking,
  getContractByBooking,
  getMediaBuyer,
  getPaymentsByReference,
  initiateFlutterwaveCheckout,
  initiatePayment,
  listMediaBuyers,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CREDIT_CARD",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "CREDIT_ACCOUNT",
  "FLUTTERWAVE",
];

export default function BookingPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const { advertiserId } = useAuth();
  const searchParams = useSearchParams();

  const { data: booking } = useSWR(["booking", id], () => getBooking(id));
  const { data: advertiser } = useSWR(
    advertiserId ? ["advertiser", advertiserId] : null,
    () => getAdvertiser(advertiserId!),
  );
  const { data: billboard } = useSWR(
    booking ? ["billboard", booking.billboardId] : null,
    () => getBillboard(booking!.billboardId),
  );
  const { data: contract } = useSWR(booking ? ["contract-by-booking", booking.id] : null, ([, bookingId]) =>
    getContractByBooking(bookingId).catch(() => null),
  );
  const contractSigned = contract?.status === "SIGNED";

  const { data: existingPayments, mutate: mutatePayments } = useSWR(
    booking ? ["payments-by-reference", booking.id] : null,
    ([, bookingId]) => getPaymentsByReference(bookingId),
  );
  const existingPayment = existingPayments?.[0] ?? null;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [delegate, setDelegate] = useState(false);
  const [mediaBuyerQuery, setMediaBuyerQuery] = useState("");
  const [selectedMediaBuyer, setSelectedMediaBuyer] = useState<MediaBuyerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentTransactionResponse | null>(null);
  const [gatewayReference, setGatewayReference] = useState("");
  const [completing, setCompleting] = useState(false);
  const [redirectingToFlutterwave, setRedirectingToFlutterwave] = useState(false);
  const flutterwaveResult = searchParams.get("flutterwave");

  const activePayment = payment ?? existingPayment;
  const displayAmount = amount || booking?.totalPrice || "";

  const { data: delegatedMediaBuyer } = useSWR(
    activePayment?.delegated ? ["media-buyer", activePayment.payerId] : null,
    ([, payerId]) => getMediaBuyer(payerId),
  );

  useEffect(() => {
    if (flutterwaveResult) {
      mutatePayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flutterwaveResult]);

  const { data: mediaBuyers } = useSWR(delegate ? "media-buyers" : null, listMediaBuyers);

  const filteredMediaBuyers = useMemo(() => {
    if (!mediaBuyers) return [];
    const query = mediaBuyerQuery.trim().toLowerCase();
    if (!query) return mediaBuyers;
    return mediaBuyers.filter(
      (buyer) =>
        buyer.companyName.toLowerCase().includes(query) || buyer.contactEmail.toLowerCase().includes(query),
    );
  }, [mediaBuyers, mediaBuyerQuery]);

  async function handleInitiate(event: FormEvent) {
    event.preventDefault();
    if (!advertiserId || !booking) return;
    const payerId = delegate ? selectedMediaBuyer?.id : advertiserId;
    if (!payerId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await initiatePayment({
        payerId,
        referenceId: booking.id,
        amount: displayAmount,
        currency: booking.currency,
        paymentMethod: method,
        initiatedBy: advertiserId,
      });

      // Un paiement délégué doit être finalisé par le media buyer lui-même, pas dans cette
      // session : on ne redirige donc jamais l'annonceur vers le checkout Flutterwave ici.
      if (method === "FLUTTERWAVE" && !delegate) {
        setRedirectingToFlutterwave(true);
        const { checkoutUrl } = await initiateFlutterwaveCheckout(result.id, {
          customerEmail: advertiser?.contactEmail ?? "",
          customerName: advertiser?.companyName ?? "",
          customerPhone: advertiser?.contactPhone ?? undefined,
        });
        window.location.href = checkoutUrl;
        return;
      }

      setPayment(result);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
      setRedirectingToFlutterwave(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(event: FormEvent) {
    event.preventDefault();
    if (!activePayment) return;
    setCompleting(true);
    setError(null);
    try {
      await completePayment(activePayment.id, { gatewayReference });
      setPayment({ ...activePayment, status: "SUCCESSFUL", gatewayReference });
      await mutatePayments();
    } catch (err) {
      setError(extractErrorMessage(err, t("complete")));
    } finally {
      setCompleting(false);
    }
  }

  if (!booking || !billboard) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link
        href={`/bookings/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{billboard.title}</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {error && <p className="text-destructive">{error}</p>}

          {flutterwaveResult === "success" && (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 font-medium text-emerald-700 dark:text-emerald-400">
              {t("flutterwaveSuccess")}
            </p>
          )}
          {flutterwaveResult === "failed" && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 font-medium text-destructive">
              {t("flutterwaveFailed")}
            </p>
          )}

          {!activePayment && !contractSigned && (
            <div className="flex flex-col gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-400">
              <p className="text-sm font-medium">{t("contractRequired")}</p>
              <Link
                href={`/bookings/${id}/contract`}
                className="text-xs font-semibold underline underline-offset-2"
              >
                {t("goToContract")}
              </Link>
            </div>
          )}

          {!activePayment && contractSigned && (
            <form className="flex flex-col gap-4" onSubmit={handleInitiate}>
              <Input
                name="amount"
                type="number"
                step="0.01"
                label={`${t("amount")} (${booking.currency})`}
                value={displayAmount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="method">
                  {t("method")}
                </label>
                <select
                  id="method"
                  className="h-10 rounded-md border bg-transparent px-3 text-sm"
                  value={method}
                  onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={!delegate ? "default" : "outline"}
                  onClick={() => setDelegate(false)}
                >
                  {t("payMyself")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={delegate ? "default" : "outline"}
                  onClick={() => setDelegate(true)}
                >
                  {t("delegate")}
                </Button>
              </div>

              {delegate && (
                <div className="flex flex-col gap-2">
                  <Input
                    name="mediaBuyerQuery"
                    label={t("searchMediaBuyer")}
                    value={mediaBuyerQuery}
                    onChange={(event) => {
                      setMediaBuyerQuery(event.target.value);
                      setSelectedMediaBuyer(null);
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    {filteredMediaBuyers.length === 0 && (
                      <p className="text-muted-foreground">{t("noMediaBuyer")}</p>
                    )}
                    {filteredMediaBuyers.map((buyer) => (
                      <button
                        type="button"
                        key={buyer.id}
                        onClick={() => setSelectedMediaBuyer(buyer)}
                        className={`rounded-md border p-2 text-left ${
                          selectedMediaBuyer?.id === buyer.id ? "border-primary bg-accent" : ""
                        }`}
                      >
                        <p className="font-medium">{buyer.companyName}</p>
                        <p className="text-xs text-muted-foreground">{buyer.contactEmail}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={submitting}
                disabled={submitting || (delegate && !selectedMediaBuyer)}
              >
                {redirectingToFlutterwave
                  ? t("redirectingToFlutterwave")
                  : submitting
                    ? t("initiating")
                    : t("initiate")}
              </Button>
            </form>
          )}

          {activePayment && (
            <div className="flex flex-col gap-4">
              <p>
                {t("status")}: <span className="font-medium">{activePayment.status}</span>
              </p>
              <p>
                {t("amount")}: {activePayment.amount} {activePayment.currency}
              </p>
              {activePayment.delegated && (
                <p>
                  {t("delegatedTo")}: {selectedMediaBuyer?.companyName ?? delegatedMediaBuyer?.companyName ?? "…"}
                </p>
              )}

              {activePayment.status === "PENDING" && activePayment.delegated && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
                  {t("waitingForMediaBuyer", {
                    name: selectedMediaBuyer?.companyName ?? delegatedMediaBuyer?.companyName ?? "…",
                  })}
                </p>
              )}

              {activePayment.status === "PENDING" && !activePayment.delegated && (
                <form className="flex flex-col gap-3" onSubmit={handleComplete}>
                  <Input
                    name="gatewayReference"
                    label={t("gatewayReference")}
                    value={gatewayReference}
                    onChange={(event) => setGatewayReference(event.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" loading={completing} disabled={completing}>
                    {completing ? t("completing") : t("complete")}
                  </Button>
                </form>
              )}

              {activePayment.status === "SUCCESSFUL" && (
                <Button asChild size="sm">
                  <Link href={`/campaigns/new?bookingId=${booking.id}`}>{t("continueToCampaign")}</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

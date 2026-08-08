"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Loader2,
  Receipt,
  SearchX,
  ShieldAlert,
  Send,
  Hash,
  Building2,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  completePayment,
  extractErrorMessage,
  getAdvertiser,
  getBillboard,
  getBooking,
  getMediaBuyer,
  getPaymentsByPayer,
  initiateFlutterwaveCheckout,
  PaymentTransactionResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// Helper de formattage monétaire
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

// Visualisation des statuts de paiement avec styles & icônes
const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  COMPLETED: {
    label: "Payé",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Échoué",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: AlertCircle,
  },
  REFUNDED: {
    label: "Remboursé",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: ArrowRightLeft,
  },
};

function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUS_CONFIG[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
      <span
          className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
              config.className
          )}
      >
      <Icon className="h-3.5 w-3.5 shrink-0" />
        {config.label}
    </span>
  );
}

// Contexte de la délégation : quel panneau, demandé par quel annonceur
function DelegationContext({ payment }: { payment: PaymentTransactionResponse }) {
  const { data: booking } = useSWR(["booking", payment.referenceId], () => getBooking(payment.referenceId));
  const { data: billboard } = useSWR(
    booking ? ["billboard", booking.billboardId] : null,
    () => getBillboard(booking!.billboardId),
  );
  const { data: advertiser } = useSWR(
    payment.initiatedBy ? ["advertiser", payment.initiatedBy] : null,
    () => getAdvertiser(payment.initiatedBy!),
  );

  if (!billboard && !advertiser) return null;

  return (
      <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3 text-xs">
        {billboard && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{billboard.title}</span>
              {billboard.city && <span className="text-muted-foreground">· {billboard.city}</span>}
            </div>
        )}
        {advertiser && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>Demandé par {advertiser.companyName}</span>
            </div>
        )}
      </div>
  );
}

export default function MediaBuyerPaymentsPage() {
  const t = useTranslations("mediaBuyerPayments");
  const tPayments = useTranslations("payments");
  const tCommon = useTranslations("common");
  const { mediaBuyerId } = useAuth();

  const {
    data: payments,
    mutate,
    isLoading,
  } = useSWR(
      mediaBuyerId ? ["payments-by-payer", mediaBuyerId] : null,
      ([, payerId]) => getPaymentsByPayer(payerId)
  );

  const { data: mediaBuyer } = useSWR(mediaBuyerId ? ["media-buyer", mediaBuyerId] : null, () => getMediaBuyer(mediaBuyerId!));

  const [gatewayReferences, setGatewayReferences] = useState<Record<string, string>>({});
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [redirectingId, setRedirectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(event: FormEvent, paymentId: string) {
    event.preventDefault();
    setCompletingId(paymentId);
    setError(null);
    try {
      await completePayment(paymentId, { gatewayReference: gatewayReferences[paymentId] ?? "" });
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, t("complete")));
    } finally {
      setCompletingId(null);
    }
  }

  async function handleFlutterwaveCheckout(paymentId: string) {
    setRedirectingId(paymentId);
    setError(null);
    try {
      const { checkoutUrl } = await initiateFlutterwaveCheckout(paymentId, {
        customerEmail: mediaBuyer?.contactEmail ?? "",
        customerName: mediaBuyer?.companyName ?? "",
        customerPhone: mediaBuyer?.phoneNumber ?? undefined,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(extractErrorMessage(err, tPayments("title")));
      setRedirectingId(null);
    }
  }

  // Si l'utilisateur n'est pas authentifié comme Media Buyer
  if (!mediaBuyerId) {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 border border-amber-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Accès restreint</h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {t("notMediaBuyer")}
          </p>
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        {/* En-tête de la page */}
        <div className="flex flex-col gap-1 border-b border-border/60 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <CreditCard className="h-4 w-4" />
            <span>Espace Facturation</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            Consultez vos transactions, ajustez les paiements en attente et validez les références bancaires.
          </p>
        </div>

        {/* Zone de notification d'erreur */}
        {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
        )}

        {/* État de chargement (Skeleton) */}
        {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        )}

        {/* État vide (Aucun paiement trouvé) */}
        {!isLoading && payments && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <SearchX className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("empty")}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Aucun historique de paiement disponible pour votre compte à ce jour.
              </p>
            </div>
        )}

        {/* Liste des cartes de paiements */}
        {!isLoading && payments && payments.length > 0 && (
            <div className="flex flex-col gap-4">
              {payments.map((payment: PaymentTransactionResponse) => {
                const isCompleting = completingId === payment.id;
                const isRedirecting = redirectingId === payment.id;
                const isPending = payment.status === "PENDING";
                const isFlutterwave = payment.paymentMethod === "FLUTTERWAVE";

                return (
                    <Card
                        key={payment.id}
                        className={cn(
                            "border-border/60 shadow-sm transition-all hover:border-border",
                            isPending && "border-amber-500/30 bg-amber-500/[0.01]"
                        )}
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs text-muted-foreground">
                        ID: {payment.id}
                      </span>
                          </div>
                          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                            {formatCurrency(Number(payment.amount), payment.currency)}
                          </CardTitle>
                        </div>

                        <PaymentStatusBadge status={payment.status} />
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        {payment.delegated && <DelegationContext payment={payment} />}

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">{tPayments("status")}: </span>
                            <span className="font-semibold text-foreground">{payment.status}</span>
                          </div>
                          {payment.gatewayReference && (
                              <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                                <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">Réf: </span>
                                <span className="font-medium text-foreground truncate">
                          {payment.gatewayReference}
                        </span>
                              </div>
                          )}
                        </div>

                        {/* Paiement Flutterwave : redirection vers le checkout hébergé */}
                        {isPending && isFlutterwave && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleFlutterwaveCheckout(payment.id)}
                                disabled={isRedirecting}
                                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                            >
                              {isRedirecting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                  <Wallet className="h-4 w-4" />
                              )}
                              <span>{tPayments("payViaFlutterwave")}</span>
                            </Button>
                        )}

                        {/* Formulaire de complétion manuelle pour les autres moyens de paiement */}
                        {isPending && !isFlutterwave && (
                            <form
                                className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 border-t border-border/40 pt-4"
                                onSubmit={(event) => handleComplete(event, payment.id)}
                            >
                              <div className="flex-1 space-y-1.5">
                                <label
                                    htmlFor={`gatewayReference-${payment.id}`}
                                    className="text-xs font-semibold text-foreground"
                                >
                                  {tPayments("gatewayReference")}
                                </label>
                                <Input
                                    id={`gatewayReference-${payment.id}`}
                                    name={`gatewayReference-${payment.id}`}
                                    placeholder="Ex: TXN_987654321..."
                                    value={gatewayReferences[payment.id] ?? ""}
                                    onChange={(event) =>
                                        setGatewayReferences((prev) => ({
                                          ...prev,
                                          [payment.id]: event.target.value,
                                        }))
                                    }
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                              </div>

                              <Button
                                  type="submit"
                                  size="sm"
                                  disabled={isCompleting || !(gatewayReferences[payment.id]?.trim())}
                                  className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 shrink-0"
                              >
                                {isCompleting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>{tCommon("loading")}</span>
                                    </>
                                ) : (
                                    <>
                                      <Send className="h-3.5 w-3.5" />
                                      <span>{t("complete")}</span>
                                    </>
                                )}
                              </Button>
                            </form>
                        )}
                      </CardContent>
                    </Card>
                );
              })}
            </div>
        )}
      </div>
  );
}

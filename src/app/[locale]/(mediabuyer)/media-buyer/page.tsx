"use client";

import useSWR from "swr";
import {
    CheckCircle2,
    Clock,
    Wallet,
    ArrowRight,
    Receipt,
    Sparkles,
    CreditCard,
    UserCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/dashboard/StatTile";
import { getPaymentsByPayer, PaymentTransactionResponse } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
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

// Config des badges de statut
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    PENDING: {
        label: "En attente",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    COMPLETED: {
        label: "Payé",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    FAILED: {
        label: "Échoué",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    REFUNDED: {
        label: "Remboursé",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
};

function PaymentStatusBadge({ status }: { status: string }) {
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

export default function MediaBuyerDashboardPage() {
    const t = useTranslations("mediaBuyerDashboard");
    const tCommon = useTranslations("common");
    const { email, mediaBuyerId } = useAuth();

    const { data: payments, isLoading } = useSWR(
        mediaBuyerId ? ["payments-by-payer", mediaBuyerId] : null,
        ([, payerId]) => getPaymentsByPayer(payerId)
    );

    const pending = payments?.filter((p) => p.status === "PENDING").length ?? 0;
    const completed = payments?.filter((p) => p.status === "COMPLETED").length ?? 0;

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
            {/* En-tête du tableau de bord */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Tableau de bord Acheteur Média</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        {t("greeting")}
                    </h1>
                    {email && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Connecté en tant que :</span>
                            <span className="font-medium text-foreground">{email}</span>
                        </p>
                    )}
                </div>

                <Button
                    asChild
                    size="sm"
                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/20 shrink-0 self-start sm:self-auto"
                >
                    <Link href="/media-buyer/payments">
                        <CreditCard className="h-4 w-4" />
                        <span>Gérer mes paiements</span>
                    </Link>
                </Button>
            </div>

            {/* Grille des indicateurs statistiques */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                    </>
                ) : (
                    <>
                        <StatTile
                            label={t("totalLabel")}
                            value={payments?.length ?? 0}
                            icon={Wallet}
                            accent="violet"
                        />
                        <StatTile
                            label={t("pendingLabel")}
                            value={pending}
                            icon={Clock}
                            accent="amber"
                        />
                        <StatTile
                            label={t("completedLabel")}
                            value={completed}
                            icon={CheckCircle2}
                            accent="emerald"
                        />
                    </>
                )}
            </div>

            {/* Section des transactions récentes */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <span>{t("recentPayments")}</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Aperçu des 5 dernières opérations financières enregistrées sur votre compte.
                        </CardDescription>
                    </div>

                    {payments && payments.length > 0 && (
                        <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30">
                            <Link href="/media-buyer/payments">
                                <span>{t("viewAll")}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="pt-6">
                    {/* Squelette de chargement */}
                    {isLoading && (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                            ))}
                        </div>
                    )}

                    {/* État vide */}
                    {!isLoading && payments && payments.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                            <Receipt className="h-8 w-8 text-muted-foreground/60 mb-2" />
                            <p className="text-xs font-medium text-foreground">{t("noPayments")}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Vos transactions apparaîtront ici dès l&apos;émission de votre première facture.
                            </p>
                        </div>
                    )}

                    {/* Liste des paiements récents */}
                    {!isLoading && payments && payments.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {payments.slice(0, 5).map((payment: PaymentTransactionResponse) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-violet-500/30 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold text-xs">
                                            <Receipt className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {formatCurrency(Number(payment.amount), payment.currency)}
                                            </p>
                                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                Réf ID: {payment.id}
                                            </p>
                                        </div>
                                    </div>

                                    <PaymentStatusBadge status={payment.status} />
                                </div>
                            ))}

                            <div className="pt-2 sm:hidden">
                                <Button asChild size="sm" variant="outline" className="w-full gap-2">
                                    <Link href="/media-buyer/payments">
                                        <span>{t("viewAll")}</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
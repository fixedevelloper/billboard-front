"use client";

import useSWR from "swr";
import {
    Megaphone,
    Plus,
    AlertCircle,
    ChevronRight,
    Calendar,
    Layers,
    Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCampaignsByAdvertiser, CampaignResponse } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// Mapping des styles de badges selon le statut de la campagne
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    ACTIVE: {
        label: "En cours",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    DRAFT: {
        label: "Brouillon",
        className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    },
    PENDING: {
        label: "En attente",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    COMPLETED: {
        label: "Terminée",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    PAUSED: {
        label: "Suspendue",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
};

function CampaignStatusBadge({ status }: { status: string }) {
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

export default function CampaignsListPage() {
    const t = useTranslations("campaigns.list");
    const tCommon = useTranslations("common");
    const { advertiserId, hydrated } = useAuth();

    const {
        data: campaigns,
        error,
        isLoading,
    } = useSWR(
        advertiserId ? ["campaigns", advertiserId] : null,
        ([, id]) => getCampaignsByAdvertiser(id)
    );

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
            {/* En-tête de la page */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Gestion publicitaire</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Suivez la diffusion et les performances de vos campagnes d'affichage.
                    </p>
                </div>

                {advertiserId && (
                    <Button
                        asChild
                        size="sm"
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 shrink-0 self-start sm:self-auto"
                    >
                        <Link href="/campaigns/new">
                            <Plus className="h-4 w-4" />
                            <span>Créer une campagne</span>
                        </Link>
                    </Button>
                )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error.message}</span>
                </div>
            )}

            {/* Skeletons de chargement */}
            {(isLoading || !hydrated) && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/60">
                            <CardHeader className="p-4 pb-2">
                                <Skeleton className="h-5 w-1/3" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <Skeleton className="h-4 w-1/5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* État vide */}
            {!isLoading && campaigns && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                        <Megaphone className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Aucune campagne trouvée</h3>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                        {t("empty")}
                    </p>
                    <Button
                        asChild
                        size="sm"
                        className="mt-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                    >
                        <Link href="/campaigns/new">
                            <Plus className="h-4 w-4" />
                            <span>Lancer ma première campagne</span>
                        </Link>
                    </Button>
                </div>
            )}

            {/* Liste des campagnes */}
            {!isLoading && campaigns && campaigns.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="text-xs text-muted-foreground font-medium">
                        {campaigns.length} campagne(s) au total
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {campaigns.map((campaign: CampaignResponse) => (
                            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                                <Card className="group border-border/60 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5">
                                    <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-start justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                                                <Megaphone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {campaign.name}
                                                </CardTitle>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    ID: <span className="font-mono">{campaign.id}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CampaignStatusBadge status={campaign.status} />
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/40 mt-3 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="h-3.5 w-3.5 text-foreground/70" />
                                            <span>
                        Statut actuel : <strong className="text-foreground font-medium">{campaign.status}</strong>
                      </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
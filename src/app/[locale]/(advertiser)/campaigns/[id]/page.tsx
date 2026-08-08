"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  BarChart3,
  Send,
  Loader2,
  ImageIcon,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CampaignCreativesModal } from "@/components/campaigns/CampaignCreativesModal";
import { extractErrorMessage, getCampaign, getCreativeProofsByCampaign, submitCampaign } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// Mapping des styles de badges selon le statut de la campagne
const CAMPAIGN_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  PENDING_APPROVAL: {
    label: "En attente de validation",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approuvée",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejetée",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  ACTIVE: {
    label: "En cours de diffusion",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  COMPLETED: {
    label: "Terminée",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = CAMPAIGN_STATUS_STYLES[status] || {
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

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("campaigns.detail");
  const { advertiserId } = useAuth();

  const { data: campaign, error: campaignError, mutate: mutateCampaign, isLoading: loadingCampaign } = useSWR(
      ["campaign", id],
      () => getCampaign(id)
  );

  const { data: proofs, isLoading: loadingProofs } = useSWR(
      ["creative-proofs", id],
      () => getCreativeProofsByCampaign(id)
  );

  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitForApproval() {
    setSubmittingApproval(true);
    setError(null);
    try {
      await submitCampaign(id);
      await mutateCampaign();
    } catch (err) {
      setError(extractErrorMessage(err, t("submitForApproval")));
    } finally {
      setSubmittingApproval(false);
    }
  }

  if (campaignError) {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Erreur de chargement</h2>
          <p className="mt-1 text-xs text-muted-foreground">{campaignError.message}</p>
          <Button asChild size="sm" variant="outline" className="mt-6 gap-2">
            <Link href="/campaigns">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux campagnes</span>
            </Link>
          </Button>
        </div>
    );
  }

  if (loadingCampaign || !campaign) {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
          <Skeleton className="h-6 w-32" />
          <Card className="border-border/60">
            <CardHeader className="p-6">
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
    );
  }

  const canSubmit = campaign.status === "DRAFT" || campaign.status === "REJECTED";

  return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        {/* Retour + Fil d'ariane */}
        <div className="flex items-center gap-2">
          <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <Link href="/campaigns">
              <ArrowLeft className="h-4 w-4" />
              <span>Toutes les campagnes</span>
            </Link>
          </Button>
        </div>

        {/* En-tête principal de la campagne */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="font-mono">ID: {campaign.id}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {campaign.name}
              </h1>
              {campaign.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mt-1">
                    {campaign.description}
                  </p>
              )}
            </div>

            <StatusBadge status={campaign.status} />
          </div>

          {/* Alerte de rejet si présent */}
          {campaign.rejectionReason && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t("rejectionReason")}</p>
                  <p className="mt-0.5 opacity-90">{campaign.rejectionReason}</p>
                </div>
              </div>
          )}

          {/* Feedback d'erreur globale */}
          {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
          )}

          {/* Barre d'outils et actions rapides */}
          <div className="border-t border-border/60 pt-4 mt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Actions & Étapes du projet
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {canSubmit && (
                  <Button
                      size="sm"
                      onClick={handleSubmitForApproval}
                      disabled={submittingApproval}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  >
                    {submittingApproval ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    <span>{t("submitForApproval")}</span>
                  </Button>
              )}

              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href={`/campaigns/${id}/installation`}>
                  <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("goToInstallation")}</span>
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href={`/campaigns/${id}/report`}>
                  <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("goToReport")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Section des épreuves créatives */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("creatives")}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Gérez les visuels soumis pour validation avant impression et diffusion.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {proofs && proofs.length > 0 && (
                    <Badge tone="secondary" className="text-xs font-mono">
                      {proofs.length} version(s)
                    </Badge>
                )}
                {advertiserId && <CampaignCreativesModal campaignId={id} advertiserId={advertiserId} />}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {loadingProofs ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                  ))}
                </div>
            ) : proofs && proofs.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {proofs.slice(0, 6).map((proof) => (
                      <div
                          key={proof.id}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                          title={`${t("version")} #${proof.version} — ${proof.status}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={proof.fileUrl}
                            alt={`${t("version")} ${proof.version}`}
                            className="h-full w-full object-cover"
                        />
                      </div>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-medium text-foreground">{t("noCreatives")}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
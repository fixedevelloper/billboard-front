"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Check,
  ClipboardList,
  ImagePlus,
} from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CampaignCreativesModal } from "@/components/campaigns/CampaignCreativesModal";
import { createCampaign, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<NewCampaignLoading />}>
      <NewCampaignForm />
    </Suspense>
  );
}

function NewCampaignLoading() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-xs text-muted-foreground font-medium">
        Chargement du formulaire de campagne...
      </p>
    </div>
  );
}

function StepBadge({
  active,
  done,
  label,
  icon: Icon,
}: {
  active: boolean;
  done: boolean;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200",
          done && "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
          active && !done && "border-emerald-600 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/10",
          !active && !done && "border-border text-muted-foreground bg-muted/40",
        )}
      >
        {done ? <Check className="size-4 stroke-[3]" /> : <Icon className="size-4" />}
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          active || done ? "text-foreground font-semibold" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function NewCampaignForm() {
  const t = useTranslations("campaigns.create");
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { advertiserId } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateCampaign(event: FormEvent) {
    event.preventDefault();
    if (!advertiserId || !bookingId) return;
    setSubmitting(true);
    setError(null);
    try {
      const campaign = await createCampaign({
        bookingId,
        advertiserId,
        name,
        description: description || undefined,
      });
      setCampaignId(campaign.id);
      setStep(2);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setSubmitting(false);
    }
  }

  // État d'erreur si l'ID de réservation est manquant
  if (!bookingId) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Réservation manquante</h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Impossible de créer une campagne sans identifiant de réservation (<code className="font-mono text-destructive">bookingId</code>). Veuillez sélectionner un emplacement réservé au préalable.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-6 gap-2">
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux campagnes</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
      {/* Bouton retour */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
            <span>Annuler</span>
          </Link>
        </Button>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
        <StepBadge active={step === 1} done={step > 1} label={t("wizardStep1")} icon={ClipboardList} />
        <div className="h-px flex-1 bg-border/80 mx-4" />
        <StepBadge active={step === 2} done={false} label={t("wizardStep2")} icon={ImagePlus} />
      </div>

      {step === 1 && (
        <Card className="border-border/60 shadow-md">
          <CardHeader className="space-y-1.5 border-b border-border/40 pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Nouvelle création</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("title")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Renseignez les détails descriptifs pour programmer la diffusion sur l&apos;écran sélectionné.
            </CardDescription>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] text-muted-foreground font-mono">
              <span>Réservation :</span>
              <span className="font-semibold text-foreground">{bookingId}</span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form className="flex flex-col gap-5" onSubmit={handleCreateCampaign}>
              <div className="space-y-2">
                <Label htmlFor="campaign-name" className="text-xs font-semibold">
                  {t("name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="campaign-name"
                  name="name"
                  placeholder="ex. Promotion Estivale 2026 - Offre Spéciale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-description" className="text-xs font-semibold">
                  {t("description")}
                </Label>
                <Textarea
                  id="campaign-description"
                  name="description"
                  placeholder="Renseignez des notes internes ou des consignes d'affichage (optionnel)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/campaigns")}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !name.trim()}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("submitting")}</span>
                    </>
                  ) : (
                    <span>{t("wizardNext")}</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && campaignId && advertiserId && (
        <Card className="border-border/60 shadow-md">
          <CardHeader className="border-b border-border/40 pb-5">
            <CardTitle className="text-lg font-bold">{t("wizardStep2")}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ajoutez un ou plusieurs visuels pour lancer le processus de validation (optionnel, vous pourrez en ajouter plus tard).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center">
              <ImagePlus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-muted-foreground max-w-xs">
                Gérez les visuels de votre campagne : ajoutez de nouvelles versions et suivez leur statut de validation.
              </p>
              <CampaignCreativesModal campaignId={campaignId} advertiserId={advertiserId} />
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              {t("wizardFinish")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

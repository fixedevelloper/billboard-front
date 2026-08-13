"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ClipboardList,
  ImagePlus,
  ArrowLeft,
  Loader2,
  MapPin,
  Ruler,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CityCombobox } from "@/components/billboards/CityCombobox";
import { BillboardImagesModal } from "@/components/billboards/BillboardImagesModal";
import { BillboardType, createBillboard, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// ---------------- PAGE CREATION DE PANNEAU ----------------
const BILLBOARD_TYPES: BillboardType[] = ["DIGITAL", "STATIC", "TRIVISION", "LED_SCREEN"];

const emptyForm = {
  title: "",
  description: "",
  type: "STATIC" as BillboardType,
  address: "",
  city: "",
  latitude: "0",
  longitude: "0",
  width: "4",
  height: "3",
  dailyRate: "50",
  currency: "XOF",
};

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
                !active && !done && "border-border text-muted-foreground bg-muted/40"
            )}
        >
          {done ? <Check className="size-4 stroke-[3]" /> : <Icon className="size-4" />}
        </div>
        <span
            className={cn(
                "text-sm font-medium transition-colors",
                active || done ? "text-foreground font-semibold" : "text-muted-foreground"
            )}
        >
        {label}
      </span>
      </div>
  );
}

export default function NewBillboardPage() {
  const t = useTranslations("owner.billboards");
  const router = useRouter();
  const { ownerId, isAuthenticated, hydrated, addBillboardId } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [billboardId, setBillboardId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  function updateField<K extends keyof typeof emptyForm>(field: K) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleCreateBillboard(event: FormEvent) {
    event.preventDefault();
    if (!ownerId) return;
    setSubmitting(true);
    setError(null);
    try {
      const billboard = await createBillboard({
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        address: form.address,
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        width: Number(form.width),
        height: Number(form.height),
        dailyRate: form.dailyRate,
        currency: form.currency,
        ownerId,
      });
      addBillboardId(billboard.id);
      setBillboardId(billboard.id);
      setStep(2);
    } catch (err) {
      setError(extractErrorMessage(err, t("createTitle")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || !isAuthenticated) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
        <Link
            href="/my-billboards"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour aux panneaux</span>
        </Link>

        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
          <StepBadge active={step === 1} done={step > 1} label={t("wizardStep1")} icon={ClipboardList} />
          <div className="h-px flex-1 bg-border/80 mx-4" />
          <StepBadge active={step === 2} done={false} label={t("wizardStep2")} icon={ImagePlus} />
        </div>

        {step === 1 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{t("wizardStep1")}</CardTitle>
                <CardDescription className="text-xs">
                  Saisissez les informations techniques et géographiques de votre emplacement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-5" onSubmit={handleCreateBillboard}>
                  <div className="space-y-4">
                    <Input
                        name="title"
                        label={t("billboardTitle")}
                        placeholder="ex: Panneau Digital Boulevard du 20 Mai"
                        value={form.title}
                        onChange={updateField("title")}
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground" htmlFor="description">
                        {t("description")}
                      </label>
                      <textarea
                          id="description"
                          rows={3}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Description complète, visibilité, trafic moyen..."
                          value={form.description}
                          onChange={updateField("description")}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground" htmlFor="type">
                        {t("type")}
                      </label>
                      <select
                          id="type"
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={form.type}
                          onChange={updateField("type")}
                      >
                        {BILLBOARD_TYPES.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Emplacement géographique</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                          name="address"
                          label={t("address")}
                          placeholder="Avenue ou Quartier"
                          value={form.address}
                          onChange={updateField("address")}
                          required
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="city">
                          {t("city")}
                        </label>
                        <CityCombobox
                            value={form.city}
                            onSelect={(city) =>
                                setForm((prev) => ({
                                  ...prev,
                                  city: city.name,
                                  latitude: String(city.latitude),
                                  longitude: String(city.longitude),
                                }))
                            }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                          name="latitude"
                          type="number"
                          step="any"
                          label={t("latitude")}
                          value={form.latitude}
                          onChange={updateField("latitude")}
                          required
                      />
                      <Input
                          name="longitude"
                          type="number"
                          step="any"
                          label={t("longitude")}
                          value={form.longitude}
                          onChange={updateField("longitude")}
                          required
                      />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Ruler className="h-3.5 w-3.5" />
                      <span>Dimensions & Tarif</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                          name="width"
                          type="number"
                          step="any"
                          label={`${t("width")} (m)`}
                          value={form.width}
                          onChange={updateField("width")}
                          required
                      />
                      <Input
                          name="height"
                          type="number"
                          step="any"
                          label={`${t("height")} (m)`}
                          value={form.height}
                          onChange={updateField("height")}
                          required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                          name="dailyRate"
                          type="number"
                          step="0.01"
                          label={t("dailyRate")}
                          value={form.dailyRate}
                          onChange={updateField("dailyRate")}
                          required
                      />
                      <Input
                          name="currency"
                          label={t("currency")}
                          value={form.currency}
                          onChange={updateField("currency")}
                          required
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs font-medium text-destructive mt-1">{error}</p>}

                  <Button
                      type="submit"
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      disabled={submitting}
                  >
                    {submitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("submitting")}</span>
                        </div>
                    ) : (
                        t("wizardNext")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
        )}

        {step === 2 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{t("wizardStep2")}</CardTitle>
                  <CardDescription className="text-xs">{t("wizardAddImagesHint")}</CardDescription>
                </div>

              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-emerald-500/50 hover:bg-muted/30">
                  {/* Modal de gestion complète des images du panneau créé */}
                  {billboardId && ownerId && (
                      <BillboardImagesModal billboardId={billboardId} ownerId={ownerId} />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4 mt-2">

                  <Button
                      type="button"
                      size="sm"
                      onClick={() => router.push("/my-billboards")}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  >
                    {t("wizardFinish")}
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  );
}
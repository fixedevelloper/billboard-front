"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ClipboardList,
  ImagePlus,
  ArrowLeft,
  UploadCloud,
  X,
  Loader2,
  Sparkles,
  MapPin,
  Ruler,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CityCombobox } from "@/components/billboards/CityCombobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BillboardType,
  addBillboardImage,
  createBillboard,
  extractErrorMessage,
  getBillboardImages,
  removeBillboardImage,
  uploadFile,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";

// ---------------- COMPOSANTS POUR LA MODALE GESTION DES IMAGES ----------------
interface ModalEmptyStateProps {
  title: string;
  onNavigateToAdd: () => void;
  addTabLabel: string;
}

function ModalEmptyState({ title, onNavigateToAdd, addTabLabel }: ModalEmptyStateProps) {
  return (
      <div className="flex flex-col items-center justify-center border-dashed border-border/80 bg-card/40 p-6 text-center sm:p-8 rounded-xl shadow-sm my-2">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
          <ImageIcon className="h-7 w-7 stroke-[1.5]" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Plus className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
          Ajoutez des photos de votre panneau sous différents angles pour attirer l'attention des annonceurs.
        </p>

        <Button
            type="button"
            size="sm"
            onClick={onNavigateToAdd}
            className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-md shadow-emerald-500/20"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>{addTabLabel}</span>
        </Button>
      </div>
  );
}

interface BillboardImagesModalProps {
  billboardId: string;
  ownerId: string;
}

export function BillboardImagesModal({ billboardId, ownerId }: BillboardImagesModalProps) {
  const t = useTranslations("billboardImages");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  const { data: images, isLoading, mutate } = useSWR(
      open ? ["billboard-images", billboardId] : null,
      () => getBillboardImages(billboardId)
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;
    const filesArray = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);

    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of selectedFiles) {
        const uploaded = await uploadFile(file, ownerId);
        await addBillboardImage(billboardId, uploaded.publicUrl);
      }
      setSelectedFiles([]);
      setPreviews([]);
      await mutate();
      setActiveTab("list");
    } catch (err) {
      setError(extractErrorMessage(err, t("add")));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    setError(null);
    try {
      await removeBillboardImage(billboardId, imageId);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, t("delete")));
    } finally {
      setDeletingId(null);
    }
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t("manage")}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("title")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Gérez les visuels affichés pour ce panneau publicitaire.
            </DialogDescription>
          </DialogHeader>

          {error && (
              <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium border border-destructive/20">
                {error}
              </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="text-xs">
                {t("listTab")}
              </TabsTrigger>
              <TabsTrigger value="add" className="text-xs">
                {t("addTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4 flex flex-col gap-3">
              {isLoading && (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                    ))}
                  </div>
              )}

              {!isLoading && images && images.length === 0 && (
                  <ModalEmptyState
                      title={t("empty")}
                      onNavigateToAdd={() => setActiveTab("add")}
                      addTabLabel={t("addTab")}
                  />
              )}

              {!isLoading && images && images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-0.5">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                              src={image.url}
                              alt="Panneau publicitaire"
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <button
                              type="button"
                              onClick={() => handleDelete(image.id)}
                              disabled={deletingId === image.id}
                              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50 hover:bg-black/80"
                              aria-label={t("delete")}
                          >
                            {deletingId === image.id ? (
                                <Loader2 className="h-3 w-3 animate-spin text-white" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </TabsContent>

            <TabsContent value="add" className="mt-4 flex flex-col gap-4">
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-colors hover:border-emerald-500/50 hover:bg-muted/30">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Glissez vos photos ou <span className="text-emerald-600 underline">parcourez</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP</p>
              </div>

              {previews.length > 0 && (
                  <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Fichiers prêts ({previews.length})
                </span>
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, index) => (
                          <div
                              key={index}
                              className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="Aperçu" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeSelectedFile(index)}
                                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
              >
                {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Téléversement...</span>
                    </>
                ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>{t("add")}</span>
                    </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
  );
}

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  function updateField<K extends keyof typeof emptyForm>(field: K) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;
    const filesArray = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);

    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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

  async function handleUploadImages() {
    if (selectedFiles.length === 0 || !billboardId || !ownerId) return;
    setUploading(true);
    setImageError(null);
    try {
      for (const file of selectedFiles) {
        const uploaded = await uploadFile(file, ownerId);
        await addBillboardImage(billboardId, uploaded.publicUrl);
        setUploadedCount((count) => count + 1);
      }
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      setImageError(extractErrorMessage(err, t("wizardStep2")));
    } finally {
      setUploading(false);
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

                {previews.length > 0 && (
                    <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Fichiers prêts pour l'envoi ({previews.length})
                </span>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="Aperçu" className="h-full w-full object-cover" />
                              <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {imageError && <p className="text-xs font-medium text-destructive">{imageError}</p>}

                {uploadedCount > 0 && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>
                  {t("wizardImagesUploaded")} ({uploadedCount})
                </span>
                    </div>
                )}

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
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ImagePlus,
  UploadCloud,
  X,
  Loader2,
  ImageIcon,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  extractErrorMessage,
  getCreativeProofsByCampaign,
  submitCreativeProof,
  uploadFile,
} from "@/lib/api";

interface CampaignCreativesModalProps {
  campaignId: string;
  advertiserId: string;
}

// ---------------- COMPOSANT EMPTY STATE INTERNE ----------------
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
        Soumettez un visuel pour lancer le processus de validation de votre campagne.
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

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

// ---------------- MODALE PRINCIPALE ----------------
export function CampaignCreativesModal({ campaignId, advertiserId }: CampaignCreativesModalProps) {
  const t = useTranslations("campaigns.detail");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  const { data: proofs, isLoading, mutate } = useSWR(
    open ? ["creative-proofs", campaignId] : null,
    () => getCreativeProofsByCampaign(campaignId),
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
        const uploaded = await uploadFile(file, advertiserId);
        const { width, height } = await readImageDimensions(file);
        await submitCreativeProof({ campaignId, fileId: uploaded.id, width, height });
      }
      setSelectedFiles([]);
      setPreviews([]);
      await mutate();
      setActiveTab("list");
    } catch (err) {
      setError(extractErrorMessage(err, t("uploadCreative")));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{t("creatives")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{t("creatives")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Gérez les visuels soumis pour validation avant impression et diffusion.
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
              {t("creatives")}
            </TabsTrigger>
            <TabsTrigger value="add" className="text-xs">
              {t("uploadCreative")}
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1: Versions existantes */}
          <TabsContent value="list" className="mt-4 flex flex-col gap-3">
            {isLoading && (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
            )}

            {!isLoading && proofs && proofs.length === 0 && (
              <ModalEmptyState
                title={t("noCreatives")}
                onNavigateToAdd={() => setActiveTab("add")}
                addTabLabel={t("uploadCreative")}
              />
            )}

            {!isLoading && proofs && proofs.length > 0 && (
              <div className="flex max-h-[320px] flex-col gap-2.5 overflow-y-auto p-0.5">
                {proofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proof.fileUrl}
                      alt={`${t("version")} ${proof.version}`}
                      className="h-12 w-12 shrink-0 rounded-lg border border-border/60 bg-muted object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {t("version")} #{proof.version}
                        </span>
                        <Badge tone="secondary" className="text-[10px] font-mono uppercase">
                          {proof.status}
                        </Badge>
                      </div>
                      {proof.feedback && (
                        <p className="mt-1 truncate text-[11px] italic text-muted-foreground">
                          &ldquo;{proof.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Onglet 2: Ajouter des visuels */}
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
                Glissez vos visuels ou <span className="text-emerald-600 underline">parcourez</span>
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
                  <span>{t("uploadCreative")}</span>
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

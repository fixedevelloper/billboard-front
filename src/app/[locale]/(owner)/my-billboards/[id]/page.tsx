"use client";

import { FormEvent, useEffect, useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Loader2, MapPin, Ruler, ShieldAlert, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BillboardImagesModal } from "@/components/billboards/BillboardImagesModal";
import { CityCombobox } from "@/components/billboards/CityCombobox";
import {
  BillboardType,
  deleteBillboard,
  extractErrorMessage,
  getBillboard,
  updateBillboard,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

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

export default function EditBillboardPage() {
  const t = useTranslations("owner.billboards");
  const tCommon = useTranslations("common");
  const params = useParams<{ id: string }>();
  const billboardId = params.id;
  const router = useRouter();
  const { ownerId, isAuthenticated, hydrated, removeBillboardId } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: billboard, isLoading } = useSWR(
    billboardId ? ["billboard", billboardId] : null,
    () => getBillboard(billboardId),
    {
      onSuccess: (data) => {
        setForm({
          title: data.title,
          description: data.description ?? "",
          type: data.type as BillboardType,
          address: data.address ?? "",
          city: data.city ?? "",
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          width: String(data.width),
          height: String(data.height),
          dailyRate: data.dailyRate,
          currency: data.currency,
        });
      },
    },
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  function updateField<K extends keyof typeof emptyForm>(field: K) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await updateBillboard(billboardId, {
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
      });
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, tCommon("save")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBillboard(billboardId);
      removeBillboardId(billboardId);
      router.push("/my-billboards");
    } catch (err) {
      setDeleteError(extractErrorMessage(err, t("deleteBillboard")));
      setDeleting(false);
    }
  }

  if (!hydrated || !isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (billboard && ownerId && billboard.ownerId !== ownerId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="border-border/60 p-6 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">{t("notOwner")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <Link
        href="/my-billboards"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t("title")}</span>
      </Link>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold">{form.title || t("billboardTitle")}</CardTitle>
            <CardDescription className="text-xs">{t("createTitle")}</CardDescription>
          </div>
          {ownerId && <BillboardImagesModal billboardId={billboardId} ownerId={ownerId} />}
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                name="title"
                label={t("billboardTitle")}
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

            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{t("address")} / {t("city")}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input name="address" label={t("address")} value={form.address} onChange={updateField("address")} required />
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Ruler className="h-3.5 w-3.5" />
                <span>{t("width")} / {t("dailyRate")}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  name="dailyRate"
                  type="number"
                  step="0.01"
                  label={t("dailyRate")}
                  value={form.dailyRate}
                  onChange={updateField("dailyRate")}
                  required
                />
                <Input name="currency" label={t("currency")} value={form.currency} onChange={updateField("currency")} required />
              </div>
            </div>

            {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
            {success && <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{t("updateSuccess")}</p>}

            <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    {t("deleteBillboard")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("deleteBillboard")}</DialogTitle>
                    <DialogDescription>{t("deleteConfirm")}</DialogDescription>
                  </DialogHeader>
                  {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDelete} loading={deleting} disabled={deleting}>
                      {t("deleteBillboard")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button type="submit" loading={submitting} disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

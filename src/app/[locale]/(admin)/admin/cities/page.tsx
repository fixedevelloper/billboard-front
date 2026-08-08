"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CityResponse, createCity, deleteCity, extractErrorMessage, getCities, updateCity } from "@/lib/api";

const emptyForm = { name: "", country: "", latitude: "", longitude: "" };

export default function AdminCitiesPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: cities, mutate } = useSWR("admin-cities", () => getCities());

  const [editing, setEditing] = useState<CityResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deletingCity, setDeletingCity] = useState<CityResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(city: CityResponse) {
    setEditing(city);
    setForm({
      name: city.name,
      country: city.country ?? "",
      latitude: String(city.latitude),
      longitude: String(city.longitude),
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input = {
        name: form.name,
        country: form.country || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (editing) {
        await updateCity(editing.id, input);
      } else {
        await createCity(input);
      }
      await mutate();
      setFormOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err, t("tabCities")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingCity) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCity(deletingCity.id);
      await mutate();
      setDeletingCity(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, t("deleteCity")));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("tabCities")}</h1>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("addCity")}
        </Button>
      </div>

      <Card>
        {!cities && <p className="p-4 text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {cities && cities.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">{t("emptyCities")}</p>
        )}
        {cities && cities.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colCountry")}</TableHead>
                <TableHead>{t("colLatitude")}</TableHead>
                <TableHead>{t("colLongitude")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell className="text-muted-foreground">{city.country ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{city.latitude}</TableCell>
                  <TableCell className="text-muted-foreground">{city.longitude}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(city)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setDeletingCity(city);
                          setDeleteError(null);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog création / édition */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("editCity") : t("addCity")}</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Input
              name="name"
              label={t("colName")}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <Input
              name="country"
              label={t("colCountry")}
              value={form.country}
              onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="latitude"
                type="number"
                step="any"
                label={t("colLatitude")}
                value={form.latitude}
                onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))}
                required
              />
              <Input
                name="longitude"
                type="number"
                step="any"
                label={t("colLongitude")}
                value={form.longitude}
                onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {editing ? tCommon("save") : t("addCity")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deletingCity} onOpenChange={(open) => !open && setDeletingCity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCity")}</DialogTitle>
            <DialogDescription>
              {t("deleteCityConfirm", { name: deletingCity?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDelete} loading={deleting} disabled={deleting}>
              {t("deleteCity")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

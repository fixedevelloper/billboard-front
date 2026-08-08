"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Radar,
  Calendar,
  User,
  Check,
  X,
  AlertCircle,
  Loader2,
  CalendarDays,
  Building2,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePayerMap } from "@/components/admin/usePayerMap";
import {
  cancelBooking,
  confirmBooking,
  extractErrorMessage,
  getBillboardsByOwner,
  getBookingsByBillboard,
  BookingResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

// Helper de formatage monétaire
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

export default function OwnerBookingsPage() {
  const t = useTranslations("ownerBookings");
  const tTracking = useTranslations("bookingTracking");
  const { ownerId } = useAuth();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: billboards, isLoading: isLoadingBillboards } = useSWR(
      ownerId ? ["my-billboards", ownerId] : null,
      () => getBillboardsByOwner(ownerId as string)
  );

  const billboardIds = useMemo(
      () => billboards?.map((b) => b.id) ?? [],
      [billboards]
  );

  const {
    data: bookings,
    mutate,
    isLoading: isLoadingBookings,
  } = useSWR(
      billboardIds.length > 0 ? ["owner-bookings", billboardIds.join(",")] : null,
      () =>
          Promise.all(
              billboardIds.map((id) => getBookingsByBillboard(id))
          ).then((lists) => lists.flat())
  );

  const billboardMap = useMemo(
      () => new Map(billboards?.map((b) => [b.id, b.title]) ?? []),
      [billboards]
  );
  const payerMap = usePayerMap();

  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isLoadingBillboards || (billboardIds.length > 0 && isLoadingBookings);

  // Filtrage des réservations
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((booking) => {
      const billboardTitle = billboardMap.get(booking.billboardId) || booking.billboardId;
      const advertiserName = payerMap.get(booking.advertiserId) || booking.advertiserId;

      const matchesSearch =
          billboardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          advertiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
          statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter, billboardMap, payerMap]);

  // Statistiques calculées
  const stats = useMemo(() => {
    if (!bookings) return { total: 0, pending: 0, confirmed: 0, revenue: 0 };
    return bookings.reduce(
        (acc, b) => {
          acc.total += 1;
          if (b.status === "PENDING") acc.pending += 1;
          if (b.status === "CONFIRMED") {
            acc.confirmed += 1;
            acc.revenue += Number(b.totalPrice) || 0;
          }
          return acc;
        },
        { total: 0, pending: 0, confirmed: 0, revenue: 0 }
    );
  }, [bookings]);

  async function handleConfirm(id: string) {
    setRunningId(id);
    setError(null);
    try {
      await confirmBooking(id);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, t("confirm")));
    } finally {
      setRunningId(null);
    }
  }

  async function handleCancel(id: string) {
    setRunningId(id);
    setError(null);
    try {
      await cancelBooking(id);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, t("cancel")));
    } finally {
      setRunningId(null);
    }
  }

  // Non autorisé / Non connecté
  if (!ownerId) {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 border border-amber-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Accès restreint</h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Vous devez être connecté en tant que propriétaire pour consulter vos réservations.
          </p>
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        {/* En-tête principal */}
        <div className="flex flex-col gap-1 border-b border-border/60 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <CalendarDays className="h-4 w-4" />
            <span>Espace Propriétaire</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            Gérez les demandes de réservation sur vos panneaux publicitaires et suivez leur cycle de vie.
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
        )}

        {/* Cartes de statistiques rapide */}
        {!isLoading && bookings && bookings.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="border-border/60 shadow-sm p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">Total Demandes</p>
                  <p className="text-lg font-extrabold text-foreground">{stats.total}</p>
                </div>
              </Card>

              <Card className="border-border/60 shadow-sm p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">En attente</p>
                  <p className="text-lg font-extrabold text-foreground">{stats.pending}</p>
                </div>
              </Card>

              <Card className="border-border/60 shadow-sm p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">Confirmées</p>
                  <p className="text-lg font-extrabold text-foreground">{stats.confirmed}</p>
                </div>
              </Card>

              <Card className="border-border/60 shadow-sm p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[11px] font-medium text-muted-foreground truncate">Volume Confirmé</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {formatCurrency(stats.revenue, "EUR")}
                  </p>
                </div>
              </Card>
            </div>
        )}

        {/* Barre de recherche et de filtres */}
        {!isLoading && bookings && bookings.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par panneau, annonceur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
                {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((status) => (
                    <Button
                        key={status}
                        size="sm"
                        variant={statusFilter === status ? "default" : "outline"}
                        onClick={() => setStatusFilter(status)}
                        className="h-8 text-[11px] px-2.5 rounded-lg whitespace-nowrap"
                    >
                      {status === "ALL" && "Tous"}
                      {status === "PENDING" && "En attente"}
                      {status === "CONFIRMED" && "Confirmés"}
                      {status === "CANCELLED" && "Annulés"}
                    </Button>
                ))}
              </div>
            </div>
        )}

        {/* Carte principale avec Tableau */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          {isLoading && (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
          )}

          {/* État vide global */}
          {!isLoading && bookings && bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/10 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{t("empty")}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Aucune réservation enregistrée pour vos panneaux publicitaires actuellement.
                </p>
              </div>
          )}

          {/* Aucun résultat trouvé après filtrage */}
          {!isLoading && bookings && bookings.length > 0 && filteredBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-xs font-semibold text-foreground">Aucun résultat trouvé</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Essayez de modifier votre terme de recherche ou le filtre appliqué.
                </p>
              </div>
          )}

          {/* Affichage des réservations */}
          {!isLoading && filteredBookings.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-border/60">
                      <TableHead className="text-xs font-bold">{t("colBillboard")}</TableHead>
                      <TableHead className="text-xs font-bold">{t("colAdvertiser")}</TableHead>
                      <TableHead className="text-xs font-bold">{t("colDates")}</TableHead>
                      <TableHead className="text-xs font-bold">{t("colTotal")}</TableHead>
                      <TableHead className="text-xs font-bold">{t("colStatus")}</TableHead>
                      <TableHead className="text-xs font-bold text-right">{t("colActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking: BookingResponse) => {
                      const isActionRunning = runningId === booking.id;
                      const isPending = booking.status === "PENDING";
                      const isCancelable =
                          booking.status !== "CANCELLED" && booking.status !== "COMPLETED";

                      return (
                          <TableRow key={booking.id} className="border-border/40 hover:bg-muted/20">
                            {/* Panneau */}
                            <TableCell className="font-semibold text-xs text-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[180px]">
                            {billboardMap.get(booking.billboardId) ?? booking.billboardId}
                          </span>
                              </div>
                            </TableCell>

                            {/* Annonceur */}
                            <TableCell className="text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                <span className="truncate max-w-[150px]">
                            {payerMap.get(booking.advertiserId) ?? booking.advertiserId}
                          </span>
                              </div>
                            </TableCell>

                            {/* Dates */}
                            <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                <span>
                            {booking.startDate} → {booking.endDate}
                          </span>
                              </div>
                            </TableCell>

                            {/* Prix Total */}
                            <TableCell className="text-xs font-bold text-foreground whitespace-nowrap">
                              {formatCurrency(Number(booking.totalPrice), booking.currency)}
                            </TableCell>

                            {/* Statut */}
                            <TableCell className="whitespace-nowrap">
                              <StatusBadge status={booking.status} />
                            </TableCell>

                            {/* Actions en Menu Déroulant (Dropdown) */}
                            <TableCell className="text-right whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-muted"
                                      disabled={isActionRunning}
                                  >
                                    {isActionRunning ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    ) : (
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">Ouvrir le menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {/* Lien vers le suivi / Détail */}
                                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                                    <Link
                                        href={`/my-billboards/bookings/${booking.id}`}
                                        className="flex items-center gap-2"
                                    >
                                      <Radar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>{tTracking("trigger")}</span>
                                    </Link>
                                  </DropdownMenuItem>

                                  {(isPending || isCancelable) && <DropdownMenuSeparator />}

                                  {/* Action : Confirmer */}
                                  {isPending && (
                                      <DropdownMenuItem
                                          onClick={() => handleConfirm(booking.id)}
                                          className="cursor-pointer text-xs text-emerald-600 focus:text-emerald-700 dark:text-emerald-400 flex items-center gap-2"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>{t("confirm")}</span>
                                      </DropdownMenuItem>
                                  )}

                                  {/* Action : Annuler */}
                                  {isCancelable && (
                                      <DropdownMenuItem
                                          onClick={() => handleCancel(booking.id)}
                                          className="cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        <span>{t("cancel")}</span>
                                      </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
          )}
        </Card>
      </div>
  );
}
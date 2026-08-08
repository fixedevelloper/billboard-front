"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePayerMap } from "@/components/admin/usePayerMap";
import { listAllBillboards, listAllBookings } from "@/lib/api";

export default function AdminBookingsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: bookings } = useSWR("admin-bookings", listAllBookings);
  const { data: billboards } = useSWR("admin-billboards", listAllBillboards);
  const payerMap = usePayerMap();

  const billboardMap = useMemo(() => new Map(billboards?.map((b) => [b.id, b.title]) ?? []), [billboards]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabBookings")}</h1>

      <Card>
        {!bookings && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {bookings && bookings.length === 0 && <p className="text-sm text-muted-foreground">{t("emptyBookings")}</p>}
        {bookings && bookings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colBillboard")}</TableHead>
                <TableHead>{t("colAdvertiser")}</TableHead>
                <TableHead>{t("colDates")}</TableHead>
                <TableHead>{t("colTotal")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {billboardMap.get(booking.billboardId) ?? booking.billboardId}
                  </TableCell>
                  <TableCell>{payerMap.get(booking.advertiserId) ?? booking.advertiserId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {booking.startDate} → {booking.endDate}
                  </TableCell>
                  <TableCell>
                    {booking.totalPrice} {booking.currency}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

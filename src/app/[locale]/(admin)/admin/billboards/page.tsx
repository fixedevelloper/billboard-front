"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listAllBillboards, listOwners } from "@/lib/api";

export default function AdminBillboardsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: billboards } = useSWR("admin-billboards", listAllBillboards);
  const { data: owners } = useSWR("admin-owners", listOwners);

  const ownerMap = useMemo(() => new Map(owners?.map((o) => [o.id, o.companyName]) ?? []), [owners]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabBillboards")}</h1>

      <Card>
        {!billboards && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {billboards && billboards.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("emptyBillboards")}</p>
        )}
        {billboards && billboards.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colTitle")}</TableHead>
                <TableHead>{t("colCity")}</TableHead>
                <TableHead>{t("colOwner")}</TableHead>
                <TableHead>{t("colDailyRate")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billboards.map((billboard) => (
                <TableRow key={billboard.id}>
                  <TableCell className="font-medium">{billboard.title}</TableCell>
                  <TableCell className="text-muted-foreground">{billboard.city ?? "—"}</TableCell>
                  <TableCell>{ownerMap.get(billboard.ownerId) ?? billboard.ownerId}</TableCell>
                  <TableCell>
                    {billboard.dailyRate} {billboard.currency}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={billboard.status} />
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

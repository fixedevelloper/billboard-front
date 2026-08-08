"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePayerMap } from "@/components/admin/usePayerMap";
import { listAllCampaigns } from "@/lib/api";

export default function AdminCampaignsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: campaigns } = useSWR("admin-campaigns", listAllCampaigns);
  const payerMap = usePayerMap();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabCampaigns")}</h1>

      <Card>
        {!campaigns && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {campaigns && campaigns.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("emptyCampaigns")}</p>
        )}
        {campaigns && campaigns.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colAdvertiser")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("colRejectionReason")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{payerMap.get(campaign.advertiserId) ?? campaign.advertiserId}</TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{campaign.rejectionReason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

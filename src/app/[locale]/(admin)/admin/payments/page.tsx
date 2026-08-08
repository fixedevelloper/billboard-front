"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usePayerMap } from "@/components/admin/usePayerMap";
import { listAllPayments } from "@/lib/api";

export default function AdminPaymentsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tCommon = useTranslations("common");
  const { data: payments } = useSWR("admin-payments", listAllPayments);
  const payerMap = usePayerMap();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabPayments")}</h1>

      <Card>
        {!payments && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {payments && payments.length === 0 && <p className="text-sm text-muted-foreground">{t("emptyPayments")}</p>}
        {payments && payments.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colPayer")}</TableHead>
                <TableHead>{t("colAmount")}</TableHead>
                <TableHead>{t("colMethod")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("colReference")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payerMap.get(payment.payerId) ?? payment.payerId}</TableCell>
                  <TableCell>
                    {payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.gatewayReference ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

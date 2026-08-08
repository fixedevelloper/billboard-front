"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllAuditLogs } from "@/lib/api";

export default function AdminJournalPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tDashboard = useTranslations("admin.dashboard");
  const tCommon = useTranslations("common");
  const { data: logs } = useSWR("admin-journal", listAllAuditLogs);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabJournal")}</h1>

      <Card>
        {!logs && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {logs && logs.length === 0 && <p className="text-sm text-muted-foreground">{tDashboard("empty")}</p>}
        {logs && logs.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tDashboard("actionType")}</TableHead>
                <TableHead>{tDashboard("targetEntity")}</TableHead>
                <TableHead>{t("colTarget")}</TableHead>
                <TableHead>{tDashboard("detailsLabel")}</TableHead>
                <TableHead>{t("colDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.targetEntity}</TableCell>
                  <TableCell className="text-muted-foreground">{log.targetId}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

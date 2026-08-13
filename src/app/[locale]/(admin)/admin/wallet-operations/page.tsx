"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useUserMap } from "@/components/admin/useUserMap";
import { completeWalletOperation, extractErrorMessage, failWalletOperation, listAllWalletOperations } from "@/lib/api";

export default function AdminWalletOperationsPage() {
  const t = useTranslations("admin.dashboard.entities");
  const tDashboard = useTranslations("admin.dashboard");
  const tWallet = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const { data: operations, mutate } = useSWR("admin-wallet-operations", listAllWalletOperations);
  const userMap = useUserMap();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(id: string) {
    setRunningId(id);
    setError(null);
    try {
      await completeWalletOperation(id);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, tDashboard("completeOperation")));
    } finally {
      setRunningId(null);
    }
  }

  async function handleFail(id: string) {
    const reason = rejectReasons[id] ?? "";
    if (!reason) return;
    setRunningId(id);
    setError(null);
    try {
      await failWalletOperation(id, reason);
      setRejectingId(null);
      await mutate();
    } catch (err) {
      setError(extractErrorMessage(err, tDashboard("failOperation")));
    } finally {
      setRunningId(null);
    }
  }

  function details(operation: NonNullable<typeof operations>[number]) {
    if (operation.method === "MOBILE_MONEY") return operation.phoneNumber ?? "—";
    if (operation.bankIban) return `${operation.bankAccountHolder} · ${operation.bankIban} · ${operation.bankName}`;
    return "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("tabWalletOperations")}</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        {!operations && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
        {operations && operations.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("emptyWalletOperations")}</p>
        )}
        {operations && operations.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colUser")}</TableHead>
                <TableHead>{t("colType")}</TableHead>
                <TableHead>{t("colMethod")}</TableHead>
                <TableHead>{t("colAmount")}</TableHead>
                <TableHead>{t("colDetails")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{tDashboard("quickActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium">{userMap.get(operation.userId) ?? operation.userId}</TableCell>
                  <TableCell>{tWallet(operation.type === "DEPOSIT" ? "deposit" : "withdraw")}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tWallet(operation.method === "MOBILE_MONEY" ? "methodMobileMoney" : "methodBankTransfer")}
                  </TableCell>
                  <TableCell>
                    {operation.amount} {operation.currency}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{details(operation)}</TableCell>
                  <TableCell>
                    <StatusBadge status={operation.status} />
                  </TableCell>
                  <TableCell>
                    {operation.status === "PENDING" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            loading={runningId === operation.id}
                            disabled={runningId !== null}
                            onClick={() => handleComplete(operation.id)}
                          >
                            {tDashboard("completeOperation")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={runningId !== null}
                            onClick={() => setRejectingId(rejectingId === operation.id ? null : operation.id)}
                          >
                            {tDashboard("failOperation")}
                          </Button>
                        </div>
                        {rejectingId === operation.id && (
                          <div className="flex items-end gap-2">
                            <Input
                              name={`failReason-${operation.id}`}
                              label={tDashboard("rejectReasonLabel")}
                              value={rejectReasons[operation.id] ?? ""}
                              onChange={(event) =>
                                setRejectReasons((prev) => ({ ...prev, [operation.id]: event.target.value }))
                              }
                            />
                            <Button
                              size="sm"
                              loading={runningId === operation.id}
                              disabled={runningId !== null || !rejectReasons[operation.id]}
                              onClick={() => handleFail(operation.id)}
                            >
                              {tDashboard("failOperation")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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

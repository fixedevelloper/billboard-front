"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getWallet, getWalletOperations, WalletOperationStatus } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { DepositDialog } from "@/components/wallet/DepositDialog";
import { WithdrawalDialog } from "@/components/wallet/WithdrawalDialog";

function statusTone(status: WalletOperationStatus) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

export default function WalletPage() {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { userId, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const { data: wallet, mutate: mutateWallet } = useSWR(
    userId ? ["wallet", userId] : null,
    ([, id]) => getWallet(id),
  );
  const { data: operations, mutate: mutateOperations } = useSWR(
    userId ? ["wallet-operations", userId] : null,
    ([, id]) => getWalletOperations(id),
  );

  async function refresh() {
    await Promise.all([mutateWallet(), mutateOperations()]);
  }

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card className="flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <WalletIcon className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("balance")}</p>
            <p className="text-2xl font-semibold">
              {wallet ? `${wallet.balance} ${wallet.currency}` : tCommon("loading")}
            </p>
          </div>
        </div>
        {userId && wallet && (
          <div className="flex flex-wrap gap-2">
            <DepositDialog userId={userId} currency={wallet.currency} onCompleted={refresh} />
            <WithdrawalDialog userId={userId} currency={wallet.currency} balance={wallet.balance} onCompleted={refresh} />
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!operations && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
          {operations && operations.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          )}
          {operations && operations.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colType")}</TableHead>
                  <TableHead>{t("colMethod")}</TableHead>
                  <TableHead>{t("colAmount")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  <TableHead>{t("colDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      <Badge tone={operation.type === "DEPOSIT" ? "success" : "warning"} variant="outline">
                        {t(operation.type === "DEPOSIT" ? "deposit" : "withdraw")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t(operation.method === "MOBILE_MONEY" ? "methodMobileMoney" : "methodBankTransfer")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {operation.type === "DEPOSIT" ? "+" : "-"}
                      {operation.amount} {operation.currency}
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone(operation.status)}>
                        {t(`operationStatus.${operation.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{operation.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

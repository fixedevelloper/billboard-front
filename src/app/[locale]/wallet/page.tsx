"use client";

import { FormEvent, useEffect, useState } from "react";
import useSWR from "swr";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Wallet as WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { depositToWallet, extractErrorMessage, getWallet, getWalletTransactions, withdrawFromWallet } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

function MovementDialog({
  kind,
  currency,
  onSubmit,
}: {
  kind: "deposit" | "withdraw";
  currency: string;
  onSubmit: (amount: string, reference: string) => Promise<void>;
}) {
  const t = useTranslations("wallet");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(amount, reference);
      setAmount("");
      setReference("");
      setOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err, t(kind === "deposit" ? "deposit" : "withdraw")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={kind === "deposit" ? "default" : "outline"} className="gap-2">
          {kind === "deposit" ? <ArrowDownCircle className="size-4" /> : <ArrowUpCircle className="size-4" />}
          {t(kind === "deposit" ? "deposit" : "withdraw")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(kind === "deposit" ? "depositTitle" : "withdrawTitle")}</DialogTitle>
          <DialogDescription>{t(kind === "deposit" ? "depositDescription" : "withdrawDescription")}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            label={`${t("amount")} (${currency})`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <Input
            name="reference"
            label={t("referenceOptional")}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" loading={submitting} disabled={submitting}>
              {t(kind === "deposit" ? "deposit" : "withdraw")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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
  const { data: transactions, mutate: mutateTransactions } = useSWR(
    userId ? ["wallet-transactions", userId] : null,
    ([, id]) => getWalletTransactions(id),
  );

  async function refresh() {
    await Promise.all([mutateWallet(), mutateTransactions()]);
  }

  async function handleDeposit(amount: string, reference: string) {
    if (!userId) return;
    await depositToWallet(userId, { amount, currency: wallet?.currency ?? "XOF", reference: reference || undefined });
    await refresh();
  }

  async function handleWithdraw(amount: string, reference: string) {
    if (!userId) return;
    await withdrawFromWallet(userId, { amount, currency: wallet?.currency ?? "XOF", reference: reference || undefined });
    await refresh();
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
        <div className="flex flex-wrap gap-2">
          <MovementDialog kind="deposit" currency={wallet?.currency ?? "XOF"} onSubmit={handleDeposit} />
          <MovementDialog kind="withdraw" currency={wallet?.currency ?? "XOF"} onSubmit={handleWithdraw} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
          {transactions && transactions.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          )}
          {transactions && transactions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colType")}</TableHead>
                  <TableHead>{t("colAmount")}</TableHead>
                  <TableHead>{t("colReference")}</TableHead>
                  <TableHead>{t("colDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge tone={transaction.type === "DEPOSIT" ? "success" : "warning"}>
                        {t(transaction.type === "DEPOSIT" ? "deposit" : "withdraw")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.type === "DEPOSIT" ? "+" : "-"}
                      {transaction.amount} {transaction.currency}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{transaction.reference ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{transaction.createdAt}</TableCell>
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

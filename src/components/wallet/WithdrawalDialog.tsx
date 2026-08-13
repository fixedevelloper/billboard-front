"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpCircle, Info, Landmark, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { extractErrorMessage, initiateWithdrawal, WalletOperationMethod, WalletOperationResponse } from "@/lib/api";

export function WithdrawalDialog({
  userId,
  currency,
  balance,
  onCompleted,
}: {
  userId: string;
  currency: string;
  balance: string;
  onCompleted: () => void;
}) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<WalletOperationMethod>("MOBILE_MONEY");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WalletOperationResponse | null>(null);

  function reset() {
    setMethod("MOBILE_MONEY");
    setAmount("");
    setPhoneNumber("");
    setBankAccountHolder("");
    setBankIban("");
    setBankName("");
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const operation = await initiateWithdrawal(userId, {
        method,
        amount,
        currency,
        phoneNumber: method === "MOBILE_MONEY" ? phoneNumber : undefined,
        bankAccountHolder: method === "BANK_TRANSFER" ? bankAccountHolder : undefined,
        bankIban: method === "BANK_TRANSFER" ? bankIban : undefined,
        bankName: method === "BANK_TRANSFER" ? bankName : undefined,
      });
      setResult(operation);
      onCompleted();
    } catch (err) {
      setError(extractErrorMessage(err, t("withdraw")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowUpCircle className="size-4" />
          {t("withdraw")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("withdrawTitle")}</DialogTitle>
          <DialogDescription>{t("withdrawDescription")}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              {result.method === "MOBILE_MONEY" ? t("withdrawMobileMoneyPending") : t("withdrawBankPending")}
            </div>
            <Button onClick={() => setOpen(false)}>{tCommon("close")}</Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Tabs value={method} onValueChange={(value) => setMethod(value as WalletOperationMethod)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="MOBILE_MONEY" className="gap-1.5">
                  <Smartphone className="size-4" />
                  {t("methodMobileMoney")}
                </TabsTrigger>
                <TabsTrigger value="BANK_TRANSFER" className="gap-1.5">
                  <Landmark className="size-4" />
                  {t("methodBankTransfer")}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              label={`${t("amount")} (${currency}) — ${t("balance")}: ${balance}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            {method === "MOBILE_MONEY" ? (
              <Input
                name="phoneNumber"
                type="tel"
                label={t("phoneNumberReceiving")}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            ) : (
              <div className="flex flex-col gap-4">
                <Input
                  name="bankAccountHolder"
                  label={t("bankAccountHolder")}
                  value={bankAccountHolder}
                  onChange={(event) => setBankAccountHolder(event.target.value)}
                  required
                />
                <Input
                  name="bankIban"
                  label={t("bankIban")}
                  value={bankIban}
                  onChange={(event) => setBankIban(event.target.value)}
                  required
                />
                <Input
                  name="bankName"
                  label={t("bankName")}
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <Info className="size-4 shrink-0" />
              <p>{method === "MOBILE_MONEY" ? t("withdrawMobileMoneyExplanation") : t("withdrawBankExplanation")}</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {t("withdraw")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

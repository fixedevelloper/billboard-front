"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownCircle, Info, Landmark, Smartphone } from "lucide-react";
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
import {
  extractErrorMessage,
  getPlatformBankDetails,
  initiateDeposit,
  PlatformBankAccountResponse,
  WalletOperationMethod,
  WalletOperationResponse,
} from "@/lib/api";

export function DepositDialog({
  userId,
  currency,
  onCompleted,
}: {
  userId: string;
  currency: string;
  onCompleted: () => void;
}) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<WalletOperationMethod>("MOBILE_MONEY");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankAccount, setBankAccount] = useState<PlatformBankAccountResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WalletOperationResponse | null>(null);

  useEffect(() => {
    if (open && method === "BANK_TRANSFER" && !bankAccount) {
      getPlatformBankDetails()
        .then(setBankAccount)
        .catch(() => undefined);
    }
  }, [open, method, bankAccount]);

  function reset() {
    setMethod("MOBILE_MONEY");
    setAmount("");
    setPhoneNumber("");
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const operation = await initiateDeposit(userId, {
        method,
        amount,
        currency,
        phoneNumber: method === "MOBILE_MONEY" ? phoneNumber : undefined,
      });
      setResult(operation);
      onCompleted();
    } catch (err) {
      setError(extractErrorMessage(err, t("deposit")));
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
        <Button className="gap-2">
          <ArrowDownCircle className="size-4" />
          {t("deposit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("depositTitle")}</DialogTitle>
          <DialogDescription>{t("depositDescription")}</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            {result.method === "MOBILE_MONEY" ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/30">
                {t("depositMobileMoneyPending", { phoneNumber: result.phoneNumber ?? "" })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/30">
                <p>{t("depositBankPending")}</p>
                <dl className="mt-2 space-y-1 font-mono text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("bankAccountHolder")}</dt>
                    <dd>{bankAccount?.accountHolderName || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">IBAN</dt>
                    <dd>{bankAccount?.iban || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("bankName")}</dt>
                    <dd>{bankAccount?.bankName || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t("transferReference")}</dt>
                    <dd className="font-semibold">{result.reference}</dd>
                  </div>
                </dl>
              </div>
            )}
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
              label={`${t("amount")} (${currency})`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            {method === "MOBILE_MONEY" && (
              <Input
                name="phoneNumber"
                type="tel"
                label={t("phoneNumber")}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            )}

            <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <Info className="size-4 shrink-0" />
              {method === "MOBILE_MONEY" ? (
                <p>{t("depositMobileMoneyExplanation")}</p>
              ) : (
                <div className="space-y-1.5">
                  <p>{t("depositBankExplanation")}</p>
                  {bankAccount && bankAccount.iban && (
                    <dl className="space-y-0.5 font-mono">
                      <div>{bankAccount.accountHolderName}</div>
                      <div>IBAN : {bankAccount.iban}</div>
                      <div>{t("bankName")} : {bankAccount.bankName}</div>
                    </dl>
                  )}
                  {bankAccount && !bankAccount.iban && <p className="italic">{t("bankDetailsUnavailable")}</p>}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {t("deposit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

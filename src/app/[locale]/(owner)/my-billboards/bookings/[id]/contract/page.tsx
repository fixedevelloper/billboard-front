"use client";

import { FormEvent, use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  extractErrorMessage,
  getBillboard,
  getBooking,
  getContractByBooking,
  publishContractForSignature,
  signContractAsOwner,
} from "@/lib/api";

export default function OwnerBookingContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");

  const { data: booking } = useSWR(["booking", id], () => getBooking(id));
  const { data: billboard } = useSWR(
    booking ? ["billboard", booking.billboardId] : null,
    () => getBillboard(booking!.billboardId),
  );
  const {
    data: contract,
    error: contractError,
    isLoading: loadingContract,
    mutate: mutateContract,
  } = useSWR(booking ? ["contract-by-booking", booking.id] : null, ([, bookingId]) =>
    getContractByBooking(bookingId),
  );

  const [signerName, setSignerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    if (!contract) return;
    setSubmitting(true);
    setError(null);
    try {
      await publishContractForSignature(contract.id);
      await mutateContract();
    } catch (err) {
      setError(extractErrorMessage(err, t("publish")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSign(event: FormEvent) {
    event.preventDefault();
    if (!contract) return;
    setSubmitting(true);
    setError(null);
    try {
      await signContractAsOwner(contract.id, { signerName, ipAddress: "0.0.0.0" });
      await mutateContract();
    } catch (err) {
      setError(extractErrorMessage(err, t("signAsOwner")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!booking || !billboard) {
    return <p className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link
        href={`/my-billboards/bookings/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{billboard.title}</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {error && <p className="text-destructive">{error}</p>}

          {loadingContract && <p className="text-muted-foreground">{tCommon("loading")}</p>}

          {!contract && contractError && !loadingContract && (
            <p className="text-muted-foreground">{t("notCreated")}</p>
          )}

          {contract && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>{t("status")}</span>
                <StatusBadge status={contract.status} />
              </div>

              {(contract.status === "DRAFT" || contract.status === "PENDING_SIGNATURE") &&
                contract.termsAndConditions && (
                  <div className="flex flex-col gap-1.5 rounded-md border bg-muted/20 p-3">
                    <span className="text-xs font-medium text-muted-foreground">{t("terms")}</span>
                    <p className="whitespace-pre-wrap text-sm">{contract.termsAndConditions}</p>
                  </div>
                )}

              {contract.status === "DRAFT" && (
                <Button size="sm" loading={submitting} disabled={submitting} onClick={handlePublish}>
                  {t("publish")}
                </Button>
              )}

              {contract.status === "PENDING_SIGNATURE" && !contract.isSignedByOwner && (
                <form className="flex flex-col gap-3" onSubmit={handleSign}>
                  <Input
                    name="signerName"
                    label={t("signerName")}
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" loading={submitting} disabled={submitting}>
                    {submitting ? t("submitting") : t("submit")}
                  </Button>
                </form>
              )}

              {contract.status === "PENDING_SIGNATURE" && contract.isSignedByOwner && (
                <p className="text-muted-foreground">{t("waitingAdvertiser")}</p>
              )}

              {contract.status === "SIGNED" && <p className="font-medium text-primary">{t("signed")}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

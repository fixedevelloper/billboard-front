"use client";

import { FormEvent, use, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createContract,
  extractErrorMessage,
  getBillboard,
  getBooking,
  getContractByBooking,
  publishContractForSignature,
  signContractAsAdvertiser,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

export default function BookingContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const { advertiserId } = useAuth();

  const { data: booking } = useSWR(["booking", id], () => getBooking(id));
  const { data: billboard } = useSWR(
    booking ? ["billboard", booking.billboardId] : null,
    () => getBillboard(booking!.billboardId),
  );
  const {
    data: contract,
    error: contractError,
    mutate: mutateContract,
  } = useSWR(booking ? ["contract-by-booking", booking.id] : null, ([, bookingId]) =>
    getContractByBooking(bookingId),
  );

  const [terms, setTerms] = useState(
    "Le présent contrat régit la location de l'emplacement publicitaire décrit ci-dessus pour la durée de la réservation.",
  );
  const [signerName, setSignerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!booking || !billboard || !advertiserId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createContract({
        bookingId: booking.id,
        ownerId: billboard.ownerId,
        advertiserId,
        termsAndConditions: terms,
      });
      await mutateContract();
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setSubmitting(false);
    }
  }

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
      await signContractAsAdvertiser(contract.id, { signerName, ipAddress: "0.0.0.0" });
      await mutateContract();
    } catch (err) {
      setError(extractErrorMessage(err, t("signAsAdvertiser")));
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
        href={`/bookings/${id}`}
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

          {!contract && contractError && (
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="terms">
                  {t("terms")}
                </label>
                <textarea
                  id="terms"
                  className="min-h-32 rounded-md border bg-transparent p-3 text-sm"
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? tCommon("loading") : t("title")}
              </Button>
            </form>
          )}

          {contract && (
            <div className="flex flex-col gap-4">
              <p>
                {t("status")}: <span className="font-medium">{contract.status}</span>
              </p>

              {contract.status === "DRAFT" && (
                <Button size="sm" loading={submitting} disabled={submitting} onClick={handlePublish}>
                  {t("publish")}
                </Button>
              )}

              {contract.status === "PENDING_SIGNATURE" && !contract.isSignedByAdvertiser && (
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

              {contract.status === "PENDING_SIGNATURE" && contract.isSignedByAdvertiser && (
                <p className="text-muted-foreground">{t("waitingOwner")}</p>
              )}

              {contract.status === "SIGNED" && <p className="font-medium text-primary">{t("signed")}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

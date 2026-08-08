"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractErrorMessage, registerOwner } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

export default function BecomeOwnerPage() {
  const t = useTranslations("owner.become");
  const router = useRouter();
  const { userId, isAuthenticated, hydrated, logout } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    contactEmail: "",
    phoneNumber: "",
    revenueShareRate: "0.15",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    try {
      await registerOwner({
        userId,
        companyName: form.companyName,
        registrationNumber: form.registrationNumber || undefined,
        contactEmail: form.contactEmail,
        phoneNumber: form.phoneNumber || undefined,
        revenueShareRate: form.revenueShareRate,
      });
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-foreground">{t("success")}</p>
              <p className="text-sm text-muted-foreground">{t("reloginRequired")}</p>
              <Button onClick={() => logout()} asChild>
                <Link href="/login">{t("continue")}</Link>
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                name="companyName"
                label={t("companyName")}
                value={form.companyName}
                onChange={updateField("companyName")}
                required
              />
              <Input
                name="registrationNumber"
                label={t("registrationNumber")}
                value={form.registrationNumber}
                onChange={updateField("registrationNumber")}
              />
              <Input
                name="contactEmail"
                type="email"
                label={t("contactEmail")}
                value={form.contactEmail}
                onChange={updateField("contactEmail")}
                required
              />
              <Input
                name="phoneNumber"
                type="tel"
                label={t("phoneNumber")}
                value={form.phoneNumber}
                onChange={updateField("phoneNumber")}
              />
              <Input
                name="revenueShareRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                label={t("revenueShareRate")}
                value={form.revenueShareRate}
                onChange={updateField("revenueShareRate")}
                required
                error={error ?? undefined}
              />
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? t("submitting") : t("submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { extractErrorMessage, registerOwner } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import {
  Building2,
  CheckCircle2,
  Percent,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

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
      <div className="relative min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <CardHeader className="space-y-3 text-center pb-6 border-b border-border/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner border border-primary/20">
              {success ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 animate-bounce" />
              ) : (
                  <Building2 className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("title")}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t("subtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {success ? (
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("success")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                      {t("reloginRequired")}
                    </p>
                  </div>

                  <Button
                      onClick={() => logout()}
                      asChild
                      className="w-full gap-2 font-medium shadow-lg shadow-primary/25 h-11"
                  >
                    <Link href="/login">
                      {t("continue")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Message d'erreur global */}
                  {error && (
                      <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                  )}

                  {/* Section Informations de l'entreprise */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        {t("companyName")} *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="companyName"
                            placeholder="e.g. Acme Corp Marketplace"
                            value={form.companyName}
                            onChange={updateField("companyName")}
                            required
                            className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        {t("registrationNumber")}
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="registrationNumber"
                            placeholder="e.g. SIRET / TAX ID"
                            value={form.registrationNumber}
                            onChange={updateField("registrationNumber")}
                            className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* Section Contact */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        {t("contactEmail")} *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="contactEmail"
                            type="email"
                            placeholder="owner@company.com"
                            value={form.contactEmail}
                            onChange={updateField("contactEmail")}
                            required
                            className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        {t("phoneNumber")}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="phoneNumber"
                            type="tel"
                            placeholder="+33 6 00 00 00 00"
                            value={form.phoneNumber}
                            onChange={updateField("phoneNumber")}
                            className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* Commission plateforme : fixée par Guen's Pub, pas par le propriétaire
                      (voir BillboardOwner.DEFAULT_REVENUE_SHARE_RATE côté backend). */}
                  <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Percent className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">{t("revenueShareRate")}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t("revenueShareRateHint")}</p>
                    </div>
                  </div>

                  {/* Bouton de soumission */}
                  <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 mt-2"
                  >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t("submitting")}
                  </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                          {t("submit")}
                  </span>
                    )}
                  </Button>
                </form>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
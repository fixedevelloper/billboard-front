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
  BadgeCheck,
  Loader2,
  Shield,
  Zap,
  TrendingUp,
  Wallet,
  ArrowLeft,
} from "lucide-react";

export function BecomeOwnerClient() {
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        {/* Header avec navigation */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center px-4 py-4 md:px-6">
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 shadow-lg shadow-purple-500/20">
                <BadgeCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Générez des revenus</p>
                <p className="text-xs text-muted-foreground mt-1">Monétisez vos espaces</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Paiements automatiques</p>
                <p className="text-xs text-muted-foreground mt-1">Revenus mensuels garantis</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Gestion simplifiée</p>
                <p className="text-xs text-muted-foreground mt-1">Dashboard intuitif</p>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire */}
          <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent pb-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Informations de l'entreprise</CardTitle>
                  <CardDescription className="text-sm">
                    Enregistrez votre entreprise pour commencer à louer vos espaces
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {success ? (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/20">
                      <CheckCircle2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Demande soumise avec succès !</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {t("success")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground/70 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          {t("reloginRequired")}
                        </p>
                      </div>
                    </div>

                    <Button
                        onClick={() => {
                          logout();
                        }}
                        asChild
                        size="lg"
                        className="w-full max-w-sm bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
                    >
                      <Link href="/login">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t("continue")}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
              ) : (
                  <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Section: Informations de l'entreprise */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10">
                          <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">Informations de l'entreprise</h4>
                      </div>

                      {/* Champ: Nom de l'entreprise */}
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                          {t("companyName")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                          <Input
                              id="companyName"
                              name="companyName"
                              value={form.companyName}
                              onChange={updateField("companyName")}
                              placeholder="Ex: Immobilier Plus SARL"
                              required
                              className="h-11 pl-9 bg-background border-border/60 focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      {/* Champ: Numéro d'enregistrement (optionnel) */}
                      <div className="space-y-2">
                        <label htmlFor="registrationNumber" className="text-sm font-medium text-foreground">
                          {t("registrationNumber")} <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                          <Input
                              id="registrationNumber"
                              name="registrationNumber"
                              value={form.registrationNumber}
                              onChange={updateField("registrationNumber")}
                              placeholder="Ex: RC Douala 2024 B 12345"
                              className="h-11 pl-9 bg-background border-border/60 focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="border-border/40" />

                    {/* Section: Contact */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                          <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">Informations de contact</h4>
                      </div>

                      {/* Champ: Email de contact */}
                      <div className="space-y-2">
                        <label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
                          {t("contactEmail")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                          <Input
                              id="contactEmail"
                              name="contactEmail"
                              type="email"
                              value={form.contactEmail}
                              onChange={updateField("contactEmail")}
                              placeholder="contact@votre-entreprise.com"
                              required
                              className="h-11 pl-9 bg-background border-border/60 focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      {/* Champ: Téléphone (optionnel) */}
                      <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                          {t("phoneNumber")} <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                          <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel"
                              value={form.phoneNumber}
                              onChange={updateField("phoneNumber")}
                              placeholder="+237 6XX XX XX XX"
                              className="h-11 pl-9 bg-background border-border/60 focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="border-border/40" />

                    {/* Commission plateforme */}
                    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                        <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{t("revenueShareRate")}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t("revenueShareRateHint")}</p>
                      </div>
                    </div>

                    {/* Message d'erreur */}
                    {error && (
                        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </div>
                          <span className="text-sm font-medium text-destructive">{error}</span>
                        </div>
                    )}

                    {/* Bouton de soumission */}
                    <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        className="h-12 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-600/25 gap-2 text-base mt-2"
                    >
                      {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Traitement en cours...</span>
                          </>
                      ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            <span>{t("submit")}</span>
                          </>
                      )}
                    </Button>

                    {/* Note de sécurité */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Vos informations sont sécurisées et confidentielles</span>
                    </div>
                  </form>
              )}
            </CardContent>
          </Card>

          {/* Footer avec aide */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Besoin d'aide ?{" "}
              <Link href="/contact" className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline-offset-4 hover:underline">
                Contactez notre équipe
              </Link>
            </p>
          </div>
        </main>
      </div>
  );
}
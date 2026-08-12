"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractErrorMessage, resendVerificationEmail, verifyEmail } from "@/lib/api";

export function VerifyEmailForm() {
  return (
      <Suspense fallback={null}>
        <VerifyEmailFormInner />
      </Suspense>
  );
}

function VerifyEmailFormInner() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(token.trim());
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendMessage(null);
    try {
      await resendVerificationEmail(email);
      setResendMessage(t("resendSuccess"));
    } catch {
      setResendMessage(t("resendSuccess"));
    } finally {
      setResending(false);
    }
  }

  return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {email ? t("subtitleWithEmail", { email }) : t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-medium text-foreground">{t("success")}</p>
                <Button asChild className="w-full sm:w-auto mt-2">
                  <Link href="/login">{t("goToLogin")}</Link>
                </Button>
              </div>
          ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    name="email"
                    type="email"
                    label={t("emailLabel")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <Input
                    name="token"
                    label={t("codeLabel")}
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    required
                />

                {error && (
                    <div className="p-3 text-sm font-medium rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                      {error}
                    </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                    {submitting ? t("submitting") : t("submit")}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground space-y-1">
                    <p>
                      {t("resendPrompt")}{" "}
                      <button
                          type="button"
                          onClick={handleResend}
                          disabled={resending || !email}
                          className="font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resending ? t("resending") : t("resend")}
                      </button>
                    </p>
                    {resendMessage && <p className="text-xs">{resendMessage}</p>}
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/login"
                        className="font-semibold text-primary underline-offset-4 hover:underline transition-all"
                    >
                      {t("goToLogin")}
                    </Link>
                  </p>
                </div>
              </form>
          )}
        </CardContent>
      </Card>
  );
}

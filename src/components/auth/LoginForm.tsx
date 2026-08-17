"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { ACCOUNT_NOT_VERIFIED_MESSAGE, extractErrorMessage, loginUser } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

// Valeurs possibles de ?error= posées par OAuth2AuthenticationSuccessHandler /
// OAuth2AuthenticationFailureHandler côté backend lors d'un retour Google/Facebook.
const OAUTH_ERROR_KEYS: Record<string, string> = {
  oauth: "errorGeneric",
  oauth_no_email: "errorNoEmail",
  account_disabled: "errorAccountDisabled",
};

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const tOAuth = useTranslations("auth.oauth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Init paresseuse : ?error= vient d'une redirection OAuth2 côté backend (voir OAUTH_ERROR_KEYS),
  // donc déjà connu au premier rendu — pas besoin d'un effect pour le lire après coup.
  const [error, setError] = useState<string | null>(() => {
    const oauthError = searchParams.get("error");
    return oauthError && OAUTH_ERROR_KEYS[oauthError] ? tOAuth(OAUTH_ERROR_KEYS[oauthError]) : null;
  });
  const [notVerified, setNotVerified] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotVerified(false);
    try {
      const session = await loginUser({ email, password });
      login(session);

      // Redirection directe vers l'espace si un seul profil est actif — évite un aller-retour
      // via /space (mount -> useEffect -> nouvelle navigation) inutilement fragile. Avec un
      // compte multi-profils (ou aucun profil), /space affiche le sélecteur comme avant.
      const profileHrefs = [
        session.advertiserId && "/dashboard",
        session.ownerId && "/owner-dashboard",
        session.mediaBuyerId && "/media-buyer",
        session.adminId && "/admin",
      ].filter((href): href is string => !!href);

      router.push(profileHrefs.length === 1 ? profileHrefs[0] : "/space");
    } catch (err) {
      const message = extractErrorMessage(err, t("title"));
      setError(message);
      setNotVerified(message === ACCOUNT_NOT_VERIFIED_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <OAuthButtons />

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                  name="email"
                  type="email"
                  label={tCommon("email")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
              />

              <div className="space-y-1">
                <PasswordInput
                    name="password"
                    label={tCommon("password")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    error={error ?? undefined}
                />
              </div>
            </div>

            {/* Banner d'erreur globale si nécessaire */}
            {error && (
                <div className="p-3 text-sm font-medium rounded-lg bg-destructive/10 text-destructive border border-destructive/20 transition-all space-y-2">
                  <p>{error}</p>
                  {notVerified && (
                      <Link
                          href={`/verify-email?email=${encodeURIComponent(email)}`}
                          className="inline-block font-semibold underline underline-offset-4"
                      >
                        {t("verifyCta")}
                      </Link>
                  )}
                </div>
            )}

            <div className="space-y-4 pt-2">
              <Button
                  type="submit"
                  className="w-full"
                  loading={submitting}
                  disabled={submitting}
              >
                {submitting ? t("submitting") : t("submit")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("noAccount")}{" "}
                <Link
                    href="/register"
                    className="font-semibold text-primary underline-offset-4 hover:underline transition-all"
                >
                  {t("createAccount")}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
  );
}
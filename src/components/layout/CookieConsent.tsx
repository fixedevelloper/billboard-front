"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { markCookieNoticeAcknowledged, useCookieBannerVisible } from "@/hooks/use-cookie-banner-visible";

/**
 * Simple notice, pas une bannière de consentement avec choix : l'unique cookie posé par
 * l'app (voir AuthController) est le cookie de session HttpOnly, strictement nécessaire au
 * fonctionnement (authentification) et donc exempté d'opt-in RGPD. Le bouton sert juste à
 * ne plus l'afficher, pas à activer/désactiver quoi que ce soit.
 */
export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const bannerVisible = useCookieBannerVisible();
  const [dismissed, setDismissed] = useState(false);

  function acknowledge() {
    markCookieNoticeAcknowledged();
    setDismissed(true);
  }

  if (!bannerVisible || dismissed) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{t("title")}</span>{" "}
            {t("message")}
          </p>
        </div>
        <Button onClick={acknowledge} size="sm" className="shrink-0 self-end sm:self-auto">
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}

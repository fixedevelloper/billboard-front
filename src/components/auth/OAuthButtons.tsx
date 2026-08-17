import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

/**
 * Navigation complète (pas de fetch/router) : le flux OAuth2 est géré entièrement côté backend
 * (Spring Security), qui redirige ensuite vers /space avec le cookie de session déjà posé.
 */
export function OAuthButtons() {
  const t = useTranslations("auth.oauth");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="outline" asChild className="w-full">
          <a href={`${API_BASE_URL}/oauth2/authorization/google`} className="flex items-center justify-center gap-2">
            <GoogleIcon className="h-4 w-4" />
            <span>{t("continueWithGoogle")}</span>
          </a>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <a href={`${API_BASE_URL}/oauth2/authorization/facebook`} className="flex items-center justify-center gap-2">
            <FacebookIcon className="h-4 w-4" />
            <span>{t("continueWithFacebook")}</span>
          </a>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t("orContinueWith")}</span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.27-2.09 3.56-5.17 3.56-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.89-3.01c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.29v3.1C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.6H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4l4.02-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l4.02 3.1c.94-2.82 3.58-4.93 6.69-4.93z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="#1877F2">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  );
}

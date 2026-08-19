"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useCookieBannerVisible } from "@/hooks/use-cookie-banner-visible";
import { cn } from "@/lib/utils";

// TODO: remplacer par le vrai numéro WhatsApp de Guen's Pub (format international E.164, sans
// "+" ni espaces, ex: "225XXXXXXXXX").
const WHATSAPP_NUMBER = "242066516978";

// Pages d'auth plein écran (formulaire centré, pas de place pour un bouton flottant) : mêmes
// exclusions que le Header (voir HIDDEN_ON dans Header.tsx).
const HIDDEN_ON = new Set(["/login", "/register", "/verify-email"]);

export function WhatsAppButton() {
  const t = useTranslations("whatsapp");
  const pathname = usePathname();
  // Remonte au-dessus de la bannière de cookies tant qu'elle est visible, pour ne pas se
  // superposer avec elle en bas d'écran.
  const cookieBannerVisible = useCookieBannerVisible();

  if (HIDDEN_ON.has(pathname)) {
    return null;
  }

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("prefilledMessage"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("ariaLabel")}
      className={cn(
        "group fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        cookieBannerVisible ? "bottom-24 sm:bottom-28" : "bottom-5 sm:bottom-6"
      )}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-40" />
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.386.7 4.61 1.902 6.47L4 29l7.72-1.87A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.8a9.76 9.76 0 0 1-4.98-1.36l-.357-.21-4.58 1.11 1.127-4.46-.232-.366A9.74 9.74 0 0 1 5.2 15c0-5.965 4.84-10.8 10.804-10.8 5.963 0 10.8 4.835 10.8 10.8 0 5.964-4.837 10.8-10.8 10.8Zm5.937-8.09c-.325-.163-1.923-.95-2.222-1.058-.298-.109-.515-.163-.732.163-.217.326-.84 1.058-1.03 1.276-.19.217-.38.244-.705.081-.325-.163-1.372-.505-2.613-1.61-.966-.861-1.618-1.924-1.808-2.25-.19-.325-.02-.5.143-.663.147-.146.325-.38.488-.57.163-.19.217-.326.325-.543.109-.217.054-.407-.027-.57-.081-.163-.732-1.765-1.003-2.418-.264-.634-.532-.548-.732-.558l-.624-.011c-.217 0-.57.081-.868.407-.298.326-1.138 1.113-1.138 2.715 0 1.602 1.166 3.15 1.329 3.368.163.217 2.294 3.502 5.557 4.912.777.335 1.383.535 1.856.685.78.248 1.49.213 2.05.13.626-.093 1.923-.786 2.194-1.545.271-.76.271-1.41.19-1.546-.081-.135-.298-.217-.623-.38Z" />
      </svg>
    </a>
  );
}

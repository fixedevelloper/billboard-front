import { useSyncExternalStore } from "react";

export const COOKIE_NOTICE_STORAGE_KEY = "cookie-notice-acknowledged";

// Événement synthétique séparé du native "storage" (qui ne se déclenche que dans les *autres*
// onglets) : nécessaire pour que useCookieBannerVisible se remette à jour dans le même onglet
// dès que markCookieNoticeAcknowledged() est appelé (ex: bouton WhatsApp qui doit remonter
// dès que la bannière de cookies est acquittée, sans attendre un rechargement de page).
const ACKNOWLEDGED_EVENT = "cookie-notice-acknowledged-change";

export function markCookieNoticeAcknowledged() {
  window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(ACKNOWLEDGED_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ACKNOWLEDGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ACKNOWLEDGED_EVENT, callback);
  };
}

/**
 * Lecture de localStorage via useSyncExternalStore (même pattern que AuthProvider.useHydrated) :
 * le rendu serveur ne peut pas savoir si la notice a déjà été vue, donc on la considère
 * "acquittée" tant que le client n'a pas confirmé le contraire, pour éviter tout flash au
 * premier rendu et tout mismatch d'hydratation React.
 */
export function useCookieBannerVisible(): boolean {
  const acknowledged = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === "true",
    () => true,
  );
  return !acknowledged;
}

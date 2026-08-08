"use client";

import { ReactNode, useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentSession, logoutUser, type SessionUser } from "@/lib/api";

interface AuthState {
  session: SessionUser | null;
  // true une fois qu'on a demandé au backend s'il existe une session valide (cookie HttpOnly) -
  // avant login/register il n'y en a pas forcément, et on n'a aucun moyen de le savoir sans lui
  // demander : on ne peut plus décoder un JWT nous-mêmes, il n'est jamais exposé au JS.
  authChecked: boolean;
  // BillboardController n'a aucun endpoint "lister les billboards d'un propriétaire", donc on
  // mémorise les ids créés pour reconstituer "mes billboards" via GET /billboards/{id}.
  myBillboardIds: string[];
  setSession: (session: SessionUser | null) => void;
  setAuthChecked: (checked: boolean) => void;
  addBillboardId: (billboardId: string) => void;
  removeBillboardId: (billboardId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      authChecked: false,
      myBillboardIds: [],
      setSession: (session) => set({ session, authChecked: true }),
      setAuthChecked: (authChecked) => set({ authChecked }),
      addBillboardId: (billboardId) =>
        set((state) => ({ myBillboardIds: [...state.myBillboardIds, billboardId] })),
      removeBillboardId: (billboardId) =>
        set((state) => ({ myBillboardIds: state.myBillboardIds.filter((id) => id !== billboardId) })),
      logout: () => {
        // best-effort : même si l'appel réseau échoue, on efface l'état local tout de suite
        logoutUser().catch(() => undefined);
        set({ session: null, myBillboardIds: [] });
      },
    }),
    {
      name: "billboard-auth",
      // Seul myBillboardIds est persisté. Le JWT vit uniquement dans un cookie HttpOnly posé par
      // le backend (voir AuthController) : jamais en localStorage, jamais lu par ce store. La
      // session elle-même n'est pas persistée non plus - elle est reconstituée à chaque
      // chargement via GET /api/v1/auth/me, seule source de vérité.
      partialize: (state) => ({ myBillboardIds: state.myBillboardIds }) as AuthState,
    },
  ),
);

const noopSubscribe = () => () => {};

/**
 * zustand-persist ne peut lire localStorage qu'après le montage côté client : le rendu
 * serveur doit donc rester "non hydraté" pour éviter un mismatch d'hydratation React.
 * useSyncExternalStore avec des snapshots serveur/client différents est la façon
 * recommandée d'exprimer ça (contrairement à un useEffect + setState).
 */
function usePersistHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Demande au backend, via le cookie HttpOnly, s'il existe une session active. C'est la seule
 * façon de savoir si l'utilisateur est connecté : contrairement à l'ancien modèle (JWT décodé
 * côté client), le token n'est jamais accessible en JS.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  useEffect(() => {
    let cancelled = false;
    getCurrentSession()
      .then((session) => {
        if (!cancelled) setSession(session);
      })
      .catch(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [setSession, setAuthChecked]);

  return <>{children}</>;
}

export function useAuth() {
  const persistHydrated = usePersistHydrated();
  const session = useAuthStore((state) => state.session);
  const authChecked = useAuthStore((state) => state.authChecked);
  const myBillboardIds = useAuthStore((state) => state.myBillboardIds);
  const setSession = useAuthStore((state) => state.setSession);
  const addBillboardId = useAuthStore((state) => state.addBillboardId);
  const removeBillboardId = useAuthStore((state) => state.removeBillboardId);
  const logout = useAuthStore((state) => state.logout);

  const hydrated = persistHydrated && authChecked;

  return {
    userId: hydrated ? session?.userId ?? null : null,
    email: hydrated ? session?.email ?? null : null,
    advertiserId: hydrated ? session?.advertiserId ?? null : null,
    ownerId: hydrated ? session?.ownerId ?? null : null,
    mediaBuyerId: hydrated ? session?.mediaBuyerId ?? null : null,
    adminId: hydrated ? session?.adminId ?? null : null,
    myBillboardIds: hydrated ? myBillboardIds : [],
    isAuthenticated: hydrated && !!session,
    hydrated,
    // Le composant appelant a déjà le SessionUser renvoyé par POST /auth/login : pas besoin de
    // le re-décoder, on le pousse simplement dans le store.
    login: setSession,
    addBillboardId,
    removeBillboardId,
    logout,
  };
}

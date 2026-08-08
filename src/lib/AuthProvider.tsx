"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DecodedToken {
  sub?: string;
  userId?: string;
  advertiserId?: string;
  ownerId?: string;
  mediaBuyerId?: string;
  adminId?: string;
  exp?: number;
}

interface AuthState {
  token: string | null;
  // Idem : BillboardController n'a aucun endpoint "lister les billboards d'un propriétaire",
  // donc on mémorise les ids créés pour reconstituer "mes billboards" via GET /billboards/{id}.
  myBillboardIds: string[];
  setToken: (token: string | null) => void;
  addBillboardId: (billboardId: string) => void;
  removeBillboardId: (billboardId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      myBillboardIds: [],
      setToken: (token) => set({ token }),
      addBillboardId: (billboardId) =>
        set((state) => ({ myBillboardIds: [...state.myBillboardIds, billboardId] })),
      removeBillboardId: (billboardId) =>
        set((state) => ({ myBillboardIds: state.myBillboardIds.filter((id) => id !== billboardId) })),
      logout: () => set({ token: null, myBillboardIds: [] }),
    }),
    { name: "billboard-auth" },
  ),
);

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

/**
 * zustand-persist ne peut lire localStorage qu'après le montage côté client : le rendu
 * serveur doit donc rester "non hydraté" pour éviter un mismatch d'hydratation React.
 * useSyncExternalStore avec des snapshots serveur/client différents est la façon
 * recommandée d'exprimer ça (contrairement à un useEffect + setState).
 */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * advertiserId/ownerId/mediaBuyerId/adminId viennent du JWT (calculés côté serveur à la
 * connexion, voir AuthenticationService.login côté backend) — pas de state client séparé
 * à synchroniser, ils sont toujours à jour dès qu'on se reconnecte.
 */
export function useAuth() {
  const hydrated = useHydrated();
  const token = useAuthStore((state) => state.token);
  const myBillboardIds = useAuthStore((state) => state.myBillboardIds);
  const setToken = useAuthStore((state) => state.setToken);
  const addBillboardId = useAuthStore((state) => state.addBillboardId);
  const removeBillboardId = useAuthStore((state) => state.removeBillboardId);
  const logout = useAuthStore((state) => state.logout);

  const decoded = token ? decodeToken(token) : null;

  return {
    token: hydrated ? token : null,
    userId: hydrated ? decoded?.userId ?? null : null,
    email: hydrated ? decoded?.sub ?? null : null,
    advertiserId: hydrated ? decoded?.advertiserId ?? null : null,
    ownerId: hydrated ? decoded?.ownerId ?? null : null,
    mediaBuyerId: hydrated ? decoded?.mediaBuyerId ?? null : null,
    adminId: hydrated ? decoded?.adminId ?? null : null,
    myBillboardIds: hydrated ? myBillboardIds : [],
    isAuthenticated: hydrated && !!token,
    hydrated,
    login: setToken,
    addBillboardId,
    removeBillboardId,
    logout,
  };
}

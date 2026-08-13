import { useMemo } from "react";
import useSWR from "swr";
import { listUsers } from "@/lib/api";

/** userId (compte de connexion) -> email, pour les entités qui référencent directement un User (ex. WalletOperation), contrairement à usePayerMap qui référence un profil annonceur/media buyer. */
export function useUserMap() {
  const { data: users } = useSWR("admin-users", listUsers);

  return useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => map.set(u.id, u.email));
    return map;
  }, [users]);
}

import { useMemo } from "react";
import useSWR from "swr";
import { listAdvertisers, listMediaBuyers } from "@/lib/api";

export function usePayerMap() {
  const { data: advertisers } = useSWR("admin-advertisers", listAdvertisers);
  const { data: mediaBuyers } = useSWR("admin-media-buyers", listMediaBuyers);

  return useMemo(() => {
    const map = new Map<string, string>();
    advertisers?.forEach((a) => map.set(a.id, a.companyName));
    mediaBuyers?.forEach((m) => map.set(m.id, m.companyName));
    return map;
  }, [advertisers, mediaBuyers]);
}

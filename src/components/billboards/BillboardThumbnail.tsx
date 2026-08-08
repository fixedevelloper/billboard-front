"use client";

import useSWR from "swr";
import { ImageOff } from "lucide-react";
import { getBillboardImages } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BillboardThumbnailProps {
  billboardId: string;
  className?: string;
}

export function BillboardThumbnail({ billboardId, className }: BillboardThumbnailProps) {
  const { data: images } = useSWR(["billboard-images", billboardId], () => getBillboardImages(billboardId));
  const firstImage = images?.[0];

  return (
    <div className={cn("flex items-center justify-center overflow-hidden bg-muted", className)}>
      {firstImage ? (
        // Images MinIO (URL présignée) : next/image n'apporterait rien (pas de cache
        // possible, la signature change à chaque appel) et demanderait de whitelister
        // l'host dans next.config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={firstImage.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="size-6 text-muted-foreground" />
      )}
    </div>
  );
}

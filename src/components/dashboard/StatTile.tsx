import type { LucideIcon } from "lucide-react";
import { ACCENTS, type DashboardAccent } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: DashboardAccent;
}

// Stat tile contract (skill dataviz) : label en casse phrase, valeur en semibold,
// jamais de couleur de donnée sur le texte — seule l'icône porte l'accent.
export function StatTile({ label, value, icon: Icon, accent }: StatTileProps) {
  const theme = ACCENTS[accent];
  const formattedValue = typeof value === "number" ? new Intl.NumberFormat(undefined, { notation: "compact" }).format(value) : value;

  return (
    <Card className="flex-row items-center gap-4 p-4">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", theme.badge)}>
        <Icon className={cn("size-5", theme.icon)} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">{formattedValue}</span>
      </div>
    </Card>
  );
}

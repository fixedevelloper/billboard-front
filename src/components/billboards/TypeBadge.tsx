import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  DIGITAL: {
    label: "Digital",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  STATIC: {
    label: "Statique",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  TRIVISION: {
    label: "Trivision",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  LED_SCREEN: {
    label: "Écran LED",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  const style = TYPE_STYLES[type] || {
    label: type,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        secondary: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      },
      variant: {
        solid: "",
        outline: "border bg-transparent",
      },
    },
    defaultVariants: {
      tone: "neutral",
      variant: "solid",
    },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ tone, variant, className, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, variant }), className)} {...props} />;
}

"use client";

import { ReactNode, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";
import {
  LogOut,
  LayoutGrid,
  ChevronRight,
  User,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export type DashboardAccent = "blue" | "emerald" | "violet" | "amber";

export const ACCENTS: Record<
    DashboardAccent,
    { badge: string; icon: string; active: string; hover: string; border: string }
> = {
  blue: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400",
    active: "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-600",
    hover: "hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
    border: "border-blue-500/30",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    active: "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600",
    hover: "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400",
    border: "border-emerald-500/30",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    icon: "text-violet-600 dark:text-violet-400",
    active: "bg-violet-600 text-white shadow-md shadow-violet-500/20 hover:bg-violet-600",
    hover: "hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400",
    border: "border-violet-500/30",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: "text-amber-600 dark:text-amber-400",
    active: "bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600",
    hover: "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400",
    border: "border-amber-500/30",
  },
};

interface DashboardShellProps {
  title: string;
  icon: LucideIcon;
  accent: DashboardAccent;
  navItems: DashboardNavItem[];
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({
                                 title,
                                 icon: Icon,
                                 accent,
                                 navItems,
                                 action,
                                 children,
                               }: DashboardShellProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { email, logout } = useAuth();
  const theme = ACCENTS[accent];

  const [mobileOpen, setMobileOpen] = useState(false);

  // Sélection du lien le plus spécifique
  const matches = navItems.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const bestMatchHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const items = navItems.map((item) => ({ ...item, active: item.href === bestMatchHref }));

  const sidebarContent = (
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-5">
          {/* Header Dashboard & Icône d'ambiance */}
          <div className={cn("flex items-center justify-between rounded-xl border p-3", theme.badge)}>
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-background/80 p-2 shadow-sm">
                <Icon className={cn("h-5 w-5", theme.icon)} />
              </div>
              <span className="font-bold text-sm tracking-tight">{title}</span>
            </div>
            {/* Bouton de fermeture sur mobile */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* CTA Principal s'il existe */}
          {action && <div className="w-full" onClick={() => setMobileOpen(false)}>{action}</div>}

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                        "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                        item.active
                            ? theme.active
                            : cn("text-muted-foreground", theme.hover)
                    )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                      <span
                          className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-bold",
                              item.active
                                  ? "bg-white/20 text-white"
                                  : "bg-muted text-muted-foreground"
                          )}
                      >
                  {item.badge}
                </span>
                  ) : (
                      <ChevronRight
                          className={cn(
                              "h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100",
                              item.active && "opacity-100"
                          )}
                      />
                  )}
                </Link>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar : Switcher & Profil */}
        <div className="space-y-3 border-t border-border/60 pt-4 mt-6">
          <Link
              href="/space"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
              <span>{t("space", { defaultValue: "Changer d'espace" })}</span>
            </div>
            <Sparkles className="h-3 w-3 text-amber-500" />
          </Link>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 min-w-0 group hover:opacity-80 transition-opacity"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {email ? email[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-foreground group-hover:underline">
                {email || "Mon Compte"}
              </span>
                <span className="text-[10px] text-muted-foreground">Profil & Réglages</span>
              </div>
            </Link>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={logout}
                title={t("logout", { defaultValue: "Déconnexion" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
  );

  return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6">
        {/* ---------------- BANDEAU MOBILE & TOGGLE ---------------- */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 md:hidden">
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold", theme.badge)}>
              <Icon className="h-4 w-4" />
              <span>{title}</span>
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* ---------------- OVERLAY & DRAWER SIDEBAR MOBILE ---------------- */}
        {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Arrière-plan flouté */}
              <div
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                  onClick={() => setMobileOpen(false)}
              />

              {/* Panneau latéral coulissant */}
              <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs border-r border-border/60 bg-card p-4 shadow-2xl animate-in slide-in-from-left duration-300">
                {sidebarContent}
              </div>
            </div>
        )}

        {/* ---------------- SIDEBAR DESKTOP ---------------- */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:flex min-h-[calc(100vh-6rem)]">
          {sidebarContent}
        </aside>

        {/* ---------------- CONTENU PRINCIPAL ---------------- */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
  );
}
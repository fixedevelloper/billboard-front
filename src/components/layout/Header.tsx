"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/lib/AuthProvider";
import {
  LayoutGrid,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogIn,
  UserPlus,
  Loader2,
  Wallet,
} from "lucide-react";
import Image from "next/image";
const HIDDEN_ON = new Set(["/login", "/register", "/verify-email"]);

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const {
    isAuthenticated,
    hydrated,
    advertiserId,
    ownerId,
    mediaBuyerId,
    adminId,
    email,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (HIDDEN_ON.has(pathname)) {
    return null;
  }

  const hasAnySpace = Boolean(advertiserId || ownerId || mediaBuyerId || adminId);

  // Génération des initiales pour l'avatar
  const userInitial = email ? email[0].toUpperCase() : "U";

  return (
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand / Logo */}
          <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
          >

            <div className="">
              <Image
                  src="/logo.png" // Remplacez par le chemin exact de votre image (ex: dans /public)
                  alt="Guen's Pub Logo"
                  width={125}
                  height={60}
                  className="h-full w-full object-cover"
                  priority
              />
            </div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {!hydrated ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
                <>
                  {/* Accès direct à l'Espace */}
                  {hasAnySpace && (
                      <Button
                          asChild
                          variant={pathname.startsWith("/space") ? "default" : "ghost"}
                          size="sm"
                          className="gap-2 font-semibold transition-all"
                      >
                        <Link href="/space">
                          <LayoutGrid className="h-4 w-4 text-primary" />
                          <span>{t("space")}</span>
                        </Link>
                      </Button>
                  )}

                  {/* Menu Déroulant Profil Utilisateur */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                          variant="outline"
                          size="sm"
                          className="gap-2.5 rounded-full pl-2 pr-3 border-border/80 hover:border-primary/50 shadow-sm"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-bold text-xs text-primary">
                          {userInitial}
                        </div>
                        <span className="max-w-[120px] truncate text-xs font-semibold">
                      {email || t("profile")}
                    </span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl rounded-2xl">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{t("signedInAs", { defaultValue: "Connecté en tant que" })}</p>
                          <p className="text-xs font-bold leading-none text-foreground truncate">{email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {hasAnySpace && (
                          <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-2">
                            <Link href="/space" className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">{t("space")}</span>
                            </Link>
                          </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-2">
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{t("profile")}</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-2">
                        <Link href="/wallet" className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-medium">{t("wallet")}</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                          onClick={logout}
                          className="cursor-pointer rounded-xl py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{t("logout")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <NotificationBell />
                  <LanguageSwitcher />
                </>
            ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/login">
                      <LogIn className="h-4 w-4" />
                      <span>{t("login")}</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20">
                    <Link href="/register">
                      <UserPlus className="h-4 w-4" />
                      <span>{t("register")}</span>
                    </Link>
                  </Button>
                  <LanguageSwitcher />
                </>
            )}
          </div>

          {/* Bouton Hamburger Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <LanguageSwitcher />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Rétractable */}
        {mobileMenuOpen && (
            <div className="border-b border-border/60 bg-background/95 px-4 pt-2 pb-6 backdrop-blur-lg md:hidden animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-2 pt-2">
                {!hydrated ? (
                    <div className="py-4 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </div>
                ) : isAuthenticated ? (
                    <>
                      {email && (
                          <div className="px-3 py-2 rounded-xl bg-muted/50 mb-2">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Compte</p>
                            <p className="text-xs font-semibold text-foreground truncate">{email}</p>
                          </div>
                      )}

                      {hasAnySpace && (
                          <Button
                              asChild
                              variant="outline"
                              className="justify-start gap-3 h-11 rounded-xl"
                              onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href="/space">
                              <LayoutGrid className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{t("space")}</span>
                            </Link>
                          </Button>
                      )}

                      <Button
                          asChild
                          variant="outline"
                          className="justify-start gap-3 h-11 rounded-xl"
                          onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/profile">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{t("profile")}</span>
                        </Link>
                      </Button>

                      <Button
                          asChild
                          variant="outline"
                          className="justify-start gap-3 h-11 rounded-xl"
                          onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/wallet">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{t("wallet")}</span>
                        </Link>
                      </Button>

                      <Button
                          variant="destructive"
                          className="justify-start gap-3 h-11 rounded-xl mt-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-semibold">{t("logout")}</span>
                      </Button>
                    </>
                ) : (
                    <>
                      <Button
                          asChild
                          variant="outline"
                          className="justify-start gap-3 h-11 rounded-xl"
                          onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/login">
                          <LogIn className="h-4 w-4" />
                          <span className="font-semibold">{t("login")}</span>
                        </Link>
                      </Button>
                      <Button
                          asChild
                          className="justify-start gap-3 h-11 rounded-xl shadow-md"
                          onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/register">
                          <UserPlus className="h-4 w-4" />
                          <span className="font-semibold">{t("register")}</span>
                        </Link>
                      </Button>
                    </>
                )}
              </nav>
            </div>
        )}
      </header>
  );
}
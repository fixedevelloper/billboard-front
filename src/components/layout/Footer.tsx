"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Mail } from "lucide-react";

// Espaces authentifiés (dashboards, admin, profil, portefeuille...) et pages d'auth plein écran
// (qui ont déjà leur propre pied de page minimal) : le footer marketing n'y a rien à faire.
// Reprend la liste des préfixes disallow de robots.ts, plus login/register/verify-email.
const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/verify-email",
  "/dashboard",
  "/bookings",
  "/campaigns",
  "/owner-dashboard",
  "/my-billboards",
  "/media-buyer",
  "/admin",
  "/space",
  "/profile",
  "/wallet",
];

export function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (hidden) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="w-fit rounded-lg bg-white p-2 shadow-sm">
            <Image
              src="/logo.png"
              alt="Guen's Pub"
              width={125}
              height={60}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">{t("tagline")}</p>
          <a
            href="mailto:contact@guenspub.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4 text-primary" />
            contact@guenspub.com
          </a>
        </div>

        <nav className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("navTitle")}
          </h3>
          <Link href="/billboards" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("billboards")}
          </Link>
          <Link href="/become-owner" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("becomeOwner")}
          </Link>
          <Link href="/become-advertiser" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("becomeAdvertiser")}
          </Link>
          <Link href="/become-mediabuyer" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("becomeMediaBuyer")}
          </Link>
        </nav>

        <nav className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("supportTitle")}
          </h3>
          <Link href="/help-center" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("helpCenter")}
          </Link>
          <Link href="/faq" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("faq")}
          </Link>
          <Link href="/contact" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("contact")}
          </Link>
        </nav>

        <nav className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("legalTitle")}
          </h3>
          <Link href="/terms" className="text-sm text-slate-300 transition-colors hover:text-white">
            {t("terms")}
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>
            &copy; {new Date().getFullYear()} Guen&apos;s Pub. {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}

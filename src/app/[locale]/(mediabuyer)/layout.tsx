"use client";

import { ReactNode, useEffect } from "react";
import { LayoutDashboard, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/AuthProvider";

export default function MediaBuyerLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { hydrated, isAuthenticated, mediaBuyerId } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!mediaBuyerId) {
      router.replace("/space");
    }
  }, [hydrated, isAuthenticated, mediaBuyerId, router]);

  if (!hydrated || !isAuthenticated || !mediaBuyerId) {
    return null;
  }

  return (
    <DashboardShell
      title={t("space")}
      icon={Wallet}
      accent="violet"
      navItems={[
        { href: "/media-buyer", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/media-buyer/payments", label: t("mediaBuyerPayments"), icon: Wallet },
      ]}
    >
      {children}
    </DashboardShell>
  );
}

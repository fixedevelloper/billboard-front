"use client";

import { ReactNode, useEffect } from "react";
import { LayoutDashboard, Megaphone, CalendarCheck, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/AuthProvider";

export default function AdvertiserLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { hydrated, isAuthenticated, advertiserId } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!advertiserId) {
      router.replace("/become-advertiser");
    }
  }, [hydrated, isAuthenticated, advertiserId, router]);

  if (!hydrated || !isAuthenticated || !advertiserId) {
    return null;
  }

  return (
    <DashboardShell
      title={t("space")}
      icon={Megaphone}
      accent="blue"
      navItems={[
        { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/billboards", label: t("billboards"), icon: Search },
        { href: "/bookings", label: t("bookings"), icon: CalendarCheck },
        { href: "/campaigns", label: t("campaigns"), icon: Megaphone },
      ]}
    >
      {children}
    </DashboardShell>
  );
}

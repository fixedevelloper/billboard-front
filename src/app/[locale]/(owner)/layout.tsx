"use client";

import { ReactNode, useEffect } from "react";
import { Building2, CalendarCheck, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/AuthProvider";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { hydrated, isAuthenticated, ownerId } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!ownerId) {
      router.replace("/become-owner");
    }
  }, [hydrated, isAuthenticated, ownerId, router]);

  if (!hydrated || !isAuthenticated || !ownerId) {
    return null;
  }

  return (
    <DashboardShell
      title={t("space")}
      icon={Building2}
      accent="emerald"
      navItems={[
        { href: "/owner-dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/my-billboards", label: t("myBillboards"), icon: Building2 },
        { href: "/my-billboards/bookings", label: t("ownerBookings"), icon: CalendarCheck },
      ]}
    >
      {children}
    </DashboardShell>
  );
}

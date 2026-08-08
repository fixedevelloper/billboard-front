"use client";

import { ReactNode, useEffect } from "react";
import {
  Building2,
  CalendarCheck,
  CreditCard,
  History,
  LayoutDashboard,
  MapPin,
  Megaphone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/AuthProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const tEntities = useTranslations("admin.dashboard.entities");
  const router = useRouter();
  const { hydrated, isAuthenticated, adminId } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!adminId) {
      router.replace("/space");
    }
  }, [hydrated, isAuthenticated, adminId, router]);

  if (!hydrated || !isAuthenticated || !adminId) {
    return null;
  }

  return (
    <DashboardShell
      title={t("space")}
      icon={ShieldCheck}
      accent="amber"
      navItems={[
        { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/admin/users", label: tEntities("tabUsers"), icon: Users },
        { href: "/admin/billboards", label: tEntities("tabBillboards"), icon: Building2 },
        { href: "/admin/cities", label: tEntities("tabCities"), icon: MapPin },
        { href: "/admin/bookings", label: tEntities("tabBookings"), icon: CalendarCheck },
        { href: "/admin/campaigns", label: tEntities("tabCampaigns"), icon: Megaphone },
        { href: "/admin/payments", label: tEntities("tabPayments"), icon: CreditCard },
        { href: "/admin/reviews", label: tEntities("tabReviews"), icon: Star },
        { href: "/admin/journal", label: tEntities("tabJournal"), icon: History },
      ]}
    >
      {children}
    </DashboardShell>
  );
}

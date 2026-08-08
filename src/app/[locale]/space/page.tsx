"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthProvider";
import {
    Megaphone,
    Building2,
    ShoppingBag,
    ShieldCheck,
    ArrowRight,
    UserX,
    Loader2,
    PlusCircle,
    HelpCircle,
    User,
    Sparkles,
    type LucideIcon,
} from "lucide-react";

export default function SpacePage() {
    const t = useTranslations("space");
    const router = useRouter();
    const { hydrated, isAuthenticated, advertiserId, ownerId, mediaBuyerId, adminId } = useAuth();

    const spaces = useMemo(
        () =>
            [
                advertiserId && {
                    href: "/dashboard",
                    label: t("advertiser"),
                    description: t("advertiserDescription", { defaultValue: "Gérez vos campagnes publicitaires et budgets" }),
                    icon: Megaphone,
                    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    ctaText: t("advertiserCta", { defaultValue: "Lancer une campagne" }),
                },
                ownerId && {
                    href: "/owner-dashboard",
                    label: t("owner"),
                    description: t("ownerDescription", { defaultValue: "Gérez votre parc d'écrans et vos revenus" }),
                    icon: Building2,
                    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                    ctaText: t("ownerCta", { defaultValue: "Gérer mes écrans" }),
                },
                mediaBuyerId && {
                    href: "/media-buyer",
                    label: t("mediaBuyer"),
                    description: t("mediaBuyerDescription", { defaultValue: "Achetez et optimisez vos espaces média" }),
                    icon: ShoppingBag,
                    badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
                    ctaText: t("mediaBuyerCta", { defaultValue: "Explorer le catalogue" }),
                },
                adminId && {
                    href: "/admin",
                    label: t("admin"),
                    description: t("adminDescription", { defaultValue: "Administration et supervision de la plateforme" }),
                    icon: ShieldCheck,
                    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                    ctaText: t("adminCta", { defaultValue: "Console d'administration" }),
                },
            ].filter(
                (
                    space
                ): space is {
                    href: string;
                    label: string;
                    description: string;
                    icon: LucideIcon;
                    badgeColor: string;
                    ctaText: string;
                } => !!space
            ),
        [advertiserId, ownerId, mediaBuyerId, adminId, t]
    );

    useEffect(() => {
        if (hydrated && !isAuthenticated) {
            router.replace("/login");
        } else if (hydrated && spaces.length === 1) {
            router.replace(spaces[0].href);
        }
    }, [hydrated, isAuthenticated, spaces, router]);

    // Écran d'attente / Loader fluide
    if (!hydrated || !isAuthenticated || spaces.length === 1) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t("loading", { defaultValue: "Chargement de votre espace..." })}
                </p>
            </div>
        );
    }

    // Aucun profil actif configuré
    if (spaces.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-5 px-4 py-20 text-center">
                <div className="rounded-full bg-muted p-4 text-muted-foreground">
                    <UserX className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">{t("emptyTitle", { defaultValue: "Aucun profil associé" })}</h2>
                    <p className="text-sm text-muted-foreground">{t("empty")}</p>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
                    <Link href="/profile" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>{t("goToProfile")}</span>
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
            {/* En-tête dynamique avec badge d'accueil */}
            <div className="flex flex-col gap-3 text-center sm:text-left">
                <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>{t("welcomeBadge", { defaultValue: "Espace Multi-Rôles" })}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {t("title")}
                </h1>
                <p className="text-base text-muted-foreground max-w-xl">
                    {t("selectSpaceSubtitle", { defaultValue: "Sélectionnez le tableau de bord dans lequel vous souhaitez travailler :" })}
                </p>
            </div>

            {/* Grille des cartes réactives avec CTA dédiés */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {spaces.map((space) => {
                    const IconComponent = space.icon;
                    return (
                        <Card
                            key={space.href}
                            className="group relative flex flex-col justify-between border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                            <div>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div className="space-y-1 pr-4">
                                        <CardTitle className="text-xl font-bold transition-colors group-hover:text-primary">
                                            {space.label}
                                        </CardTitle>
                                    </div>
                                    <div className={`rounded-xl border p-3 transition-transform duration-300 group-hover:scale-110 ${space.badgeColor}`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                        {space.description}
                                    </CardDescription>
                                </CardContent>
                            </div>

                            {/* Action Principal (CTA) au bas de la carte */}
                            <div className="p-6 pt-0 mt-4">
                                <Button asChild className="w-full justify-between shadow-sm group-hover:shadow-md transition-all">
                                    <Link href={space.href}>
                                        <span className="font-semibold">{space.ctaText}</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Barre d'actions secondaires pour animer le bas de page */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/40 p-6 backdrop-blur-sm">
                <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-sm font-semibold">{t("needHelpTitle", { defaultValue: "Besoin de configurer un autre rôle ?" })}</h4>
                    <p className="text-xs text-muted-foreground">
                        {t("needHelpSubtitle", { defaultValue: "Vous pouvez ajouter ou modifier vos informations de profil à tout moment." })}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto bg-background">
                        <Link href="/profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{t("myProfile", { defaultValue: "Mon Profil" })}</span>
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
                        <Link href="/support" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <HelpCircle className="h-4 w-4" />
                            <span>{t("help", { defaultValue: "Aide" })}</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
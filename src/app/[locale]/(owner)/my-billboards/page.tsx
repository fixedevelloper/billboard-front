"use client";

import { useEffect } from "react";
import useSWR from "swr";
import {
  Plus,
  MapPin,
  Loader2,
  Image as ImageIcon,
  Edit3,
  ShieldAlert,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBillboardsByOwner } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { BillboardThumbnail } from "@/components/billboards/BillboardThumbnail";
import { BillboardImagesModal } from "@/components/billboards/BillboardImagesModal";
import { cn } from "@/lib/utils";

// Helpeur de couleur selon le statut du panneau
function getStatusBadgeVariant(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "actifs":
    case "published":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "pending":
    case "en attente":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ---------------- COMPOSANT EMPTY STATE ----------------
interface BillboardsEmptyStateProps {
  title: string;
  description?: string;
  actionLabel: string;
}

function BillboardsEmptyState({ title, description, actionLabel }: BillboardsEmptyStateProps) {
  return (
      <Card className="flex flex-col items-center justify-center border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12 shadow-sm">
        {/* Illustration / Icône empilée */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner mb-6">
          <Layers className="h-10 w-10 stroke-[1.5]" />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Plus className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Titre & Description */}
        <h3 className="text-lg font-bold text-foreground sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description ||
              "Vous n'avez encore configuré aucun emplacement publicitaire. Commencez dès maintenant pour proposer vos espaces aux annonceurs."}
        </p>

        {/* Bouton d'action principal */}
        <Button asChild className="mt-6 gap-2 shadow-md shadow-primary/20" size="lg">
          <Link href="/my-billboards/new">
            <Plus className="h-5 w-5" />
            <span>{actionLabel}</span>
          </Link>
        </Button>

        {/* Aide / Note explicative */}
        <div className="mt-8 flex items-center gap-2 rounded-xl bg-muted/50 px-3.5 py-2 text-xs text-muted-foreground border border-border/40">
          <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
          <span>Besoin d'aide pour configurer votre premier panneau ? Consultez le guide propriétaire.</span>
        </div>
      </Card>
  );
}

// ---------------- PAGE PRINCIPALE ----------------
export default function MyBillboardsPage() {
  const t = useTranslations("owner.billboards");
  const router = useRouter();
  const { ownerId, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const { data: billboards, isLoading } = useSWR(
      ownerId ? ["my-billboards", ownerId] : null,
      () => getBillboardsByOwner(ownerId as string)
  );

  if (!hydrated || !isAuthenticated) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Écran d'accès restreint si l'utilisateur n'est pas un propriétaire
  if (!ownerId) {
    return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <Card className="border-border/60 p-6 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold">Accès Restreint</h2>
                <p className="text-sm text-muted-foreground">
                  Vous devez enregistrer un compte propriétaire pour gérer des espaces publicitaires.
                </p>
              </div>
              <Button asChild className="mt-2 w-full gap-2">
                <Link href="/become-owner">
                  <Sparkles className="h-4 w-4" />
                  {t("notOwner", { defaultValue: "Devenir Propriétaire" })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 md:px-6">
        {/* Header avec action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gérez vos panneaux publicitaires, modifiez les détails et téléversez des visuels.
            </p>
          </div>

          {/* N'affiche le bouton d'action dans le header que si la liste n'est pas vide */}
          {billboards && billboards.length > 0 && (
              <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20 shrink-0">
                <Link href="/my-billboards/new">
                  <Plus className="h-4 w-4" />
                  <span>{t("addBillboard")}</span>
                </Link>
              </Button>
          )}
        </div>

        {/* Squelettes de chargement (SWR) */}
        {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden border-border/60">
                    <Skeleton className="h-44 w-full rounded-b-none" />
                    <CardHeader className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-9 w-full rounded-xl" />
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}

        {/* Empty State Intégré */}
        {!isLoading && billboards && billboards.length === 0 && (
            <BillboardsEmptyState
                title={t("empty", { defaultValue: "Aucun panneau publicitaire" })}
                actionLabel={t("addBillboard", { defaultValue: "Ajouter un panneau" })}
            />
        )}

        {/* Liste des Panneaux Publicitaires */}
        {!isLoading && billboards && billboards.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {billboards.map((billboard) => (
                  <Card
                      key={billboard.id}
                      className="group overflow-hidden border-border/60 transition-all duration-200 hover:border-border hover:shadow-md"
                  >
                    {/* Vignette avec Badge de Statut */}
                    <div className="relative">
                      <BillboardThumbnail
                          billboardId={billboard.id}
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                            variant="outline"
                            className={cn(
                                "backdrop-blur-md font-semibold text-[11px] uppercase tracking-wider",
                                getStatusBadgeVariant(billboard.status)
                            )}
                        >
                          {billboard.status}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold text-foreground truncate">
                        {billboard.title}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{billboard.city || "Emplacement non spécifié"}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 pb-3 text-xs">
                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-2">
                        <span className="text-muted-foreground">ID Panneau</span>
                        <span className="font-mono text-foreground font-medium">#{billboard.id.slice(0, 8)}</span>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 p-3">
                      <BillboardImagesModal billboardId={billboard.id} ownerId={ownerId} />
                      <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                        <Link href={`/my-billboards/${billboard.id}`}>
                          <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Éditer</span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}
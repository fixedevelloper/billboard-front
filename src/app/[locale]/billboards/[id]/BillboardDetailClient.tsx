"use client";

import { FormEvent, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ImageOff,
  Loader2,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  Tag,
  AlertCircle,
  Building,
  Users,
  TrendingUp,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BillboardResponse,
  createBooking,
  extractErrorMessage,
  getAverageRating,
  getBillboard,
  getBillboardImages,
  getPublishedReviewsForTarget,
  submitReview,
} from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";
import { TypeBadge } from "@/components/billboards/TypeBadge";

const BillboardMap = dynamic(
    () => import("@/components/billboards/BillboardMap").then((mod) => mod.BillboardMap),
    { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
);

// ─────────────────────────────────────────────────────────────────────────────
// Composant StarRatingInput amélioré
// ─────────────────────────────────────────────────────────────────────────────
function StarRatingInput({
                           value,
                           onChange,
                           size = "md",
                         }: {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Note sur 5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating ?? value) >= star;
          return (
              <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={value === star}
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                  onClick={() => onChange(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="group relative p-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm hover:scale-110"
              >
                <Star
                    className={cn(
                        "transition-all duration-200",
                        sizeClasses[size],
                        isFilled
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "text-gray-200 dark:text-gray-700 group-hover:text-amber-300"
                    )}
                />
              </button>
          );
        })}
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant ImageGallery avec navigation
// ─────────────────────────────────────────────────────────────────────────────
function ImageGallery({
                        images,
                        title,
                      }: {
  images: Array<{ id?: string; url: string }> | undefined;
  title: string;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const currentImageUrl = useMemo(() => {
    if (!images || images.length === 0) return null;
    return images[selectedImageIndex]?.url || images[0]?.url;
  }, [images, selectedImageIndex]);

  const goToPrevious = useCallback(() => {
    if (!images || images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images]);

  const goToNext = useCallback(() => {
    if (!images || images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images]);

  if (!currentImageUrl) {
    return (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/80">
              <ImageOff className="h-7 w-7 text-muted-foreground/70" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aucune image disponible</p>
            <p className="text-xs text-muted-foreground/70">Les images de cet emplacement seront ajoutées bientôt</p>
          </div>
        </div>
    );
  }

  return (
      <div className="group relative">
        {/* Image principale avec effet de zoom */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-border/50 bg-muted shadow-xl shadow-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
              src={currentImageUrl}
              alt={`${title} — vue ${selectedImageIndex + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Overlay gradient pour meilleur contraste */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Navigation arrows */}
          {images && images.length > 1 && (
              <>
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground shadow-lg opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-white hover:scale-110 focus:opacity-100 focus:translate-x-0"
                    aria-label="Image précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground shadow-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-white hover:scale-110 focus:opacity-100 focus:translate-x-0"
                    aria-label="Image suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
          )}


          {images && images.length > 1 && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>{selectedImageIndex + 1} / {images.length}</span>
              </div>
          )}
        </div>

        {/* Thumbnails */}
        {images && images.length > 1 && (
            <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((image, index) => (
                  <button
                      key={image.id || index}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Voir l'image ${index + 1} de ${title}`}
                      aria-current={selectedImageIndex === index}
                      className={cn(
                          "relative flex h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                          selectedImageIndex === index
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105 shadow-lg"
                              : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                      )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
              ))}
            </div>
        )}
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant FeatureCard pour les caractéristiques
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({
                       icon,
                       label,
                       value,
                       highlight = false,
                     }: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
      <div
          className={cn(
              "group relative flex flex-col gap-2 rounded-2xl border p-4 transition-all duration-300 hover:shadow-md",
              highlight
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-sm"
                  : "border-border/50 bg-muted/30 hover:border-border/80 hover:bg-muted/50"
          )}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div
              className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  highlight ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
              )}
          >
            {icon}
          </div>
          <span>{label}</span>
        </div>
        <div className={cn("text-sm font-semibold", highlight ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}>
          {value}
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale (Client Component) — reçoit `id` et, quand disponibles, les données déjà
// résolues côté serveur (pour generateMetadata/JSON-LD) en fallbackData SWR : évite un aller-
// retour réseau supplémentaire et affiche le contenu dès le premier rendu.
// ─────────────────────────────────────────────────────────────────────────────
export function BillboardDetailClient({
  id,
  initialBillboard,
}: {
  id: string;
  initialBillboard?: BillboardResponse;
}) {
  const tDetail = useTranslations("billboards.detail");
  const tBooking = useTranslations("billboards.booking");
  const tReviews = useTranslations("reviews");
  const router = useRouter();
  const { advertiserId } = useAuth();

  const { data: billboard, error: loadError, isLoading: loadingBillboard } = useSWR(
      id ? ["billboard", id] : null,
      () => getBillboard(id),
      { fallbackData: initialBillboard }
  );
  const { data: images } = useSWR(id ? ["billboard-images", id] : null, () => getBillboardImages(id));
  const { data: reviews, mutate: mutateReviews } = useSWR(id ? ["reviews", id] : null, () =>
      getPublishedReviewsForTarget(id)
  );
  const { data: averageRating } = useSWR(id ? ["average-rating", id] : null, () => getAverageRating(id));

  // Formulaire de réservation
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formulaire d'avis
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Date minimale pour la sélection
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Calcul dynamique de la durée et du prix estimé
  const bookingEstimate = useMemo(() => {
    if (!startDate || !endDate || !billboard?.dailyRate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

    const diffTime = end.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      days,
      totalPrice: days * Number(billboard.dailyRate),
    };
  }, [startDate, endDate, billboard]);

  async function handleSubmitReview(event: FormEvent) {
    event.preventDefault();
    if (!advertiserId) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await submitReview({ authorId: advertiserId, targetId: id, rating, comment: comment || undefined });
      setReviewSubmitted(true);
      setComment("");
      await mutateReviews();
    } catch (err) {
      setReviewError(extractErrorMessage(err, tReviews("submit")));
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!billboard || !advertiserId || !bookingEstimate) return;
    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        billboardId: billboard.id,
        advertiserId,
        startDate,
        endDate,
        dailyRate: billboard.dailyRate,
        currency: billboard.currency,
      });
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, tBooking("title")));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Erreur de chargement</p>
              <p className="text-muted-foreground">{loadError.message}</p>
            </div>
          </div>
        </div>
    );
  }

  if (loadingBillboard || !billboard) {
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-[600px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[600px] rounded-3xl" />
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Header avec navigation */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Link href="/billboards">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{tDetail("back")}</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              {typeof averageRating === "number" && averageRating > 0 && (
                  <Badge className="gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                  </Badge>
              )}
              <TypeBadge type={billboard.type} className="text-xs" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {/* Hero Section */}
          <section aria-labelledby="billboard-title" className="mb-8">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h1 id="billboard-title" className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  {billboard.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{billboard.address ? `${billboard.address}, ${billboard.city}` : billboard.city}</span>
                  </div>
                </div>
              </div>

              <Card className="shrink-0 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-lg shadow-emerald-500/10">
                <CardContent className="p-4 text-right">
                  <div className="text-xs font-medium text-muted-foreground">{tDetail("dailyRate")}</div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {billboard.dailyRate} <span className="text-sm font-normal text-muted-foreground">{billboard.currency} / jour</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Galerie d'images */}
            <ImageGallery images={images} title={billboard.title} />
          </section>

          {/* Grille principale */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Colonne Gauche : Détails */}
            <article className="space-y-6 lg:col-span-2">
              {/* Description */}
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>Description de l&apos;emplacement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                    {billboard.description || (
                        <span className="italic">Aucune description détaillée fournie pour cet emplacement publicitaire.</span>
                    )}
                  </p>
                </CardContent>
              </Card>

              {/* Caractéristiques techniques */}
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Caractéristiques techniques</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                    <FeatureCard
                        icon={<Tag className="h-4 w-4" />}
                        label={tDetail("type")}
                        value={billboard.type}
                    />
                    <FeatureCard
                        icon={<Building className="h-4 w-4" />}
                        label={tDetail("city")}
                        value={billboard.city}
                    />
                    <FeatureCard
                        icon={<MapPin className="h-4 w-4" />}
                        label={tDetail("address")}
                        value={billboard.address || "Non spécifiée"}
                    />
                    <FeatureCard
                        icon={<Clock className="h-4 w-4" />}
                        label={tDetail("status")}
                        value={billboard.status}
                        highlight
                    />
                    {billboard.audience && (
                        <FeatureCard
                            icon={<Users className="h-4 w-4" />}
                            label={tDetail("audience")}
                            value={billboard.audience}
                        />
                    )}
                    {billboard.dailyTraffic != null && (
                        <FeatureCard
                            icon={<TrendingUp className="h-4 w-4" />}
                            label={tDetail("dailyTraffic")}
                            value={
                              <>
                                {billboard.dailyTraffic.toLocaleString()}{" "}
                                <span className="text-xs font-normal text-muted-foreground">{tDetail("dailyTrafficUnit")}</span>
                              </>
                            }
                        />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Carte de localisation */}
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <Navigation className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Localisation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-72 w-full overflow-hidden sm:h-96">
                    <BillboardMap
                        latitude={billboard.latitude}
                        longitude={billboard.longitude}
                        title={billboard.title}
                        address={billboard.address}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section Avis et Évaluations */}
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent pb-4 border-b border-border/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                        <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span>{tReviews("title")}</span>
                    </div>
                    {typeof averageRating === "number" && averageRating > 0 && (
                        <Badge className="gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{averageRating.toFixed(1)}/5</span>
                        </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {reviews && reviews.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 bg-muted/20 py-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground italic">{tReviews("empty")}</p>
                      </div>
                  )}

                  {reviews && reviews.length > 0 && (
                      <div className="space-y-3">
                        {reviews.map((review, index) => (
                            <div
                                key={review.id}
                                className="group rounded-2xl border border-border/40 bg-gradient-to-br from-muted/20 to-transparent p-4 transition-all hover:border-border/60 hover:shadow-sm"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <StarRatingInput value={review.rating} onChange={() => {}} size="sm" />
                                <span className="text-xs text-muted-foreground">Avis #{index + 1}</span>
                              </div>
                              {review.comment && (
                                  <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                              )}
                            </div>
                        ))}
                      </div>
                  )}

                  {advertiserId && (
                      <form className="flex flex-col gap-5 border-t border-border/50 pt-6" onSubmit={handleSubmitReview}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="text-sm font-bold text-foreground">Laisser un avis</h4>
                        </div>

                        {reviewSubmitted ? (
                            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">{tReviews("submitted")}</span>
                            </div>
                        ) : (
                            <>
                              <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                  {tReviews("rating")}
                                </label>
                                <StarRatingInput value={rating} onChange={setRating} size="lg" />
                              </div>

                              <div className="space-y-2">
                                <label htmlFor="comment" className="text-sm font-medium text-muted-foreground">
                                  {tReviews("comment")}
                                </label>
                                <Input
                                    id="comment"
                                    name="comment"
                                    placeholder="Partagez votre expérience sur cet emplacement..."
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    className="h-11 text-sm bg-background border-border/60 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                />
                              </div>

                              {reviewError && (
                                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{reviewError}</span>
                                  </div>
                              )}

                              <Button
                                  type="submit"
                                  size="sm"
                                  disabled={submittingReview}
                                  className="h-10 self-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                              >
                                {submittingReview ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                      <Star className="h-4 w-4" />
                                      <span>{tReviews("submit")}</span>
                                    </>
                                )}
                              </Button>
                            </>
                        )}
                      </form>
                  )}
                </CardContent>
              </Card>
            </article>

            {/* Colonne Droite : Formulaire de réservation sticky */}
            <div className="lg:sticky lg:top-24">
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-background shadow-xl shadow-emerald-500/10">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent pb-5 border-b border-emerald-500/20">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
                      <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span>{tBooking("title")}</span>
                      <p className="text-xs font-normal text-muted-foreground mt-0.5">Réservez votre emplacement en quelques clics</p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-6">
                  {!advertiserId ? (
                      <div className="flex flex-col gap-5 text-center py-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <Shield className="h-7 w-7 text-muted-foreground/70" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Devenez annonceur</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {tDetail("needAdvertiser")}
                          </p>
                        </div>
                        <Button
                            asChild
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                        >
                          <Link href="/become-advertiser">
                            <Zap className="h-4 w-4 mr-2" />
                            {tDetail("bookCta")}
                          </Link>
                        </Button>
                      </div>
                  ) : success ? (
                      <div className="flex flex-col gap-5 text-center py-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-foreground">Réservation confirmée !</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tBooking("success")}
                          </p>
                        </div>
                        <Button
                            onClick={() => router.push("/bookings")}
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {tBooking("viewBooking")}
                        </Button>
                      </div>
                  ) : (
                      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="startDate" className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              {tBooking("startDate")}
                            </label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                min={todayStr}
                                value={startDate}
                                onChange={(event) => {
                                  setStartDate(event.target.value);
                                  if (endDate && event.target.value > endDate) {
                                    setEndDate(event.target.value);
                                  }
                                }}
                                required
                                className="h-11 text-sm bg-background border-border/60 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="endDate" className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              {tBooking("endDate")}
                            </label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                min={startDate || todayStr}
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                required
                                className="h-11 text-sm bg-background border-border/60 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {bookingEstimate && (
                            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Durée totale</span>
                                </div>
                                <strong className="text-sm font-bold text-foreground">{bookingEstimate.days} jour(s)</strong>
                              </div>
                              <div className="border-t border-emerald-500/20 pt-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Tag className="h-4 w-4" />
                                    <span>Prix total estimé</span>
                                  </div>
                                  <strong className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {bookingEstimate.totalPrice.toLocaleString()} {billboard.currency}
                                  </strong>
                                </div>
                              </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-sm">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              </div>
                              <span className="font-medium text-destructive">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={submitting || !bookingEstimate}
                            className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/25 gap-2 text-base"
                        >
                          {submitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Traitement en cours...</span>
                              </>
                          ) : (
                              <>
                                <CheckCircle2 className="h-5 w-5" />
                                <span>{tBooking("submit")}</span>
                              </>
                          )}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                          <Shield className="h-3.5 w-3.5 inline mr-1" />
                          Paiement sécurisé et sans frais cachés
                        </p>
                      </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
  );
}

"use client";

import { FormEvent, use, useState, useMemo } from "react";
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
  DollarSign,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
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

// Badges pour les types de panneaux
const TYPE_STYLES: Record<string, { label: string; className: string }> = {
  DIGITAL: {
    label: "Digital",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  STATIC: {
    label: "Statique",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  TRIVISION: {
    label: "Trivision",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  LED_SCREEN: {
    label: "Écran LED",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] || {
    label: type,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
      <span
          className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
              style.className
          )}
      >
      {style.label}
    </span>
  );
}

// Composant pour la sélection tactile/visuelle de la note en étoiles
function StarRatingInput({
                           value,
                           onChange,
                         }: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating ?? value) >= star;
          return (
              <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star className={cn("h-6 w-6", isFilled ? "fill-amber-400" : "text-muted border-muted")} />
              </button>
          );
        })}
      </div>
  );
}

export default function BillboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tDetail = useTranslations("billboards.detail");
  const tBooking = useTranslations("billboards.booking");
  const tReviews = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { advertiserId } = useAuth();

  const { data: billboard, error: loadError, isLoading: loadingBillboard } = useSWR(
      ["billboard", id],
      () => getBillboard(id)
  );
  const { data: images } = useSWR(["billboard-images", id], () => getBillboardImages(id));
  const { data: reviews, mutate: mutateReviews } = useSWR(["reviews", id], () =>
      getPublishedReviewsForTarget(id)
  );
  const { data: averageRating } = useSWR(["average-rating", id], () => getAverageRating(id));

  // Galerie d'images
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // Calcul dynamique de la durée et du prix estimé
  const bookingEstimate = useMemo(() => {
    if (!startDate || !endDate || !billboard?.dailyRate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 0) return null;
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
    if (!billboard || !advertiserId) return;
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
          <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{loadError.message}</span>
          </div>
        </div>
    );
  }

  if (loadingBillboard || !billboard) {
    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="h-60 md:col-span-2 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
        </div>
    );
  }

  return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {/* Bouton de retour */}
        <div>
          <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Link href="/billboards">
              <ArrowLeft className="h-4 w-4" />
              <span>{tDetail("back")}</span>
            </Link>
          </Button>
        </div>

        {/* Titre et détails rapides */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TypeBadge type={billboard.type} />
              {typeof averageRating === "number" && averageRating > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{averageRating.toFixed(1)} / 5</span>
                  </div>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {billboard.title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{billboard.address || billboard.city}, {billboard.city}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4 text-right shadow-sm self-start sm:self-auto">
            <div className="text-xs text-muted-foreground">{tDetail("dailyRate")}</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {billboard.dailyRate} <span className="text-xs font-normal text-muted-foreground">{billboard.currency} / jour</span>
            </div>
          </div>
        </div>

        {/* Galerie d'images */}
        {images && images.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={images[selectedImageIndex]?.url || images[0].url}
                    alt={billboard.title}
                    className="h-full w-full object-cover transition-all duration-300"
                />
              </div>

              {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={cn(
                                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted transition-all",
                                selectedImageIndex === index
                                    ? "ring-2 ring-emerald-500 border-transparent scale-105"
                                    : "opacity-70 hover:opacity-100 border-border/60"
                            )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                  </div>
              )}
            </div>
        ) : (
            <div className="flex aspect-[16/8] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 text-center">
              <ImageOff className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Aucune image disponible pour ce panneau</p>
            </div>
        )}

        {/* Grille principale : Informations & Formulaire de Réservation */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Colonne Gauche : Détails techniques */}
          <div className="space-y-6 md:col-span-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Description de l'emplacement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <p className="leading-relaxed text-muted-foreground">
                  {billboard.description || "Aucune description détaillée fournie pour cet emplacement publicitaire."}
                </p>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Caractéristiques techniques
                  </h4>
                  <dl className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 border border-border/40">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        <span>{tDetail("type")}</span>
                      </dt>
                      <dd className="font-semibold text-foreground">{billboard.type}</dd>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 border border-border/40">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" />
                        <span>{tDetail("city")}</span>
                      </dt>
                      <dd className="font-semibold text-foreground">{billboard.city}</dd>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 border border-border/40">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{tDetail("address")}</span>
                      </dt>
                      <dd className="font-semibold text-foreground truncate">{billboard.address || "Non spécifiée"}</dd>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 border border-border/40">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{tDetail("status")}</span>
                      </dt>
                      <dd className="font-semibold text-emerald-600 dark:text-emerald-400">{billboard.status}</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/* Section Avis et Évaluations */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{tReviews("title")}</span>
                  </div>
                  {typeof averageRating === "number" && averageRating > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                    Note moyenne: <strong className="text-foreground">{averageRating.toFixed(1)}/5</strong>
                  </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Liste des avis existants */}
                {reviews && reviews.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">{tReviews("empty")}</p>
                )}

                {reviews && reviews.length > 0 && (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                          <div key={review.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1.5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                      key={s}
                                      className={cn(
                                          "h-3.5 w-3.5",
                                          s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                                      )}
                                  />
                              ))}
                            </div>
                            {review.comment && (
                                <p className="text-xs text-foreground leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                      ))}
                    </div>
                )}

                {/* Formulaire d'ajout d'avis si connecté comme annonceur */}
                {advertiserId && (
                    <form className="flex flex-col gap-4 border-t border-border/50 pt-5" onSubmit={handleSubmitReview}>
                      <h4 className="text-xs font-semibold text-foreground">Laisser un avis</h4>

                      {reviewSubmitted ? (
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{tReviews("submitted")}</span>
                          </div>
                      ) : (
                          <>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {tReviews("rating")}
                              </label>
                              <StarRatingInput value={rating} onChange={setRating} />
                            </div>

                            <div className="space-y-1.5">
                              <label htmlFor="comment" className="text-xs font-medium text-muted-foreground">
                                {tReviews("comment")}
                              </label>
                              <Input
                                  id="comment"
                                  name="comment"
                                  placeholder="Partagez votre expérience sur cet emplacement..."
                                  value={comment}
                                  onChange={(event) => setComment(event.target.value)}
                                  className="h-10 text-xs bg-background"
                              />
                            </div>

                            {reviewError && (
                                <p className="text-xs font-medium text-destructive">{reviewError}</p>
                            )}

                            <Button
                                type="submit"
                                size="sm"
                                disabled={submittingReview}
                                className="self-start h-9 text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {submittingReview ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Envoi...</span>
                                  </>
                              ) : (
                                  <span>{tReviews("submit")}</span>
                              )}
                            </Button>
                          </>
                      )}
                    </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite : Formulaire de réservation */}
          <div>
            <Card className="sticky top-6 border-border/60 shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{tBooking("title")}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-5">
                {!advertiserId ? (
                    <div className="flex flex-col gap-4 text-center py-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tDetail("needAdvertiser")}
                      </p>
                      <Button
                          asChild
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <Link href="/become-advertiser">{tDetail("bookCta")}</Link>
                      </Button>
                    </div>
                ) : success ? (
                    <div className="flex flex-col gap-4 text-center py-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Réservation enregistrée !</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {tBooking("success")}
                        </p>
                      </div>
                      <Button
                          onClick={() => router.push("/bookings")}
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm mt-2"
                      >
                        {tBooking("viewBooking")}
                      </Button>
                    </div>
                ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="startDate" className="text-xs font-medium text-foreground">
                            {tBooking("startDate")}
                          </label>
                          <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={startDate}
                              onChange={(event) => setStartDate(event.target.value)}
                              required
                              className="h-10 text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="endDate" className="text-xs font-medium text-foreground">
                            {tBooking("endDate")}
                          </label>
                          <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={endDate}
                              onChange={(event) => setEndDate(event.target.value)}
                              required
                              className="h-10 text-xs bg-background"
                          />
                        </div>
                      </div>

                      {/* Estimation du tarif */}
                      {bookingEstimate && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Durée totale:</span>
                              <strong className="text-foreground">{bookingEstimate.days} jour(s)</strong>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground border-t border-emerald-500/10 pt-1.5">
                              <span>Prix total estimé:</span>
                              <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                {bookingEstimate.totalPrice} {billboard.currency}
                              </strong>
                            </div>
                          </div>
                      )}

                      {error && (
                          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                      )}

                      <Button
                          type="submit"
                          disabled={submitting}
                          className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 gap-2 mt-2"
                      >
                        {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{tBooking("submitting")}</span>
                            </>
                        ) : (
                            <span>{tBooking("submit")}</span>
                        )}
                      </Button>
                    </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
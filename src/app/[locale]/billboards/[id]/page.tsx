import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestBaseUrl } from "@/lib/site-url";
import {
  getAverageRating,
  getBillboard,
  getBillboardImages,
  getPublishedReviewsForTarget,
} from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { BillboardDetailClient } from "./BillboardDetailClient";

// cache() dédoublonne l'appel entre generateMetadata et le rendu de la page pour une même
// requête : axios (utilisé par lib/api) n'est pas automatiquement mémoïsé comme le fetch natif
// de Next, donc sans ça chaque fonction referait son propre aller-retour réseau.
const loadBillboard = cache(getBillboard);
const loadImages = cache(getBillboardImages);
const loadAverageRating = cache(getAverageRating);
const loadReviews = cache(getPublishedReviewsForTarget);

async function loadBillboardOrNull(id: string) {
  try {
    return await loadBillboard(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const billboard = await loadBillboardOrNull(id);
  if (!billboard) {
    return { title: "Panneau introuvable" };
  }

  const baseUrl = getRequestBaseUrl(await headers());
  const canonical = `${baseUrl}${getPathname({ locale, href: `/billboards/${id}` })}`;
  const images = await loadImages(id).catch(() => []);
  // Le titre du panneau inclut parfois déjà la ville (ex: "Panneau Digital — Rue X, Douala") :
  // ne pas la répéter dans le <title> dans ce cas.
  const includesCity = billboard.city && billboard.title.toLowerCase().includes(billboard.city.toLowerCase());
  const title = includesCity
    ? `${billboard.title} | Guen's Pub`
    : `${billboard.title} — ${billboard.city} | Guen's Pub`;
  const description =
    billboard.description?.slice(0, 155) ||
    `Louez ce panneau ${billboard.type.toLowerCase()} à ${billboard.city}, à partir de ${billboard.dailyRate} ${billboard.currency}/jour sur Guen's Pub.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}${getPathname({ locale: l, href: `/billboards/${id}` })}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: images[0] ? [{ url: images[0].url }] : undefined,
    },
    twitter: {
      card: images[0] ? "summary_large_image" : "summary",
      title,
      description,
      images: images[0] ? [images[0].url] : undefined,
    },
  };
}

export default async function BillboardDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const billboard = await loadBillboardOrNull(id);
  if (!billboard) {
    notFound();
  }

  const [images, averageRating, reviews] = await Promise.all([
    loadImages(id).catch(() => []),
    loadAverageRating(id).catch(() => 0),
    loadReviews(id).catch(() => []),
  ]);

  const baseUrl = getRequestBaseUrl(await headers());
  const canonical = `${baseUrl}${getPathname({ locale: routing.defaultLocale, href: `/billboards/${id}` })}`;
  const billboardsPath = getPathname({ locale: routing.defaultLocale, href: "/billboards" });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: billboard.title,
    description: billboard.description || undefined,
    image: images.map((image) => image.url),
    brand: { "@type": "Brand", name: "Guen's Pub" },
    category: billboard.type,
    offers: {
      "@type": "Offer",
      price: billboard.dailyRate,
      priceCurrency: billboard.currency,
      availability:
        billboard.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonical,
    },
    ...(averageRating > 0 && reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Panneaux", item: `${baseUrl}${billboardsPath}` },
      { "@type": "ListItem", position: 3, name: billboard.title, item: canonical },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BillboardDetailClient id={id} initialBillboard={billboard} />
    </>
  );
}

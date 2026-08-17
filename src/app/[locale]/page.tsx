import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { BillboardsPreview } from "@/components/billboards/BillboardsPreview";
import heroBillboard from "../../../public/images/hero-billboard.jpg";

export default async function HomePage({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("home");

    return (
        <>
        <div className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            {/* Image de fond avec effet de zoom au survol et chargement optimisé */}
            <Image
                src={heroBillboard}
                alt={t("heroTitle")}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center transition-transform duration-1000 scale-105"
            />

            {/* Superposition de dégradés pour une lisibilité maximale et une ambiance sombre moderne */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />

            {/* Halo lumineux décoratif en arrière-plan */}
            <div
                aria-hidden="true"
                className="absolute -top-40 left-1/2 -z-10 -translate-x-1/2 blur-3xl sm:-top-80 transform-gpu"
            >
                <div
                    className="aspect-[1097/845] w-[36.125rem] max-w-none bg-gradient-to-tr from-primary to-indigo-500 opacity-20 sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            {/* Contenu principal Hero */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
                {/* Badge d'introduction */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-inner sm:text-sm">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Guen's Pub Digital & Out-Of-Home</span>
                </div>

                {/* Titre principal responsive */}
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.15]">
                    {t("heroTitle")}
                </h1>

                {/* Sous-titre */}
                <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-xl font-normal leading-relaxed">
                    {t("heroSubtitle")}
                </p>

                {/* Call to Actions (CTA) */}
                <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                    >
                        <Link href="/register" className="flex items-center justify-center gap-2">
                            <span>{t("ctaRegister")}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 hover:text-white hover:scale-[1.02]"
                    >
                        <Link href="/login">{t("ctaLogin")}</Link>
                    </Button>
                </div>
            </div>
        </div>

        <BillboardsPreview />
        </>
    );
}
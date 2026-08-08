import { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import heroBillboard from "../../../../public/images/hero-billboard.jpg";

export default async function AuthLayout({
                                           children,
                                           params,
                                         }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.layout");

  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background font-sans antialiased">
        {/* Colonne Formulaire (Mobile & Desktop) */}
        <div className="flex flex-col min-h-screen justify-between p-6 sm:p-8 md:p-12 lg:p-16">
          {/* En-tête / Logo */}
          <header className="flex items-center justify-between">
            <Image
                src="/logo.png" // Remplacez par le chemin exact de votre image (ex: dans /public)
                alt="Guen's Pub Logo"
                width={180}
                height={60}
                className="object-cover"
                priority
            />
          </header>

          {/* Zone centrale du Formulaire */}
          <main className="my-auto py-8 flex items-center justify-center">
            {/* Le conteneur s'adapte jusqu'à max-w-2xl pour accommoder les formulaires plus larges comme l'inscription */}
            <div className="w-full max-w-xl sm:max-w-2xl transition-all">
              {children}
            </div>
          </main>

          {/* Pied de page discret */}
          <footer className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Billboard. Tous droits réservés.
          </footer>
        </div>

        {/* Colonne Visuelle (Écrans Large uniquement) */}
        <div className="relative hidden lg:flex overflow-hidden bg-slate-950">
          <Image
              src={heroBillboard}
              alt={t("imageAlt")}
              fill
              priority
              sizes="50vw"
              className="object-cover object-center transition-scale duration-700 hover:scale-105"
          />

          {/* Overlays de dégradé pour la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

          {/* Contenu textuel sur l'image */}
          <div className="relative z-10 flex h-full w-full flex-col justify-end p-12 xl:p-16 text-white space-y-6">
            <div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-md shadow-inner">
              {t("badge")}
            </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {t("headline")}
              </h1>
              <p className="text-base xl:text-lg text-slate-300 max-w-lg font-normal leading-relaxed">
                {t("subheadline")}
              </p>
            </div>

            <ul className="space-y-3 pt-2 text-sm text-slate-200">
              {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    <span className="font-medium">{bullet}</span>
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
}
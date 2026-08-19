import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Handshake, Megaphone } from "lucide-react";

export async function CtaSection() {
  const t = await getTranslations("home.cta");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center shadow-2xl sm:px-16 sm:py-20">
        {/* Halo lumineux décoratif, cohérent avec la section hero */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 -translate-x-1/2 blur-3xl"
        >
          <div
            className="aspect-[1097/845] w-[36rem] bg-gradient-to-tr from-primary to-indigo-500 opacity-25"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <Handshake className="h-4 w-4 text-amber-400" />
          <span>{t("eyebrow")}</span>
        </div>

        <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">{t("subtitle")}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] sm:w-auto"
          >
            <Link href="/become-advertiser">
              <Megaphone className="h-4 w-4" />
              <span>{t("ctaAdvertiser")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full gap-2 border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 hover:text-white hover:scale-[1.02] sm:w-auto"
          >
            <Link href="/become-owner">
              <span>{t("ctaOwner")}</span>
            </Link>
          </Button>
        </div>

        <Link
          href="/become-mediabuyer"
          className="mt-6 inline-block text-sm font-medium text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          {t("ctaMediaBuyer")}
        </Link>
      </div>
    </section>
  );
}

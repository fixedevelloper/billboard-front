import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRequestBaseUrl } from "@/lib/site-url";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = getRequestBaseUrl(await headers());
    const canonical = `${baseUrl}${getPathname({ locale, href: "/terms" })}`;
    const title = "Conditions générales d'utilisation | Guen's Pub";
    const description = "Conditions générales d'utilisation de la marketplace Guen's Pub de location de panneaux publicitaires.";

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, `${baseUrl}${getPathname({ locale: l, href: "/terms" })}`])
            ),
        },
        openGraph: { title, description, url: canonical, type: "website" },
    };
}

export default function TermConditonPage() {
    const lastUpdated = "19 août 2026";
    // Nom de marque connu (voir Footer/Header/JsonLd) — pas de raison sociale distincte connue
    // (numéro RCCM, forme juridique...) à ce jour : on ne fabrique pas une mention légale non
    // vérifiée, on reste sur le nom de marque partout où le texte l'utilisait.
    const appName = "Guen's Pub";
    const companyName = "Guen's Pub";
    const contactEmail = "contact@guenspub.com";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">

                {/* En-tête */}
                <header className="border-b border-slate-200 pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                        Conditions Générales d&apos;Utilisation
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Dernière mise à jour : {lastUpdated}
                    </p>
                </header>

                {/* Contenu */}
                <div className="space-y-8 text-slate-600 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            1. Présentation et Acceptation
                        </h2>
                        <p>
                            Bienvenue sur <strong>{appName}</strong>, un service édité par <strong>{companyName}</strong>.
                            En accédant à notre application ou en l&apos;utilisant, vous acceptez d&apos;être lié par les présentes Conditions Générales d&apos;Utilisation (CGU). Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            2. Accès aux Services et Inscription
                        </h2>
                        <p className="mb-2">
                            L&apos;accès à certaines fonctionnalités nécessite la création d&apos;un compte utilisateur ou l&apos;authentification via un tiers (ex: Google, Facebook).
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Vous devez fournir des informations exactes et à jour lors de votre inscription.</li>
                            <li>Vous êtes responsable du maintien de la confidentialité de vos identifiants.</li>
                            <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            3. Services Tiers et Intégrations (APIs)
                        </h2>
                        <p>
                            <strong>{appName}</strong> intègre des services fournis par des tiers (notamment Google Cloud, Meta/Facebook API). L&apos;utilisation de ces intégrations implique votre adhésion aux conditions respectives de ces tiers. Nous ne collectons et n&apos;utilisons les données issues de ces services que conformément aux autorisations (scopes) que vous nous accordez explicitement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            4. Utilisation Acceptable
                        </h2>
                        <p className="mb-2">Vous vous engagez à ne pas :</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Utiliser le service à des fins illégales ou non autorisées.</li>
                            <li>Tenter de perturber, d&apos;endommager ou d&apos;accéder sans autorisation à nos serveurs ou réseaux.</li>
                            <li>Rétro-concevoir (reverse engineer) tout aspect de l&apos;application.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            5. Propriété Intellectuelle
                        </h2>
                        <p>
                            Tous les éléments constitutifs de l&apos;application (textes, graphismes, logiciels, logos, marque) sont la propriété exclusive de <strong>{companyName}</strong> ou de ses concédants de licence et sont protégés par les lois sur le droit d&apos;auteur et la propriété intellectuelle.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            6. Limitation de Responsabilité
                        </h2>
                        <p>
                            Le service est fourni &quot;en l&apos;état&quot; et &quot;selon disponibilité&quot;. Nous ne garantissons pas que l&apos;accès à l&apos;application sera ininterrompu ou exempt d&apos;erreurs. Dans la mesure permise par la loi, <strong>{companyName}</strong> ne saurait être tenue responsable des dommages indirects subis du fait de l&apos;utilisation du service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            7. Modification des Conditions
                        </h2>
                        <p>
                            Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication sur cette page. L&apos;utilisation continue de l&apos;application après publication constitue votre acceptation des nouvelles conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">
                            8. Contact
                        </h2>
                        <p>
                            Pour toute question concernant ces Conditions Générales d&apos;Utilisation, vous pouvez nous contacter à l&apos;adresse suivante :{" "}
                            <a href={`mailto:${contactEmail}`} className="text-blue-600 underline hover:text-blue-800">
                                {contactEmail}
                            </a>.
                        </p>
                    </section>

                </div>

                {/* Pied de page */}
                <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} {companyName}. Tous droits réservés.
                </footer>

            </div>
        </div>
    );
}

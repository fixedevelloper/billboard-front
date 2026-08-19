// Injecte des données structurées JSON-LD (schema.org) dans le <head>/<body> du document.
// Component Server (pas de "use client") : peut être rendu directement depuis n'importe quel
// Server Component (page.tsx, layout.tsx...).
export function JsonLd({ data }: { data: object }) {
  // Échappe "<" pour empêcher une valeur intégrée (titre de panneau, description...) contenant
  // "</script>" de rompre hors de la balise et d'injecter du HTML/JS arbitraire — ces valeurs
  // proviennent de propriétaires (saisie utilisateur), donc pas dignes de confiance telles quelles.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}

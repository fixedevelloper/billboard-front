import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Origine de l'API Spring Boot (autre port en dev, autre sous-domaine en prod) : la CSP doit
// explicitement l'autoriser en connect-src/img-src (fetch, EventSource, images MinIO/logo...).
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").origin;
  } catch {
    return "http://localhost:8080";
  }
}

export default function proxy(request: NextRequest) {
  const origin = apiOrigin();

  // Pas de nonce ici volontairement : un CSP à base de nonce exige que TOUTES les pages soient
  // rendues dynamiquement (chaque page statiquement pré-rendue est servie sans connaître le nonce
  // généré à la requête suivante, donc ses scripts se retrouvent bloqués - vécu en prod sur
  // Vercel). Cette policy reste "self" uniquement : elle bloque toujours le chargement de script
  // depuis un domaine externe (le principal vecteur d'exfiltration en cas de XSS stocké), sans
  // dépendre du mode de rendu de chaque page.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com ${origin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${origin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const response = intlMiddleware(request) ?? NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

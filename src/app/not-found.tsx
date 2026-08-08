"use client";

import Error from "next/error";

// Ce composant s'affiche si l'URL n'a même pas de préfixe de langue (ex: /invalid-route)
export default function GlobalNotFound() {
    return (
        <html>
        <body>
        <Error statusCode={404} />
        </body>
        </html>
    );
}
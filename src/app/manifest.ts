import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conectado por el Cambio",
    short_name: "Conectado",
    description:
      "Plataforma territorial para coordinadores, dirigentes, miembros, eventos y gestion interna.",
    start_url: "/login",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2740b0",
    lang: "es-DO",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conectados",
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
        src: "/uploads/favicon.png",
        type: "image/png",
      },
    ],
  };
}

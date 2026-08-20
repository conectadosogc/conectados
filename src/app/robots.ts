import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/login", "/recuperar-acceso"],
      disallow: ["/panel", "/coordinadores", "/dirigentes", "/miembros", "/eventos", "/usuarios", "/ajustes"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

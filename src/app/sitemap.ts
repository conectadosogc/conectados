import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const routes = ["/login", "/recuperar-acceso"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date("2026-08-19T00:00:00.000Z");

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "/login" ? "weekly" : "monthly",
    priority: route === "/login" ? 1 : 0.5,
  }));
}

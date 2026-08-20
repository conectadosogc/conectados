import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Manrope, Sora } from "next/font/google";

import { ThemeScript } from "@/components/theme-script";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conectado por el Cambio",
  description: "Plataforma territorial para coordinadores, dirigentes, miembros, eventos y gestion interna.",
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Conectado por el Cambio",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Conectado por el Cambio",
    description:
      "Plataforma territorial para coordinadores, dirigentes, miembros, eventos y gestion interna.",
    url: "/login",
    siteName: "Conectado por el Cambio",
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conectado por el Cambio",
    description:
      "Plataforma territorial para coordinadores, dirigentes, miembros, eventos y gestion interna.",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const initialTheme = cookieStore.get("conectados-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="es"
      data-theme={initialTheme}
      suppressHydrationWarning
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

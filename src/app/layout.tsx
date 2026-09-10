import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taskflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaskFlow — Plateforme Collaborative de Gestion de Projets & Tâches",
    template: "%s | TaskFlow",
  },
  description:
    "Organisez, planifiez et suivez vos projets en équipe avec TaskFlow. Tableaux Kanban dynamiques, vues calendrier, gestion documentaire et continuité hors-ligne garantie.",
  keywords: [
    "gestion de projet",
    "gestion de tâches",
    "kanban",
    "tableau agile",
    "collaboration équipe",
    "productivité",
    "suivi de projet",
    "planification",
    "calendrier",
    "hors-ligne",
  ],
  authors: [{ name: "TaskFlow Team" }],
  creator: "TaskFlow",
  publisher: "TaskFlow Inc.",
  applicationName: "TaskFlow",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "TaskFlow",
    title: "TaskFlow — Plateforme Collaborative de Gestion de Projets & Tâches",
    description:
      "Pilotez vos projets avec clarté. Tableaux Kanban interactifs, gestion documentaire et synchronisation hors-ligne garantie.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow — Plateforme Collaborative de Gestion de Projets & Tâches",
    description:
      "Pilotez vos projets avec clarté. Tableaux Kanban interactifs, gestion documentaire et synchronisation hors-ligne garantie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

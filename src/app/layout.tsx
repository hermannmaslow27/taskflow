import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TaskFlow — Gestion de Tâches Fullstack & Offline-First",
  description:
    "Application moderne de gestion de tâches haute performance avec Next.js 16, Drizzle ORM, Kanban dnd-kit, synchronisation PWA hors-ligne et rôles RBAC.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#6366F1",
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

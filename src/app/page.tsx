import Link from "next/link";
import {
  CheckCircle2,
  LayoutDashboard,
  WifiOff,
  Clock,
  ShieldCheck,
  Command,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="border-b border-card-border/60 bg-card/50 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg transition"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition shadow-sm"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next.js 16 · Drizzle ORM · Offline-First PWA · Tailwind CSS v4</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-card-foreground leading-tight max-w-3xl">
          La gestion de tâches{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            haute performance
          </span>{" "}
          pensée pour la vitesse.
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Kanban accessible réordonnable en temps réel, support complet hors-ligne avec Dexie.js,
          sécurité RBAC stricte, automatisations d&apos;échéances et recherche instantanée.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition shadow-lg shadow-primary/25 flex items-center gap-2.5 cursor-pointer"
          >
            <span>Accéder au Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="border border-card-border bg-card/60 hover:bg-muted-bg px-6 py-3.5 rounded-2xl font-semibold text-sm transition text-card-foreground"
          >
            Connexion
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-16 text-left w-full">
          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Kanban & Fractional Indexing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Glisser-déposer accessible (`@dnd-kit`) avec calcul de position flottante, sans réécrire l&apos;intégralité des lignes en base.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Mode PWA Hors-Ligne</h3>
            <p className="text-xs text-muted leading-relaxed">
              Persistance IndexedDB avec Dexie.js, file de mutations locale et réconciliation automatique Last-Write-Wins à la reconnexion.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Automatisations Inngest</h3>
            <p className="text-xs text-muted leading-relaxed">
              Tâches récurrentes (règles RFC 5545), rappels d&apos;échéances et purge automatique de la corbeille exécutés en tâche de fond.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Sécurité & RBAC Stricte</h3>
            <p className="text-xs text-muted leading-relaxed">
              Gestion fine des droits par projet (`owner`, `editor`, `viewer`), hashage de mots de passe moderne en `argon2` et validation Zod.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Palette de Commandes (⌘K)</h3>
            <p className="text-xs text-muted leading-relaxed">
              Navigation instantanée, création rapide de tâche, changement de vue et de thème au clavier via `cmdk`.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-card-foreground">Drizzle ORM & Postgres</h3>
            <p className="text-xs text-muted leading-relaxed">
              Schéma relationnel optimisé avec index composites, soft deletes, tables de sous-tâches, commentaires et historique d&apos;activité.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border/60 py-6 text-center text-xs text-muted">
        TaskFlow © 2026 — Construit avec Next.js 16, TypeScript & Drizzle ORM.
      </footer>
    </div>
  );
}

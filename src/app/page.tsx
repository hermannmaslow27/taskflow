import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  ListTodo,
  ShieldCheck,
  Zap,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  Smartphone,
  Bell,
  Check,
  ChevronRight,
  Star,
  Search,
  FolderKanban,
  RotateCcw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TaskFlow — Plateforme Collaborative de Gestion de Projets & Tâches",
  description:
    "Organisez, planifiez et suivez vos projets en équipe avec TaskFlow. Tableaux Kanban dynamiques, vues calendrier, gestion documentaire et continuité hors-ligne garantie.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="border-b border-card-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              TaskFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-muted px-1.5 py-0.5 rounded bg-muted-bg border border-card-border">
              Workspace
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
          <a href="#services" className="hover:text-card-foreground transition">
            Services
          </a>
          <a href="#workflow" className="hover:text-card-foreground transition">
            Fonctionnement
          </a>
          <a href="#security" className="hover:text-card-foreground transition">
            Sécurité & Droits
          </a>
          <a href="#testimonials" className="hover:text-card-foreground transition">
            Témoignages
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg transition"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition shadow-sm flex items-center gap-1.5"
          >
            <span>Démarrer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-4 pt-16 pb-20 text-center flex flex-col items-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme collaborative nouvelle génération pour équipes modernes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-card-foreground leading-[1.15] max-w-4xl">
            Pilotez vos projets avec clarté,{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              libérez la vélocité
            </span>{" "}
            de votre équipe.
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
            Un espace de travail complet pour organiser vos tâches, collaborer en temps réel et partager vos documents. Continuez à travailler partout, même sans connexion.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold text-sm transition shadow-lg shadow-primary/25 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Créer mon espace gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="border border-card-border bg-card/80 hover:bg-muted-bg px-7 py-4 rounded-2xl font-semibold text-sm transition text-card-foreground shadow-xs"
            >
              Accéder à mon espace
            </Link>
          </div>

          {/* Interactive UI Preview Showcase */}
          <div className="w-full pt-8">
            <div className="rounded-2xl border border-card-border bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-left">
              {/* Header preview mock */}
              <div className="flex items-center justify-between border-b border-card-border pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-card-foreground flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-primary" />
                    Refonte Plateforme Client 2026
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronisé
                  </span>
                </div>
              </div>

              {/* Kanban Mock Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Column 1: A faire */}
                <div className="bg-muted-bg/30 rounded-xl p-3 border border-card-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-card-foreground uppercase tracking-wide">
                      À faire (3)
                    </span>
                    <span className="text-[11px] text-muted">70%</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card p-3 rounded-lg border border-card-border shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                          Urgent
                        </span>
                        <span className="text-[10px] text-muted">Demain</span>
                      </div>
                      <p className="text-xs font-medium text-card-foreground">
                        Validation des maquettes design et user flows
                      </p>
                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-muted">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> 2 fichiers
                        </span>
                        <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[9px] font-bold">
                          AL
                        </div>
                      </div>
                    </div>

                    <div className="bg-card p-3 rounded-lg border border-card-border shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                          Moyenne
                        </span>
                        <span className="text-[10px] text-muted">14 sept</span>
                      </div>
                      <p className="text-xs font-medium text-card-foreground">
                        Préparation du plan de communication de rentrée
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: En cours */}
                <div className="bg-muted-bg/30 rounded-xl p-3 border border-card-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-card-foreground uppercase tracking-wide">
                      En cours (2)
                    </span>
                    <span className="text-[11px] text-muted">45%</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card p-3 rounded-lg border border-card-border shadow-xs ring-1 ring-primary/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                          Élevée
                        </span>
                        <span className="text-[10px] text-indigo-400 font-medium">Aujourd&apos;hui</span>
                      </div>
                      <p className="text-xs font-medium text-card-foreground">
                        Mise en place de la gestion documentaire sécurisée
                      </p>
                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-muted">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-3 h-3" /> 4/5 sous-tâches
                        </span>
                        <div className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-[9px] font-bold">
                          MD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Terminé */}
                <div className="bg-muted-bg/30 rounded-xl p-3 border border-card-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-card-foreground uppercase tracking-wide">
                      Terminé (8)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">100%</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card/70 p-3 rounded-lg border border-card-border shadow-xs opacity-80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Clôturé
                        </span>
                        <span className="text-[10px] text-muted">Hier</span>
                      </div>
                      <p className="text-xs font-medium text-card-foreground line-through decoration-muted">
                        Audit d&apos;accessibilité et validation des contrastes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Metrics Band */}
        <section className="w-full border-y border-card-border/60 bg-muted-bg/20 py-10">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-card-foreground">100%</div>
              <div className="text-xs text-muted font-medium mt-1">Disponibilité garantie en et hors-ligne</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-card-foreground">+40%</div>
              <div className="text-xs text-muted font-medium mt-1">Gain de temps sur la gestion des projets</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-card-foreground">0ms</div>
              <div className="text-xs text-muted font-medium mt-1">Latence ressentie lors des manipulations</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-card-foreground">RGPD</div>
              <div className="text-xs text-muted font-medium mt-1">Sécurité stricte & isolation des accès</div>
            </div>
          </div>
        </section>

        {/* Services & Core Features Section */}
        <section id="services" className="w-full max-w-6xl mx-auto px-4 py-24 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Services & Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-card-foreground tracking-tight">
              Tout ce dont votre équipe a besoin pour performer au quotidien.
            </h2>
            <p className="text-sm text-muted">
              Une suite d&apos;outils intégrés pensée pour simplifier chaque étape du cycle de vie de vos projets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Vues Métiers */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Vues Métiers Personnalisables
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Alternez instantanément entre le tableau Kanban interactif, la vue Liste hiérarchisée et le Calendrier des jalons selon votre besoin du moment.
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Glisser-déposer intuitif
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Filtres par priorité, tag et statut
                </li>
              </ul>
            </div>

            {/* Service 2: Mode Hors-Ligne */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Continuité Hors-Ligne Absolue
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Restez productif dans l&apos;avion, en déplacement ou en zone blanche. Modifiez, créez et déplacez vos tâches : tout est sauvegardé localement puis synchronisé automatiquement.
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Fonctionnement sans interruption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Résolution automatique des conflits
                </li>
              </ul>
            </div>

            {/* Service 3: Gestion Documentaire */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Gestion Documentaire Cloud
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Centralisez toutes vos pièces jointes (PDF, maquettes visuelles, tableurs, images) directement sur vos projets ou au cœur de chaque fiche tâche.
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Glisser-déposer de fichiers volumineux
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Prévisualisation et téléchargement rapide
                </li>
              </ul>
            </div>

            {/* Service 4: Rôles & Sécurité */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Gouvernance & Droits d&apos;Accès
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Contrôlez précisément qui peut consulter, éditer ou administrer chaque projet grâce aux profils de sécurité granulaires (Propriétaire, Éditeur, Lecteur).
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Cloisonnement strict des espaces
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Protection contre les suppressions accidentelles
                </li>
              </ul>
            </div>

            {/* Service 5: Automatisation & Échéances */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Planification & Récurrences
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Programmez des tâches récurrentes quotidiennes, hebdomadaires ou mensuelles. Bénéficiez d&apos;un suivi des retards et d&apos;alertes automatiques.
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Tâches périodiques automatisées
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Gestion fine des priorités
                </li>
              </ul>
            </div>

            {/* Service 6: Navigation Rapide */}
            <div className="p-7 rounded-2xl bg-card border border-card-border shadow-xs space-y-4 hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground">
                Recherche & Navigation Instantanée
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Une palette de commandes accessible au clavier (Ctrl+K) pour retrouver n&apos;importe quelle tâche, projet ou changer d&apos;environnement sans lâcher la frappe.
              </p>
              <ul className="space-y-1.5 text-xs text-muted pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Recherche globale instantanée
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Raccourcis clavier productifs
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="workflow" className="w-full border-t border-card-border/60 bg-muted-bg/10 py-24">
          <div className="max-w-6xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Fonctionnement
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-card-foreground tracking-tight">
                Démarrez en moins de 2 minutes.
              </h2>
              <p className="text-sm text-muted">
                Aucune configuration complexe nécessaire. Tout est immédiatement prêt à l&apos;emploi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-card border border-card-border/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black text-xl flex items-center justify-center mx-auto">
                  1
                </div>
                <h3 className="font-bold text-base text-card-foreground">Créez votre projet</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Définissez un espace de travail dédié à votre objectif, personnalisez sa couleur et invitez les membres de votre équipe.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-card-border/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 font-black text-xl flex items-center justify-center mx-auto">
                  2
                </div>
                <h3 className="font-bold text-base text-card-foreground">Organisez vos livrables</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Ajoutez vos tâches, assignez les responsabilités, définissez les dates d&apos;échéance et attachez les documents indispensables.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-card-border/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 font-black text-xl flex items-center justify-center mx-auto">
                  3
                </div>
                <h3 className="font-bold text-base text-card-foreground">Pilotez en direct</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Déplacez vos tâches au fur et à mesure, suivez les progrès en équipe et restez serein grâce à la sauvegarde permanente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Audit Section */}
        <section id="security" className="w-full max-w-6xl mx-auto px-4 py-24">
          <div className="rounded-3xl border border-card-border bg-gradient-to-br from-card via-card to-muted-bg/40 p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Sécurité & Confidentialité
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-card-foreground">
                  Vos données de projet sont protégées par les standards les plus exigeants.
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Chaque compte bénéficie d&apos;une isolation stricte, d&apos;un chiffrement renforcé et d&apos;une traçabilité complète de chaque action effectuée par vos collaborateurs.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-card-foreground">Chiffrement et intégrité</h4>
                      <p className="text-[11px] text-muted">Sessions sécurisées, identifiants protégés et transmissions cryptées de bout en bout.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-card-foreground">Corbeille sécurisée & Restauration</h4>
                      <p className="text-[11px] text-muted">Restaurez n&apos;importe quelle tâche supprimée par mégarde en un seul clic.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-card-foreground">Journal d&apos;activité d&apos;équipe</h4>
                      <p className="text-[11px] text-muted">Historique transparent de chaque création, mise à jour ou clôture de tâche.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted-bg/40 border border-card-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-card-border pb-3">
                  <span className="text-xs font-bold text-card-foreground">Journal d&apos;activité récent</span>
                  <span className="text-[10px] text-muted">Temps réel</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-card-foreground">Tâche clôturée avec succès</p>
                      <p className="text-[11px] text-muted">Sophie M. a validé la phase de recette client</p>
                      <span className="text-[10px] text-muted/80">Il y a 4 minutes</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-card-foreground">Nouvelle pièce jointe ajoutée</p>
                      <p className="text-[11px] text-muted">Marc D. a téléversé le document cahier_des_charges.pdf</p>
                      <span className="text-[10px] text-muted/80">Il y a 18 minutes</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-card-foreground">Mise à jour des priorités</p>
                      <p className="text-[11px] text-muted">Élise B. a ajusté la priorité en &quot;Urgent&quot;</p>
                      <span className="text-[10px] text-muted/80">Il y a 1 heure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Témoignages
            </span>
            <h2 className="text-3xl font-black text-card-foreground tracking-tight">
              Adopté par des équipes qui aiment l&apos;efficacité.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                &quot;Le mode hors-ligne a changé notre manière de travailler en clientèle. Plus besoin de se demander si on a du réseau pour mettre à jour nos livrables.&quot;
              </p>
              <div className="pt-2 border-t border-card-border/60">
                <div className="text-xs font-bold text-card-foreground">Alexandre V.</div>
                <div className="text-[11px] text-muted">Directeur des Opérations, Agence Nova</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                &quot;La réactivité de l&apos;interface est bluffante. Le Kanban est fluide, la recherche avec Ctrl+K est ultra rapide et l&apos;équipe a pris l&apos;outil en main en un quart d&apos;heure.&quot;
              </p>
              <div className="pt-2 border-t border-card-border/60">
                <div className="text-xs font-bold text-card-foreground">Camille R.</div>
                <div className="text-[11px] text-muted">Lead Product Manager, Studio Pulse</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-card-border shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                &quot;Avoir les documents joints directement dans les cartes de tâches et les discussions d&apos;équipe au même endroit nous a évité de perdre des heures en réunions inutiles.&quot;
              </p>
              <div className="pt-2 border-t border-card-border/60">
                <div className="text-xs font-bold text-card-foreground">Thomas B.</div>
                <div className="text-[11px] text-muted">Responsable Technique, FinTech Horizon</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full max-w-4xl mx-auto px-4 pb-24 text-center">
          <div className="rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-8 sm:p-14 text-white shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Prêt à transformer la gestion de vos projets ?
            </h2>
            <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Rejoignez des milliers de professionnels qui organisent leurs tâches avec clarté et sérénité.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-2xl font-bold text-sm transition shadow-lg shadow-black/10 cursor-pointer"
              >
                Créer un compte maintenant
              </Link>
              <Link
                href="/login"
                className="border border-white/30 text-white hover:bg-white/10 px-7 py-3.5 rounded-2xl font-semibold text-sm transition"
              >
                Déjà inscrit ? Connexion
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border/60 bg-card/40 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-card-foreground">TaskFlow Workspace</span>
            <span>— Plateforme collaborative de gestion de projets</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-card-foreground transition">
              Espace membre
            </Link>
            <Link href="/register" className="hover:text-card-foreground transition">
              Inscription
            </Link>
            <span>© 2026 TaskFlow. Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

# TaskFlow — Application Fullstack de Gestion de Tâches

> Application de gestion de tâches moderne, robuste et complète construite avec **Next.js 16** (App Router, Server Actions, Route Handlers), **TypeScript strict**, **Drizzle ORM** (PostgreSQL), **Auth.js (NextAuth v5)**, **@dnd-kit**, **Dexie.js** (PWA offline-first), **TanStack Table** et **Inngest**.

---

## ✨ Fonctionnalités Clés

1. **Tableau Kanban Accessible**
   - Glisser-déposer accessible (`@dnd-kit`) au pointeur et au clavier (ARIA compliant).
   - Technique de **fractional indexing** (`doublePrecision` position) : réordonnancement sans réécrire les lignes adjacentes.
   - Mutations optimistes et gestion des priorités (Basse, Moyenne, Haute, Urgente).

2. **Mode Hors-Ligne & PWA (Offline-First)**
   - Service Worker pour la mise en cache du shell d'application et des assets statiques.
   - Base locale **Dexie.js (IndexedDB)** stockant les tâches, projets et une file d'attente de mutations (`pendingMutations`).
   - Rejeu automatique à la reconnexion via l'endpoint `/api/sync`.
   - Résolution de conflits **Last-Write-Wins (LWW)** basé sur `updatedAt` avec notification à l'utilisateur.
   - Utilisation d'UUIDs client pour éviter les collisions d'identifiants.

3. **Multi-Vues Performantes**
   - **Vue Kanban** : colonnes par statut avec compteurs et ajout rapide.
   - **Vue Liste** : propulsée par **TanStack Table**, avec tri multi-colonnes et filtres combinés.
   - **Vue Calendrier** : visualisation des échéances par mois et ajout direct au clic sur un jour.
   - **Corbeille (Soft Delete)** : conservation des tâches supprimées avec restauration en 1 clic.

4. **Éditeur de Tâches Riche**
   - Description Markdown avec rendu assaini XSS (`react-markdown` + `remark-gfm` + `rehype-sanitize`).
   - Gestion de sous-tâches réordonnables avec barre de progression dynamique.
   - Fil de commentaires chronologique avec auteur et date.
   - Récurrence de tâches selon le standard RFC 5545 (`DAILY`, `WEEKLY`, `MONTHLY`, `WEEKDAYS`).

5. **Sécurité & Permissions RBAC**
   - Authentification **Auth.js v5** (Credentials email/mot de passe avec hachage **Argon2** + OAuth).
   - Middleware Edge pour la protection des routes.
   - Contrôle d'accès granulaire sur les Server Actions via `assertProjectRole` (`owner`, `editor`, `viewer`).

6. **Automatisations en Arrière-Plan (Inngest)**
   - Cron de génération des occurrences pour les tâches récurrentes.
   - Cron d'alerte et rappels d'échéances.
   - Purge automatique des tâches placées en corbeille depuis plus de 30 jours.

7. **Palette de Commandes (⌘K / Ctrl+K)**
   - Implémentée avec **cmdk** pour créer une tâche, changer de projet, basculer de vue ou changer de thème sans quitter le clavier.

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- Node.js 20+ ou 24+
- Une instance PostgreSQL (Neon, Supabase ou PostgreSQL local)

### 2. Configuration des variables d'environnement
Créez un fichier `.env.local` à la racine :

```bash
cp .env.example .env.local
```

Renseignez votre URL de base de données :
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/taskflow"
AUTH_SECRET="votre-cle-secrete-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Migrations Drizzle
Pour générer et appliquer les migrations sur votre base PostgreSQL :

```bash
# Générer les fichiers SQL de migration
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Ou pousser directement le schéma (prototypage rapide)
npm run db:push
```

### 4. Lancement de l'application
```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests Unitaires (Vitest)

La suite de tests valide la logique métier critique (indexation fractionnaire, récurrence RFC 5545, hiérarchie RBAC et schémas Zod) :

```bash
npm run test
```

---

## 📁 Structure du Projet

```
taskflow/
├── src/
│   ├── actions/          # Server Actions typées par domaine (tasks, projects, auth...)
│   ├── app/              # App Router Next.js 16 (layouts, pages, route handlers)
│   │   ├── api/
│   │   │   ├── auth/     # Auth.js route handler
│   │   │   ├── inngest/  # Inngest webhooks
│   │   │   └── sync/     # Synchronisation hors-ligne & LWW
│   │   ├── dashboard/    # Interface principale du tableau de bord
│   │   ├── login/        # Connexion
│   │   └── register/     # Inscription
│   ├── components/       # Composants UI Tailwind CSS v4 custom
│   │   ├── views/        # Vues Kanban, Liste, Calendrier, Corbeille
│   │   ├── command-palette.tsx
│   │   ├── offline-indicator.tsx
│   │   └── task-detail-modal.tsx
│   ├── db/               # Schéma Drizzle PostgreSQL & migrations SQL
│   ├── inngest/          # Jobs et cron functions d'arrière-plan
│   ├── lib/              # Utilitaires (RBAC, Fractional Indexing, Recurrence, Dexie...)
│   └── middleware.ts     # Middleware d'authentification Edge
├── tests/                # Suite de tests Vitest
├── drizzle.config.ts     # Configuration Drizzle Kit
└── vitest.config.ts      # Configuration Vitest
```

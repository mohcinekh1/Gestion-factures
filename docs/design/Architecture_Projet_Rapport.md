# Rapport : Structure et Architecture du Projet

> Documentation détaillée de l'architecture, des dossiers et de leur rôle dans l'application de Gestion des Factures.

**Projet :** Gestion des Factures  
**Stack :** React (Vite), MUI v5, Firebase, JSON Server, Formik/Yup, jsPDF, Recharts

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Arborescence complète](#2-arborescence-complète)
3. [Schéma architectural](#3-schéma-architectural)
4. [Détail des dossiers et rôles](#4-détail-des-dossiers-et-rôles)
5. [Flux de données](#5-flux-de-données)
6. [Dépendances entre modules](#6-dépendances-entre-modules)

---

## 1. Vue d'ensemble

### Objectif du projet

Application web de gestion de factures avec :
- Authentification (Admin / User)
- Gestion clients, articles, catégories
- Création et suivi de factures
- Génération de PDF
- Tableau de bord analytique

### Structure racine

```
facturation/                    ← Racine du projet
├── gestion-factures/           ← Application React (Vite)
├── docs/                       ← Documentation
├── phases/                     ← Phases de développement
└── .cursor/                    ← Règles Cursor (IA)
```

---

## 2. Arborescence complète

```
facturation/
│
├── .cursor/
│   └── rules/                  # Règles pour l'assistant IA Cursor
│       ├── mentor-pedagogy.mdc
│       ├── phases-workflow.mdc
│       └── project-context.mdc
│
├── docs/
│   ├── design/                 # Design et maquettes
│   │   ├── UI_Model.png        # Référence visuelle principale
│   │   └── README.md
│   ├── AuthContext_Rapport.md  # Documentation AuthContext
│   └── Architecture_Projet_Rapport.md  # Ce fichier
│
├── phases/                     # Phases de développement
│   ├── PHASE_1_SETUP.md
│   ├── PHASE_2_AUTH.md
│   ├── PHASE_3_CRUD.md
│   ├── PHASE_4_INVOICING.md
│   ├── PHASE_5_DASHBOARD.md
│   ├── PHASE_6_DEPLOY.md
│   └── RULES_REFERENCE.md
│
├── PROJECT_CONTEXT.md          # Contexte central du projet (référence)
│
└── gestion-factures/           # Application React
    ├── public/
    ├── src/
    │   ├── components/         # Composants réutilisables
    │   ├── pages/              # Pages / vues
    │   ├── contexts/           # Contexte React (état global)
    │   ├── services/           # Accès aux APIs (Firebase, JSON Server)
    │   ├── routes/             # Protection des routes
    │   ├── hooks/              # Hooks personnalisés
    │   ├── utils/              # Utilitaires
    │   ├── theme/              # Thème MUI
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── .env                    # Variables d'environnement (non versionné)
```

---

## 3. Schéma architectural

### Vue en couches

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE PRÉSENTATION (UI)                               │
│  pages/ + components/ + theme/                                                   │
│  Login, Register, UserDashboard, ClientForm, InvoiceForm, etc.                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE LOGIQUE (React)                                 │
│  contexts/ (AuthContext, AppContext)                                             │
│  routes/ (PrivateRoute, AdminRoute)                                              │
│  hooks/ (useClients, useInvoices, useArticles)                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE SERVICES                                        │
│  services/firebase.js     → Configuration Firebase                               │
│  services/firebaseService.js → CRUD Firebase (clients, factures, users)          │
│  services/jsonService.js  → CRUD JSON Server (articles, catégories)              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE DONNÉES                                         │
│  Firebase (Auth + Realtime DB)  │  JSON Server (port 3001)                       │
│  users, clients, factures      │  articles, categories                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Flux d'entrée de l'application

```
main.jsx
   │
   └──► App.jsx
          │
          ├── ThemeProvider (MUI theme)
          │      │
          │      └── BrowserRouter
          │             │
          │             └── AuthProvider (contexte auth)
          │                    │
          │                    └── Routes
          │                           ├── /login → Login
          │                           ├── /register → Register
          │                           └── PrivateRoute (protégé)
          │                                  └── /dashboard → UserDashboard
          │
          └── CssBaseline
```

---

## 4. Détail des dossiers et rôles

### Racine : `facturation/`

| Élément | Rôle |
|---------|------|
| **Racine du projet** | Contient l'app React, la doc et les phases. Point d'entrée du workspace. |
| **PROJECT_CONTEXT.md** | Référence centrale : objectifs, stack, structure des données, règles. À consulter en début de session. |

---

### `.cursor/rules/`

| Fichier | Rôle |
|---------|------|
| **mentor-pedagogy.mdc** | Règles pour le mode mentor : guider l'étudiant, poser des questions, ne pas donner de code complet sans explication. |
| **phases-workflow.mdc** | Indicateur de phase, référence aux fichiers phases/, validation avant passage de phase. |
| **project-context.mdc** | Rappelle de consulter PROJECT_CONTEXT.md, stack, règles de développement. |

**Traitement :** Ces règles sont appliquées automatiquement par Cursor lors des sessions de développement.

---

### `docs/`

| Dossier/Fichier | Rôle |
|-----------------|------|
| **docs/** | Documentation projet (rapports, design, architecture). |
| **docs/design/** | Maquettes et références visuelles. |
| **docs/design/UI_Model.png** | Source principale pour le design : layout, couleurs, composants. |
| **docs/design/README.md** | Explication de l'usage du design et mapping Eventure → Facturation. |
| **docs/AuthContext_Rapport.md** | Documentation détaillée du AuthContext. |
| **docs/Architecture_Projet_Rapport.md** | Ce rapport : structure et architecture. |

**Traitement :** Consultés avant tout développement UI ou lors de l'onboarding sur le projet.

---

### `phases/`

| Fichier | Phase | Rôle |
|---------|-------|------|
| **PHASE_1_SETUP.md** | S1 | Initialisation, Vite, dépendances, Firebase, JSON Server. |
| **PHASE_2_AUTH.md** | S1–S2 | Auth (login, register), AuthContext, routes protégées. |
| **PHASE_3_CRUD.md** | S2–S4 | Clients, articles, catégories. |
| **PHASE_4_INVOICING.md** | S4–S6 | Facturation, PDF, suivi des statuts. |
| **PHASE_5_DASHBOARD.md** | S6–S7 | Dashboard, graphiques, admin. |
| **PHASE_6_DEPLOY.md** | S7–S8 | Tests, déploiement. |
| **RULES_REFERENCE.md** | — | Référence des règles du projet. |

**Traitement :** Chaque phase décrit des étapes, des questions de compréhension et des critères de validation. Le workflow Cursor suit ces phases.

---

### `gestion-factures/src/` — Application React

#### `src/main.jsx`

| Rôle |
|------|
| Point d'entrée de l'app React. Monte le composant `App` dans le DOM avec `StrictMode`. Importe les styles globaux (`index.css`). |

---

#### `src/App.jsx`

| Rôle |
|------|
| Composant racine. Configure `ThemeProvider`, `BrowserRouter`, `AuthProvider` et les `Routes`. Définit les chemins publics (/login, /register) et protégés (/dashboard). |

---

#### `src/components/`

Composants réutilisables organisés par domaine.

| Sous-dossier | Rôle | Fichiers (actuels / prévus) |
|--------------|------|-----------------------------|
| **common/** | Éléments partagés (boutons, loaders, layouts) | AuthLayout.jsx, BeamsBackground.jsx |
| **clients/** | Formulaire et affichage clients | ClientForm, ClientCard (Phase 3) |
| **factures/** | Formulaires et lignes de factures | InvoiceForm, ArticleRow, InvoiceCard (Phase 4) |
| **dashboard/** | KPI et graphiques | KPICard, Charts (Phase 5) |
| **layout/** | Structure globale de la page | Sidebar, Navbar, Layout (Phase 5) |

**Traitement :** Un composant = un rôle. Ils sont importés par les `pages/` et ne font pas d’appels directs aux services (logique déléguée aux hooks ou contexts).

---

#### `src/pages/`

Pages principales correspondant aux routes.

| Sous-dossier | Rôle | Fichiers |
|--------------|------|----------|
| **auth/** | Connexion et inscription | Login.jsx, Register.jsx |
| **user/** | Espace utilisateur (comptable) | UserDashboard.jsx, Clients, Factures, InvoiceDetail (phases suivantes) |
| **admin/** | Espace administrateur | AdminDashboard, Articles, Categories, Validation (Phase 5) |

**Traitement :** Chaque page = une route. Utilise `useAuth()`, formulaires Formik/Yup, composants de `components/`.

---

#### `src/contexts/`

| Fichier | Rôle |
|---------|------|
| **AuthContext.jsx** | Contexte d'authentification : currentUser, userRole, loading, login, logout, register. Écoute Firebase Auth et Realtime DB. |
| **AppContext.jsx** | (Prévu) Contexte pour données métier (clients, factures, etc.) partagées. |

**Traitement :** Les contexts fournissent l’état global. `AuthProvider` enveloppe l’app dans `App.jsx`. Les composants utilisent `useAuth()` pour accéder à l’auth.

---

#### `src/services/`

| Fichier | Rôle |
|---------|------|
| **firebase.js** | Configuration Firebase : initialisation, instances `auth` et `database`. Utilise les variables d'environnement `.env`. |
| **firebaseService.js** | (Prévu) CRUD Firebase : clients, factures. Point unique d’accès à Firebase depuis les composants. |
| **jsonService.js** | (Prévu) CRUD JSON Server (articles, catégories). Point unique d’accès à JSON Server. |

**Traitement :** Règle : pas d’appels directs à Firebase/JSON Server dans les composants. Tout passe par ces services.

---

#### `src/routes/`

| Fichier | Rôle |
|---------|------|
| **PrivateRoute.jsx** | Protège les routes. Redirige vers /login si `!currentUser`. Affiche un spinner si `loading`. Utilise `Outlet` pour afficher les routes enfants. |
| **AdminRoute.jsx** | (Prévu) Protège les routes admin. Vérifie `userRole === 'admin'`. Redirige les non-admins. |

**Traitement :** Utilisés comme layouts de route dans `App.jsx` (ex. `<Route element={<PrivateRoute />}>`).

---

#### `src/hooks/`

| Fichier | Rôle |
|---------|------|
| **useClients.js** | (Prévu) CRUD clients, chargement, gestion des erreurs. |
| **useInvoices.js** | (Prévu) CRUD factures, filtres, statuts. |
| **useArticles.js** | (Prévu) Récupération des articles depuis JSON Server. |

**Traitement :** Encapsulent la logique de récupération et mise à jour des données pour les composants.

---

#### `src/utils/`

| Fichier | Rôle |
|---------|------|
| **calculations.js** | (Prévu) Logique TVA, remises, totaux (4 méthodes de facturation). |
| **pdfGenerator.js** | (Prévu) Génération des PDF de factures (jsPDF). |
| **helpers.js** | (Prévu) Formatage dates, numéros, etc. |

**Traitement :** Fonctions pures ou utilitaires sans dépendance UI. Importées par les composants ou les services.

---

#### `src/theme/`

| Fichier | Rôle |
|---------|------|
| **theme.js** | Thème MUI : palette, typographie, borderRadius. Aligné sur docs/design/UI_Model.png. |

**Traitement :** Importé par `ThemeProvider` dans `App.jsx`. S’applique à toute l’interface MUI.

---

#### Fichiers à la racine de `src/`

| Fichier | Rôle |
|---------|------|
| **index.css** | Styles globaux (reset, variables CSS si besoin). |
| **App.jsx** | Point d’assemblage des providers et routes. |
| **main.jsx** | Point d’entrée React. |

---

### `gestion-factures/` (racine app)

| Fichier/Dossier | Rôle |
|-----------------|------|
| **package.json** | Dépendances, scripts (dev, build, json-server). |
| **vite.config.js** | Config Vite (plugins React). |
| **.env** | Variables d’environnement (clés Firebase). Non versionné. |
| **public/** | Assets statiques. |
| **db.json** | (Prévu) Données JSON Server (articles, catégories). |

---

## 5. Flux de données

### Authentification

```
User → Login.jsx (Formik)
         │
         └── useAuth().login(email, password)
                    │
                    └── AuthContext → signInWithEmailAndPassword (Firebase)
                                            │
                                            └── onAuthStateChanged
                                                    │
                                                    └── setCurrentUser, setUserRole
                                                            │
                                                            └── PrivateRoute lit currentUser
                                                                    │
                                                                    └── Affiche dashboard ou redirige /login
```

### Données métier (prévu)

```
Composant (ex: ClientForm)
         │
         └── useClients() ou useInvoices()
                    │
                    └── firebaseService.js ou jsonService.js
                            │
                            └── Firebase Realtime DB / JSON Server
```

---

## 6. Dépendances entre modules

### Schéma des imports typiques

```
main.jsx
  └── App.jsx
        ├── theme/theme.js
        ├── contexts/AuthContext.jsx
        │     └── services/firebase.js
        ├── routes/PrivateRoute.jsx
        │     └── contexts/AuthContext.jsx
        ├── pages/auth/Login.jsx
        │     ├── contexts/AuthContext.jsx
        │     └── components/common/BeamsBackground.jsx
        └── pages/user/UserDashboard.jsx
              └── contexts/AuthContext.jsx
```

### Règles de dépendance

| Règle | Description |
|-------|-------------|
| **pages/** | Peut importer : components/, contexts/, hooks/, utils/, theme/ |
| **components/** | Peut importer : theme/, utils/, autres components/ — Pas d’import direct de services/ |
| **hooks/** | Peut importer : services/, contexts/ |
| **contexts/** | Peut importer : services/ (firebase.js pour AuthContext) |
| **services/** | Peut importer : firebase.js (config) — Pas d’import de components ou pages |
| **utils/** | Fonctions pures, pas d’import de React ou UI |
| **routes/** | Peut importer : contexts/, MUI |

---

## Résumé des rôles par dossier

| Dossier | Rôle principal |
|---------|----------------|
| **.cursor/rules/** | Règles et workflow pour Cursor |
| **docs/** | Documentation, design, rapports |
| **phases/** | Phases et étapes de développement |
| **gestion-factures/src/components/** | Composants UI réutilisables |
| **gestion-factures/src/pages/** | Pages et routes |
| **gestion-factures/src/contexts/** | État global (auth, app) |
| **gestion-factures/src/services/** | Accès aux APIs (Firebase, JSON Server) |
| **gestion-factures/src/routes/** | Protection des routes |
| **gestion-factures/src/hooks/** | Logique métier réutilisable |
| **gestion-factures/src/utils/** | Calculs et helpers |
| **gestion-factures/src/theme/** | Thème MUI |

---

*Rapport généré pour le projet Gestion des Factures — Architecture et structure*

# Rapport Phase 1 — Initialisation & Configuration du Projet

> **Phase** : 1/6 — Setup  
> **Objectif global** : Poser les fondations solides du projet Gestion des Factures

---

## Vue d'ensemble

La Phase 1 établit l'environnement de développement et les bases techniques nécessaires aux phases suivantes. Chaque étape remplit un rôle précis dans la chaîne de construction.

---

## ÉTAPE 1.1 — Création du projet React avec Vite

### Rôle
Initialiser l'application React avec un outil de build moderne (Vite).

### Objectif
- Avoir un projet React fonctionnel et prêt au développement
- Bénéficier des performances de Vite (HMR rapide, build optimisé)
- Partir d'une base propre (sans contenu par défaut)

### Ce qui a été appliqué
- Projet créé via `npm create vite@latest gestion-factures -- --template react`
- Dépendances installées
- Serveur de développement opérationnel sur `http://localhost:5173`
- Contenu par défaut supprimé pour une base vierge

### Pourquoi c'est important
Sans cette étape, aucune des phases suivantes ne peut démarrer. Vite remplace Create React App pour des temps de rechargement bien plus courts.

---

## ÉTAPE 1.2 — Installation des Dépendances

### Rôle
Intégrer tous les packages nécessaires au projet dans `package.json`.

### Objectif
- **UI** : Material UI (composants, icônes, date pickers) + React Router
- **Backend** : Firebase (auth + base de données)
- **Formulaires** : Formik + Yup (saisie et validation)
- **PDF** : jsPDF + jspdf-autotable (génération des factures)
- **Graphiques** : Recharts (dashboard)
- **Utilitaires** : date-fns (manipulation des dates)

### Ce qui a été appliqué
- Tous les packages installés selon la stack du `PROJECT_CONTEXT.md`
- `package.json` à jour
- Le projet démarre sans erreur après installation

### Pourquoi c'est important
Chaque dépendance correspond à une fonctionnalité future : pas de factures sans jsPDF, pas de dashboard sans Recharts, etc.

---

## ÉTAPE 1.3 — Configuration Firebase

### Rôle
Connecter l'application à Firebase (Auth + Realtime Database).

### Objectif
- Stocker les utilisateurs, clients et factures dans le cloud
- Préparer l'authentification (Phase 2)
- Protéger les clés API via `.env` (jamais dans Git)

### Ce qui a été appliqué
- Projet Firebase créé sur la console Google
- Authentication (Email/Password) et Realtime Database activés
- Fichier `.env` créé avec les variables `VITE_FIREBASE_*`
- `src/services/firebase.js` initialise l'app avec `import.meta.env`
- `.env` ajouté à `.gitignore`

### Pourquoi c'est important
Firebase est le backend principal pour les données métier. Sans cette configuration, impossible d'enregistrer clients et factures.

---

## ÉTAPE 1.4 — Configuration JSON Server

### Rôle
Mettre en place une API REST locale pour les articles et catégories.

### Objectif
- Servir le catalogue d'articles et de catégories
- Simuler un backend de paramètres (sans backend réel)
- Exposer des endpoints REST (`/articles`, `/categories`)

### Ce qui a été appliqué
- JSON Server installé
- `db.json` créé avec des articles et catégories de test
- Script `npm run json-server` ajouté (port 3001)
- API accessible sur `http://localhost:3001/articles` et `/categories`

### Pourquoi c'est important
Les factures sont composées d'articles. JSON Server fournit ce catalogue localement, distinct de Firebase qui gère les données métier.

---

## ÉTAPE 1.5 — Structure des Dossiers

### Rôle
Créer l'arborescence complète définie dans `PROJECT_CONTEXT.md`.

### Objectif
- Séparer les responsabilités (components, pages, services, etc.)
- Préparer les emplacements pour les phases suivantes
- Rendre le projet maintenable et lisible

### Ce qui a été appliqué
- Dossiers créés : `components/`, `pages/`, `services/`, `contexts/`, `utils/`, `routes/`, `hooks/`, `theme/`
- Sous-dossiers : `common/`, `clients/`, `factures/`, `dashboard/`, `layout/` dans components ; `auth/`, `user/`, `admin/` dans pages
- Fichiers vides créés avec commentaires pour les implémentations futures

### Pourquoi c'est important
Une structure claire évite le chaos quand le projet grandit. Chaque fichier a sa place : pas de logique Firebase dans les composants, tout passe par `firebaseService.js`.

---

## ÉTAPE 1.6 — Thème MUI (basé sur UI_Model.png)

### Rôle
Configurer le thème Material UI en s'inspirant du design de référence.

### Objectif
- Définir palette, typographie et espacements une seule fois
- Appliquer le style visuel du `docs/design/UI_Model.png`
- Activer `CssBaseline` pour un reset CSS cohérent

### Ce qui a été appliqué
- `src/theme/theme.js` créé avec les couleurs du modèle (sidebar sombre, fond clair, primaire/secondaire)
- `App.jsx` enveloppé avec `<ThemeProvider>` et `<CssBaseline />`
- Couleurs centralisées : pas de style inline dispersé

### Pourquoi c'est important
Le thème garantit une identité visuelle cohérente sur toute l'application. Tous les composants MUI héritent automatiquement des couleurs et styles définis.

---

## Checklist de validation Phase 1

| Critère | Statut |
|---------|--------|
| Projet Vite React fonctionnel | ✅ |
| Dépendances installées | ✅ |
| Firebase configuré avec .env | ✅ |
| JSON Server sur port 3001 | ✅ |
| Structure des dossiers créée | ✅ |
| Thème MUI configuré | ✅ |
| Aucune erreur console | ✅ |

---

## Prochaine étape

**Phase 2** — Authentification Firebase & Protection des Routes (`phases/PHASE_2_AUTH.md`)

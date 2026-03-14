# 📦 PHASE 1 — Initialisation & Configuration du Projet

> **Durée estimée** : 2 jours | **Semaine** : 1
> **Prérequis** : Node.js installé, compte Firebase créé, VS Code + Cursor

---

## 🎯 Objectif de la Phase

Poser les **fondations solides** du projet :
- Créer la structure React avec Vite
- Installer et configurer toutes les dépendances
- Configurer Firebase (Auth + Realtime Database)
- Mettre en place JSON Server pour les paramètres
- Appliquer la structure de dossiers définie dans PROJECT_CONTEXT.md

---

## 📋 Étapes

---

### ÉTAPE 1.1 — Création du projet React avec Vite

**Objectif** : Initialiser le projet React avec Vite (plus rapide que CRA)

**Définition** :
> Vite est un outil de build moderne qui démarre un serveur de développement ultra-rapide grâce au module bundling natif ES Modules.

**Questions de compréhension à poser à l'étudiant** :
1. Quelle est la différence entre `create-react-app` et Vite ?
2. Pourquoi utilise-t-on `npm` et non `yarn` ici ?
3. Qu'est-ce qu'un bundler et à quoi sert-il ?

**Tâches** :
- [ ] Créer le projet : `npm create vite@latest gestion-factures -- --template react`
- [ ] Naviguer dans le dossier : `cd gestion-factures`
- [ ] Installer les dépendances de base : `npm install`
- [ ] Tester que ça fonctionne : `npm run dev` → voir la page Vite par défaut
- [ ] Supprimer le contenu par défaut (App.css, assets/react.svg, contenu d'App.jsx)

**Critères de validation** :
- Le serveur Vite démarre sans erreur sur `http://localhost:5173`
- La page affiche un composant React vide (pas de contenu Vite par défaut)

---

### ÉTAPE 1.2 — Installation des Dépendances

**Objectif** : Installer tous les packages nécessaires au projet

**Définition** :
> Un package.json est le "carnet de recettes" du projet : il liste tous les ingrédients (dépendances) nécessaires pour que l'application fonctionne.

**Questions de compréhension** :
1. Quelle est la différence entre une `dependency` et une `devDependency` ?
2. Pourquoi `firebase` est une dependency et non une devDependency ?
3. À quoi sert le `^` devant les numéros de version ?

**Tâches** :

```bash
# UI & Navigation
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @mui/x-date-pickers
npm install react-router-dom

# Firebase
npm install firebase

# Formulaires & Validation
npm install formik yup

# PDF
npm install jspdf jspdf-autotable

# Graphiques
npm install recharts

# Utilitaires
npm install date-fns
```

- [ ] Vérifier que tous les packages sont dans `package.json`
- [ ] Relancer `npm run dev` — aucune erreur ne doit apparaître

**Critères de validation** :
- `package.json` contient toutes les dépendances listées
- Le projet démarre toujours sans erreur

---

### ÉTAPE 1.3 — Configuration Firebase

**Objectif** : Connecter le projet à Firebase

**Définition** :
> Firebase est une plateforme de Google qui fournit des services cloud (base de données, authentification, hébergement) sans avoir à gérer un serveur backend.

**Questions de compréhension** :
1. Quelle est la différence entre Firebase Authentication et Firebase Realtime Database ?
2. Pourquoi ne faut-il jamais commiter les clés Firebase dans Git ?
3. Qu'est-ce qu'un fichier `.env` et comment React l'utilise ?

**Tâches** :
- [ ] Aller sur [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Créer un nouveau projet Firebase nommé `gestion-factures`
- [ ] Activer **Authentication** → méthode Email/Password
- [ ] Activer **Realtime Database** → démarrer en mode test (pour l'instant)
- [ ] Aller dans Paramètres du projet → Ajouter une app Web
- [ ] Copier la configuration Firebase
- [ ] Créer le fichier `.env` à la racine :

```env
VITE_FIREBASE_API_KEY=ta_clé_ici
VITE_FIREBASE_AUTH_DOMAIN=ton_projet.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ton_projet-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=ton_projet_id
VITE_FIREBASE_STORAGE_BUCKET=ton_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ton_sender_id
VITE_FIREBASE_APP_ID=ton_app_id
```

- [ ] Créer `src/services/firebase.js` :

```javascript
// Hint : importe initializeApp, getAuth, getDatabase depuis firebase
// Utilise import.meta.env.VITE_* pour lire les variables d'environnement
// N'oublie pas d'exporter auth et database
```

- [ ] Ajouter `.env` dans `.gitignore`

**Critères de validation** :
- `firebase.js` importe et initialise Firebase sans erreur console
- Les clés ne sont PAS visibles dans le code source (uniquement dans `.env`)
- `.gitignore` contient `.env`

---

### ÉTAPE 1.4 — Configuration JSON Server

**Objectif** : Créer la "mini-API" pour les articles et catégories

**Définition** :
> JSON Server transforme un simple fichier JSON en une API REST complète (GET, POST, PUT, DELETE) en une seule commande. C'est parfait pour simuler un backend de paramètres.

**Questions de compréhension** :
1. Pourquoi les articles sont-ils sur JSON Server et non sur Firebase ?
2. Qu'est-ce qu'une API REST ? Quels sont ses verbes HTTP ?
3. Sur quel port va tourner JSON Server et pourquoi choisir 3001 ?

**Tâches** :
- [ ] Installer JSON Server globalement : `npm install -g json-server`
- [ ] Créer le fichier `db.json` à la racine du projet :

```json
{
  "articles": [
    { "id": 1, "designation": "Ordinateur portable", "prix_unitaire": 8500, "categorie_id": 1 },
    { "id": 2, "designation": "Formation React", "prix_unitaire": 3000, "categorie_id": 3 },
    { "id": 3, "designation": "Maintenance annuelle", "prix_unitaire": 1200, "categorie_id": 2 }
  ],
  "categories": [
    { "id": 1, "nom": "Informatique" },
    { "id": 2, "nom": "Services" },
    { "id": 3, "nom": "Formation" }
  ]
}
```

- [ ] Ajouter le script dans `package.json` :

```json
"scripts": {
  "dev": "vite",
  "json-server": "json-server --watch db.json --port 3001"
}
```

- [ ] Lancer `npm run json-server` et tester dans le navigateur :
  - `http://localhost:3001/articles`
  - `http://localhost:3001/categories`

**Critères de validation** :
- `http://localhost:3001/articles` retourne le tableau JSON des articles
- `http://localhost:3001/categories` retourne les catégories
- Les deux serveurs (Vite + JSON Server) peuvent tourner simultanément

---

### ÉTAPE 1.5 — Structure des Dossiers

**Objectif** : Créer l'arborescence complète du projet

**Définition** :
> Une architecture modulaire sépare les responsabilités : chaque dossier a un rôle précis. Cela rend le projet maintenable à mesure qu'il grandit.

**Questions de compréhension** :
1. Pourquoi séparer `pages/` et `components/` ?
2. Quel est le rôle du dossier `services/` ? Pourquoi ne pas appeler Firebase directement dans les composants ?
3. À quoi sert le dossier `contexts/` ?

**Tâches** :
Créer la structure suivante (fichiers vides avec un commentaire `// TODO`) :

```
src/
├── components/
│   ├── common/
│   ├── clients/
│   ├── factures/
│   ├── dashboard/
│   └── layout/
├── pages/
│   ├── auth/
│   ├── user/
│   └── admin/
├── services/
│   ├── firebase.js          ✅ (créé à l'étape 1.3)
│   ├── firebaseService.js   (à créer)
│   └── jsonService.js       (à créer)
├── contexts/
│   ├── AuthContext.jsx      (à créer)
│   └── AppContext.jsx       (à créer)
├── utils/
│   ├── calculations.js      (à créer)
│   ├── pdfGenerator.js      (à créer)
│   └── helpers.js           (à créer)
├── routes/
│   ├── PrivateRoute.jsx     (à créer)
│   └── AdminRoute.jsx       (à créer)
├── hooks/
│   ├── useClients.js        (à créer)
│   ├── useInvoices.js       (à créer)
│   └── useArticles.js       (à créer)
└── theme/
    └── theme.js             (à créer)
```

- [ ] Créer tous les dossiers
- [ ] Créer les fichiers vides avec un commentaire `// Phase X - À implémenter`

**Critères de validation** :
- L'arborescence correspond exactement à celle du `PROJECT_CONTEXT.md`
- Le projet compile toujours sans erreur

---

### ÉTAPE 1.6 — Thème MUI (basé sur UI_Model.png)

**Objectif** : Configurer le thème Material UI en s'inspirant du modèle UI

**Définition** :
> Un thème MUI est une configuration centralisée des couleurs, typographies et espacements. En définissant le thème une seule fois, tous les composants MUI héritent automatiquement du style.

**Questions de compréhension** :
1. Pourquoi centraliser les couleurs dans un thème plutôt que les mettre inline ?
2. Quelles couleurs observes-tu dans `UI_Model.png` ? Primaire, secondaire, fond ?
3. Comment `ThemeProvider` propage-t-il le thème à tous les composants enfants ?

**Tâches** :
- [ ] Observer attentivement `UI_Model.png` et noter :
  - Couleur de la sidebar
  - Couleur des boutons principaux
  - Couleur de fond de la page
  - Police utilisée
- [ ] Créer `src/theme/theme.js` avec ces couleurs
- [ ] Envelopper `App.jsx` avec `<ThemeProvider theme={theme}><CssBaseline />`

**Critères de validation** :
- Le thème est appliqué sans erreur
- Les couleurs correspondent à `UI_Model.png`
- `CssBaseline` est inclus (reset CSS)

---

## ✅ Checklist de Fin de Phase 1

- [ ] Projet Vite React créé et fonctionnel
- [ ] Toutes les dépendances installées
- [ ] Firebase configuré avec `.env`
- [ ] JSON Server opérationnel sur le port 3001
- [ ] Structure des dossiers créée
- [ ] Thème MUI configuré
- [ ] Aucune erreur dans la console

## 🔜 Prochaine Phase
`phases/PHASE_2_AUTH.md` — Authentification Firebase & Protection des Routes

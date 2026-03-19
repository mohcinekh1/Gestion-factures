# 📄 Gestion des Factures

Application web de gestion de factures avec authentification, création de factures, génération PDF et tableau de bord administrateur.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12-ffca28?logo=firebase)
![Material UI](https://img.shields.io/badge/MUI-7-007fff?logo=mui)

---

## ✨ Fonctionnalités

### Utilisateur (Comptable / Agent)
- **Authentification** : Connexion et inscription sécurisées
- **Clients** : CRUD complet (ajout, modification, suppression)
- **Factures** : Création avec articles, calcul automatique HT/TVA/TTC
- **4 méthodes de facturation** : Simple HT+TVA, remise par ligne, remise globale, TVA par catégorie
- **PDF** : Génération et téléchargement de factures
- **Suivi** : Statuts (En attente, Payée, Rejetée) et suivi paiements
- **Dashboard** : KPIs personnels et dernières factures

### Administrateur
- Toutes les fonctionnalités utilisateur, plus :
- **Articles & Catégories** : Gestion du catalogue (JSON Server)
- **Validation des factures** : Valider ou rejeter les factures en attente
- **Dashboard admin** : Statistiques globales (total factures, encaissé, clients, etc.)

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| React 19 + Vite | Frontend |
| Material UI v7 | Interface utilisateur |
| React Router v7 | Routing |
| Firebase (Auth + Realtime DB) | Authentification et données (clients, factures) |
| JSON Server | Articles et catégories |
| Formik + Yup | Formulaires et validation |
| jsPDF + jspdf-autotable | Génération PDF |

---

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Firebase
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/mohcinekh1/Gestion-factures.git
cd Gestion-factures/gestion-factures
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer Firebase
Créer un fichier `.env` à la racine de `gestion-factures/` :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Important** : Ne jamais commiter le fichier `.env`. Les clés Firebase sont sensibles.

### 4. Démarrer JSON Server (articles & catégories)
Dans un premier terminal :
```bash
npm run json-server
```
Le serveur tourne sur `http://localhost:3001`.

### 5. Démarrer l'application
Dans un second terminal :
```bash
npm run dev
```
L'application est accessible sur `http://localhost:5173`.

---

## 📁 Structure du projet

```
gestion-factures/
├── src/
│   ├── components/     # Composants réutilisables
│   │   ├── clients/    # ClientForm
│   │   ├── factures/   # ArticleRow, PaymentForm
│   │   ├── dashboard/  # KPICard
│   │   └── layout/     # Sidebar, Navbar, Layout
│   ├── pages/          # Pages de l'application
│   │   ├── auth/       # Login, Register
│   │   ├── user/       # Dashboard, Clients, Factures
│   │   └── admin/      # Dashboard Admin, Articles, Catégories, Validation
│   ├── services/       # firebaseService, jsonService
│   ├── contexts/       # AuthContext
│   ├── hooks/          # useClients, useInvoices, useArticles
│   ├── utils/          # calculations, pdfGenerator, dashboardStats
│   ├── routes/         # PrivateRoute, AdminRoute
│   └── theme/          # MUI theme
├── db.json             # Données JSON Server (articles, catégories)
└── public/
```

---

## 🚀 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build |
| `npm run json-server` | Démarre JSON Server (port 3001) |
| `npm run lint` | Vérification ESLint |

---

## 💰 Méthodes de facturation

| # | Méthode | Description |
|---|---------|-------------|
| 1 | Simple HT + TVA | `TTC = Σ(qté × prix) × 1.20` |
| 2 | Remise par ligne | Remise appliquée sur chaque ligne |
| 3 | Remise globale | Pourcentage de remise sur le total HT |
| 4 | TVA par catégorie | Taux variables (Informatique 20%, Services 10%, Formation 0%) |

---

## 👤 Comptes de test

Pour tester l'application, créer un compte via l'interface d'inscription.  
Pour un compte **admin**, modifier manuellement le rôle dans Firebase Realtime Database :  
`/users/{uid}/role` → `"admin"`.

---

## 📄 Licence

Projet éducatif — Tous droits réservés.

# 📦 PROJECT CONTEXT — Application Web de Gestion des Factures

> Ce fichier est le **point de référence central** du projet.
> Cursor doit le consulter à chaque session avant toute interaction.
> Les règles Cursor (contexte, phases, mentor) sont dans `.cursor/rules/` et s'appliquent automatiquement.

---

## 🎯 Objectif du Projet

Développer une application web de gestion de factures complète avec :
- Création et suivi de factures
- Gestion des clients et articles
- Génération de PDF professionnels
- Tableau de bord analytique
- Authentification avec rôles (Admin / User)

---

## 🛠️ Stack Technique

| Couche | Technologie | Usage |
|--------|-------------|-------|
| Frontend | React JS (Vite) | UI principale |
| UI Library | Material UI v5 | Composants & thème |
| Routing | React Router v6 | Navigation & protection routes |
| Forms | Formik + Yup | Validation formulaires |
| Auth + DB | Firebase (Auth + Realtime DB) | Authentification, clients, factures |
| Paramètres | JSON Server (port 3001) | Articles, catégories |
| PDF | jsPDF + jspdf-autotable | Génération factures PDF |
| Charts | Recharts | Graphiques dashboard |
| State | React Context API | État global (auth, données) |

---

## 👤 Profils Utilisateurs

### USER (Comptable / Agent)
- Saisir des clients
- Créer des factures avec articles
- Calculer automatiquement les totaux (HT, TVA, TTC)
- Générer et télécharger des PDF
- Suivre le statut des factures

### ADMIN
- Tout ce que fait le USER, plus :
- Gérer les articles et catégories (JSON Server)
- Valider ou rejeter les factures
- Accéder au tableau de bord global avec statistiques

---

## 🗄️ Architecture des Données

### Firebase Realtime Database
```
/users
  /{uid}
    role: "admin" | "user"
    nom: string
    email: string

/clients
  /{id}
    nom: string
    email: string
    tel: string
    adresse: string

/factures
  /{id}
    numero: string           // FAC-2025-0001
    date_creation: timestamp
    client_id: string
    articles: [
      { article_id, designation, qte, prix_unitaire, remise, total_ligne }
    ]
    methode_calcul: 1|2|3|4
    remise_globale: number
    total_ht: number
    tva: number
    total_ttc: number
    statut: "EN_ATTENTE" | "PAYEE" | "REJETEE"
    date_depot: timestamp
    date_encaissement: timestamp
    type_virement: string
    validated_by_admin: string | null
    created_by: string       // uid du créateur
```

### JSON Server (db.json)
```json
{
  "articles": [
    { "id": 1, "designation": "Ordinateur", "prix_unitaire": 5000, "categorie_id": 1 }
  ],
  "categories": [
    { "id": 1, "nom": "Informatique" }
  ]
}
```

---

## 💰 Méthodes de Facturation

| # | Nom | Logique |
|---|-----|---------|
| 1 | Simple HT + TVA | `TTC = Σ(qté × prix) × 1.20` |
| 2 | Remise par ligne | `ligne = (qté × prix) × (1 - remise%)` |
| 3 | Remise globale | `TTC = (HT - remise_globale%) + TVA` |
| 4 | TVA par catégorie | Informatique 20%, Services 10%, Formation 0% |

---

## 📁 Structure du Projet

```
docs/
└── design/
    ├── UI_Model.png        # Source de design principale (référence visuelle)
    └── README.md           # Documentation du design

src/
├── components/
│   ├── common/           # Boutons, modales, loaders réutilisables
│   ├── clients/          # ClientForm, ClientCard
│   ├── factures/         # InvoiceForm, ArticleRow, InvoiceCard
│   ├── dashboard/        # KPICard, Charts
│   └── layout/           # Sidebar, Navbar, Layout
├── pages/
│   ├── auth/             # Login.jsx, Register.jsx
│   ├── user/             # UserDashboard, Clients, Factures, InvoiceDetail
│   └── admin/            # AdminDashboard, Articles, Categories, Validation
├── services/
│   ├── firebaseService.js
│   └── jsonService.js
├── contexts/
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── utils/
│   ├── calculations.js   # Logique TVA & remises
│   ├── pdfGenerator.js   # jsPDF template
│   └── helpers.js        # Formatage dates, numéros
├── routes/
│   ├── PrivateRoute.jsx
│   └── AdminRoute.jsx
├── hooks/
│   ├── useClients.js
│   ├── useInvoices.js
│   └── useArticles.js
├── theme/
│   └── theme.js          # MUI theme basé sur UI_Model.png
└── App.jsx
```

---

## 🎨 Identité Visuelle (référence : docs/design/UI_Model.png)

> **⚠️ Source de design principale : consulter impérativement `docs/design/UI_Model.png` avant tout développement UI**

### Principes directeurs extraits du modèle UI
- Sidebar sombre (dark) avec icônes et labels
- Contenu principal sur fond clair (gris très léger `#F5F7FA`)
- Cards blanches avec ombre légère (`box-shadow`)
- Couleur primaire : bleu profond (ex. `#1E3A5F` ou similaire visible dans le modèle)
- Couleur accent : bleu clair / cyan pour les actions
- Badges colorés pour les statuts : vert (Payée), orange (En attente), rouge (Rejetée)
- Typographie : Roboto ou Inter, propre et lisible
- Boutons arrondis, style Material Design
- Tableaux avec alternance de lignes (zebra striping)

### Fichier thème à créer : `src/theme/theme.js`
```javascript
// Extraire les couleurs exactes de UI_Model.png et configurer ici
import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: {
    primary: { main: '#1E3A5F' },   // à ajuster selon UI_Model.png
    secondary: { main: '#2196F3' }, // à ajuster selon UI_Model.png
    background: { default: '#F5F7FA' },
  },
  // ...
});
```

---

## 📋 Phases du Projet

| Fichier | Phase | Semaines |
|---------|-------|----------|
| `phases/PHASE_1_SETUP.md` | Initialisation & Config | S1 |
| `phases/PHASE_2_AUTH.md` | Authentification & Routing | S1–S2 |
| `phases/PHASE_3_CRUD.md` | Clients, Articles, Catégories | S2–S4 |
| `phases/PHASE_4_INVOICING.md` | Facturation, PDF, Suivi | S4–S6 |
| `phases/PHASE_5_DASHBOARD.md` | Dashboard & Admin | S6–S7 |
| `phases/PHASE_6_DEPLOY.md` | Tests & Déploiement | S7–S8 |

---

## ✅ Règles de Développement

1. **Un composant = un seul rôle** — ne pas mélanger logique et présentation
2. **Toute donnée Firebase passe par `firebaseService.js`** — jamais d'appel direct dans les composants
3. **Toute donnée JSON Server passe par `jsonService.js`**
4. **Validation obligatoire** avec Yup sur tous les formulaires
5. **Responsive design** — tester mobile ET desktop
6. **Commit Git** après chaque étape validée
7. **Ne jamais exposer les clés Firebase** — utiliser `.env`

---

## 🚦 Statuts des Phases

| Phase | Statut |
|-------|--------|
| Phase 1 | ⬜ Non commencée |
| Phase 2 | ⬜ Non commencée |
| Phase 3 | ⬜ Non commencée |
| Phase 4 | ⬜ Non commencée |
| Phase 5 | ⬜ Non commencée |
| Phase 6 | ⬜ Non commencée |

> Mettre à jour ce tableau au fur et à mesure : ⬜ → 🟡 En cours → ✅ Terminée

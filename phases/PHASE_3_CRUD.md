# 👥 PHASE 3 — Gestion des Entités de Base (CRUD)

> **Durée estimée** : 5 jours | **Semaines** : 2–4
> **Prérequis** : Phase 2 terminée ✅ — Auth, routes et layout fonctionnels

---

## 🎯 Objectif de la Phase

Implémenter les CRUD complets pour :
- **Clients** → Firebase Realtime Database
- **Articles** → JSON Server (Admin seulement)
- **Catégories** → JSON Server (Admin seulement)

Et créer les services centralisés (`firebaseService.js` & `jsonService.js`).

---

## 📋 Étapes

---

### ÉTAPE 3.1 — firebaseService.js : Couche d'Abstraction Firebase

**Objectif** : Centraliser tous les appels Firebase dans un seul fichier

**Définition** :
> Un service est une couche d'abstraction entre les données et l'UI. Il expose des fonctions métier (`getClients`, `addClient`) et cache les détails d'implémentation Firebase. Si on change de base de données demain, on ne modifie que le service.

**Questions de compréhension** :
1. Pourquoi ne pas appeler `firebase/database` directement dans les composants React ?
2. Quelle est la différence entre `get()` (lecture unique) et `onValue()` (listener temps réel) dans Firebase ?
3. Quand utiliserait-on `push()` vs `set()` pour créer un enregistrement ?

**Tâches** :
- [ ] Créer `src/services/firebaseService.js`

Fonctions à implémenter (une par une) :

```javascript
// === CLIENTS ===
// getClients()          → retourne Promise<clients[]>
// getClientById(id)     → retourne Promise<client>
// addClient(clientData) → retourne Promise<id>
// updateClient(id, data)→ retourne Promise<void>
// deleteClient(id)      → retourne Promise<void>

// === FACTURES ===
// getFactures()                   → retourne Promise<factures[]>
// getFactureById(id)              → retourne Promise<facture>
// getFacturesByClient(clientId)   → retourne Promise<factures[]>
// addFacture(factureData)         → retourne Promise<id>
// updateFacture(id, data)         → retourne Promise<void>
// deleteFacture(id)               → retourne Promise<void>
// validateFacture(id, adminUid)   → retourne Promise<void>

// === USERS ===
// getUserRole(uid)                → retourne Promise<"admin"|"user">
// createUserProfile(uid, data)    → retourne Promise<void>
```

**Hint** :
```javascript
// Pour lire des données une seule fois :
import { getDatabase, ref, get, set, push, update, remove } from 'firebase/database';
const db = getDatabase();
const snapshot = await get(ref(db, 'clients'));
if (snapshot.exists()) {
  const data = snapshot.val();
  // data est un objet { id1: {...}, id2: {...} }
  // Pour convertir en tableau :
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
}
```

**Critères de validation** :
- Chaque fonction est testée dans la console (pas encore de UI)
- Les données apparaissent bien dans la console Firebase
- Les erreurs sont gérées avec try/catch

---

### ÉTAPE 3.2 — jsonService.js : Couche d'Abstraction JSON Server

**Objectif** : Centraliser tous les appels à JSON Server

**Définition** :
> JSON Server expose une API REST standard. `fetch()` natif suffit pour interagir avec lui. On utilise les méthodes HTTP : GET (lire), POST (créer), PUT (modifier), DELETE (supprimer).

**Questions de compréhension** :
1. Qu'est-ce qu'un endpoint REST ? Donne un exemple pour les articles.
2. Pourquoi utilise-t-on `Content-Type: application/json` dans les headers ?
3. Quelle méthode HTTP utilise-t-on pour créer un article ? Et pour le modifier partiellement ?

**Tâches** :
- [ ] Créer `src/services/jsonService.js`

```javascript
const BASE_URL = 'http://localhost:3001';

// === ARTICLES ===
// getArticles()              → GET /articles
// getArticleById(id)         → GET /articles/:id
// getArticlesByCategory(id)  → GET /articles?categorie_id=id
// addArticle(data)           → POST /articles
// updateArticle(id, data)    → PUT /articles/:id
// deleteArticle(id)          → DELETE /articles/:id

// === CATÉGORIES ===
// getCategories()            → GET /categories
// addCategory(data)          → POST /categories
// updateCategory(id, data)   → PUT /categories/:id
// deleteCategory(id)         → DELETE /categories/:id
```

- [ ] Tester chaque fonction dans la console du navigateur

**Critères de validation** :
- `getArticles()` retourne les 3 articles du `db.json`
- `addArticle()` ajoute un article et il apparaît dans `db.json`
- `deleteArticle()` supprime bien l'article

---

### ÉTAPE 3.3 — Hook useClients (Custom Hook)

**Objectif** : Créer un hook React qui gère l'état des clients

**Définition** :
> Un custom hook est une fonction JavaScript préfixée par `use` qui encapsule de la logique React réutilisable (state, effects, etc.). Il évite de dupliquer la même logique dans plusieurs composants.

**Questions de compréhension** :
1. Quelle est la différence entre un custom hook et un composant React ?
2. Pourquoi `useClients` est-il plus pratique que d'appeler `firebaseService.getClients()` directement dans chaque composant ?
3. Que contient le `loading` state et pourquoi est-il important pour l'UX ?

**Tâches** :
- [ ] Créer `src/hooks/useClients.js` :

```javascript
// Ce hook doit exposer :
// - clients : tableau des clients
// - loading : boolean
// - error : string | null
// - addClient(data) : appelle le service + met à jour le state local
// - updateClient(id, data) : idem
// - deleteClient(id) : idem
// - refreshClients() : recharge depuis Firebase
```

**Critères de validation** :
- Le hook recharge automatiquement les clients au montage du composant
- Les opérations CRUD mettent à jour le state immédiatement (sans recharger la page)

---

### ÉTAPE 3.4 — Module Clients : Liste & Formulaire

**Objectif** : Créer l'interface CRUD complète pour les clients

**Référence visuelle** : Consulter `UI_Model.png` pour le style des tableaux et formulaires

**Questions de compréhension** :
1. Dans `UI_Model.png`, comment sont présentées les listes de données ?
2. Un formulaire "Ajouter" et "Modifier" peuvent-ils partager le même composant ?
3. Pourquoi utiliser une `Dialog` MUI plutôt qu'une page séparée pour le formulaire ?

**Tâches** :

**ClientsList.jsx** (`src/pages/user/ClientsList.jsx`)
- [ ] Tableau MUI avec colonnes : Nom, Email, Téléphone, Adresse, Actions
- [ ] Bouton "Nouveau client" en haut à droite
- [ ] Boutons Edit et Delete sur chaque ligne
- [ ] Confirmation avant suppression (Dialog MUI)
- [ ] Loading skeleton pendant le chargement
- [ ] Barre de recherche (filtre par nom)

**ClientForm.jsx** (`src/components/clients/ClientForm.jsx`)
- [ ] Composant réutilisable (Ajouter ET Modifier)
- [ ] Prop `client` optionnelle (si fournie → mode édition)
- [ ] Champs : Nom*, Email*, Téléphone*, Adresse*
- [ ] Validation Yup :
  - Nom : requis, 2 caractères minimum
  - Email : requis, format valide, unique dans Firebase
  - Téléphone : requis, format numérique valide
  - Adresse : requise

```javascript
// Schéma Yup à implémenter par l'étudiant :
const clientSchema = Yup.object({
  // À compléter...
});
```

**Critères de validation** :
- Ajouter un client → apparaît dans la liste sans refresh
- Modifier un client → les nouvelles données s'affichent
- Supprimer avec confirmation → disparaît de la liste
- Erreurs de validation affichées correctement
- Design cohérent avec `UI_Model.png`

---

### ÉTAPE 3.5 — Module Articles (Admin)

**Objectif** : Interface CRUD pour les articles (accessible Admin uniquement)

**Questions de compréhension** :
1. Pourquoi les articles sont-ils dans JSON Server et non Firebase ?
2. Comment afficher la catégorie d'un article (relation `categorie_id`) dans le tableau ?
3. Que se passe-t-il si on supprime une catégorie qui a des articles associés ?

**Tâches** :

**AdminArticles.jsx** (`src/pages/admin/AdminArticles.jsx`)
- [ ] Tableau : Désignation, Prix unitaire (formaté en MAD), Catégorie, Actions
- [ ] Bouton "Nouvel article"
- [ ] Formulaire dans une Dialog :
  - Désignation (requis)
  - Prix unitaire (requis, nombre positif)
  - Catégorie (Select MUI, chargé depuis `getCategories()`)
- [ ] Filtre par catégorie (Select en haut du tableau)

**Critères de validation** :
- La catégorie s'affiche par son nom (pas son ID)
- Le filtre par catégorie fonctionne
- Les prix sont formatés (ex: `8 500,00 MAD`)

---

### ÉTAPE 3.6 — Module Catégories (Admin)

**Objectif** : Interface CRUD pour les catégories

**Questions de compréhension** :
1. Quelle règle métier faut-il respecter avant de supprimer une catégorie ?
2. Les catégories ont-elles un impact sur les calculs TVA ? (Méthode 4)

**Tâches** :

**AdminCategories.jsx** (`src/pages/admin/AdminCategories.jsx`)
- [ ] Liste des catégories avec nom + nombre d'articles associés
- [ ] CRUD complet
- [ ] Vérification avant suppression : si des articles sont liés → bloquer avec un message d'erreur
- [ ] Affichage du taux TVA associé (selon Méthode 4) :
  - Informatique → 20%
  - Services → 10%
  - Formation → 0%

**Critères de validation** :
- Impossible de supprimer une catégorie avec des articles
- Le nombre d'articles par catégorie est affiché correctement

---

### ÉTAPE 3.7 — useArticles Hook

**Objectif** : Créer un hook pour les articles (similaire à useClients)

**Tâches** :
- [ ] Créer `src/hooks/useArticles.js`
- [ ] Exposer : `articles`, `categories`, `loading`, `addArticle`, `updateArticle`, `deleteArticle`, `addCategory`, etc.

**Critères de validation** :
- Le hook est utilisé dans `AdminArticles.jsx` et `AdminCategories.jsx`
- Aucun appel direct à `jsonService` dans les composants

---

## ✅ Checklist de Fin de Phase 3

- [ ] `firebaseService.js` avec tous les CRUD clients + factures
- [ ] `jsonService.js` avec tous les CRUD articles + catégories
- [ ] `useClients` et `useArticles` hooks créés
- [ ] Page Clients : liste + formulaire + validation fonctionnels
- [ ] Page Admin Articles : CRUD complet avec filtre catégorie
- [ ] Page Admin Catégories : CRUD avec protection suppression
- [ ] Design cohérent avec `UI_Model.png`
- [ ] Aucun appel Firebase/JSON direct dans les composants

## 🔜 Prochaine Phase
`phases/PHASE_4_INVOICING.md` — Module de Facturation Complet

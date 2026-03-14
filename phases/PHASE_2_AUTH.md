# 🔐 PHASE 2 — Authentification & Routage

> **Durée estimée** : 3 jours | **Semaines** : 1–2
> **Prérequis** : Phase 1 terminée ✅ — Firebase configuré, structure dossiers en place

---

## 🎯 Objectif de la Phase

Sécuriser l'application avec :
- Une authentification Firebase complète (Login / Logout)
- Un système de rôles (admin vs user) stocké dans Firebase
- Des routes protégées qui redirigent les non-connectés
- Une navigation adaptée au rôle de l'utilisateur

---

## 📋 Étapes

---

### ÉTAPE 2.1 — AuthContext : Le Gardien Global

**Objectif** : Créer le contexte qui gère l'état d'authentification dans toute l'app

**Définitions** :
> **Context API** : Mécanisme React qui permet de partager des données entre composants sans prop-drilling (passer les props de parent en parent).
>
> **onAuthStateChanged** : Listener Firebase qui se déclenche à chaque changement d'état auth (connexion, déconnexion, rechargement de page).

**Questions de compréhension** :
1. Pourquoi utilise-t-on un Context plutôt que de passer `user` en props partout ?
2. Que se passe-t-il si on stocke `user` dans un `useState` simple dans `App.jsx` ?
3. `onAuthStateChanged` est un listener — à quoi doit-on faire attention avec les listeners dans React ?

**Tâches** :
- [ ] Créer `src/contexts/AuthContext.jsx`

Structure à implémenter (à remplir par l'étudiant) :
```javascript
// 1. Créer le contexte avec createContext()
// 2. Créer un hook useAuth() qui expose le contexte
// 3. Créer AuthProvider avec :
//    - state: currentUser, userRole, loading
//    - useEffect avec onAuthStateChanged
//    - Dans le callback : récupérer le rôle depuis Firebase /users/{uid}/role
//    - Fonctions exposées : login(), logout(), register()
// 4. Pendant loading, afficher un écran de chargement (CircularProgress MUI)
```

**Hint pour la récupération du rôle** :
```javascript
// Après que Firebase confirme l'utilisateur connecté,
// aller chercher son rôle dans la Realtime Database :
// chemin : /users/{uid}/role
// Utiliser get() de firebase/database
```

- [ ] Envelopper `App.jsx` avec `<AuthProvider>`

**Critères de validation** :
- `useAuth()` retourne `{ currentUser, userRole, loading, login, logout }`
- Le `loading` est `true` pendant la vérification initiale (évite le flash de contenu)
- Le rôle est bien récupéré depuis Firebase au login

---

### ÉTAPE 2.2 — Initialisation des Rôles dans Firebase

**Objectif** : Comprendre comment les rôles sont stockés et créés

**Définition** :
> Dans Firebase Realtime Database, la structure `/users/{uid}/role` permet de vérifier côté serveur et côté client le niveau d'accès d'un utilisateur.

**Questions de compréhension** :
1. Pourquoi stocker le rôle dans Firebase et non dans le JWT token Firebase ?
2. Qui peut modifier le rôle d'un utilisateur ? Un user normal devrait-il pouvoir changer son propre rôle ?
3. Quelle règle de sécurité Firebase faudra-t-il écrire ?

**Tâches** :
- [ ] Aller dans la console Firebase → Realtime Database
- [ ] Créer manuellement la structure pour un utilisateur admin :
```json
{
  "users": {
    "uid_de_ton_compte": {
      "role": "admin",
      "nom": "Admin Test",
      "email": "admin@test.com"
    }
  }
}
```
- [ ] Dans `AuthContext`, lors du `register()`, écrire automatiquement le rôle `"user"` pour les nouveaux inscrits

**Critères de validation** :
- Un utilisateur existant a son rôle récupéré correctement au login
- Un nouveau compte reçoit le rôle `"user"` automatiquement

---

### ÉTAPE 2.3 — Page de Login

**Objectif** : Créer la page de connexion avec validation

**Définition** :
> Formik gère l'état du formulaire (valeurs, erreurs, soumission). Yup définit les règles de validation sous forme de schéma déclaratif.

**Questions de compréhension** :
1. Quelle est la différence entre `errors` et `touched` dans Formik ?
2. Pourquoi afficher les erreurs seulement après que le champ a été "touché" ?
3. Que doit-on faire si Firebase retourne une erreur `auth/user-not-found` ?

**Tâches** :
- [ ] Créer `src/pages/auth/Login.jsx`

Structure guidée :
```javascript
// 1. Schéma Yup :
//    - email : requis, format email valide
//    - password : requis, minimum 6 caractères

// 2. Formik avec initialValues, validationSchema, onSubmit
//    - onSubmit appelle login() depuis useAuth()
//    - Gérer les erreurs Firebase (mauvais mot de passe, compte inexistant)
//    - Après succès : navigate vers /dashboard

// 3. UI (s'inspirer de UI_Model.png) :
//    - Card centrée avec logo/titre
//    - TextField MUI pour email et password
//    - Affichage conditionnel des erreurs (helperText)
//    - Button de soumission avec loading state
```

- [ ] Créer `src/pages/auth/Register.jsx` (même pattern, ajouter champ "nom")

**Critères de validation** :
- Les erreurs Yup s'affichent correctement (champ vide, email invalide...)
- Les erreurs Firebase sont affichées en français (ex: "Email ou mot de passe incorrect")
- Après login réussi, redirection vers `/dashboard`
- L'état "loading" du bouton est visible pendant la requête Firebase

---

### ÉTAPE 2.4 — Configuration React Router

**Objectif** : Mettre en place le routage complet de l'application

**Définition** :
> React Router v6 utilise un système déclaratif de routes. `<Routes>` contient les `<Route>`, et `<Navigate>` permet les redirections programmatiques.

**Questions de compréhension** :
1. Quelle est la différence entre `<Link>` et `useNavigate()` ?
2. Pourquoi utilise-t-on des routes imbriquées (`nested routes`) ?
3. Qu'est-ce que le `outlet` dans React Router v6 ?

**Tâches** :
- [ ] Configurer `App.jsx` avec toutes les routes :

```javascript
// Structure des routes à implémenter :
// /login              → Login.jsx (publique)
// /register           → Register.jsx (publique)
// /                   → PrivateRoute → Layout → UserDashboard
// /clients            → PrivateRoute → Layout → ClientsList
// /factures           → PrivateRoute → Layout → InvoicesList
// /factures/:id       → PrivateRoute → Layout → InvoiceDetail
// /admin              → AdminRoute → Layout → AdminDashboard
// /admin/articles     → AdminRoute → Layout → AdminArticles
// /admin/categories   → AdminRoute → Layout → AdminCategories
// /admin/validation   → AdminRoute → Layout → AdminValidation
// *                   → Navigate vers /
```

**Critères de validation** :
- La navigation fonctionne entre les pages existantes
- Les URLs changent correctement dans la barre du navigateur

---

### ÉTAPE 2.5 — PrivateRoute & AdminRoute

**Objectif** : Protéger les routes selon l'état d'authentification et le rôle

**Définition** :
> Un Route Guard (garde de route) vérifie une condition avant d'afficher un composant. Si la condition n'est pas remplie, il redirige vers une autre page.

**Questions de compréhension** :
1. Que doit-il se passer si un utilisateur non connecté essaie d'accéder à `/dashboard` ?
2. Que doit-il se passer si un `user` (non-admin) essaie d'accéder à `/admin` ?
3. Pourquoi doit-on gérer le cas `loading = true` dans le route guard ?

**Tâches** :
- [ ] Créer `src/routes/PrivateRoute.jsx` :

```javascript
// Logique à implémenter :
// Si loading → afficher <CircularProgress> (pas de redirect prématurée !)
// Si !currentUser → <Navigate to="/login" replace />
// Sinon → <Outlet /> (affiche la route enfant)
```

- [ ] Créer `src/routes/AdminRoute.jsx` :

```javascript
// Même logique + vérification supplémentaire :
// Si userRole !== 'admin' → <Navigate to="/" replace />
```

**Critères de validation** :
- Accéder à `/dashboard` sans être connecté redirige vers `/login`
- Après login, retour automatique vers `/dashboard`
- Un utilisateur `user` ne peut pas accéder aux routes `/admin/*`
- Aucun "flash" de contenu protégé avant la redirection

---

### ÉTAPE 2.6 — Layout Principal (Sidebar + Navbar)

**Objectif** : Créer le layout avec la sidebar adaptée au rôle, en suivant UI_Model.png

**Définition** :
> Un Layout est un composant "squelette" qui encadre toutes les pages. Il contient les éléments communs (navigation, header) et affiche le contenu des pages via `<Outlet />`.

**Questions de compréhension** :
1. Regarde `UI_Model.png` — quels éléments sont présents dans la sidebar ?
2. Comment adapter le menu de navigation selon le rôle (admin vs user) ?
3. Quelle est la différence entre un `Drawer` permanent et un `Drawer` temporaire dans MUI ?

**Tâches** :
- [ ] Créer `src/components/layout/Layout.jsx`
- [ ] Créer `src/components/layout/Sidebar.jsx`
- [ ] Créer `src/components/layout/Navbar.jsx`

Menu USER à inclure :
- 📊 Dashboard
- 👥 Clients
- 📄 Factures
- 🚪 Déconnexion

Menu ADMIN à inclure (tout le menu USER +) :
- ⚙️ Articles
- 🏷️ Catégories
- ✅ Validation factures
- 📊 Dashboard Admin

**Inspiration UI_Model.png** :
- Sidebar sombre avec icônes + texte
- Élément actif mis en évidence (couleur ou fond)
- Navbar en haut avec nom de l'utilisateur connecté + bouton logout

**Critères de validation** :
- La sidebar affiche le bon menu selon le rôle
- L'élément de navigation actif est visuellement distinct
- Le nom de l'utilisateur connecté apparaît dans la navbar
- Le logout fonctionne et redirige vers `/login`
- Le design correspond à `UI_Model.png`

---

## ✅ Checklist de Fin de Phase 2

- [ ] `AuthContext` fournit user, rôle, login, logout à toute l'app
- [ ] Page Login fonctionnelle avec validation Formik/Yup
- [ ] Page Register crée le compte ET écrit le rôle `"user"` dans Firebase
- [ ] Toutes les routes sont configurées dans `App.jsx`
- [ ] `PrivateRoute` protège les pages connectées
- [ ] `AdminRoute` protège les pages admin
- [ ] Le Layout (sidebar + navbar) est conforme à `UI_Model.png`
- [ ] Aucune route protégée n'est accessible sans authentification

## 🔜 Prochaine Phase
`phases/PHASE_3_CRUD.md` — Gestion des Clients, Articles & Catégories

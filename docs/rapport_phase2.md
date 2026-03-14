# Rapport Phase 2 — Authentification & Routage

**Projet :** Application Web de Gestion des Factures  
**Phase :** 2 — Authentification & Routage  
**Date :** Mars 2025

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Étape 2.1 — AuthContext](#2-étape-21--authcontext)
3. [Étape 2.2 — Initialisation des Rôles Firebase](#3-étape-22--initialisation-des-rôles-firebase)
4. [Étape 2.3 — Pages Login & Register](#4-étape-23--pages-login--register)
5. [Étape 2.4 — Configuration React Router](#5-étape-24--configuration-react-router)
6. [Étape 2.5 — PrivateRoute & AdminRoute](#6-étape-25--privateroute--adminroute)
7. [Étape 2.6 — Layout (Sidebar + Navbar)](#7-étape-26--layout-sidebar--navbar)
8. [Récapitulatif des fichiers créés](#8-récapitulatif-des-fichiers-créés)

---

## 1. Vue d'ensemble

### Objectif de la Phase 2

Sécuriser l'application avec :
- Une authentification Firebase complète (Login / Logout / Register)
- Un système de rôles (admin vs user) stocké dans Firebase
- Des routes protégées qui redirigent les non-connectés
- Une navigation adaptée au rôle de l'utilisateur

### Stack utilisée

| Technologie | Usage |
|-------------|-------|
| Firebase Auth | Authentification (email/password) |
| Firebase Realtime Database | Stockage des rôles utilisateur |
| React Context API | État global d'authentification |
| React Router v6 | Routage et protection des routes |
| Formik + Yup | Formulaires et validation |
| Material UI | Composants UI |

---

## 2. Étape 2.1 — AuthContext

### Partie théorique

**Context API React** : Mécanisme qui permet de partager des données entre composants sans "prop-drilling" (passer les props de parent en parent). Un Context crée un "tunnel" de données accessible par tous les composants enfants.

**onAuthStateChanged** : Listener Firebase qui se déclenche à chaque changement d'état d'authentification (connexion, déconnexion, rechargement). Il retourne une fonction `unsubscribe` qu'il faut appeler au démontage du composant pour éviter les memory leaks.

**Pourquoi un Context ?** : L'état `currentUser` doit être accessible partout (Login, Layout, PrivateRoute, etc.). Sans Context, il faudrait passer `user` en props à travers toute l'arborescence de composants.

### Partie pratique

**Fichier créé :** `src/contexts/AuthContext.jsx`

**Structure implémentée :**

1. **createContext(null)** : Création du contexte avec valeur initiale `null`
2. **useAuth()** : Hook personnalisé qui expose le contexte et lance une erreur si utilisé hors AuthProvider
3. **AuthProvider** avec :
   - `currentUser` : objet utilisateur Firebase ou `null`
   - `userRole` : `"admin"` | `"user"` | `null`
   - `loading` : `true` pendant la vérification initiale
   - `login(email, password)` : utilise `signInWithEmailAndPassword`
   - `logout()` : utilise `signOut`
   - `register(email, password, nom)` : crée le compte et le profil Firebase
4. **useEffect** avec `onAuthStateChanged` : récupère le rôle depuis `/users/{uid}/role` via `get()`
5. **Écran de chargement** : `CircularProgress` affiché tant que `loading` est true
6. **Nettoyage** : `return () => unsubscribe()` dans le useEffect

---

## 3. Étape 2.2 — Initialisation des Rôles Firebase

### Partie théorique

**Pourquoi stocker le rôle dans Firebase ?** : Le JWT Firebase ne contient que l'identité (uid, email). Les rôles métier (admin/user) doivent être stockés séparément pour pouvoir être modifiés sans recréer le compte.

**Structure Realtime Database :**
```
/users
  /{uid}
    role: "admin" | "user"
    nom: string
    email: string
```

### Partie pratique

**Actions réalisées :**

1. **Création manuelle dans Firebase Console** : Un utilisateur admin a été créé avec `role: "admin"` dans Realtime Database
2. **Dans AuthContext.register()** : Après `createUserWithEmailAndPassword`, écriture automatique dans Firebase :
   ```javascript
   await set(ref(database, `users/${uid}`), {
     role: 'user',
     nom,
     email,
   });
   ```
3. **Récupération au login** : Dans le callback `onAuthStateChanged`, lecture de `/users/{uid}/role` via `get(roleRef)`. Si absent, défaut à `'user'`

---

## 4. Étape 2.3 — Pages Login & Register

### Partie théorique

**Formik** : Gère l'état du formulaire (valeurs, erreurs, touched, soumission). Évite le boilerplate de useState pour chaque champ.

**Yup** : Définit un schéma de validation déclaratif. S'intègre avec Formik via `validationSchema`. Les erreurs sont automatiquement mappées aux champs.

**errors vs touched** : `errors` contient les messages d'erreur. `touched` indique si l'utilisateur a interagi avec le champ. On affiche les erreurs seulement quand `touched.email && errors.email` pour une meilleure UX (pas d'erreur avant que l'utilisateur ait tapé).

### Partie pratique

**Fichiers créés :**
- `src/pages/auth/Login.jsx`
- `src/pages/auth/Register.jsx`
- `src/components/common/AuthLayout.jsx` (refactoring : fond commun réutilisable)

**Login.jsx :**
- Schéma Yup : email requis + format valide, password requis + min 6 caractères
- Formik avec `onSubmit` → `login()` depuis useAuth
- Gestion des erreurs Firebase en français : `auth/invalid-credential` → "Email ou mot de passe incorrect"
- Redirection vers `/dashboard` après succès
- UI : Card centrée, TextField MUI, bouton avec état loading
- AuthLayout (BeamsBackground) pour le fond animé

**Register.jsx :**
- Schéma Yup : nom (min 2), email, password, confirmPassword (oneOf avec password)
- `register(email, password, nom)` crée le compte et le profil avec rôle "user"
- Même style visuel que Login via AuthLayout

---

## 5. Étape 2.4 — Configuration React Router

### Partie théorique

**React Router v6** : Système déclaratif. `<Routes>` contient des `<Route>`. Chaque Route associe un `path` à un `element` (composant).

**Routes imbriquées (nested routes)** : Une Route peut avoir des enfants. Le parent affiche `<Outlet />` à l'endroit où le contenu enfant doit s'afficher. Permet d'avoir un Layout commun avec un contenu qui change.

**Outlet** : Composant de React Router qui représente l'emplacement où les routes enfants sont rendues. C'est le "trou" dans le Layout.

**Navigate** : Redirige vers une URL. `replace` évite d'ajouter une entrée dans l'historique.

### Partie pratique

**Fichier modifié :** `src/App.jsx`

**Structure des routes implémentée :**

| URL | Composant | Protection |
|-----|-----------|------------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Navigate → /dashboard | PrivateRoute |
| `/dashboard` | UserDashboard | PrivateRoute + Layout |
| `/clients` | ClientsList | PrivateRoute + Layout |
| `/factures` | InvoicesList | PrivateRoute + Layout |
| `/factures/:id` | InvoiceDetail | PrivateRoute + Layout |
| `/admin` | AdminDashboard | AdminRoute + Layout |
| `/admin/articles` | AdminArticles | AdminRoute + Layout |
| `/admin/categories` | AdminCategories | AdminRoute + Layout |
| `/admin/validation` | AdminValidation | AdminRoute + Layout |
| `*` | Navigate → / | Fallback |

**Pages placeholder créées :** ClientsList, InvoicesList, InvoiceDetail, AdminDashboard, AdminArticles, AdminCategories, AdminValidation — contenu minimal "Page à implémenter (Phase X)".

---

## 6. Étape 2.5 — PrivateRoute & AdminRoute

### Partie théorique

**Route Guard (Garde de route)** : Composant qui vérifie une condition avant d'afficher le contenu. Si la condition n'est pas remplie, il redirige. Évite d'afficher du contenu protégé à un utilisateur non autorisé.

**Pourquoi gérer loading ?** : Si on redirige vers /login pendant que Firebase vérifie encore l'auth, on pourrait rediriger un utilisateur connecté par erreur (race condition). Il faut attendre que `loading` soit false avant toute redirection.

### Partie pratique

**PrivateRoute.jsx** (pour utilisateurs connectés) :
1. Si `loading` → afficher `CircularProgress` (centré, plein écran)
2. Si `!currentUser` → `<Navigate to="/login" replace />`
3. Sinon → `<Outlet />` (afficher les routes enfants)

**AdminRoute.jsx** (pour admin uniquement) :
1. Même logique que PrivateRoute pour loading et currentUser
2. Si `userRole !== 'admin'` → `<Navigate to="/" replace />` (accès refusé)
3. Sinon → `<Outlet />`

---

## 7. Étape 2.6 — Layout (Sidebar + Navbar)

### Partie théorique

**Layout** : Composant "squelette" qui encadre le contenu. Il contient les éléments communs (navigation, header) et affiche le contenu variable via `<Outlet />`. Toutes les pages protégées partagent ce même cadre.

**Drawer MUI permanent** : La sidebar reste visible sur desktop. `variant="permanent"` vs `temporary` (qui se cache sur mobile).

**NavLink** : Composant React Router qui agit comme un `<Link>` mais ajoute automatiquement la classe `active` quand l'URL correspond. Permet de styliser l'élément de menu actif.

### Partie pratique

**Layout.jsx** :
- Structure flex : Sidebar à gauche (260px), zone principale à droite
- Navbar en haut (AppBar fixe)
- Zone de contenu avec `mt: '64px'` pour compenser la hauteur de l'AppBar
- `<Outlet />` pour afficher la page courante

**Sidebar.jsx** :
- Drawer permanent, fond `#1E3A5F`
- Menu USER : Dashboard, Clients, Factures
- Menu ADMIN (conditionnel si `userRole === 'admin'`) : Dashboard Admin, Articles, Catégories, Validation factures
- Bouton Déconnexion en bas
- NavLink avec classe `active` pour l'élément actif (couleur bleue)
- Icônes MUI pour chaque élément

**Navbar.jsx** :
- AppBar fixe, fond blanc
- Affichage de l'email de l'utilisateur connecté
- Bouton Déconnexion
- Positionné à droite de la Sidebar (`ml: DRAWER_WIDTH`)

---

## 8. Récapitulatif des fichiers créés

### Contexte
| Fichier | Rôle |
|---------|------|
| `contexts/AuthContext.jsx` | État global auth, login, logout, register, rôles |

### Routes
| Fichier | Rôle |
|---------|------|
| `routes/PrivateRoute.jsx` | Protection routes connectées |
| `routes/AdminRoute.jsx` | Protection routes admin |

### Pages Auth
| Fichier | Rôle |
|---------|------|
| `pages/auth/Login.jsx` | Page de connexion |
| `pages/auth/Register.jsx` | Page d'inscription |

### Layout
| Fichier | Rôle |
|---------|------|
| `components/layout/Layout.jsx` | Structure Sidebar + Navbar + contenu |
| `components/layout/Sidebar.jsx` | Menu de navigation |
| `components/layout/Navbar.jsx` | Barre supérieure avec email et logout |

### Composants communs
| Fichier | Rôle |
|---------|------|
| `components/common/AuthLayout.jsx` | Layout commun Login/Register (fond BeamsBackground) |

### Pages placeholder (user)
| Fichier | Rôle |
|---------|------|
| `pages/user/UserDashboard.jsx` | Tableau de bord utilisateur |
| `pages/user/ClientsList.jsx` | Liste clients (Phase 3) |
| `pages/user/InvoicesList.jsx` | Liste factures (Phase 4) |
| `pages/user/InvoiceDetail.jsx` | Détail facture (Phase 4) |

### Pages placeholder (admin)
| Fichier | Rôle |
|---------|------|
| `pages/admin/AdminDashboard.jsx` | Dashboard admin (Phase 5) |
| `pages/admin/AdminArticles.jsx` | CRUD articles (Phase 3) |
| `pages/admin/AdminCategories.jsx` | CRUD catégories (Phase 3) |
| `pages/admin/AdminValidation.jsx` | Validation factures (Phase 5) |

### Fichier modifié
| Fichier | Modification |
|---------|--------------|
| `App.jsx` | Toutes les routes, imports, structure imbriquée |

---

## Validation de la Phase 2

- [x] AuthContext fournit user, rôle, login, logout, register
- [x] Page Login fonctionnelle avec validation Formik/Yup
- [x] Page Register crée le compte ET écrit le rôle "user" dans Firebase
- [x] Toutes les routes configurées dans App.jsx
- [x] PrivateRoute protège les pages connectées
- [x] AdminRoute protège les pages admin
- [x] Layout (sidebar + navbar) conforme au design
- [x] Aucune route protégée accessible sans authentification

**Phase 2 terminée.** Prochaine étape : Phase 3 — Gestion des Clients, Articles & Catégories.

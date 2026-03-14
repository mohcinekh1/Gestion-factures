# Rapport Phase 2 — Authentification & Routage

> **Phase** : 2/6 — Auth  
> **Objectif global** : Sécuriser l'application avec authentification Firebase, rôles, routes protégées et navigation adaptée

---

## Vue d'ensemble

La Phase 2 pose les fondations de la sécurité et de la navigation de l'application. Elle met en place :

- **AuthContext** : le gardien global qui gère l'état d'authentification
- **Pages Login et Register** : formulaires avec validation Formik/Yup
- **Routes protégées** : PrivateRoute (utilisateur connecté) et AdminRoute (rôle admin)
- **Layout** : sidebar + navbar avec menu adapté au rôle

Tout utilisateur non connecté est redirigé vers `/login`. Les admins ont accès à une section supplémentaire dans le menu.

---

## Table des matières

1. [Fichiers créés ou modifiés](#1-fichiers-créés-ou-modifiés)
2. [ÉTAPE 2.1 — AuthContext](#2-étape-21--authcontext)
3. [ÉTAPE 2.2 — Initialisation des rôles dans Firebase](#3-étape-22--initialisation-des-rôles-dans-firebase)
4. [ÉTAPE 2.3 — Pages Login et Register](#4-étape-23--pages-login-et-register)
5. [ÉTAPE 2.4 — Configuration React Router](#5-étape-24--configuration-react-router)
6. [ÉTAPE 2.5 — PrivateRoute et AdminRoute](#6-étape-25--privateroute-et-adminroute)
7. [ÉTAPE 2.6 — Layout (Sidebar + Navbar)](#7-étape-26--layout-sidebar--navbar)
8. [Flux complet d'authentification](#8-flux-complet-dauthentification)
9. [Checklist de validation](#9-checklist-de-validation)

---

## 1. Fichiers créés ou modifiés

| Fichier | Rôle |
|---------|------|
| `src/contexts/AuthContext.jsx` | Contexte global d'authentification (login, logout, register, user, role) |
| `src/pages/auth/Login.jsx` | Page de connexion avec formulaire Formik/Yup |
| `src/pages/auth/Register.jsx` | Page d'inscription |
| `src/routes/PrivateRoute.jsx` | Garde de route : exige un utilisateur connecté |
| `src/routes/AdminRoute.jsx` | Garde de route : exige le rôle admin |
| `src/components/layout/Layout.jsx` | Squelette : Sidebar + Navbar + zone de contenu |
| `src/components/layout/Sidebar.jsx` | Menu latéral avec liens selon le rôle |
| `src/components/layout/Navbar.jsx` | Barre supérieure (email + déconnexion) |
| `src/components/common/BeamsBackground.jsx` | Fond animé pour Login/Register |
| `src/components/common/AuthLayout.jsx` | Layout réutilisable pour les pages auth |
| `src/App.jsx` | Configuration des routes et des providers |

**Réutilisés depuis Phase 1** : `firebase.js`, `theme.js`, `CssBaseline`.

### Composant BeamsBackground (détail)

`BeamsBackground` fournit le fond animé des pages Login et Register :

| Élément | Description |
|---------|-------------|
| **Canvas** | Faisceaux lumineux animés (gradient, mouvement vertical) |
| **Motion (Framer Motion)** | Overlay avec animation d'opacité en boucle |
| **Props** | `intensity` : "subtle" \| "medium" \| "strong" ; `children` : contenu centré |
| **Responsive** | `window.addEventListener('resize')` pour adapter le canvas |

`AuthLayout` encapsule `BeamsBackground` pour les pages auth ; dans ce projet, Login et Register utilisent directement `BeamsBackground` pour garder la flexibilité du layout split-screen.

---

## 2. ÉTAPE 2.1 — AuthContext

### Rôle

Fournir à toute l'application l'état d'authentification et les actions (login, logout, register) sans prop-drilling.

### Objectif

- Centraliser l'état : `currentUser`, `userRole`, `loading`
- Écouter Firebase Auth via `onAuthStateChanged`
- Récupérer le rôle depuis Firebase Realtime DB (`/users/{uid}/role`)
- Exposer `login()`, `logout()`, `register()` à tous les composants enfants

### Ce qui a été appliqué

Création de `src/contexts/AuthContext.jsx` avec :

1. **createContext(null)** — création du contexte
2. **useAuth()** — hook pour consommer le contexte (lève une erreur si utilisé hors Provider)
3. **AuthProvider** — composant wrapper qui :
   - gère `currentUser`, `userRole`, `loading` via `useState`
   - utilise `useEffect` + `onAuthStateChanged` pour synchroniser avec Firebase
   - lit le rôle dans `/users/{uid}/role` quand un utilisateur est connecté
   - définit `register()` qui crée le compte Auth **et** écrit `{ role: 'user', nom, email }` dans Realtime DB
4. **Rendu conditionnel** : pendant `loading`, affiche un `CircularProgress` centré ; sinon fournit le contexte

### Explication détaillée du code

#### Partie 1 : Imports

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../services/firebase';
```

- **createContext** : crée un objet contexte.
- **useContext** : permet d'accéder à la valeur du Provider.
- **useState, useEffect** : état et effet de synchronisation.
- **onAuthStateChanged** : listener Firebase qui se déclenche à chaque connexion/déconnexion/rechargement.
- **signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword** : actions d'authentification.
- **ref, get, set** : lecture/écriture dans la Realtime Database.

#### Partie 2 : Listener Firebase

```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);
    if (user) {
      try {
        const roleRef = ref(database, `users/${user.uid}/role`);
        const snapshot = await get(roleRef);
        setUserRole(snapshot.exists() ? snapshot.val() : 'user');
      } catch (err) {
        setUserRole('user');  // fallback en cas d'erreur
      }
    } else {
      setUserRole(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();  // nettoyage au démontage
}, []);
```

- Au montage : Firebase vérifie si une session existe.
- Si `user` existe : on lit le rôle dans `users/{uid}/role`, sinon on met `'user'`.
- Si `user` est `null` : on met `userRole` à `null`.
- `return () => unsubscribe()` : important pour éviter les fuites mémoire et les effets de bord.

#### Partie 3 : register()

```javascript
async function register(email, password, nom) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = userCredential.user;
  await set(ref(database, `users/${uid}`), {
    role: 'user',
    nom,
    email,
  });
  return userCredential;
}
```

- Création du compte dans Firebase Auth.
- Création du profil dans Realtime DB sous `users/{uid}` avec `role: 'user'`.
- Les admins sont créés manuellement dans la console Firebase.

### Pourquoi c'est important

Sans AuthContext, chaque composant devrait recevoir `user` et `login` en props, ce qui serait difficile à maintenir. Le Context centralise tout et simplifie les composants.

---

## 3. ÉTAPE 2.2 — Initialisation des rôles dans Firebase

### Rôle

Stocker les rôles dans Firebase Realtime Database pour que l'application sache qui est admin et qui est user.

### Objectif

- Créer manuellement un utilisateur admin dans la console Firebase
- Assigner automatiquement le rôle `"user"` aux nouveaux inscrits via `register()`

### Ce qui a été appliqué

1. **Structure dans Realtime Database** :

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

2. **Dans AuthContext** : la fonction `register()` écrit automatiquement `role: 'user'` pour tout nouveau compte.

### Pourquoi c'est important

Firebase Auth ne gère pas les rôles. En stockant le rôle dans Realtime DB, on peut le modifier côté serveur et le lire à chaque connexion.

---

## 4. ÉTAPE 2.3 — Pages Login et Register

### Rôle

Permettre aux utilisateurs de se connecter et de s'inscrire avec validation côté client et gestion des erreurs Firebase.

### Objectif

- Formulaires avec Formik (état) et Yup (validation)
- Affichage des erreurs Firebase en français
- Redirection vers `/dashboard` après succès
- Design moderne (split-screen, fond animé BeamsBackground)

### Ce qui a été appliqué

#### Login.jsx

| Élément | Description |
|---------|-------------|
| **validationSchema** | Email requis et valide, mot de passe min 6 caractères |
| **useFormik** | `initialValues`, `validationSchema`, `onSubmit` qui appelle `login()` |
| **Erreurs Firebase** | Mapping des codes `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential` → "Email ou mot de passe incorrect" |
| **Navigate** | Si `currentUser` existe, redirection immédiate vers `/dashboard` |
| **BeamsBackground** | Fond animé avec faisceaux lumineux |
| **Split-screen** | Panneau gauche (branding), panneau droit (formulaire) |
| **Toggle mot de passe** | Icône œil pour afficher/masquer le mot de passe |
| **formik.isSubmitting** | Bouton désactivé pendant la requête, texte "Connexion..." |

#### Register.jsx

| Élément | Description |
|---------|-------------|
| **validationSchema** | Nom min 2 caractères, email valide, mot de passe min 6, confirmation égale au mot de passe |
| **Champ nom** | En plus de email et password |
| **Erreurs Firebase** | `auth/email-already-in-use`, `auth/weak-password` traduites en français |
| **register()** | Appel avec `(email, password, nom)` pour créer le profil en base |

### Explication des concepts

**Formik** gère :
- `values` : valeurs des champs
- `errors` : erreurs de validation (Yup)
- `touched` : champs qui ont été modifiés ou perdus le focus
- `handleChange`, `handleBlur`, `handleSubmit` : liaisons avec les champs

**Pourquoi `formik.touched.email && formik.errors.email` ?**  
On affiche l'erreur seulement si le champ a été touché, pour éviter des messages avant que l'utilisateur ait commencé à taper.

### Pourquoi c'est important

Une UX claire (erreurs lisibles, loading state) et une validation stricte évitent les comptes invalides et les erreurs côté serveur.

---

## 5. ÉTAPE 2.4 — Configuration React Router

### Rôle

Définir toutes les routes de l'application et leur protection (public / privé / admin).

### Objectif

- Routes publiques : `/login`, `/register`
- Routes privées (connecté) : `/`, `/dashboard`, `/clients`, `/factures`, `/factures/:id`
- Routes admin : `/admin`, `/admin/articles`, `/admin/categories`, `/admin/validation`
- Route fallback `*` → redirection vers `/`

### Ce qui a été appliqué

Structure dans `App.jsx` :

```javascript
<AuthProvider>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<PrivateRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/factures" element={<InvoicesList />} />
        <Route path="/factures/:id" element={<InvoiceDetail />} />
      </Route>
    </Route>

    <Route element={<AdminRoute />}>
      <Route element={<Layout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        ...
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</AuthProvider>
```

**Route imbriquée** :  
`PrivateRoute` vérifie l'auth, puis rend `<Outlet />`. L'`Outlet` est remplacé par `Layout`. `Layout` rend lui-même un `Outlet` pour le contenu de la page. Ainsi : **PrivateRoute → Layout → UserDashboard** (ou autre).

### Pourquoi c'est important

Une structure de routes claire évite les pages accessibles sans authentification et facilite l'ajout de nouvelles routes.

---

## 6. ÉTAPE 2.5 — PrivateRoute et AdminRoute

### Rôle

Bloquer l'accès aux pages protégées selon l'état d'authentification et le rôle.

### Objectif

- **PrivateRoute** : si non connecté → redirection vers `/login`
- **AdminRoute** : si non connecté → `/login` ; si connecté mais pas admin → `/`
- Pendant `loading` : afficher un spinner, pas de redirection prématurée

### Ce qui a été appliqué

#### PrivateRoute.jsx

```javascript
function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

| Condition | Action |
|-----------|--------|
| `loading` | Spinner plein écran (on attend la réponse Firebase) |
| `!currentUser` | Redirection vers `/login` avec `replace` (pas d'historique de navigation) |
| Sinon | Affiche les routes enfants via `<Outlet />` |

#### AdminRoute.jsx

Même logique que PrivateRoute, plus :

```javascript
if (userRole !== 'admin') {
  return <Navigate to="/" replace />;
}
```

Un utilisateur connecté avec le rôle `user` est redirigé vers la page d'accueil s'il tente d'accéder à `/admin/*`.

### Pourquoi c'est important

Sans gardes de route, un utilisateur pourrait accéder aux URLs protégées en tapant directement l'URL. La vérification côté client (et plus tard côté serveur) assure la sécurité.

---

## 7. ÉTAPE 2.6 — Layout (Sidebar + Navbar)

### Rôle

Fournir un squelette commun à toutes les pages protégées : menu latéral, barre supérieure, zone de contenu.

### Objectif

- Sidebar fixe à gauche avec menu selon le rôle (user vs admin)
- Navbar en haut avec email et bouton déconnexion
- Zone principale pour le contenu des pages (`Outlet`)

### Ce qui a été appliqué

#### Layout.jsx

```javascript
<Box sx={{ display: 'flex', minHeight: '100vh' }}>
  <Sidebar />
  <Box component="main" sx={{ flexGrow: 1, width: `calc(100% - ${DRAWER_WIDTH}px)`, backgroundColor: 'background.default' }}>
    <Navbar />
    <Box sx={{ p: 3, mt: '64px' }}>
      <Outlet />
    </Box>
  </Box>
</Box>
```

- `Sidebar` : drawer permanent de 260px.
- `Navbar` : position fixe, `mt: '64px'` pour éviter que le contenu passe sous la barre.
- `Outlet` : emplacement du contenu de la route (UserDashboard, ClientsList, etc.).

#### Sidebar.jsx

| Élément | Description |
|---------|-------------|
| **userMenuItems** | Dashboard, Clients, Factures (pour tous) |
| **adminMenuItems** | Dashboard Admin, Articles, Catégories, Validation (pour admin uniquement) |
| **useAuth()** | Récupère `userRole` et `logout` |
| **isAdmin** | `userRole === 'admin'` |
| **NavLink** | Lien React Router avec classe `active` sur la route courante |
| **Styles actif** | Fond bleu clair `rgba(33, 150, 243, 0.2)`, texte/icône bleus |
| **Déconnexion** | `onClick={handleLogout}`, style rouge au hover |

#### Navbar.jsx

- AppBar fixe, blanc, aligné à droite de la Sidebar.
- Affiche `currentUser?.email` et un bouton "Déconnexion".
- `handleLogout` : appelle `logout()` puis `navigate('/login')`.

### Pourquoi c'est important

Un layout commun évite de répéter la navigation sur chaque page et offre une expérience cohérente.

---

## 8. Flux complet d'authentification

### Au démarrage de l'app

```
1. App.jsx monte
2. AuthProvider se monte, loading = true
3. Spinner affiché
4. onAuthStateChanged s'exécute
5. Firebase vérifie la session
   - Si session valide → user reçu
   - AuthContext lit /users/{uid}/role
   - setCurrentUser(user), setUserRole(...), setLoading(false)
6. Routes s'affichent
7. PrivateRoute/AdminRoute vérifient currentUser et userRole
```

### Connexion (Login)

```
1. Utilisateur remplit le formulaire
2. Clic sur "SE CONNECTER"
3. formik.handleSubmit → login(email, password)
4. signInWithEmailAndPassword (Firebase)
5. onAuthStateChanged se déclenche
6. setCurrentUser(user), setUserRole(lu depuis DB)
7. navigate('/dashboard')
8. PrivateRoute voit currentUser → affiche Layout + UserDashboard
```

### Inscription (Register)

```
1. Utilisateur remplit nom, email, password, confirmation
2. Clic sur "CRÉER MON COMPTE"
3. register(email, password, nom)
4. createUserWithEmailAndPassword (Auth)
5. set(ref(database, users/{uid}), { role: 'user', nom, email })
6. onAuthStateChanged se déclenche
7. navigate('/dashboard')
```

### Déconnexion

```
1. Clic sur "Déconnexion" (Sidebar ou Navbar)
2. logout() → signOut(auth)
3. onAuthStateChanged → user = null
4. setCurrentUser(null), setUserRole(null)
5. PrivateRoute voit !currentUser → <Navigate to="/login" />
```

---

## 9. Checklist de validation

| Critère | Statut |
|---------|--------|
| AuthContext fournit currentUser, userRole, loading, login, logout, register | ✅ |
| Page Login fonctionnelle avec validation Formik/Yup | ✅ |
| Page Register crée le compte ET écrit role: 'user' dans Firebase | ✅ |
| Toutes les routes configurées dans App.jsx | ✅ |
| PrivateRoute protège les pages connectées | ✅ |
| AdminRoute protège les pages admin | ✅ |
| Layout (Sidebar + Navbar) conforme au design | ✅ |
| Menu adapté au rôle (user vs admin) | ✅ |
| Déconnexion fonctionne et redirige vers /login | ✅ |
| Aucune route protégée accessible sans authentification | ✅ |

---

## Prochaine étape

**Phase 3** — Gestion des Clients, Articles & Catégories (`phases/PHASE_3_CRUD.md`)

- Implémentation de `firebaseService.js` et `jsonService.js`
- CRUD clients (Firebase)
- CRUD articles et catégories (JSON Server)
- Hooks `useClients` et `useArticles`

---

*Rapport généré pour le projet Gestion des Factures — Phase 2 : Authentification & Routage*

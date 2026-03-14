# Rapport détaillé : AuthContext

> Documentation complète du contexte d'authentification de l'application de Gestion des Factures.

**Fichier source :** `gestion-factures/src/contexts/AuthContext.jsx`  
**Date :** Mars 2025  
**Stack :** React, Firebase Auth, Firebase Realtime Database, MUI

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Schéma architectural](#2-schéma-architectural)
3. [Schéma du flux d'authentification](#3-schéma-du-flux-dauthentification)
4. [Explication détaillée du code](#4-explication-détaillée-du-code)
5. [Structure des données Firebase](#5-structure-des-données-firebase)
6. [Utilisation dans l'application](#6-utilisation-dans-lapplication)

---

## 1. Vue d'ensemble

### Rôle du AuthContext

Le **AuthContext** est le **contexte global d'authentification** de l'application. Il centralise :

| Responsabilité | Description |
|----------------|-------------|
| **État utilisateur** | Suivi de l'utilisateur connecté (`currentUser`) |
| **Gestion des rôles** | Récupération du rôle depuis Firebase Realtime DB (`userRole`) |
| **Actions d'auth** | Connexion (`login`), déconnexion (`logout`), inscription (`register`) |
| **État de chargement** | Affichage d'un spinner pendant l'initialisation Firebase (`loading`) |
| **Distribution** | Fourniture des données à tous les composants enfants via Context API |

### Technologies impliquées

- **React Context API** : Partage d'état global
- **Firebase Auth** : Authentification (email/mot de passe)
- **Firebase Realtime Database** : Stockage des profils utilisateur et rôles
- **Material UI** : Interface de chargement (CircularProgress, Box)

---

## 2. Schéma architectural

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION REACT                                           │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                        AuthProvider (composant wrapper)                           │ │
│  │                                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ÉTATS REACT (useState)                                                      │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                        │ │ │
│  │  │  │ currentUser  │  │  userRole    │  │   loading    │                        │ │ │
│  │  │  │ (User|null)  │  │ (admin/user) │  │  (boolean)   │                        │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘                        │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                            │ │
│  │                                      ▼                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  FIREBASE AUTH (onAuthStateChanged)                                          │ │ │
│  │  │  Écoute les changements : connexion, déconnexion, refresh                     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                            │ │
│  │                                      ▼                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  FIREBASE REALTIME DB                                                        │ │ │
│  │  │  Lecture : users/{uid}/role                                                  │ │ │
│  │  │  Écriture : users/{uid} (à l'inscription)                                    │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                            │ │
│  │                                      ▼                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  VALUE = { currentUser, userRole, loading, login, logout, register }         │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                            │ │
│  │  ┌──────────────────────────────────┴──────────────────────────────────────────┐ │ │
│  │  │  AuthContext.Provider value={value}                                          │ │ │
│  │  │       └──► { children } (routes, pages, composants)                          │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Schéma des composants et exports

```
AuthContext.jsx
├── createContext(null)     → AuthContext (objet contexte)
├── useAuth()               → Hook personnalisé (EXPORT)
│   └── useContext(AuthContext)
│   └── Vérifie que le Provider est présent
└── AuthProvider({children}) → Composant wrapper (EXPORT)
    ├── États : currentUser, userRole, loading
    ├── useEffect : listener Firebase
    ├── Fonctions : login, logout, register
    ├── value : objet partagé
    └── Rendu : loading ? Spinner : Provider + children
```

---

## 3. Schéma du flux d'authentification

### Flux au démarrage de l'application

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   App       │     │    AuthProvider      │     │   Firebase Auth     │
│   démarre   │────►│    se monte          │────►│   onAuthStateChanged│
└─────────────┘     │    loading = true    │     │   s'exécute         │
                    └──────────────────────┘     └──────────┬──────────┘
                               │                            │
                               │                            │ user ?
                               ▼                            │
                    ┌──────────────────────┐                │
                    │  Spinner affiché     │◄───────────────┘
                    │  (CircularProgress)  │
                    └──────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ user = null │     │ user existe │     │  Erreur     │
   │             │     │             │     │  Firebase   │
   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
          │                   │                   │
          ▼                   ▼                   ▼
   setCurrentUser(null)  setCurrentUser(user)  setUserRole('user')
   setUserRole(null)     get(users/uid/role)   (fallback)
                        setUserRole(...)
                               │
                               ▼
                    setLoading(false)
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Provider rend       │
                    │  { children }        │
                    │  (app visible)       │
                    └──────────────────────┘
```

### Flux des actions (login, logout, register)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LOGIN                                                                       │
│  Composant ──► useAuth().login(email, pass) ──► signInWithEmailAndPassword   │
│                                                    │                         │
│                                                    ▼                         │
│  Firebase Auth notifie ──► onAuthStateChanged ──► setCurrentUser + setUserRole│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LOGOUT                                                                      │
│  Composant ──► useAuth().logout() ──► signOut(auth)                          │
│                                                    │                         │
│                                                    ▼                         │
│  Firebase Auth notifie ──► onAuthStateChanged ──► setCurrentUser(null)       │
│                                                    setUserRole(null)         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  REGISTER                                                                   │
│  Composant ──► useAuth().register(email, pass, nom)                          │
│                    │                                                         │
│                    ├──► createUserWithEmailAndPassword (Firebase Auth)       │
│                    │                                                         │
│                    └──► set(ref(database, users/{uid}), {role, nom, email})  │
│                              (Firebase Realtime DB)                          │
│                                                    │                         │
│                                                    ▼                         │
│  onAuthStateChanged détecte le nouvel user ──► setCurrentUser + setUserRole  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Explication détaillée du code

### Partie 1 : Imports

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
import { Box, CircularProgress } from '@mui/material';
```

| Import | Origine | Rôle |
|--------|---------|------|
| `createContext` | React | Crée le contexte d'authentification |
| `useContext` | React | Permet d'accéder au contexte dans un composant |
| `useState` | React | Gère les états (user, role, loading) |
| `useEffect` | React | Exécute le listener Firebase au montage |
| `onAuthStateChanged` | Firebase Auth | Écoute les changements de connexion |
| `signInWithEmailAndPassword` | Firebase Auth | Connexion email/mot de passe |
| `signOut` | Firebase Auth | Déconnexion |
| `createUserWithEmailAndPassword` | Firebase Auth | Inscription |
| `ref`, `get`, `set` | Firebase DB | Lecture/écriture Realtime Database |
| `auth`, `database` | firebase.js | Instances Firebase configurées |
| `Box`, `CircularProgress` | MUI | UI du spinner de chargement |

---

### Partie 2 : Création du contexte

```javascript
const AuthContext = createContext(null);
```

- **`createContext(null)`** : Crée un objet contexte avec une valeur par défaut `null`.
- Ce contexte sera « rempli » par le `AuthContext.Provider` dans `AuthProvider`.
- Tous les composants enfants pourront accéder à la valeur via `useContext(AuthContext)`.

---

### Partie 3 : Hook useAuth

```javascript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
}
```

| Ligne | Rôle |
|-------|------|
| `useContext(AuthContext)` | Récupère la valeur fournie par le Provider le plus proche |
| `if (!context)` | Si le hook est utilisé en dehors du Provider, context sera `null` |
| `throw new Error(...)` | Erreur explicite pour éviter des bugs silencieux |
| `return context` | Retourne l'objet `{ currentUser, userRole, loading, login, logout, register }` |

**Objectif :** Centraliser l'accès au contexte et garantir une utilisation correcte.

---

### Partie 4 : AuthProvider — États

```javascript
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
```

| État | Type | Valeurs possibles | Rôle |
|------|------|-------------------|------|
| `currentUser` | `User \| null` | Objet Firebase User ou `null` | Identité de l'utilisateur connecté |
| `userRole` | `string \| null` | `'admin'`, `'user'` ou `null` | Rôle pour la gestion des accès |
| `loading` | `boolean` | `true` / `false` | Indique si Firebase a fini d'initialiser l'état d'auth |

- **`children`** : Tous les composants imbriqués dans `AuthProvider` (routes, layouts, etc.).

---

### Partie 5 : useEffect — Listener Auth + Récupération du rôle

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
        setUserRole('user');
      }
    } else {
      setUserRole(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

| Ligne / Bloc | Rôle |
|--------------|------|
| `useEffect(..., [])` | Exécute une seule fois au montage de `AuthProvider` |
| `onAuthStateChanged(auth, callback)` | Enregistre un listener Firebase qui se déclenche à chaque changement d'état auth |
| `setCurrentUser(user)` | Met à jour l'utilisateur connecté ou `null` |
| `if (user)` | Branchement : utilisateur connecté vs déconnecté |
| `ref(database, 'users/${uid}/role')` | Référence Firebase vers le chemin du rôle |
| `get(roleRef)` | Lecture asynchrone de la valeur en base |
| `snapshot.exists()` | Indique si la clé existe |
| `snapshot.val()` | Retourne la valeur (ex. `'admin'` ou `'user'`) |
| `setUserRole(...)` | Met à jour le rôle ou `'user'` par défaut en cas d'erreur/absence |
| `setUserRole(null)` | Utilisateur déconnecté → pas de rôle |
| `setLoading(false)` | Fin de l'initialisation, l'app peut s'afficher |
| `return () => unsubscribe()` | Nettoyage : désinscrit le listener au démontage du composant |

---

### Partie 6 : Fonctions d'authentification

```javascript
async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function logout() {
  return signOut(auth);
}

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

| Fonction | Rôle |
|----------|------|
| **login** | Connexion via Firebase Auth. Le listener `onAuthStateChanged` met à jour `currentUser` et `userRole` automatiquement. |
| **logout** | Déconnexion. Firebase notifie le listener → `currentUser` et `userRole` deviennent `null`. |
| **register** | 1) Création du compte dans Firebase Auth. 2) Création du profil dans Realtime DB sous `users/{uid}` avec `role: 'user'`, `nom`, `email`. Tous les nouveaux utilisateurs ont le rôle `user` par défaut. |

---

### Partie 7 : Valeur du contexte

```javascript
const value = {
  currentUser,
  userRole,
  loading,
  login,
  logout,
  register,
};
```

- **`value`** : Objet unique qui sera passé à tous les composants via le Provider.
- Contient à la fois l’état (currentUser, userRole, loading) et les actions (login, logout, register).
- Tout composant appelant `useAuth()` reçoit cet objet.

---

### Partie 8 : Rendu conditionnel

```javascript
if (loading) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
```

| Condition | Rendu | Objectif |
|-----------|-------|----------|
| `loading === true` | Spinner centré en plein écran | Éviter un flash d’interface avant que l’état d’auth soit connu |
| `loading === false` | `AuthContext.Provider` + `children` | Afficher l’app avec le contexte d’authentification disponible |

---

## 5. Structure des données Firebase

### Firebase Authentication

- Gérée par Firebase Auth (email/mot de passe).
- Fournit : `uid`, `email`, etc.
- Pas de rôle : le rôle est stocké en base.

### Firebase Realtime Database

```
/users
  /{uid}                    ← uid = user.uid (Firebase Auth)
    role: "user" | "admin"  ← Rôle de l'utilisateur
    nom: string             ← Nom complet
    email: string           ← Email (dupliqué pour lecture rapide)
```

- **Lecture** : `users/{uid}/role` pour obtenir le rôle à la connexion.
- **Écriture** : à l'inscription, création de `users/{uid}` avec `role`, `nom`, `email`.

---

## 6. Utilisation dans l'application

### Intégration dans App.jsx

```javascript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* routes... */}
      </Router>
    </AuthProvider>
  );
}
```

### Utilisation dans un composant

```javascript
import { useAuth } from '../contexts/AuthContext';

function MonComposant() {
  const { currentUser, userRole, login, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Connecté : {currentUser.email}</p>
      <p>Rôle : {userRole}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Routes protégées

- **PrivateRoute** : Vérifie `currentUser` pour rediriger vers `/login` si non connecté.
- **AdminRoute** : Vérifie `userRole === 'admin'` pour restreindre l'accès aux pages admin.

---

## Résumé

| Élément | Description |
|---------|-------------|
| **AuthContext** | Contexte React pour l'authentification |
| **useAuth()** | Hook pour accéder au contexte (doit être dans AuthProvider) |
| **AuthProvider** | Composant qui enveloppe l'app, gère Firebase et fournit le contexte |
| **currentUser** | Utilisateur Firebase connecté ou `null` |
| **userRole** | `'admin'`, `'user'` ou `null` (depuis Realtime DB) |
| **loading** | Indique si l'état d'auth est encore en cours de chargement |
| **login / logout / register** | Fonctions exposées pour les actions d'authentification |

---

*Rapport généré pour le projet Gestion des Factures — Phase 2 : Authentification*

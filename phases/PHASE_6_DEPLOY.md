# 🚀 PHASE 6 — Tests, Qualité & Déploiement

> **Durée estimée** : 4 jours | **Semaines** : 7–8
> **Prérequis** : Phase 5 terminée ✅ — Toutes les fonctionnalités implémentées

---

## 🎯 Objectif de la Phase

Finaliser le projet avec :
- Tests fonctionnels complets de tous les flux
- Sécurisation des règles Firebase
- Optimisation des performances
- Déploiement sur Firebase Hosting
- Documentation technique

---

## 📋 Étapes

---

### ÉTAPE 6.1 — Tests Fonctionnels Manuels

**Objectif** : Vérifier que chaque flux utilisateur fonctionne sans erreur

**Définition** :
> Un test fonctionnel vérifie qu'une fonctionnalité produit le résultat attendu du point de vue de l'utilisateur. On teste les flux complets (end-to-end) plutôt que des fonctions isolées.

**Questions de compréhension** :
1. Quelle est la différence entre un test unitaire, un test d'intégration et un test fonctionnel ?
2. Qu'est-ce qu'un "cas limite" (edge case) ? Donne 3 exemples pour ce projet.
3. Comment tester que les règles de sécurité Firebase fonctionnent correctement ?

**Tâches** :
Exécuter et valider chaque scénario de la checklist :

**Flux Authentification**
- [ ] Créer un compte → rôle "user" attribué automatiquement
- [ ] Login avec email/password valide → redirection dashboard
- [ ] Login avec mauvais mot de passe → message d'erreur en français
- [ ] Accéder à `/dashboard` sans être connecté → redirection `/login`
- [ ] Accéder à `/admin` en tant que "user" → redirection `/`
- [ ] Logout → session terminée, redirection `/login`

**Flux Clients**
- [ ] Créer un client avec tous les champs valides → apparaît dans la liste
- [ ] Créer un client sans email → erreur Yup affichée
- [ ] Modifier un client → nouvelles données affichées
- [ ] Supprimer un client → confirmation → disparaît de la liste
- [ ] Rechercher un client par nom → filtre fonctionne

**Flux Articles/Catégories (Admin)**
- [ ] Créer une catégorie → disponible dans le Select d'articles
- [ ] Créer un article avec catégorie → apparaît dans la liste
- [ ] Essayer de supprimer une catégorie avec articles → message d'erreur bloquant
- [ ] Supprimer une catégorie vide → succès

**Flux Facturation**
- [ ] Créer une facture méthode 1 → totaux corrects → sauvé Firebase
- [ ] Créer une facture méthode 2 → remises par ligne calculées
- [ ] Créer une facture méthode 3 → remise globale appliquée
- [ ] Créer une facture méthode 4 → TVA variable par catégorie
- [ ] Télécharger le PDF → ouverture du fichier correct
- [ ] Modifier le statut d'une facture → mise à jour Firebase
- [ ] Filtrer factures par statut → filtrage correct

**Flux Dashboard**
- [ ] Les KPIs USER ne comptent que ses propres factures
- [ ] Les KPIs ADMIN comptent toutes les factures
- [ ] Valider une facture → statut mis à jour + KPIs actualisés
- [ ] Les graphiques Recharts s'affichent sans erreur

**Critères de validation** :
- Tous les scénarios cochés sans erreur console
- Aucun crash JavaScript (`TypeError`, `undefined is not a function`...)
- Les messages d'erreur sont compréhensibles pour un utilisateur final

---

### ÉTAPE 6.2 — Règles de Sécurité Firebase

**Objectif** : Sécuriser l'accès aux données Firebase selon les rôles

**Définition** :
> Les Firebase Security Rules sont des règles déclaratives qui s'exécutent côté serveur. Elles permettent de valider chaque lecture/écriture indépendamment du code client, empêchant toute manipulation malveillante.

**Questions de compréhension** :
1. Pourquoi les règles Firebase côté serveur sont-elles indispensables même si on protège les routes React ?
2. Que signifie `auth != null` dans une règle Firebase ?
3. Comment vérifier le rôle d'un utilisateur dans une règle Firebase Realtime Database ?

**Tâches** :
- [ ] Dans la console Firebase → Realtime Database → Règles, implémenter :

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "clients": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "factures": {
      ".read": "auth != null",
      "$factureId": {
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['numero', 'client_id', 'total_ttc', 'statut'])"
      }
    }
  }
}
```

- [ ] Tester que :
  - Un utilisateur non connecté ne peut pas lire les données
  - Un utilisateur connecté peut lire les clients et factures
  - Un utilisateur ne peut pas modifier le rôle d'un autre utilisateur

**Critères de validation** :
- Les règles sont publiées sans erreur de syntaxe
- Un appel sans auth est refusé (tester depuis l'onglet Network du navigateur)
- L'application fonctionne normalement avec les règles actives

---

### ÉTAPE 6.3 — Optimisation & Nettoyage du Code

**Objectif** : Améliorer la qualité du code avant le déploiement

**Questions de compréhension** :
1. Qu'est-ce que le "lazy loading" de composants React et pourquoi l'utiliser ?
2. Qu'est-ce qu'un memory leak dans React ? Comment les listeners Firebase peuvent en causer ?
3. Qu'est-ce que `React.memo` et quand l'utiliser ?

**Tâches** :

**Nettoyage des listeners Firebase**
- [ ] Vérifier que tous les `onValue()` listeners sont nettoyés dans `useEffect` :

```javascript
useEffect(() => {
  const unsubscribe = onValue(ref(db, 'clients'), (snapshot) => {
    // ...
  });
  return () => unsubscribe(); // ← OBLIGATOIRE pour éviter les memory leaks
}, []);
```

**Lazy Loading des pages**
- [ ] Utiliser `React.lazy()` + `Suspense` dans `App.jsx` pour les pages lourdes :

```javascript
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
// Entourer les routes lazy avec <Suspense fallback={<CircularProgress/>}>
```

**Nettoyage général**
- [ ] Supprimer tous les `console.log` de debug
- [ ] Vérifier qu'aucune clé Firebase n'est dans le code source
- [ ] Vérifier que `.env` est bien dans `.gitignore`
- [ ] Corriger tous les warnings ESLint

**Critères de validation** :
- Aucun `console.log` de debug restant
- Aucun warning dans la console du navigateur
- Les listeners Firebase sont tous nettoyés

---

### ÉTAPE 6.4 — Build de Production

**Objectif** : Générer le bundle optimisé pour la production

**Définition** :
> Le build de production minifie le code JavaScript, supprime les commentaires et le code mort, et optimise les assets pour un chargement rapide.

**Questions de compréhension** :
1. Quelle est la différence entre le mode `development` et `production` dans Vite ?
2. Pourquoi le dossier `dist/` ne doit-il pas être commité dans Git ?
3. Qu'est-ce que le "tree shaking" ?

**Tâches** :
- [ ] Vérifier le fichier `.env.production` (variables d'environnement de prod)
- [ ] Lancer le build : `npm run build`
- [ ] Tester le build localement : `npm run preview`
- [ ] Vérifier les erreurs éventuelles du build
- [ ] Ajouter `dist/` dans `.gitignore`

**Critères de validation** :
- `npm run build` se termine sans erreur
- `npm run preview` fonctionne sur `http://localhost:4173`
- La taille du bundle est raisonnable (vérifier dans le terminal)

---

### ÉTAPE 6.5 — Déploiement Firebase Hosting

**Objectif** : Mettre l'application en ligne

**Définition** :
> Firebase Hosting est un service d'hébergement statique qui distribue votre application sur un CDN mondial, garantissant des temps de chargement rapides partout dans le monde.

**Questions de compréhension** :
1. Pourquoi Firebase Hosting est-il adapté à une application React (SPA) ?
2. Qu'est-ce qu'une SPA (Single Page Application) et pourquoi a-t-elle besoin d'une configuration spéciale pour les routes ?
3. Qu'est-ce qu'un CDN ?

**Tâches** :
- [ ] Installer Firebase CLI : `npm install -g firebase-tools`
- [ ] Se connecter : `firebase login`
- [ ] Initialiser Firebase Hosting : `firebase init hosting`
  - Sélectionner le projet Firebase existant
  - Dossier public : `dist`
  - SPA (rewrite all to index.html) : **OUI**
  - Overwrite `dist/index.html` : **NON**
- [ ] Le fichier `firebase.json` créé doit ressembler à :

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

- [ ] Déployer : `firebase deploy --only hosting`
- [ ] Tester l'URL fournie par Firebase

**Critères de validation** :
- L'URL Firebase fonctionne dans le navigateur
- La navigation entre les pages fonctionne (pas d'erreur 404)
- Le login Firebase fonctionne depuis l'URL de production

---

### ÉTAPE 6.6 — Documentation Technique (README.md)

**Objectif** : Documenter le projet pour un futur développeur (ou pour soi-même dans 6 mois)

**Questions de compréhension** :
1. Quelles informations essentielles doit contenir un README ?
2. Pourquoi documenter les variables d'environnement nécessaires ?
3. Qu'est-ce qu'un "getting started" et pourquoi c'est crucial ?

**Tâches** :
- [ ] Créer `README.md` à la racine du projet :

```markdown
# Gestion des Factures — Application Web

## Stack
- React JS (Vite)
- Material UI v5
- Firebase (Auth + Realtime Database)
- JSON Server
- jsPDF

## Installation

### Prérequis
- Node.js v18+
- Compte Firebase

### Configuration
1. Cloner le projet
2. `npm install`
3. Créer `.env` (voir `.env.example`)
4. Lancer JSON Server : `npm run json-server`
5. Lancer l'app : `npm run dev`

## Variables d'environnement
(lister toutes les VITE_FIREBASE_* avec des valeurs vides)

## Comptes de test
Admin : admin@test.com / password123
User  : user@test.com / password123

## Structure du projet
(brève description des dossiers principaux)

## Déploiement
`npm run build && firebase deploy`
```

- [ ] Créer `.env.example` avec les clés vides (sans valeurs réelles)

**Critères de validation** :
- Un nouveau développeur peut lancer le projet en suivant le README
- Les variables d'environnement sont toutes documentées
- Les comptes de test sont listés

---

## ✅ Checklist de Fin de Phase 6 (et du Projet !)

- [ ] Tous les flux testés et fonctionnels
- [ ] Règles Firebase Realtime Database configurées
- [ ] Memory leaks Firebase corrigés (unsubscribe)
- [ ] Lazy loading implémenté
- [ ] Aucun console.log de debug
- [ ] Build de production réussi
- [ ] Application déployée sur Firebase Hosting
- [ ] README.md complet
- [ ] `.env.example` créé

---

## 🎉 Félicitations !

Tu as terminé le projet de gestion des factures !

### Ce que tu as appris :
- Architecture modulaire React (services, hooks, contexts, routes)
- Firebase Authentication + Realtime Database
- React Router v6 avec routes protégées
- Formik + Yup pour les formulaires complexes
- Génération de PDF avec jsPDF
- Visualisation de données avec Recharts
- Déploiement Firebase Hosting

### Évolutions possibles (bonus) :
- Export Excel des factures
- Envoi de factures par email
- Gestion multi-devise
- Signature électronique
- Archivage annuel
- Tests automatisés avec Jest/React Testing Library

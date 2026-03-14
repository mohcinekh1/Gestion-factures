# 🧾 PHASE 4 — Module de Facturation (Cœur du Projet)

> **Durée estimée** : 8 jours | **Semaines** : 4–6
> **Prérequis** : Phase 3 terminée ✅ — Clients, Articles, services fonctionnels

---

## 🎯 Objectif de la Phase

Implémenter le cœur du projet :
- Formulaire de facture dynamique (ajout/suppression de lignes)
- 4 méthodes de calcul (HT, TVA, remises)
- Génération de PDF professionnel
- Suivi du statut et des paiements

---

## 📋 Étapes

---

### ÉTAPE 4.1 — Logique de Calcul (calculations.js)

**Objectif** : Isoler toute la logique métier de calcul dans un fichier utilitaire

**Définition** :
> Séparer la logique métier de l'UI permet de tester les calculs indépendamment et de les réutiliser (formulaire + PDF + dashboard). C'est le principe de "separation of concerns".

**Questions de compréhension** :
1. Pourquoi mettre les calculs dans `utils/calculations.js` et non directement dans le formulaire ?
2. Quelle est la différence entre HT, TVA et TTC ?
3. Pour la Méthode 4 (TVA par catégorie), comment gérer des articles avec des taux différents dans la même facture ?

**Tâches** :
- [ ] Créer `src/utils/calculations.js`

Implémenter les 4 méthodes :

```javascript
// MÉTHODE 1 : Simple HT + TVA globale 20%
// calculateMethod1(articles) → { total_ht, tva, total_ttc }
// Formule : TTC = Σ(qté × prix) × 1.20

// MÉTHODE 2 : Remise par ligne
// calculateMethod2(articles) → { lignes[], total_ht, tva, total_ttc }
// Chaque article a un champ 'remise' (pourcentage)
// total_ligne = (qté × prix) × (1 - remise/100)

// MÉTHODE 3 : Remise globale
// calculateMethod3(articles, remise_globale) → { total_ht, remise_montant, base_tva, tva, total_ttc }
// remise appliquée sur le HT total, TVA calculée après remise

// MÉTHODE 4 : TVA par catégorie
// calculateMethod4(articles, categories) → { lignes[], total_ht, tva_details[], total_tva, total_ttc }
// Informatique → 20%, Services → 10%, Formation → 0%

// HELPER : formatCurrency(montant) → "8 500,00 MAD"
// HELPER : generateInvoiceNumber(lastNumber) → "FAC-2025-0042"
```

- [ ] Écrire des tests manuels dans la console pour valider chaque méthode :
  - Ex: `calculateMethod1([{qte: 2, prix_unitaire: 1000}])` → `{total_ht: 2000, tva: 400, total_ttc: 2400}`

**Critères de validation** :
- Les 4 méthodes retournent des résultats corrects
- `formatCurrency(8500)` retourne `"8 500,00 MAD"`
- Cas limites testés : remise 0%, remise 100%, quantité 0

---

### ÉTAPE 4.2 — Formulaire de Facture — Structure de Base

**Objectif** : Créer le formulaire principal avec les champs fixes

**Définition** :
> `useFieldArray` de Formik est un helper spécialisé pour gérer des tableaux de champs dans un formulaire (ex: lignes d'articles). Il fournit `append`, `remove`, `fields` pour manipuler le tableau dynamiquement.

**Questions de compréhension** :
1. Pourquoi utilise-t-on `useFieldArray` plutôt qu'un `useState` séparé pour les lignes ?
2. Quand doit-on calculer les totaux — à chaque keystroke ou à la soumission ?
3. Regarde `UI_Model.png` — comment est visuellement structuré un formulaire de facture ?

**Tâches** :
- [ ] Créer `src/pages/user/InvoiceCreate.jsx`

Structure du formulaire (Formik) :
```javascript
initialValues: {
  client_id: '',
  date_creation: new Date(),
  methode_calcul: 1,       // Select 1|2|3|4
  remise_globale: 0,       // visible seulement méthode 3
  articles: [
    {
      article_id: '',
      designation: '',
      qte: 1,
      prix_unitaire: 0,
      remise: 0,           // visible seulement méthode 2
      total_ligne: 0
    }
  ]
}
```

- [ ] Champ : Sélection du client (Autocomplete MUI chargé depuis Firebase)
- [ ] Champ : Date de création (DatePicker MUI)
- [ ] Champ : Méthode de calcul (Select MUI avec 4 options)
- [ ] Affichage conditionnel du champ "Remise globale" si méthode 3

**Critères de validation** :
- Le client peut être sélectionné et son nom s'affiche
- La date est pré-remplie avec aujourd'hui
- La méthode de calcul change les champs visibles

---

### ÉTAPE 4.3 — Lignes d'Articles Dynamiques

**Objectif** : Implémenter l'ajout/suppression de lignes d'articles avec calcul en temps réel

**Questions de compréhension** :
1. Quand on sélectionne un article dans le Select, que doit-il se passer automatiquement ?
2. Comment s'assurer que le total de la ligne se met à jour quand on change la quantité ?
3. Quel composant MUI utiliser pour la sélection d'article ?

**Tâches** :
- [ ] Créer `src/components/factures/ArticleRow.jsx`

Ce composant représente une ligne du tableau :
```javascript
// Props : index, remove, articles (liste depuis JSON Server)
// Champs par ligne :
// - Select article → auto-remplit designation et prix_unitaire
// - Input quantité (nombre, min 1)
// - Input prix unitaire (auto-rempli, modifiable)
// - Input remise % (seulement visible méthode 2)
// - Total ligne calculé (read-only, recalcule à chaque changement)
// - Bouton supprimer la ligne (icône delete)
```

- [ ] Dans `InvoiceCreate.jsx`, ajouter :
  - Tableau de lignes avec `useFieldArray`
  - Bouton "+ Ajouter un article"
  - Section récapitulatif (totaux) qui se met à jour en temps réel

**Hint pour le calcul en temps réel** :
```javascript
// Utiliser useEffect sur les valeurs Formik ou
// la prop 'validate' de Formik pour recalculer
// après chaque changement dans les lignes
```

**Critères de validation** :
- Sélectionner un article remplit automatiquement le prix
- Changer la quantité met à jour le total de la ligne ET les totaux globaux
- Ajouter/supprimer une ligne met à jour les totaux
- Au moins 1 ligne est requise (validation Yup)

---

### ÉTAPE 4.4 — Récapitulatif et Soumission de la Facture

**Objectif** : Afficher les totaux et sauvegarder la facture dans Firebase

**Questions de compréhension** :
1. Quelles données doit-on stocker dans Firebase pour une facture ?
2. Comment générer automatiquement le numéro de facture `FAC-2025-XXXX` ?
3. Quel est le statut initial d'une nouvelle facture ?

**Tâches** :
- [ ] Section récapitulatif selon la méthode de calcul choisie :

```
Méthode 1/2 :          Méthode 3 :              Méthode 4 :
─────────────          ──────────────            ──────────────────────
Total HT : X MAD       Total HT : X MAD          HT Informatique : X MAD
TVA (20%) : X MAD      Remise (Y%) : -X MAD      TVA 20% : X MAD
─────────────          Base TVA : X MAD           HT Services : X MAD
Total TTC : X MAD      TVA (20%) : X MAD          TVA 10% : X MAD
                       ──────────────            ──────────────────────
                       Total TTC : X MAD          Total TTC : X MAD
```

- [ ] Dans `onSubmit`, appeler `firebaseService.addFacture()` avec :
  - Tous les champs du formulaire
  - `statut: 'EN_ATTENTE'`
  - `validated_by_admin: null`
  - `created_by: currentUser.uid`
  - `numero` généré automatiquement
- [ ] Après succès : redirection vers la liste des factures + message succès (Snackbar MUI)

**Critères de validation** :
- La facture est créée dans Firebase avec toutes les données
- Le numéro est unique et formaté `FAC-2025-XXXX`
- Le statut initial est `EN_ATTENTE`
- Redirection et message de confirmation après création

---

### ÉTAPE 4.5 — Liste et Détail des Factures

**Objectif** : Afficher l'historique des factures avec filtres et détail

**Questions de compréhension** :
1. Comment filtrer les factures par statut côté client (sans requête Firebase) ?
2. Quel composant MUI utiliser pour afficher les statuts de façon colorée ?

**Tâches** :
- [ ] Créer `src/pages/user/InvoicesList.jsx` :
  - Tableau : Numéro, Client, Date, Total TTC, Statut, Actions
  - Filtre par statut (Tabs MUI ou Select)
  - Statuts colorés avec `<Chip>` MUI :
    - 🟡 EN_ATTENTE (orange)
    - 🟢 PAYEE (vert)
    - 🔴 REJETEE (rouge)
  - Boutons : Voir le détail · Télécharger PDF

- [ ] Créer `src/pages/user/InvoiceDetail.jsx` :
  - Toutes les informations de la facture
  - Section suivi paiement (si le statut le permet)
  - Bouton "Télécharger PDF"
  - Bouton "Modifier" (si statut EN_ATTENTE seulement)

**Critères de validation** :
- La liste n'affiche que les factures de l'utilisateur connecté
- Les filtres fonctionnent sans rechargement
- Le détail affiche correctement tous les articles et totaux

---

### ÉTAPE 4.6 — Génération PDF avec jsPDF

**Objectif** : Générer un PDF professionnel de la facture

**Définition** :
> jsPDF crée des PDF en JavaScript via un système de coordonnées (x, y en millimètres). jspdf-autotable ajoute le support des tableaux avec en-têtes, bordures et styles.

**Questions de compréhension** :
1. Comment jsPDF positionne-t-il les éléments ? (système de coordonnées)
2. Quelle est la différence entre `text()`, `setFont()`, et `autoTable()` dans jsPDF ?
3. Que doit obligatoirement contenir une facture légale ?

**Tâches** :
- [ ] Créer `src/utils/pdfGenerator.js`

Structure du PDF à créer :
```
┌─────────────────────────────────────────────────┐
│  [LOGO]          FACTURE N° FAC-2025-0001       │
│                  Date : 15/03/2025              │
├──────────────────┬──────────────────────────────┤
│ ÉMETTEUR         │ CLIENT                       │
│ Ma Société       │ Nom du client                │
│ Adresse          │ Email · Tél                  │
│ Tel / Email      │ Adresse                      │
├──────────────────┴──────────────────────────────┤
│ Désignation  │ Qté │ PU (MAD) │ Remise │ Total  │
├──────────────┼─────┼──────────┼────────┼────────┤
│ Article 1    │  2  │ 5 000,00 │   0%   │10 000  │
│ Article 2    │  1  │ 3 000,00 │  10%   │ 2 700  │
├──────────────┴─────┴──────────┴────────┴────────┤
│                            Total HT : 12 700 MAD│
│                            TVA (20%) :  2 540 MAD│
│                            Total TTC: 15 240 MAD│
├─────────────────────────────────────────────────┤
│  Statut : EN ATTENTE          [Signature]       │
└─────────────────────────────────────────────────┘
```

- [ ] Fonction `generateInvoicePDF(facture, client, articles, categories)` :
  - En-tête avec numéro et date
  - Bloc émetteur + bloc client
  - Tableau articles avec `autoTable()`
  - Bloc totaux (selon la méthode de calcul)
  - Statut de la facture
  - Zone de signature
  - `doc.save('facture-FAC-2025-XXXX.pdf')`

**Critères de validation** :
- Le PDF se génère sans erreur
- Toutes les informations sont présentes et lisibles
- Les montants sont correctement formatés
- Le PDF est téléchargeable depuis le bouton dans `InvoiceDetail`

---

### ÉTAPE 4.7 — Suivi des Paiements

**Objectif** : Permettre la mise à jour du statut et des informations de paiement

**Questions de compréhension** :
1. Qui peut changer le statut d'une facture — l'user ou l'admin ou les deux ?
2. Quelles informations faut-il collecter quand une facture est marquée comme "PAYEE" ?
3. Une facture "REJETEE" peut-elle redevenir "EN_ATTENTE" ?

**Tâches** :
- [ ] Créer `src/components/factures/PaymentForm.jsx` :
  - Champ : Date de dépôt (DatePicker, obligatoire)
  - Champ : Type de virement (Select : Virement bancaire / Chèque / Espèces / Mobile)
  - Champ : Date d'encaissement (visible seulement si statut → PAYEE)
  - Champ : Statut (Select : EN_ATTENTE / PAYEE / REJETEE)
  - Bouton "Mettre à jour"

- [ ] Règles métier à implémenter :
  - USER peut saisir la date de dépôt et le type de virement
  - ADMIN peut changer le statut (via Phase 5 validation)
  - Date d'encaissement obligatoire si statut = PAYEE

**Critères de validation** :
- Les modifications de paiement sont sauvegardées dans Firebase
- Les champs conditionnels apparaissent/disparaissent selon le statut
- La liste des factures reflète immédiatement les changements de statut

---

## ✅ Checklist de Fin de Phase 4

- [ ] `calculations.js` : 4 méthodes + helpers testés et validés
- [ ] Formulaire de facture dynamique fonctionnel
- [ ] Calculs en temps réel selon la méthode choisie
- [ ] Sauvegarde dans Firebase avec toutes les données
- [ ] Numérotation automatique des factures
- [ ] Liste des factures avec filtres et statuts colorés
- [ ] Page détail de la facture complète
- [ ] PDF généré correctement avec toutes les infos
- [ ] Formulaire de suivi des paiements fonctionnel
- [ ] Design cohérent avec `UI_Model.png`

## 🔜 Prochaine Phase
`phases/PHASE_5_DASHBOARD.md` — Tableau de Bord & Validation Admin

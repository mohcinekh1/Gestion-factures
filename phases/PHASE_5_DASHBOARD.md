# 📊 PHASE 5 — Tableau de Bord & Administration

> **Durée estimée** : 4 jours | **Semaines** : 6–7
> **Prérequis** : Phase 4 terminée ✅ — Facturation, PDF et suivi fonctionnels

---

## 🎯 Objectif de la Phase

Créer les interfaces analytiques et d'administration :
- Dashboard USER avec ses propres KPIs
- Dashboard ADMIN avec statistiques globales et graphiques
- Interface de validation des factures par l'admin

---

## 📋 Étapes

---

### ÉTAPE 5.1 — Composant KPICard Réutilisable

**Objectif** : Créer un composant de carte KPI générique utilisé dans les deux dashboards

**Définition** :
> Un KPI (Key Performance Indicator) est une métrique clé qui mesure la performance. Un composant réutilisable évite de dupliquer le code pour chaque carte de statistique.

**Questions de compréhension** :
1. Quelles props doit recevoir un composant `KPICard` générique ?
2. En regardant `UI_Model.png`, comment sont visuellement présentées les cartes KPI ?
3. Pourquoi créer un composant générique plutôt que coder chaque carte séparément ?

**Tâches** :
- [ ] Créer `src/components/dashboard/KPICard.jsx`

```javascript
// Props attendues :
// - title : string (ex: "Total Factures")
// - value : string | number (ex: "42" ou "125 400 MAD")
// - icon : composant MUI Icon
// - color : string (couleur de l'accent)
// - trend : { value: number, label: string } (optionnel, ex: +12% ce mois)
// - loading : boolean

// Design (référence UI_Model.png) :
// Card blanche avec ombre légère
// Icône colorée en haut à gauche
// Valeur en grand, gras
// Titre en dessous, gris
// Indicateur de tendance optionnel en bas
```

**Critères de validation** :
- La carte s'affiche correctement avec les props minimales
- Le skeleton MUI s'affiche pendant le `loading`
- La couleur de l'icône correspond à la prop `color`
- Responsive (s'adapte mobile et desktop)

---

### ÉTAPE 5.2 — Données du Dashboard (dataService)

**Objectif** : Créer les fonctions qui calculent les agrégats pour les dashboards

**Définition** :
> L'agrégation de données consiste à regrouper et calculer des statistiques à partir d'un ensemble de données brutes (ex: somme des TTC de toutes les factures payées).

**Questions de compréhension** :
1. Les calculs d'agrégation se font côté client ou côté Firebase ? Pourquoi ?
2. Comment calculer le "CA mensuel" des 12 derniers mois à partir du tableau de factures ?
3. Pourquoi le dashboard ADMIN voit toutes les factures et le USER seulement les siennes ?

**Tâches** :
- [ ] Créer `src/utils/dashboardStats.js` :

```javascript
// getUserStats(factures, userId) → stats pour le dashboard user
// {
//   total_factures: number,
//   factures_en_attente: number,
//   factures_payees: number,
//   factures_rejetees: number,
//   total_emis: number,     // somme TTC de toutes ses factures
//   recent_factures: []     // les 5 dernières
// }

// getAdminStats(factures, clients) → stats pour le dashboard admin
// {
//   total_factures: number,
//   total_clients: number,
//   total_encaisse: number,         // somme TTC des factures PAYEES
//   factures_en_attente: number,
//   factures_rejetees: number,
//   montant_moyen: number,
//   ca_mensuel: [                   // 12 derniers mois
//     { mois: "Jan", montant: 0 },  // format pour Recharts
//     ...
//   ],
//   repartition_statuts: [          // format pour PieChart
//     { name: "Payées", value: 0, color: "#4CAF50" },
//     ...
//   ],
//   factures_par_mois: []           // pour LineChart
// }
```

**Hint pour le CA mensuel** :
```javascript
// Créer un tableau des 12 derniers mois,
// filtrer les factures PAYEES de chaque mois,
// sommer les total_ttc
// Utiliser date-fns : format(date, 'MMM yyyy')
```

**Critères de validation** :
- `getUserStats` retourne des données correctes avec des factures de test
- `getAdminStats` calcule correctement le CA mensuel
- Les données null/undefined sont gérées (pas de crash si aucune facture)

---

### ÉTAPE 5.3 — Dashboard USER

**Objectif** : Page de tableau de bord pour le comptable/agent

**Référence visuelle** : `UI_Model.png` — section dashboard

**Questions de compréhension** :
1. Quelles sont les 4 informations les plus importantes pour un comptable ?
2. Un utilisateur doit-il voir les factures des autres utilisateurs ? Pourquoi ?
3. Quelle action rapide serait la plus utile en haut du dashboard ?

**Tâches** :
- [ ] Créer `src/pages/user/UserDashboard.jsx`

Structure de la page :
```
┌─── Bonjour, [Nom] ! ─────────────────────────────────┐
│ [Btn: Nouvelle Facture]   [Btn: Nouveau Client]      │
├──────────────────────────────────────────────────────┤
│ [KPI: Mes Factures] [KPI: En Attente] [KPI: Payées] [KPI: Total Émis] │
├──────────────────────────────────────────────────────┤
│ Mes dernières factures                               │
│ ┌────────────┬──────────┬───────────┬──────────────┐ │
│ │ Numéro     │ Client   │ Total TTC │ Statut        │ │
│ ├────────────┼──────────┼───────────┼──────────────┤ │
│ │ FAC-001    │ Client A │ 12 000 MAD│ 🟡 EN_ATTENTE │ │
│ └────────────┴──────────┴───────────┴──────────────┘ │
│                               [Voir toutes →]        │
└──────────────────────────────────────────────────────┘
```

**Critères de validation** :
- Seules les factures de l'utilisateur connecté apparaissent
- Les KPIs affichent les bonnes valeurs
- "Voir toutes" redirige vers `/factures`
- Les boutons rapides fonctionnent

---

### ÉTAPE 5.4 — Graphiques Recharts (Admin)

**Objectif** : Implémenter les 3 graphiques du dashboard admin

**Définition** :
> Recharts est une bibliothèque de graphiques React basée sur D3. Elle utilise des composants déclaratifs (BarChart, LineChart, PieChart) avec des props de configuration.

**Questions de compréhension** :
1. Quelle est la structure de données attendue par un `BarChart` Recharts ?
2. Pourquoi utilise-t-on `ResponsiveContainer` autour des graphiques ?
3. En regardant `UI_Model.png`, quels types de graphiques sont représentés ?

**Tâches** :

**MonthlyRevenueChart.jsx** (`src/components/dashboard/MonthlyRevenueChart.jsx`)
- [ ] `BarChart` Recharts avec les données `ca_mensuel`
- [ ] Axe X : mois, Axe Y : montant en MAD
- [ ] Couleur des barres = couleur primaire du thème
- [ ] Tooltip avec montant formaté

**StatusPieChart.jsx** (`src/components/dashboard/StatusPieChart.jsx`)
- [ ] `PieChart` Recharts avec `repartition_statuts`
- [ ] Couleurs : vert (Payée), orange (En attente), rouge (Rejetée)
- [ ] Légende en dessous
- [ ] Tooltip avec pourcentage et nombre

**InvoicesLineChart.jsx** (`src/components/dashboard/InvoicesLineChart.jsx`)
- [ ] `LineChart` avec nombre de factures créées par mois
- [ ] Ligne lissée (type="monotone")
- [ ] Point visible sur chaque mois

**Critères de validation** :
- Les 3 graphiques s'affichent correctement avec des données de test
- `ResponsiveContainer` est utilisé pour l'adaptabilité
- Les couleurs sont cohérentes avec le thème et `UI_Model.png`

---

### ÉTAPE 5.5 — Dashboard ADMIN

**Objectif** : Page de tableau de bord global pour l'administrateur

**Questions de compréhension** :
1. Quelles métriques sont spécifiques à un admin (et pas à un user) ?
2. Comment afficher un "montant moyen par facture" de façon pertinente ?

**Tâches** :
- [ ] Créer `src/pages/admin/AdminDashboard.jsx`

Structure :
```
┌── Dashboard Administrateur ──────────────────────────┐
│ [KPI: Total Factures] [KPI: Total Encaissé]          │
│ [KPI: En Attente]     [KPI: Total Clients]           │
│ [KPI: Factures Rejetées] [KPI: Montant Moyen]        │
├──────────────────────────────────────────────────────┤
│ ┌── CA Mensuel ──────────┐ ┌── Répartition ─────────┐│
│ │   [BarChart]           │ │   [PieChart]           ││
│ └────────────────────────┘ └────────────────────────┘│
├──────────────────────────────────────────────────────┤
│ ┌── Évolution des Factures ──────────────────────────┐│
│ │   [LineChart]                                      ││
│ └────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Critères de validation** :
- Toutes les factures de tous les utilisateurs sont comptabilisées
- Les graphiques affichent des données réelles depuis Firebase
- La page est responsive (grille MUI)

---

### ÉTAPE 5.6 — Interface de Validation Admin

**Objectif** : Permettre à l'admin de valider ou rejeter les factures en attente

**Questions de compréhension** :
1. Quels champs de la facture sont mis à jour lors d'une validation ?
2. L'admin doit-il pouvoir rejeter une facture déjà payée ? Pourquoi ?
3. Comment signaler visuellement qu'une action est irréversible ?

**Tâches** :
- [ ] Créer `src/pages/admin/AdminValidation.jsx`

Fonctionnalités :
- [ ] Tableau de toutes les factures avec leur statut
- [ ] Filtre rapide : "Toutes" | "En attente" | "Payées" | "Rejetées"
- [ ] Pour chaque facture EN_ATTENTE, afficher deux boutons :
  - ✅ "Valider" (vert) → Dialog de confirmation → `statut: 'PAYEE'`, `validated_by_admin: uid`
  - ❌ "Rejeter" (rouge) → Dialog avec champ "Motif de rejet" → `statut: 'REJETEE'`
- [ ] Colonne "Validé par" : affiche le nom de l'admin si déjà traité
- [ ] Les factures PAYEES et REJETEES ont des boutons grisés (disabled)

**Critères de validation** :
- La validation met à jour le statut dans Firebase
- Les factures déjà traitées ne peuvent plus être modifiées
- L'interface reflète les changements en temps réel (ou après refresh)
- Un message de confirmation (Snackbar) s'affiche après chaque action

---

## ✅ Checklist de Fin de Phase 5

- [ ] `KPICard` composant générique réutilisable
- [ ] `dashboardStats.js` avec toutes les fonctions d'agrégation
- [ ] Dashboard USER : KPIs personnels + dernières factures
- [ ] Dashboard ADMIN : 6 KPIs + 3 graphiques Recharts
- [ ] `MonthlyRevenueChart`, `StatusPieChart`, `InvoicesLineChart` créés
- [ ] Interface de validation admin fonctionnelle
- [ ] Design cohérent avec `UI_Model.png`
- [ ] Tout responsive sur mobile et desktop

## 🔜 Prochaine Phase
`phases/PHASE_6_DEPLOY.md` — Tests, Qualité & Déploiement

# Design — Source de référence UI

## UI_Model.png

**Emplacement recommandé :** `docs/design/UI_Model.png`

Cette image est la **référence visuelle principale** du projet Gestion des Factures. Elle définit :

- Layout : sidebar sombre, header, zone de contenu en grille
- Palette : violet/bleu foncé (sidebar), blanc et gris pour le contenu
- Composants : cards, graphiques, listes, KPIs
- Typographie et espacements

### Usage

- Consulter **avant tout développement UI**
- S'inspirer pour : `src/theme/theme.js`, composants layout, dashboard
- Les règles Cursor (`.cursor/rules/`) référencent ce fichier

### Éléments à adapter pour la facturation

Le modèle Eventure (événements) inspire notre app facturation :

| Eventure | Gestion Factures |
|----------|------------------|
| Total Events | Nombre de factures |
| Bookings | Factures en attente |
| Revenue | Chiffre d'affaires |
| Upcoming Events | Factures à venir |
| Customer Activities | Répartition par client / statut |

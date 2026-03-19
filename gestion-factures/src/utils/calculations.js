/**
 * Logique de calcul des factures
 * 4 méthodes : HT+TVA simple, remise par ligne, remise globale, TVA par catégorie
 */

const TVA_GLOBALE = 0.2; // 20%

const TVA_BY_CATEGORY = {
  Informatique: 0.2,  // 20%
  Services: 0.1,      // 10%
  Formation: 0,       // 0%
};

/**
 * MÉTHODE 1 : Simple HT + TVA globale 20%
 * TTC = Σ(qté × prix) × 1.20
 * @param {Array<{qte: number, prix_unitaire: number}>} articles
 * @returns {{ total_ht: number, tva: number, total_ttc: number }}
 */
export function calculateMethod1(articles) {
  const total_ht = (articles || []).reduce(
    (sum, a) => sum + (Number(a.qte) || 0) * (Number(a.prix_unitaire) || 0),
    0
  );
  const tva = total_ht * TVA_GLOBALE;
  const total_ttc = total_ht + tva;
  return { total_ht, tva, total_ttc };
}

/**
 * MÉTHODE 2 : Remise par ligne
 * total_ligne = (qté × prix) × (1 - remise/100)
 * @param {Array<{qte: number, prix_unitaire: number, remise?: number}>} articles
 * @returns {{ lignes: Array<{total_ligne: number}>, total_ht: number, tva: number, total_ttc: number }}
 */
export function calculateMethod2(articles) {
  const lignes = (articles || []).map((a) => {
    const qte = Number(a.qte) || 0;
    const prix = Number(a.prix_unitaire) || 0;
    const remise = Math.min(100, Math.max(0, Number(a.remise) || 0));
    const total_ligne = qte * prix * (1 - remise / 100);
    return { ...a, total_ligne };
  });
  const total_ht = lignes.reduce((sum, l) => sum + l.total_ligne, 0);
  const tva = total_ht * TVA_GLOBALE;
  const total_ttc = total_ht + tva;
  return { lignes, total_ht, tva, total_ttc };
}

/**
 * MÉTHODE 3 : Remise globale
 * Remise appliquée sur le HT total, TVA calculée après remise
 * @param {Array<{qte: number, prix_unitaire: number}>} articles
 * @param {number} remise_globale - pourcentage (0-100)
 * @returns {{ total_ht: number, remise_montant: number, base_tva: number, tva: number, total_ttc: number }}
 */
export function calculateMethod3(articles, remise_globale = 0) {
  const total_ht = (articles || []).reduce(
    (sum, a) => sum + (Number(a.qte) || 0) * (Number(a.prix_unitaire) || 0),
    0
  );
  const remisePct = Math.min(100, Math.max(0, Number(remise_globale) || 0));
  const remise_montant = total_ht * (remisePct / 100);
  const base_tva = total_ht - remise_montant;
  const tva = base_tva * TVA_GLOBALE;
  const total_ttc = base_tva + tva;
  return { total_ht, remise_montant, base_tva, tva, total_ttc };
}

/**
 * MÉTHODE 4 : TVA par catégorie
 * Informatique → 20%, Services → 10%, Formation → 0%
 * @param {Array<{qte: number, prix_unitaire: number, categorie_id: number}>} articles
 * @param {Array<{id: number, nom: string}>} categories
 * @returns {{ lignes: Array, total_ht: number, tva_details: Array<{nom: string, taux: number, ht: number, tva: number}>, total_tva: number, total_ttc: number }}
 */
export function calculateMethod4(articles, categories = []) {
  const catMap = Object.fromEntries((categories || []).map((c) => [c.id, c]));

  const lignes = (articles || []).map((a) => {
    const qte = Number(a.qte) || 0;
    const prix = Number(a.prix_unitaire) || 0;
    const total_ligne = qte * prix;
    const cat = catMap[a.categorie_id];
    const taux = cat ? (TVA_BY_CATEGORY[cat.nom] ?? 0) : 0;
    const tva_ligne = total_ligne * taux;
    return { ...a, total_ligne, taux, tva_ligne, nom_categorie: cat?.nom };
  });

  const total_ht = lignes.reduce((sum, l) => sum + l.total_ligne, 0);

  // Regrouper par catégorie pour tva_details
  const tvaByCat = {};
  for (const l of lignes) {
    const nom = l.nom_categorie || 'Autre';
    if (!tvaByCat[nom]) {
      tvaByCat[nom] = { nom, taux: l.taux ?? 0, ht: 0, tva: 0 };
    }
    tvaByCat[nom].ht += l.total_ligne;
    tvaByCat[nom].tva += l.tva_ligne ?? 0;
  }
  const tva_details = Object.values(tvaByCat);

  const total_tva = tva_details.reduce((sum, d) => sum + d.tva, 0);
  const total_ttc = total_ht + total_tva;

  return { lignes, total_ht, tva_details, total_tva, total_ttc };
}

/**
 * Formate un montant en MAD
 * @param {number} montant
 * @returns {string} ex: "8 500,00 MAD"
 */
export function formatCurrency(montant) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(montant) || 0);
}

/**
 * Génère un numéro de facture unique
 * @param {number} lastNumber - dernier numéro utilisé (ex: 41)
 * @returns {string} ex: "FAC-2025-0042"
 */
export function generateInvoiceNumber(lastNumber = 0) {
  const year = new Date().getFullYear();
  const next = (Number(lastNumber) || 0) + 1;
  return `FAC-${year}-${String(next).padStart(4, '0')}`;
}

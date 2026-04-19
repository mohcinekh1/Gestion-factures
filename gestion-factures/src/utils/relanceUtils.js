/**
 * Utilitaires pour le Centre de Relance
 * Calcule les jours de retard, le niveau de priorité et le score de relance
 */

const DELAI_PAIEMENT_JOURS = 30; // délai standard en jours

function getTS(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (val.seconds) return val.seconds * 1000;
  const d = new Date(val);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/**
 * Calcule les jours écoulés depuis la date de dépôt
 * @param {*} dateDepot - timestamp Firebase ou number
 * @returns {number} jours écoulés (négatif = pas encore dû)
 */
export function joursDepuisDepot(dateDepot) {
  const ts = getTS(dateDepot);
  if (!ts) return 0;
  const maintenant = Date.now();
  const diff = maintenant - ts;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calcule les jours de retard (par rapport au délai de paiement standard)
 * @param {*} dateDepot
 * @returns {number} jours de retard (0 si pas encore en retard)
 */
export function joursRetard(dateDepot) {
  const jours = joursDepuisDepot(dateDepot);
  return Math.max(0, jours - DELAI_PAIEMENT_JOURS);
}

/**
 * Détermine le niveau de priorité de relance
 * @param {number} retard - jours de retard
 * @param {number} montant - total TTC
 * @returns {'critique'|'haute'|'normale'|'faible'}
 */
export function niveauPriorite(retard, montant) {
  if (retard > 60 || (retard > 30 && montant > 50000)) return 'critique';
  if (retard > 30 || (retard > 15 && montant > 20000)) return 'haute';
  if (retard > 0) return 'normale';
  return 'faible';
}

/**
 * Calcule un score de relance (0-100) pour trier les factures
 * Plus le score est élevé, plus la relance est urgente
 * @param {number} retard - jours de retard
 * @param {number} montant - total TTC
 * @returns {number}
 */
export function scoreRelance(retard, montant) {
  const scoreDateRetard = Math.min(60, retard);
  const scoreMontant = Math.min(40, montant / 10000);
  return Math.round(scoreDateRetard + scoreMontant);
}

/**
 * Config visuelle par niveau de priorité
 */
export const PRIORITE_CONFIG = {
  critique: {
    label: 'Critique',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.10)',
    border: 'rgba(220,38,38,0.30)',
    icon: '🔴',
    ordre: 0,
  },
  haute: {
    label: 'Haute',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.10)',
    border: 'rgba(234,88,12,0.30)',
    icon: '🟠',
    ordre: 1,
  },
  normale: {
    label: 'Normale',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.10)',
    border: 'rgba(217,119,6,0.30)',
    icon: '🟡',
    ordre: 2,
  },
  faible: {
    label: 'Faible',
    color: '#059669',
    bg: 'rgba(5,150,105,0.10)',
    border: 'rgba(5,150,105,0.20)',
    icon: '🟢',
    ordre: 3,
  },
};

/**
 * Enrichit une liste de factures EN_ATTENTE avec les données de relance
 * @param {Array} factures - toutes les factures
 * @returns {Array} factures EN_ATTENTE enrichies et triées par urgence
 */
export function buildRelanceList(factures = []) {
  return factures
    .filter((f) => f.statut === 'EN_ATTENTE')
    .map((f) => {
      const retard = joursRetard(f.date_depot || f.date_creation);
      const montant = Number(f.total_ttc) || 0;
      const priorite = niveauPriorite(retard, montant);
      const score = scoreRelance(retard, montant);
      const joursTotal = joursDepuisDepot(f.date_depot || f.date_creation);
      return { ...f, retard, priorite, score, joursTotal };
    })
    .sort((a, b) => {
      const ordreDiff = PRIORITE_CONFIG[a.priorite].ordre - PRIORITE_CONFIG[b.priorite].ordre;
      if (ordreDiff !== 0) return ordreDiff;
      return b.score - a.score;
    });
}

/**
 * Calcule les stats globales de relance
 * @param {Array} relanceList - factures enrichies
 * @returns {Object}
 */
export function getRelanceStats(relanceList = []) {
  const critique = relanceList.filter((f) => f.priorite === 'critique').length;
  const haute = relanceList.filter((f) => f.priorite === 'haute').length;
  const normale = relanceList.filter((f) => f.priorite === 'normale').length;
  const totalEnRetard = relanceList.filter((f) => f.retard > 0).length;
  const montantEnRetard = relanceList
    .filter((f) => f.retard > 0)
    .reduce((sum, f) => sum + (Number(f.total_ttc) || 0), 0);

  return { critique, haute, normale, totalEnRetard, montantEnRetard };
}

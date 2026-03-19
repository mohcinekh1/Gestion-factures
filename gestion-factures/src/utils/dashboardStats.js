/**
 * Agrégation des données pour les dashboards USER et ADMIN
 * Calculs côté client à partir des données Firebase
 */

import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Stats pour le dashboard USER (comptable/agent)
 * @param {Array} factures - Toutes les factures (seront filtrées par userId)
 * @param {string} userId - UID du créateur
 * @returns {Object}
 */

const getTS = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (val.seconds) return val.seconds * 1000;
  const d = new Date(val);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

export function getUserStats(factures = [], userId = null) {
  const list = Array.isArray(factures) ? factures : [];
  const mine = userId ? list.filter((f) => f.created_by === userId) : list;

  const factures_en_attente = mine.filter((f) => f.statut === 'EN_ATTENTE').length;
  const factures_payees = mine.filter((f) => f.statut === 'PAYEE').length;
  const factures_rejetees = mine.filter((f) => f.statut === 'REJETEE').length;

  const total_emis = mine.reduce((sum, f) => sum + (Number(f.total_ttc) || 0), 0);

  const recent_factures = [...mine]
    .sort((a, b) => getTS(b.date_creation) - getTS(a.date_creation))
    .slice(0, 5);

  return {
    total_factures: mine.length,
    factures_en_attente,
    factures_payees,
    factures_rejetees,
    total_emis,
    recent_factures,
  };
}

/**
 * Stats pour le dashboard ADMIN (vue globale)
 * @param {Array} factures - Toutes les factures
 * @param {Array} clients - Tous les clients
 * @returns {Object}
 */
export function getAdminStats(factures = [], clients = []) {
  const list = Array.isArray(factures) ? factures : [];
  const clientsList = Array.isArray(clients) ? clients : [];

  const payees = list.filter((f) => f.statut === 'PAYEE');
  const en_attente = list.filter((f) => f.statut === 'EN_ATTENTE').length;
  const rejetees = list.filter((f) => f.statut === 'REJETEE').length;

  const total_encaisse = payees.reduce((sum, f) => sum + (Number(f.total_ttc) || 0), 0);

  const recent_factures_en_attente = list
    .filter((f) => f.statut === 'EN_ATTENTE')
    .sort((a, b) => getTS(b.date_creation) - getTS(a.date_creation))
    .slice(0, 5);

  const montant_moyen = list.length > 0
    ? list.reduce((sum, f) => sum + (Number(f.total_ttc) || 0), 0) / list.length
    : 0;

  // CA mensuel : 12 derniers mois, somme TTC des factures PAYEES par mois
  // On utilise date_encaissement si dispo, sinon date_creation
  const now = new Date();
  const ca_mensuel = [];
  for (let i = 11; i >= 0; i--) {
    const moisDate = subMonths(now, i);
    const debut = startOfMonth(moisDate).getTime();
    const fin = endOfMonth(moisDate).getTime();

    const montant = payees.reduce((sum, f) => {
      const ts = f.date_encaissement ?? f.date_creation;
      const t = getTS(ts);
      return t >= debut && t <= fin ? sum + (Number(f.total_ttc) || 0) : sum;
    }, 0);

    ca_mensuel.push({
      mois: format(moisDate, 'MMM yy', { locale: fr }),
      montant,
      fullDate: moisDate,
    });
  }

  // Répartition par statut pour PieChart
  const repartition_statuts = [
    { name: 'Payées', value: payees.length, color: '#059669' },
    { name: 'En attente', value: en_attente, color: '#f59e0b' },
    { name: 'Rejetées', value: rejetees, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  // Factures par mois pour LineChart (date_creation)
  const facturesParMoisMap = {};
  for (let i = 11; i >= 0; i--) {
    const moisDate = subMonths(now, i);
    const key = format(moisDate, 'MMM yy', { locale: fr });
    facturesParMoisMap[key] = { mois: key, count: 0, fullDate: moisDate };
  }

  list.forEach((f) => {
    const t = getTS(f.date_creation);
    if (!t) return;
    const d = new Date(t);
    const key = format(d, 'MMM yy', { locale: fr });
    if (facturesParMoisMap[key]) {
      facturesParMoisMap[key].count += 1;
    }
  });

  const factures_par_mois = Object.values(facturesParMoisMap).sort(
    (a, b) => a.fullDate.getTime() - b.fullDate.getTime()
  );

  return {
    total_factures: list.length,
    total_clients: clientsList.length,
    total_encaisse,
    factures_en_attente: en_attente,
    factures_rejetees: rejetees,
    montant_moyen,
    ca_mensuel,
    repartition_statuts,
    factures_par_mois,
    recent_factures_en_attente,
  };
}

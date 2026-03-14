import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from './firebase';

function snapshotToArray(snapshot) {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function getClients() {
  try {
    const clientsRef = ref(database, 'clients');
    const snapshot = await get(clientsRef);
    return snapshotToArray(snapshot);
  } catch (error) {
    console.error('Erreur getClients:', error);
    throw error;
  }
}
export async function getClientById(id) {
  try {
    const clientRef = ref(database, `clients/${id}`);
    const snapshot = await get(clientRef);
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  } catch (error) {
    console.error('Erreur getClientById:', error);
    throw error;
  }
}

export async function addClient(clientData) {
  try {
    const clientsRef = ref(database, 'clients');
    const newRef = await push(clientsRef, clientData);
    return newRef.key;
  } catch (error) {
    console.error('Erreur addClient:', error);
    throw error;
  }
}

export async function updateClient(id, data) {
  try {
    const clientRef = ref(database, `clients/${id}`);
    await update(clientRef, data);
  } catch (error) {
    console.error('Erreur updateClient:', error);
    throw error;
  }
}

export async function deleteClient(id) {
  try {
    const clientRef = ref(database, `clients/${id}`);
    await remove(clientRef);
  } catch (error) {
    console.error('Erreur deleteClient:', error);
    throw error;
  }
}
export async function getFactures() {
  try {
    const facturesRef = ref(database, 'factures');
    const snapshot = await get(facturesRef);
    return snapshotToArray(snapshot);
  } catch (error) {
    console.error('Erreur getFactures:', error);
    throw error;
  }
}

export async function getFactureById(id) {
  try {
    const factureRef = ref(database, `factures/${id}`);
    const snapshot = await get(factureRef);
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  } catch (error) {
    console.error('Erreur getFactureById:', error);
    throw error;
  }
}

export async function getFacturesByClient(clientId) {
  try {
    const factures = await getFactures();
    return factures.filter((f) => f.client_id === clientId);
  } catch (error) {
    console.error('Erreur getFacturesByClient:', error);
    throw error;
  }
}

export async function addFacture(factureData) {
  try {
    const facturesRef = ref(database, 'factures');
    const newRef = await push(facturesRef, factureData);
    return newRef.key;
  } catch (error) {
    console.error('Erreur addFacture:', error);
    throw error;
  }
}

export async function updateFacture(id, data) {
  try {
    const factureRef = ref(database, `factures/${id}`);
    await update(factureRef, data);
  } catch (error) {
    console.error('Erreur updateFacture:', error);
    throw error;
  }
}

export async function deleteFacture(id) {
  try {
    const factureRef = ref(database, `factures/${id}`);
    await remove(factureRef);
  } catch (error) {
    console.error('Erreur deleteFacture:', error);
    throw error;
  }
}

export async function validateFacture(id, adminUid) {
  try {
    await updateFacture(id, {
      statut: 'PAYEE',
      validated_by_admin: adminUid,
      date_encaissement: Date.now(),
    });
  } catch (error) {
    console.error('Erreur validateFacture:', error);
    throw error;
  }
}

export async function getUserRole(uid) {
  try {
    const userRef = ref(database, `users/${uid}/role`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : 'user';
  } catch (error) {
    console.error('Erreur getUserRole:', error);
    throw error;
  }
}
  
export async function createUserProfile(uid, data) {
  try {
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, data);
  } catch (error) {
    console.error('Erreur createUserProfile:', error);
    throw error;
  }
}
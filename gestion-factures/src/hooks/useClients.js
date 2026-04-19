import { useState, useEffect, useCallback } from 'react';
import * as firebaseService from '../services/firebaseService';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await firebaseService.getClients();
      setClients(data);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firebaseService.subscribeClients(
      (data) => {
        setClients(data);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Erreur lors du chargement des clients');
        setClients([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addClient = useCallback(async (data) => {
    setError(null);
    try {
      const id = await firebaseService.addClient(data);
      setClients((prev) => [...prev, { id, ...data }]);
      return id;
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'ajout du client');
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, data) => {
    setError(null);
    try {
      await firebaseService.updateClient(id, data);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    } catch (err) {
      setError(err?.message || 'Erreur lors de la modification du client');
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    setError(null);
    try {
      await firebaseService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression du client');
      throw err;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
  };
}

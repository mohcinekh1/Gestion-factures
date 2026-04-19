import { useState, useEffect, useCallback } from 'react';
import * as firebaseService from '../services/firebaseService';

export function useClients(userId = null) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await firebaseService.getClients();
      const filtered = userId ? data.filter((c) => c.created_by === userId) : data;
      setClients(filtered);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firebaseService.subscribeClients(
      (data) => {
        const filtered = userId ? data.filter((c) => c.created_by === userId) : data;
        setClients(filtered);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Erreur lors du chargement des clients');
        setClients([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addClient = useCallback(async (data) => {
    setError(null);
    try {
      const id = await firebaseService.addClient(data);
      return id;
    } catch (err) {
      setError(err?.message || "Erreur lors de l'ajout du client");
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, data) => {
    setError(null);
    try {
      await firebaseService.updateClient(id, data);
    } catch (err) {
      setError(err?.message || 'Erreur lors de la modification du client');
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    setError(null);
    try {
      await firebaseService.deleteClient(id);
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

import { useState, useEffect, useCallback } from 'react';
import * as firebaseService from '../services/firebaseService';

export function useInvoices(userId = null) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFactures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await firebaseService.getFactures();
      const filtered = userId
        ? data.filter((f) => f.created_by === userId)
        : data;
      setFactures(filtered);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des factures');
      setFactures([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteFacture = useCallback(async (id) => {
    setError(null);
    try {
      await firebaseService.deleteFacture(id);
      setFactures((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression');
      throw err;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firebaseService.subscribeFactures(
      (data) => {
        const filtered = userId
          ? data.filter((f) => f.created_by === userId)
          : data;
        setFactures(filtered);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Erreur lors du chargement des factures');
        setFactures([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    factures,
    loading,
    error,
    refreshFactures,
    deleteFacture,
  };
}

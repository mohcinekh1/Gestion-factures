import { useState, useEffect, useCallback } from 'react';
import * as jsonService from '../services/jsonService';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [arts, cats] = await Promise.all([
        jsonService.getArticles(),
        jsonService.getCategories(),
      ]);
      setArticles(arts);
      setCategories(cats);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des données');
      setArticles([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // === ARTICLES ===

  const addArticle = useCallback(async (data) => {
    setError(null);
    try {
      const created = await jsonService.addArticle(data);
      setArticles((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err?.message || "Erreur lors de l'ajout de l'article");
      throw err;
    }
  }, []);

  const updateArticle = useCallback(async (id, data) => {
    setError(null);
    try {
      const updated = await jsonService.updateArticle(id, data);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err?.message || "Erreur lors de la modification de l'article");
      throw err;
    }
  }, []);

  const deleteArticle = useCallback(async (id) => {
    setError(null);
    try {
      await jsonService.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err?.message || "Erreur lors de la suppression de l'article");
      throw err;
    }
  }, []);

  // === CATÉGORIES ===

  const addCategory = useCallback(async (data) => {
    setError(null);
    try {
      const created = await jsonService.addCategory(data);
      setCategories((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err?.message || "Erreur lors de l'ajout de la catégorie");
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    setError(null);
    try {
      const updated = await jsonService.updateCategory(id, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setError(err?.message || 'Erreur lors de la modification de la catégorie');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setError(null);
    try {
      await jsonService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression de la catégorie');
      throw err;
    }
  }, []);

  return {
    articles,
    categories,
    loading,
    error,
    addArticle,
    updateArticle,
    deleteArticle,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshAll,
  };
}

const BASE_URL = 'http://localhost:3001';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

// === ARTICLES ===

export async function getArticles() {
  try {
    const response = await fetch(`${BASE_URL}/articles`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur getArticles:', error);
    throw error;
  }
}

export async function getArticleById(id) {
  try {
    const response = await fetch(`${BASE_URL}/articles/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur getArticleById:', error);
    throw error;
  }
}

export async function getArticlesByCategory(categorieId) {
  try {
    const response = await fetch(`${BASE_URL}/articles?categorie_id=${categorieId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur getArticlesByCategory:', error);
    throw error;
  }
}

export async function addArticle(data) {
  try {
    const response = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur addArticle:', error);
    throw error;
  }
}

export async function updateArticle(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur updateArticle:', error);
    throw error;
  }
}

export async function deleteArticle(id) {
  try {
    const response = await fetch(`${BASE_URL}/articles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return;
  } catch (error) {
    console.error('Erreur deleteArticle:', error);
    throw error;
  }
}

// === CATÉGORIES ===

export async function getCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur getCategories:', error);
    throw error;
  }
}

export async function addCategory(data) {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur addCategory:', error);
    throw error;
  }
}

export async function updateCategory(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erreur updateCategory:', error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return;
  } catch (error) {
    console.error('Erreur deleteCategory:', error);
    throw error;
  }
}

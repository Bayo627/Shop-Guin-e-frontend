// Utilitaire centralisé pour tous les appels API vers le backend
const BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('sg_token');

const headers = (json = true) => {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
};

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
};

export const api = {
  get:    (path)        => req('GET',    path),
  post:   (path, body)  => req('POST',   path, body),
  put:    (path, body)  => req('PUT',    path, body),
  delete: (path)        => req('DELETE', path),
};

// Formatage prix GNF
export const formatPrice = (n) =>
  new Intl.NumberFormat('fr-GN').format(Math.round(n)) + ' GNF';

// Étoiles de notation
export const renderStars = (rating) => {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nm-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejo global de errores 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nm-token');
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Productos ─────────────────────────────────────────────────
export const productsAPI = {
  getAll:   (params) => api.get('/products', { params }),
  getById:  (id)     => api.get(`/products/${id}`),
  // Admin
  getAllAdmin: ()              => api.get('/products/admin/all'),
  create:      (data)         => api.post('/products/admin', data),
  update:      (id, data)     => api.put(`/products/admin/${id}`, data),
  remove:      (id)           => api.delete(`/products/admin/${id}`),
};

// ── Pedidos ───────────────────────────────────────────────────
export const ordersAPI = {
  create:   (data) => api.post('/orders', data),
  getAll:   ()     => api.get('/orders'),
  getById:  (id)   => api.get(`/orders/${id}`),
  // Admin
  getAllAdmin:    ()             => api.get('/orders/admin/all'),
  updateStatus:  (id, status)   => api.patch(`/orders/admin/${id}/status`, { status }),
};

// ── Health ────────────────────────────────────────────────────
export const checkHealth = () => api.get('/health').then((r) => r.data);

export default api;

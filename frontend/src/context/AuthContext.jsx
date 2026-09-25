import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // evita flash de "no logueado"

  // Al montar: si hay token en localStorage, recupera el usuario
  useEffect(() => {
    const token = localStorage.getItem('nm-token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        // Token inválido o expirado — limpiar
        localStorage.removeItem('nm-token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('nm-token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nm-token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

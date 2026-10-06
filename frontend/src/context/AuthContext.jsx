import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'nm-token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState(null);

  // Guarda la sesión: token en localStorage y usuario en el estado
  const saveSession = useCallback((userData, newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  // Limpia la sesión completa (localStorage + estado)
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Al montar: si hay token en localStorage, recupera el usuario
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    authAPI.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => clearSession()) // Token inválido o expirado
      .finally(() => setLoading(false));
  }, [clearSession]);

  // Si la API responde 401 con la app abierta, cierra la sesión también en el estado
  useEffect(() => {
    window.addEventListener('nm:unauthorized', clearSession);
    return () => window.removeEventListener('nm:unauthorized', clearSession);
  }, [clearSession]);

  // login({ email, password }): llama a la API y guarda la sesión.
  // Si falla, lanza el error para que la página lo muestre.
  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    saveSession(data.user, data.token);
    return data.user;
  }, [saveSession]);

  // register({ name, email, password }): crea la cuenta y deja la sesión iniciada.
  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    saveSession(data.user, data.token);
    return data.user;
  }, [saveSession]);

  const logout = clearSession;

  const clearFlash = () => setFlashMessage(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, isAdmin, loading, flashMessage, setFlashMessage, clearFlash }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

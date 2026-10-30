import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Modo único: light. Limpiar cualquier preferencia guardada anteriormente.
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('nm-theme');

    const meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', '#F6F8FD');
  }, []);

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}

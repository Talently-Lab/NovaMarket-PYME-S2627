import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hace scroll al top cada vez que cambia la ruta
export default function RouteScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

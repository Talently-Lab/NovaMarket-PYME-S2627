import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE = 'NovaMarket';
const TITLES = [
  ['/catalogo/', 'Detalle de producto'],
  ['/catalogo', 'Catálogo'],
  ['/carrito', 'Carrito'],
  ['/checkout', 'Checkout'],
  ['/pedido-confirmado', 'Pedido confirmado'],
  ['/mis-pedidos', 'Mis pedidos'],
  ['/login', 'Iniciar sesión'],
  ['/registro', 'Crear cuenta'],
  ['/olvide-contrasena', 'Recuperar contraseña'],
  ['/restablecer-contrasena', 'Restablecer contraseña'],
  ['/terminos', 'Términos y condiciones'],
  ['/privacidad', 'Política de privacidad'],
  ['/ayuda/seguimiento', 'Seguimiento de pedidos'],
  ['/ayuda/faq', 'Preguntas frecuentes'],
  ['/ayuda/garantias', 'Garantías y devoluciones'],
  ['/ayuda/contacto', 'Contacto'],
  ['/admin', 'Panel de administración'],
];

export default function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/') { document.title = `${BASE} — Gear para gamers`; return; }
    const hit = TITLES.find(([p]) => pathname === p || pathname.startsWith(p));
    document.title = hit ? `${hit[1]} · ${BASE}` : `Página no encontrada · ${BASE}`;
  }, [pathname]);
  return null;
}

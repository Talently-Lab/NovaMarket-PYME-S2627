import { Link } from 'react-router-dom';
import logo2 from '../../assets/logo2.jpg';

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5
               2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01
               a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34
               6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  );
}

const FOOTER_LINKS = {
  categorias: [
    { label: 'Periféricos & Teclados',  to: '/catalogo?categoria=periféricos' },
    { label: 'Audio & Auriculares',      to: '/catalogo?categoria=audio'       },
    { label: 'Accesorios para PC',       to: '/catalogo?categoria=accesorios'  },
    { label: 'Lanzamientos & Ofertas',   to: '/catalogo'                       },
  ],
  ayuda: [
    { label: 'Seguimiento de pedidos',   to: '/mis-pedidos'  },
    { label: 'Centro de ayuda FAQ',      to: '/faq'          },
    { label: 'Garantías y devoluciones', to: '/devoluciones' },
    { label: 'Contacto con ventas',      to: '/contacto'     },
  ],
  legal: [
    { label: 'Términos y condiciones',   to: '/terminos'    },
    { label: 'Política de privacidad',   to: '/privacidad'  },
    { label: 'Gestión de cookies',       to: '/privacidad'  },
    { label: 'Aviso legal de operaciones', to: '/terminos'  },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">

        {/* Grid principal */}
        <div className="footer__grid">

          {/* Columna Brand */}
          <div className="footer__brand-col">
            <Link to="/" className="footer__logo" aria-label="NovaMarket inicio">
              <img src={logo2} alt="Nova Market" className="footer__logo-img" />
            </Link>
            <p className="footer__tagline">
              Plataforma líder en distribución de accesorios tecnológicos, periféricos de alto rendimiento y gadgets de vanguardia.
            </p>
            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                className="footer__social-link" aria-label="X (Twitter)">
                <XIcon />
              </a>
            </div>
          </div>

          {/* Columna Categorías */}
          <div className="footer__nav-col">
            <h4 className="footer__nav-title">Categorías</h4>
            <ul className="footer__nav-list">
              {FOOTER_LINKS.categorias.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="footer__nav-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Ayuda */}
          <div className="footer__nav-col">
            <h4 className="footer__nav-title">Ayuda y Soporte</h4>
            <ul className="footer__nav-list">
              {FOOTER_LINKS.ayuda.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="footer__nav-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Legal */}
          <div className="footer__nav-col">
            <h4 className="footer__nav-title">Legal y Políticas</h4>
            <ul className="footer__nav-list">
              {FOOTER_LINKS.legal.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="footer__nav-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} NovaMarket. Todos los derechos reservados.
          </p>
          <p className="footer__copy">
            Creado por el equipo de Nova Market
          </p>
        </div>

      </div>
    </footer>
  );
}

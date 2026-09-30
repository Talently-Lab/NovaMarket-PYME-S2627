import { Link } from 'react-router-dom';

// Íconos SVG inline — sin dependencias
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5
               2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01
               a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34
               6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744
               l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// Logos de medios de pago como SVG simplificados
function VisaIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" aria-label="Visa" role="img">
      <rect width="38" height="24" rx="4" fill="currentColor" opacity="0.08"/>
      <text x="19" y="16" textAnchor="middle" fontSize="11" fontWeight="800"
        fontFamily="Arial,sans-serif" fill="currentColor" letterSpacing="-0.5">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" aria-label="Mastercard" role="img">
      <rect width="38" height="24" rx="4" fill="currentColor" opacity="0.08"/>
      <circle cx="14" cy="12" r="7" fill="#EB001B" opacity="0.9"/>
      <circle cx="24" cy="12" r="7" fill="#F79E1B" opacity="0.9"/>
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" opacity="0.9"/>
    </svg>
  );
}

function MercadoPagoIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" aria-label="Mercado Pago" role="img">
      <rect width="38" height="24" rx="4" fill="currentColor" opacity="0.08"/>
      <text x="19" y="10" textAnchor="middle" fontSize="5.5" fontWeight="700"
        fontFamily="Arial,sans-serif" fill="#00BCFF">MERCADO</text>
      <text x="19" y="17" textAnchor="middle" fontSize="5.5" fontWeight="700"
        fontFamily="Arial,sans-serif" fill="#00BCFF">PAGO</text>
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" aria-label="American Express" role="img">
      <rect width="38" height="24" rx="4" fill="currentColor" opacity="0.08"/>
      <text x="19" y="16" textAnchor="middle" fontSize="8" fontWeight="800"
        fontFamily="Arial,sans-serif" fill="#2671B5">AMEX</text>
    </svg>
  );
}

const FOOTER_LINKS = {
  tienda: [
    { label: 'Catálogo', to: '/catalogo' },
    { label: 'Ofertas', to: '/catalogo?oferta=true' },
    { label: 'Novedades', to: '/catalogo?orden=nuevo' },
    { label: 'Gaming', to: '/catalogo?categoria=gaming' },
  ],
  empresa: [
    { label: 'Nosotros', to: '/nosotros' },
    { label: 'Contacto', to: '/contacto' },
    { label: 'Preguntas frecuentes', to: '/faq' },
    { label: 'Seguimiento de pedido', to: '/mis-pedidos' },
  ],
  legal: [
    { label: 'Términos y condiciones', to: '/terminos' },
    { label: 'Política de privacidad', to: '/privacidad' },
    { label: 'Política de devoluciones', to: '/devoluciones' },
  ],
};

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: <InstagramIcon /> },
  { label: 'TikTok',    href: 'https://tiktok.com',    icon: <TikTokIcon /> },
  { label: 'X',         href: 'https://x.com',         icon: <TwitterXIcon /> },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">

            {/* Columna 1 — Brand */}
            <div className="footer__brand-col">
              <Link to="/" className="footer__logo">
                Nova<span>Market</span>
              </Link>
              <p className="footer__tagline">
                Accesorios, periféricos y gadgets tech para tu setup ideal.
              </p>
              <div className="footer__social">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social-link"
                    aria-label={label}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Columna 2 — Tienda */}
            <div className="footer__nav-col">
              <h4 className="footer__nav-title">Tienda</h4>
              <ul className="footer__nav-list">
                {FOOTER_LINKS.tienda.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="footer__nav-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3 — Empresa */}
            <div className="footer__nav-col">
              <h4 className="footer__nav-title">Empresa</h4>
              <ul className="footer__nav-list">
                {FOOTER_LINKS.empresa.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="footer__nav-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 4 — Legal */}
            <div className="footer__nav-col">
              <h4 className="footer__nav-title">Legal</h4>
              <ul className="footer__nav-list">
                {FOOTER_LINKS.legal.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="footer__nav-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar — medios de pago + copyright */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p className="footer__copy">
              © {new Date().getFullYear()} NovaMarket PYME. Todos los derechos reservados.
            </p>
            <div className="footer__payments" aria-label="Medios de pago aceptados">
              <MercadoPagoIcon />
              <VisaIcon />
              <MastercardIcon />
              <AmexIcon />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          Nova<span>Market</span>
        </div>
        <p className="footer__copy">
          © {new Date().getFullYear()} NovaMarket PYME. Todos los derechos reservados.
        </p>
        <nav aria-label="Footer" style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/catalogo"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
          >
            Catálogo
          </Link>
          <Link
            to="/login"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
          >
            Ingresar
          </Link>
        </nav>
      </div>
    </footer>
  );
}

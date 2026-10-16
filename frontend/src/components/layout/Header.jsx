import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/',                               label: 'Home',        test: (p, s) => p === '/' },
  { to: '/catalogo',                       label: 'Catálogo',    test: (p, s) => p === '/catalogo' && !new URLSearchParams(s).get('categoria') },
  { to: '/catalogo?categoria=periféricos', label: 'Periféricos', test: (p, s) => p === '/catalogo' && new URLSearchParams(s).get('categoria') === 'periféricos' },
  { to: '/catalogo?categoria=gadgets',     label: 'Gadgets',     test: (p, s) => p === '/catalogo' && new URLSearchParams(s).get('categoria') === 'gadgets' },
  { to: '/catalogo?categoria=audio',       label: 'Audio',       test: (p, s) => p === '/catalogo' && new URLSearchParams(s).get('categoria') === 'audio' },
  { to: '/catalogo',                       label: 'Ofertas',     test: () => false },
];

export default function Header() {
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); closeMenu(); };

  return (
    <header className="header">

      {/* ── BANNER PROMO — fondo lima #D2EE42 ── */}
      <div className="header__promo-bar">
        <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod.</span>
      </div>

      {/* ── HEADER TOP — logo | nav centrado | controles ── */}
      <div className="header__top">
        <div className="header__top-inner">

          {/* Logo */}
          <Link to="/" className="header__logo" onClick={closeMenu}>
            <img src="/images/logotipo-dark.png" alt="Nova Market" className="header__logo-img" />
          </Link>

          {/* Nav centrada */}
          <nav className="header__nav-center" aria-label="Navegación principal">
            {NAV_LINKS.map(({ to, label, test }) => (
              <Link key={label} to={to}
                className={`header__nav-link${test(location.pathname, location.search) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Controles */}
          <div className="header__actions">
            {isAdmin && (
              <Link to="/admin" className="header__admin-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <Link to="/mis-pedidos" className="header__account-link">
                <UserIcon /><span>{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link to="/login" className="header__account-link">
                <UserIcon /><span>Mi Cuenta</span>
              </Link>
            )}
            <Link to="/carrito"
              className="header__account-link header__cart-link"
              aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} productos` : ' vacío'}`}
            >
              <div className="header__cart-icon-wrapper">
                <CartIcon />
                {totalItems > 0 && (
                  <span className="header__cart-badge" aria-hidden="true">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span>Carrito</span>
            </Link>
            {isAuthenticated && (
              <button onClick={handleLogout} className="header__logout-btn">Salir</button>
            )}
            <button
              className={`header__hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>

      {/* ── DRAWER MOBILE ── */}
      <nav id="mobile-nav"
        className={`header__mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map(({ to, label, test }) => (
          <Link key={label} to={to}
            className={test(location.pathname, location.search) ? 'active' : ''}
            onClick={closeMenu}
          >{label}</Link>
        ))}
        <Link to="/carrito" className="header__mobile-cart-link" onClick={closeMenu}>
          <div className="header__cart-icon-wrapper">
            <CartIcon />
            {totalItems > 0 && (
              <span className="header__cart-badge" aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          Carrito {totalItems > 0 ? `(${totalItems})` : ''}
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/mis-pedidos" className="header__mobile-nav-link" onClick={closeMenu}>Mis pedidos</Link>
            {isAdmin && <Link to="/admin" className="header__mobile-nav-link" onClick={closeMenu}>Panel Admin</Link>}
            <button onClick={handleLogout} className="header__mobile-btn header__mobile-btn--secondary">Cerrar sesión</button>
          </>
        ) : (
          <Link to="/login" className="header__mobile-btn header__mobile-btn--primary" onClick={closeMenu}>Ingresar</Link>
        )}
      </nav>
    </header>
  );
}

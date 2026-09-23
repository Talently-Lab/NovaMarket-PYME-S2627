import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ThemeToggle from '../ui/ThemeToggle';

// Icono carrito SVG inline
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/',         label: 'Inicio',   end: true },
  { to: '/catalogo', label: 'Catálogo', end: false },
];

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo" onClick={closeMenu}>
          Nova<span>Market</span>
        </Link>

        {/* Nav desktop */}
        <nav className="header__nav" aria-label="Navegación principal">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Acciones */}
        <div className="header__actions">
          <ThemeToggle />

          {/* Carrito */}
          <Link
            to="/carrito"
            className="header__cart-btn"
            aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} productos` : ' vacío'}`}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="header__cart-badge" aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Login (desktop) */}
          <Link to="/login" className="btn btn--primary btn--sm">
            Ingresar
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className={`header__hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Nav mobile */}
      <nav
        id="mobile-nav"
        className={`header__mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
        <Link to="/login" className="btn btn--primary" onClick={closeMenu}>
          Ingresar
        </Link>
      </nav>
    </header>
  );
}

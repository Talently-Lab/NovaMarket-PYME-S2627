import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

// Icono carrito SVG inline — carrito de compras (ShoppingCart)
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

// Icono usuario SVG inline
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
  { to: '/',         label: 'Inicio',     end: true  },
  { to: '/catalogo', label: 'Catálogo',   end: false },
  { to: '/catalogo?categoria=periféricos', label: 'Periféricos', end: false },
  { to: '/catalogo?categoria=gadgets',     label: 'Gadgets',     end: false },
  { to: '/catalogo?categoria=audio',       label: 'Audio',       end: false },
  { to: '/catalogo?categoria=accesorios',  label: 'Ofertas',     end: false },
];

export default function Header() {
  const { itemCount } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <header className="header">

      {/* ── TOP BAR ── */}
      <div className="header__top">
        <div className="header__top-inner">

          {/* Logo */}
          <Link to="/" className="header__logo" onClick={closeMenu}>
            <img src={logoImg} alt="Nova Market" className="header__logo-img" />
          </Link>

          {/* Acciones desktop */}
          <div className="header__actions">

            {/* Chip Admin */}
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

            {/* Mi cuenta */}
            {isAuthenticated ? (
              <Link to="/mis-pedidos" className="header__account-link">
                <UserIcon />
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link to="/login" className="header__account-link">
                <UserIcon />
                <span>Mi Cuenta</span>
              </Link>
            )}

            {/* Carrito */}
            <Link
              to="/carrito"
              className="header__account-link"
              aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} productos` : ' vacío'}`}
            >
              <div className="header__cart-icon-wrapper">
                <CartIcon />
                {itemCount > 0 && (
                  <span className="header__cart-badge" aria-hidden="true">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span>Carrito</span>
            </Link>

            {/* Salir */}
            {isAuthenticated && (
              <button onClick={handleLogout} className="header__logout-btn">
                Salir
              </button>
            )}

            {/* Hamburger */}
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

      {/* ── NAV BAR SECUNDARIA (verde lima) ── */}
      <nav className="header__nav-bar" aria-label="Navegación principal">
        <div className="header__nav-inner">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `header__nav-link${isActive ? ' active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── DRAWER MOBILE ── */}
      <nav
        id="mobile-nav"
        className={`header__mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}

        {isAuthenticated ? (
          <>
            <Link to="/mis-pedidos" className="header__mobile-nav-link" onClick={closeMenu}>
              Mis pedidos
            </Link>
            {isAdmin && (
              <Link to="/admin" className="header__mobile-nav-link" onClick={closeMenu}>
                Panel Admin
              </Link>
            )}
            <button onClick={handleLogout} className="header__mobile-btn header__mobile-btn--secondary">
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="header__mobile-btn header__mobile-btn--primary" onClick={closeMenu}>
            Ingresar
          </Link>
        )}
      </nav>
    </header>
  );
}

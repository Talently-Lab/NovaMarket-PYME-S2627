import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../services/productService';

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
  { to: '/',                               label: 'Inicio',      test: (p, s) => p === '/' },
  { to: '/catalogo',                       label: 'Notebooks',   test: (p, s) => p === '/catalogo' && !new URLSearchParams(s).get('categoria') },
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [showSug, setShowSug] = useState(false);
  const [activeSug, setActiveSug] = useState(-1);
  const [productNames, setProductNames] = useState([]);
  const searchRef = useRef(null);
  const location = useLocation();
  // Foco automático al abrir buscador mobile
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); closeMenu(); };

  // Carga los nombres de productos una sola vez al montar
  useEffect(() => {
    getProducts(undefined, { limit: 200 })
      .then(({ products }) => setProductNames(products.map(p => p.name)))
      .catch(() => {});
  }, []);

  // Sugerencias filtradas
  const suggestions = (() => {
    const term = headerSearch.trim().toLowerCase();
    if (term.length < 2) return [];
    return [...new Set(
      productNames.filter(n => n.toLowerCase().includes(term))
    )].slice(0, 6);
  })();

  const selectSuggestion = useCallback((name) => {
    setHeaderSearch('');
    setShowSug(false);
    setActiveSug(-1);
    navigate(`/catalogo?q=${encodeURIComponent(name)}`);
  }, [navigate]);

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const q = headerSearch.trim();
    if (!q) return;
    setShowSug(false);
    navigate(`/catalogo?q=${encodeURIComponent(q)}`);
    setHeaderSearch('');
  };

  const handleSearchKeyDown = (e) => {
    if (!showSug || suggestions.length === 0) {
      if (e.key === 'Enter') handleHeaderSearch(e);
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSug(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSug(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeSug >= 0) selectSuggestion(suggestions[activeSug]); else handleHeaderSearch(e); }
    else if (e.key === 'Escape') { setShowSug(false); setActiveSug(-1); }
  };

  return (
    <header className="header">

      {/* ── BANNER PROMO — fondo lima #D2EE42 ── */}
      <div className="header__promo-bar">
        <span>Promociones exclusivas en productos seleccionados + envío gratis en compras superiores a $70.000</span>
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

          {/* Buscador global */}
          <form className="header__search" onSubmit={handleHeaderSearch} role="search" ref={searchRef}>
            <button type="submit" className="header__search-btn" aria-label="Buscar">
              <img src="/images/iconos/search-white.svg" alt="" width="16" height="16" />
            </button>
            <input
              className="header__search-input"
              type="search"
              placeholder="Buscar productos..."
              value={headerSearch}
              onChange={e => { setHeaderSearch(e.target.value); setShowSug(true); setActiveSug(-1); }}
              onFocus={() => setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Buscar productos"
              aria-autocomplete="list"
              aria-expanded={showSug && suggestions.length > 0}
              autoComplete="off"
            />
            {showSug && suggestions.length > 0 && (
              <ul className="header__search-suggestions" role="listbox">
                {suggestions.map((name, i) => (
                  <li
                    key={name}
                    role="option"
                    aria-selected={i === activeSug}
                    className={`header__search-suggestion${i === activeSug ? ' header__search-suggestion--active' : ''}`}
                    onMouseDown={() => selectSuggestion(name)}
                  >
                    <img src="/images/iconos/search-white.svg" alt="" width="12" height="12" style={{ flexShrink: 0, opacity: 0.5 }} />
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </form>

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
                <UserIcon />
              </Link>
            ) : (
              <Link to="/login" className="header__account-link">
                <UserIcon />
              </Link>
            )}
            {/* Favoritos */}
            <Link to="/catalogo" className="header__account-link header__wishlist-link" aria-label="Mis favoritos">
              <img src="/images/iconos/fav-white.svg" alt="" width="20" height="19" />
            </Link>
            {/* Lupa mobile — solo visible en ≤768px */}
            <button
              className="header__mobile-search-toggle"
              onClick={() => setMobileSearchOpen(o => !o)}
              aria-label={mobileSearchOpen ? 'Cerrar buscador' : 'Abrir buscador'}
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
            </button>
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

      {/* ── BUSCADOR MOBILE EXPANDIBLE — aparece debajo del header al tocar la lupa ── */}
      {mobileSearchOpen && (
        <form
          className="header__mobile-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const q = headerSearch.trim();
            if (!q) return;
            setShowSug(false);
            navigate(`/catalogo?q=${encodeURIComponent(q)}`);
            setHeaderSearch('');
            setMobileSearchOpen(false);
          }}
          role="search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" className="header__mobile-search-bar-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={mobileSearchInputRef}
            className="header__mobile-search-bar-input"
            type="search"
            placeholder="Buscar productos..."
            value={headerSearch}
            onChange={e => setHeaderSearch(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setMobileSearchOpen(false)}
            aria-label="Buscar productos"
            autoComplete="off"
          />
          <button type="submit" className="header__mobile-search-bar-btn" aria-label="Buscar">
            Ir
          </button>
        </form>
      )}

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

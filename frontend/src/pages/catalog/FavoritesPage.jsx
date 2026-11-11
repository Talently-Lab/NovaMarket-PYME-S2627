import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RouteTitle from '../../components/ui/RouteTitle';
import ProductCard from '../../components/ui/ProductCard';
import { getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';

const WL_KEY = 'nm-wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; }
}

export default function FavoritesPage() {
  const { addItem, items } = useCart();
  const [wishlistIds, setWishlistIds] = useState(() => getWishlist());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de productos
  useEffect(() => {
    const ids = getWishlist();
    if (ids.length === 0) { setLoading(false); return; }
    setLoading(true);
    getProducts(undefined, { limit: 500 })
      .then(({ products: all }) => {
        const strIds = ids.map(String);
        setProducts(all.filter(p => strIds.includes(String(p.id))));
      })
      .catch(() => setError('No se pudieron cargar los favoritos.'))
      .finally(() => setLoading(false));
  }, []);

  // Polling para detectar cambios de wishlist en la misma pestaña
  // (ProductCard escribe en localStorage pero no dispara el evento storage)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getWishlist();
      const currentStr = JSON.stringify(current.map(String).sort());
      const prevStr = JSON.stringify(wishlistIds.map(String).sort());
      if (currentStr !== prevStr) {
        setWishlistIds(current);
        setProducts(prev => prev.filter(p => current.map(String).includes(String(p.id))));
      }
    }, 300);
    return () => clearInterval(interval);
  }, [wishlistIds]);

  // Sincronización entre pestañas
  useEffect(() => {
    const sync = () => {
      const current = getWishlist();
      setWishlistIds(current);
      setProducts(prev => prev.filter(p => current.map(String).includes(String(p.id))));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleAddToCart = (product) => {
    addItem(product);
  };

  const isAdded = (product) => {
    const cartItem = items.find(i => String(i.id) === String(product.id));
    return cartItem ? cartItem.qty >= 1 : false;
  };

  const cartQty = (product) => {
    const cartItem = items.find(i => String(i.id) === String(product.id));
    return cartItem ? cartItem.qty : 0;
  };

  return (
    <div className="favorites-page">
      <RouteTitle />

      <div className="favorites-page__header">
        <Link to="/catalogo" className="favorites-page__back">
          ← Seguir explorando
        </Link>
        <h1 className="favorites-page__title">
          Mis Favoritos
          {!loading && wishlistIds.length > 0 && (
            <span className="favorites-page__count">
              ({products.length} {products.length === 1 ? 'producto' : 'productos'})
            </span>
          )}
        </h1>
      </div>

      {loading && (
        <div className="favorites-page__loading" aria-live="polite" role="status">
          <div className="favorites-page__spinner" aria-hidden="true" />
          <span>Cargando favoritos…</span>
        </div>
      )}

      {!loading && error && (
        <div className="favorites-page__error" role="alert">
          <p>{error}</p>
          <Link to="/catalogo" className="favorites-page__cta-btn">Ver catálogo</Link>
        </div>
      )}

      {!loading && !error && wishlistIds.length === 0 && (
        <div className="favorites-empty">
          <div className="favorites-empty__icon" aria-hidden="true">
            <img src="/images/iconos/fav-purple.svg" alt="" width="64" height="64" />
          </div>
          <p className="favorites-empty__text">Todavía no guardaste ningún producto</p>
          <p className="favorites-empty__sub">Tocá el corazón en cualquier producto para guardarlo aquí.</p>
          <Link to="/catalogo" className="favorites-page__cta-btn">Explorar productos</Link>
        </div>
      )}

      {!loading && !error && wishlistIds.length > 0 && products.length === 0 && (
        <div className="favorites-empty">
          <div className="favorites-empty__icon" aria-hidden="true">
            <img src="/images/iconos/fav-purple.svg" alt="" width="64" height="64" />
          </div>
          <p className="favorites-empty__text">Tus productos guardados ya no están disponibles</p>
          <Link to="/catalogo" className="favorites-page__cta-btn">Explorar productos</Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="favorites-page__grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={handleAddToCart}
              added={isAdded(product)}
              cartQty={cartQty(product)}
              variant="catalog"
            />
          ))}
        </div>
      )}
    </div>
  );
}

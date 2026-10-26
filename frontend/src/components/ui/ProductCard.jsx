import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage } from '../../utils/productImage';

// ── Rating mockeado por seed (consistente por producto) ───────
function seededRating(id) {
  const x = Math.sin(Number(id) * 9301 + 49297) * 233280;
  const r = x - Math.floor(x);
  return (3.5 + r * 1.5).toFixed(1); // entre 3.5 y 5.0
}
function seededReviews(id) {
  const x = Math.sin(Number(id) * 6271 + 28411) * 134456;
  const r = x - Math.floor(x);
  return Math.floor(5 + r * 120); // entre 5 y 125
}

// ── Badge por producto ────────────────────────────────────────
function getBadge(product) {
  if (product.stock === 0) return null;
  const id = Number(product.id);
  // Precio anterior simulado: si id es par y > 10, hay descuento
  if (product.original_price && product.original_price > product.price) {
    const pct = Math.round((1 - product.price / product.original_price) * 100);
    return { label: `${pct}% OFF`, type: 'discount' };
  }
  if (id % 7 === 0) return { label: 'Más vendido', type: 'bestseller' };
  if (id > 25)      return { label: 'Nuevo',       type: 'new' };
  return null;
}

// ── Íconos ────────────────────────────────────────────────────
function CartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? '#E247FD' : 'none'}
      stroke={filled ? '#E247FD' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

// ── Wishlist helpers ──────────────────────────────────────────
const WL_KEY = 'nm-wishlist';
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; }
}
function toggleWishlist(id) {
  const wl = getWishlist();
  const next = wl.includes(id) ? wl.filter(i => i !== id) : [...wl, id];
  localStorage.setItem(WL_KEY, JSON.stringify(next));
  return next.includes(id);
}

/**
 * Tarjeta de producto del catálogo.
 * Props: product, onAdd, added, cartQty
 */
export function ProductCard({ product, onAdd, added, cartQty = 0 }) {
  const inStock     = product.stock > 0;
  const stockAgotado = !inStock || cartQty >= product.stock;
  const rating      = seededRating(product.id);
  const reviews     = seededReviews(product.id);
  const badge       = getBadge(product);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const [wishlisted, setWishlisted] = useState(() => getWishlist().includes(product.id));
  useEffect(() => { setWishlisted(getWishlist().includes(product.id)); }, [product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(toggleWishlist(product.id));
  };

  return (
    <article className="catalog-card">

      {/* ── Imagen + badge + wishlist ── */}
      <div className="catalog-card__image-wrapper">
        <Link to={`/catalogo/${product.id}`} className="catalog-card__image-link" tabIndex={-1}>
          <div className="catalog-card__image">
            <img
              src={getProductImage(product)}
              alt={product.name}
              loading="lazy"
              className="catalog-card__img"
            />
          </div>
        </Link>

        {badge && (
          <span className={`catalog-card__badge catalog-card__badge--${badge.type}`}>
            {badge.label}
          </span>
        )}

        <button
          className={`catalog-card__wishlist${wishlisted ? ' catalog-card__wishlist--active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          aria-pressed={wishlisted}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>

      {/* ── Cuerpo ── */}
      <div className="catalog-card__body">
        <Link to={`/catalogo/${product.id}`} className="catalog-card__title-link">
          <h3 className="catalog-card__title">{product.name}</h3>
        </Link>
        {product.category && <span className="catalog-card__category">{product.category}</span>}

        {/* Rating */}
        <div className="catalog-card__rating" aria-label={`${rating} de 5 estrellas, ${reviews} opiniones`}>
          <span className="catalog-card__stars" aria-hidden="true">★</span>
          <span className="catalog-card__rating-num">{rating}</span>
          <span className="catalog-card__rating-count">({reviews})</span>
        </div>

        <p className="catalog-card__desc">{product.description}</p>
        <Link to={`/catalogo/${product.id}`} className="catalog-card__detail-link">
          Ver detalle
        </Link>
      </div>

      {/* ── Footer: precio + carrito ── */}
      <div className="catalog-card__footer">
        <div className="catalog-card__price-block">
          <span className="catalog-card__price">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          {hasDiscount && (
            <span className="catalog-card__price-original">
              ${Number(product.original_price).toLocaleString('es-AR')}
            </span>
          )}
          {discountPct && (
            <span className="catalog-card__discount-pct">-{discountPct}%</span>
          )}
        </div>

        {stockAgotado ? (
          <span className="catalog-card__no-stock">Sin stock</span>
        ) : (
          <button
            className={`catalog-card__add-btn${added ? ' catalog-card__add-btn--added' : ''}`}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAdd(product); }}
            disabled={added}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <CartIcon />
            )}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;

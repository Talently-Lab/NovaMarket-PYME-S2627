import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { getProductImage } from '../../utils/productImage';

// ── Rating mockeado por seed ──────────────────────────────────
function seededRating(id) {
  const x = Math.sin(Number(id) * 9301 + 49297) * 233280;
  const r = x - Math.floor(x);
  return (3.5 + r * 1.5).toFixed(1);
}
function seededReviews(id) {
  const x = Math.sin(Number(id) * 6271 + 28411) * 134456;
  const r = x - Math.floor(x);
  return Math.floor(5 + r * 120);
}

// ── Colores de badge por categoría (Kit UI Figma) ─────────────
const CATEGORY_BADGE_COLORS = {
  'Teclados':    { bg: '#F37E1D', text: '#000000' },
  'Accesorios':  { bg: '#1DF357', text: '#000000' },
  'Iluminación': { bg: '#F8F39E', text: '#000000' },
  'Audio':       { bg: '#10C71C', text: '#FFFFFF' },
  'Periféricos': { bg: '#10C7B4', text: '#FFFFFF' },
  'Notebooks':   { bg: '#107EC7', text: '#FFFFFF' },
  'Monitores':   { bg: '#8A10C7', text: '#FFFFFF' },
  'Celulares':   { bg: '#DC38F1', text: '#FFFFFF' },
  'Gadgets':     { bg: '#F13851', text: '#FFFFFF' },
  'Gaming':      { bg: '#D2EE42', text: '#000000' },
};

function getBadge(product) {
  if (product.stock === 0) return null;
  const id = Number(product.id);
  // Primero: badge de categoría del Kit UI Figma
  const cat = product.category;
  if (cat && CATEGORY_BADGE_COLORS[cat]) {
    return { label: cat, ...CATEGORY_BADGE_COLORS[cat] };
  }
  // Segundo: descuento si tiene precio anterior
  if (product.original_price && product.original_price > product.price) {
    const pct = Math.round((1 - product.price / product.original_price) * 100);
    return { label: `${pct}% OFF`, bg: '#E247FD', text: '#FFFFFF' };
  }
  // Tercero: más vendido
  if (id % 7 === 0) return { label: 'Más vendido', bg: '#050506', text: '#D2EE42' };
  return null;
}

// ── Estrellas ─────────────────────────────────────────────────
function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  return (
    <span className="pc-stars" aria-hidden="true">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`pc-star${i <= full ? ' pc-star--full' : i === full + 1 && half ? ' pc-star--half' : ''}`}>★</span>
      ))}
    </span>
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
 * Tarjeta de producto unificada.
 * variant: 'catalog' (default) | 'home'
 */
export function ProductCard({ product, onAdd, added, cartQty = 0, variant = 'catalog' }) {
  const inStock      = product.stock > 0;
  const stockAgotado = !inStock || cartQty >= product.stock;
  const rating       = parseFloat(seededRating(product.id));
  const reviews      = seededReviews(product.id);
  const badge        = getBadge(product);
  const hasDiscount  = product.original_price && product.original_price > product.price;
  const discountPct  = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : null;

  const [wishlisted, setWishlisted] = useState(() => getWishlist().includes(product.id));
  useEffect(() => { setWishlisted(getWishlist().includes(product.id)); }, [product.id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(toggleWishlist(product.id));
  };

  const rootClass = variant === 'home' ? 'prod-card' : 'catalog-card';

  return (
    <article className={rootClass}>

      {/* ── Imagen + badge + wishlist ── */}
      <div className="pc-image-wrapper">
        <Link to={`/catalogo/${product.id}`} className="pc-image-link" tabIndex={-1}>
          <div className="pc-image">
            <img
              src={getProductImage(product)}
              alt={product.name}
              loading="lazy"
              className="pc-img"
            />
          </div>
        </Link>

        {badge && (
          <span className="pc-badge" style={{ background: badge.bg, color: badge.text }}>
            {badge.label}
          </span>
        )}

        <button
          className={`pc-wishlist${wishlisted ? ' pc-wishlist--active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          aria-pressed={wishlisted}
        >
          <img
            src={wishlisted ? '/images/iconos/fav.svg' : '/images/iconos/fav-black.svg'}
            alt=""
            width="18"
            height="17"
          />
        </button>
      </div>

      {/* ── Cuerpo ── */}
      <div className="pc-body">
        <Link to={`/catalogo/${product.id}`} className="pc-title-link">
          <h3 className="pc-title">{product.name}</h3>
        </Link>

        <p className="pc-desc">{product.description}</p>

        {/* Rating — después del texto, 5 estrellas */}
        <div className="pc-rating" aria-label={`${rating} de 5 estrellas, ${reviews} opiniones`}>
          <Stars rating={rating} />
          <span className="pc-rating-num">{rating}</span>
          <span className="pc-rating-count">({reviews})</span>
        </div>
      </div>

      {/* ── Footer: precio + carrito ── */}
      <div className="pc-footer">
        <div className="pc-price-block">
          <span className="pc-price">
            {formatearPrecio(product.price)}
          </span>
          {hasDiscount && (
            <span className="pc-price-original">
              {formatearPrecio(product.original_price)}
            </span>
          )}
          {discountPct && (
            <span className="pc-discount-pct">-{discountPct}%</span>
          )}
        </div>

        {stockAgotado ? (
          <span className="pc-no-stock">Sin stock</span>
        ) : (
          <button
            className={`pc-add-btn${added ? ' pc-add-btn--added' : ''}`}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAdd(product); }}
            disabled={added}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;

import { Link } from 'react-router-dom';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { getProductImage } from '../../utils/productImage';

// ── Icono carrito (inline SVG) ────────────────────────────────
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

/**
 * Tarjeta de producto del catálogo.
 * - product: objeto del producto ({ id, name, description, price, stock, ... })
 * - onAdd(product): se llama al tocar el botón del carrito
 * - added: true durante el feedback «agregado» (deshabilita el botón)
 * - cartQty: unidades de este producto que ya están en el carrito (para detectar el tope de stock)
 */
// ── Tarjeta de producto ───────────────────────────────────────
export function ProductCard({ product, onAdd, added, cartQty = 0 }) {
  const inStock = product.stock > 0;
  const stockAgotado = !inStock || cartQty >= product.stock;

  return (
    <article className="catalog-card">
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

      <div className="catalog-card__body">
        <Link to={`/catalogo/${product.id}`} className="catalog-card__title-link">
          <h3 className="catalog-card__title">{product.name}</h3>
        </Link>
        {product.category && <span className="catalog-card__category">{product.category}</span>}
        <p className="catalog-card__desc">{product.description}</p>
        <Link to={`/catalogo/${product.id}`} className="catalog-card__detail-link">
          Ver detalle
        </Link>
      </div>

      <div className="catalog-card__footer">
        <span className="catalog-card__price">
          {formatearPrecio(product.price)}
        </span>
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

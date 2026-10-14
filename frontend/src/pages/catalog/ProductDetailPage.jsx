import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductById, getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ui/ProductCard';
import { getProductImage } from '../../utils/productImage';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

const TABS = [
  { id: 'description', label: 'Descripción completa' },
  { id: 'specs',       label: 'Especificaciones' },
  { id: 'reviews',     label: 'Opiniones' },
];

const RELATED_LIMIT = 4;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');
  const [added,   setAdded]     = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab]           = useState('description');
  const [related, setRelated]   = useState([]);
  const [relatedAdded, setRelatedAdded] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setQuantity(1);
    setTab('description');
    getProductById(id)
      .then(setProduct)
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Producto no encontrado.');
        } else {
          setError('No se pudo cargar el producto. Intentá de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Productos relacionados: misma categoría, sin el actual. Si falla, la sección no se muestra.
  useEffect(() => {
    if (!product?.category) return undefined;
    let cancelled = false;
    getProducts(product.category, { limit: RELATED_LIMIT + 1 })
      .then(({ products }) => { if (!cancelled) setRelated(products); })
      .catch(() => { if (!cancelled) setRelated([]); });
    return () => { cancelled = true; };
  }, [product]);

  // Se arma al renderizar: sin el producto actual y solo si tiene categoría
  const relatedItems = product?.category
    ? related.filter((p) => p.id !== product.id).slice(0, RELATED_LIMIT)
    : [];

  const cartQty    = cartItems.find(i => i.id === product?.id)?.quantity ?? 0;
  const inStock    = (product?.stock ?? 0) > 0;
  const stockAgotado = !inStock || cartQty >= (product?.stock ?? 0);
  // Unidades que todavía se pueden sumar (stock menos lo que ya está en el carrito)
  const available  = Math.max((product?.stock ?? 0) - cartQty, 0);
  const qty        = Math.min(Math.max(quantity, 1), Math.max(available, 1));

  const handleAdd = () => {
    if (!product || stockAgotado) return;
    addItem(product, qty);
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1500);
  };

  // «Comprar ahora»: suma la cantidad elegida y lleva directo al checkout
  const handleBuyNow = () => {
    if (!product || stockAgotado) return;
    addItem(product, qty);
    navigate('/checkout');
  };

  const handleAddRelated = (item) => {
    addItem(item);
    setRelatedAdded(item.id);
    setTimeout(() => setRelatedAdded(null), 1500);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="product-detail product-detail--state">
        <div className="catalog-state__spinner" aria-label="Cargando producto" />
        <p>Cargando producto…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="product-detail product-detail--state">
        <p className="form-error">{error || 'Producto no encontrado.'}</p>
        <button className="btn btn--secondary" onClick={() => navigate('/catalogo')}>
          ← Volver al catálogo
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="product-detail container">

      {/* Breadcrumb */}
      <nav className="product-detail__breadcrumb" aria-label="Ruta de navegación">
        <Link to="/" className="product-detail__breadcrumb-link">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link to="/catalogo" className="product-detail__breadcrumb-link">Catálogo</Link>
        <span aria-hidden="true"> / </span>
        <span className="product-detail__breadcrumb-current">{product.name}</span>
      </nav>

      {/* Botón volver */}
      <button
        className="product-detail__back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon /> Volver
      </button>

      {/* Layout principal */}
      <div className="product-detail__layout">

        {/* Imagen */}
        <motion.div
          className="product-detail__image-wrapper"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="product-detail__image"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          className="product-detail__info"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          {/* Categoría */}
          {product.category && (
            <Link
              to={`/catalogo?categoria=${product.category}`}
              className="product-detail__category"
            >
              {product.category}
            </Link>
          )}

          {/* Nombre */}
          <h1 className="product-detail__name">{product.name}</h1>

          {/* Precio */}
          <p className="product-detail__price">
            ${fmt(product.price)}
          </p>

          {/* Descripción */}
          {product.description && (
            <p className="product-detail__description">{product.description}</p>
          )}

          {/* Stock */}
          <div className="product-detail__stock">
            {stockAgotado ? (
              <span className="product-detail__stock--out">Sin stock</span>
            ) : (
              <span className="product-detail__stock--in">
                ✓ Disponible ({available} unidad{available !== 1 ? 'es' : ''} en stock)
                {available <= 5 && (
                  <span className="product-detail__stock--low"> — ¡últimas unidades!</span>
                )}
              </span>
            )}
          </div>

          {stockAgotado ? (
            <span className="catalog-card__no-stock product-detail__no-stock">
              Sin stock
            </span>
          ) : (
            <div className="product-detail__purchase">
              {/* Cantidad */}
              <div className="product-detail__qty">
                <span className="product-detail__qty-label" id="detail-qty-label">Cantidad:</span>
                <div className="product-detail__qty-control" role="group" aria-labelledby="detail-qty-label">
                  <button
                    type="button"
                    className="product-detail__qty-btn"
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    disabled={qty <= 1}
                    aria-label="Restar una unidad"
                  >
                    −
                  </button>
                  <output className="product-detail__qty-value" aria-live="polite">{qty}</output>
                  <button
                    type="button"
                    className="product-detail__qty-btn"
                    onClick={() => setQuantity((q) => Math.min(q + 1, available))}
                    disabled={qty >= available}
                    aria-label="Sumar una unidad"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="product-detail__actions">
                <motion.button
                  className={`btn btn--lg product-detail__add-btn${added ? ' product-detail__add-btn--added' : ''}`}
                  onClick={handleAdd}
                  disabled={added}
                  whileHover={!added ? { scale: 1.02 } : {}}
                  whileTap={!added ? { scale: 0.97 } : {}}
                >
                  {added ? <><CheckIcon /> Agregado al carrito</> : <><CartIcon /> Agregar al carrito</>}
                </motion.button>
                <motion.button
                  className="btn btn--primary btn--lg product-detail__buy-btn"
                  onClick={handleBuyNow}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(210,238,66,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Comprar ahora
                </motion.button>
              </div>
            </div>
          )}

          {/* Volver al catálogo */}
          <Link to="/catalogo" className="product-detail__catalog-link">
            ← Ver todos los productos
          </Link>
        </motion.div>
      </div>

      {/* Pestañas: descripción, especificaciones y opiniones */}
      <section className="product-detail__tabs" aria-label="Información del producto">
        <div className="product-detail__tablist" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`detail-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`detail-panel-${t.id}`}
              className={`product-detail__tab${tab === t.id ? ' product-detail__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="product-detail__tabpanel"
          role="tabpanel"
          id={`detail-panel-${tab}`}
          aria-labelledby={`detail-tab-${tab}`}
        >
          {tab === 'description' && (
            <p>{product.description || 'Este producto todavía no tiene una descripción.'}</p>
          )}

          {tab === 'specs' && (
            <dl className="product-detail__specs">
              {product.category && (
                <div><dt>Categoría</dt><dd>{product.category}</dd></div>
              )}
              <div><dt>Disponibilidad</dt><dd>{inStock ? `${product.stock} unidades en stock` : 'Sin stock'}</dd></div>
              <div><dt>Precio</dt><dd>${fmt(product.price)}</dd></div>
              <div><dt>Código de producto</dt><dd>#{product.id}</dd></div>
            </dl>
          )}

          {tab === 'reviews' && (
            <p>Todavía no hay opiniones para este producto.</p>
          )}
        </div>
      </section>

      {/* Productos relacionados */}
      {relatedItems.length > 0 && (
        <section className="product-detail__related" aria-labelledby="detail-related-title">
          <h2 className="product-detail__related-title" id="detail-related-title">Productos relacionados</h2>
          <div className="product-detail__related-grid">
            {relatedItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAdd={handleAddRelated}
                added={relatedAdded === item.id}
                cartQty={cartItems.find((i) => i.id === item.id)?.quantity ?? 0}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');
  const [added,   setAdded]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    productsAPI.getById(id)
      .then(({ data }) => setProduct(data.product))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Producto no encontrado.');
        } else {
          setError('No se pudo cargar el producto. Intentá de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const cartQty    = cartItems.find(i => i.id === product?.id)?.quantity ?? 0;
  const inStock    = (product?.stock ?? 0) > 0;
  const stockAgotado = !inStock || cartQty >= (product?.stock ?? 0);

  const handleAdd = () => {
    if (!product || stockAgotado) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
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
                ✓ En stock
                {product.stock <= 5 && (
                  <span className="product-detail__stock--low">
                    {' '}— quedan {product.stock - cartQty} unidad{product.stock - cartQty !== 1 ? 'es' : ''}
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Botón agregar */}
          {stockAgotado ? (
            <span className="catalog-card__no-stock product-detail__no-stock">
              Sin stock
            </span>
          ) : (
            <motion.button
              className={`btn btn--primary btn--lg product-detail__add-btn${added ? ' product-detail__add-btn--added' : ''}`}
              onClick={handleAdd}
              disabled={added}
              whileHover={!added ? { scale: 1.02, boxShadow: '0 8px 28px rgba(210,238,66,0.35)' } : {}}
              whileTap={!added ? { scale: 0.97 } : {}}
            >
              {added ? <><CheckIcon /> Agregado al carrito</> : <><CartIcon /> Agregar al carrito</>}
            </motion.button>
          )}

          {/* Volver al catálogo */}
          <Link to="/catalogo" className="product-detail__catalog-link">
            ← Ver todos los productos
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

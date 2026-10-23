import { useEffect, useState, useRef, useCallback } from 'react';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductById, getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/productImage';


// ── Reviews mockeadas ────────────────────────────────────────
const R_NAMES = ['Martín G.','Sofía R.','Lucas P.','Valentina M.','Diego F.','Camila T.','Nicolás B.','Laura S.','Andrés H.','Florencia V.'];
const R_TEXTS = [
  'Excelente producto, superó mis expectativas. La calidad es muy buena y llegó en perfectas condiciones.',
  'Muy buena relación calidad-precio. Lo recomiendo sin dudarlo.',
  'Funciona perfecto, exactamente como dice la descripción. Muy conforme con la compra.',
  'Llegó rápido y bien empacado. El producto es sólido y de buena calidad.',
  'Buena compra. La construcción se siente robusta y el rendimiento es el esperado.',
  'Lo compré con dudas pero quedé muy satisfecho. Vale cada peso.',
  'Producto de primera. Se nota la calidad desde que lo sacás de la caja.',
  'Todo bien, cumple con lo prometido. Lo usé varios días y funciona impecable.',
  'Muy satisfecho con la compra. La atención también fue excelente.',
  'Increíble la calidad para el precio. Sin dudas lo volvería a comprar.',
];
function seededRand(seed, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.abs(Math.floor((x - Math.floor(x)) * max));
}
function generateReviews(productId) {
  const id    = parseInt(productId) || 1;
  const count = 3 + seededRand(id * 7, 4);
  const avg   = 3.5 + seededRand(id * 3, 10) / 5.5;
  return Array.from({ length: count }, (_, i) => ({
    id:       i,
    name:     R_NAMES[seededRand(id * (i+2) * 13, R_NAMES.length)],
    rating:   Math.min(5, Math.round(avg - 0.5 + seededRand(id * (i+5), 2))),
    text:     R_TEXTS[seededRand(id * (i+3) * 7, R_TEXTS.length)],
    date:     new Date(Date.now() - seededRand(id*(i+1)*11, 90) * 86400000)
                .toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' }),
    verified: seededRand(id*(i+4)*5, 3) > 0,
  }));
}

// Componente estrellas
function Stars({ rating, size = 16 }) {
  return (
    <span className="pd-stars" aria-label={`${rating} de 5 estrellas`}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= rating ? '#F59E0B' : 'none'}
          stroke={s <= rating ? '#F59E0B' : '#D4D4D4'}
          strokeWidth="1.5" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}


// ── Icono carrito ────────────────────────────────────────────
function CartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

// ── Specs enriquecidas por categoria ─────────────────────────
function buildSpecs(product) {
  const base = [
    product.brand    && { label: 'Marca',      value: product.brand    },
    product.model    && { label: 'Modelo',      value: product.model    },
    product.category && { label: 'Categoría',   value: product.category },
  ];

  // Specs inferidas del nombre/descripcion — e-commerce profesional
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const extra = [];

  // Color
  const colors = ['negro','blanco','gris','plata','dorado','verde','azul','rojo','rosa','violeta'];
  const foundColor = colors.find(c => name.includes(c) || desc.includes(c));
  if (foundColor) extra.push({ label: 'Color', value: foundColor.charAt(0).toUpperCase() + foundColor.slice(1) });

  // Conectividad
  if (name.includes('inalámbri') || desc.includes('inalámbri') || name.includes('wireless')) {
    extra.push({ label: 'Conectividad', value: 'Inalámbrico (USB + Bluetooth)' });
  } else if (name.includes('usb') || desc.includes('usb-c')) {
    extra.push({ label: 'Conectividad', value: desc.includes('usb-c') ? 'USB-C' : 'USB-A' });
  }

  // RGB
  if (name.includes('rgb') || desc.includes('rgb')) {
    extra.push({ label: 'Iluminación', value: 'RGB personalizable' });
  }

  // Garantia estandar
  extra.push({ label: 'Garantía',   value: '12 meses oficial' });
  extra.push({ label: 'Condición',  value: 'Nuevo — sellado de fábrica' });
  extra.push({ label: 'Envío',      value: 'Envío gratis a todo el país' });

  // Stock
  if (product.stock != null) {
    extra.push({ label: 'Disponibilidad', value: `${product.stock} unidades en almacén` });
  }

  return [...base, ...extra].filter(Boolean);
}

// ── Hook lupa separada ───────────────────────────────────────
const ZOOM_FACTOR = 3;

function useLens() {
  const [active, setActive] = useState(false);
  const [pos,    setPos]    = useState({ x: 0, y: 0 });   // px dentro del contenedor
  const [pct,    setPct]    = useState({ x: 50, y: 50 }); // % para background-position
  const containerRef        = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top,  rect.height));
    setPos({ x, y });
    setPct({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  return { active, setActive, pos, pct, containerRef, handleMouseMove };
}

// ── Componente principal ──────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();

  const [product,   setProduct]   = useState(null);
  const [related,   setRelated]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [qty,       setQty]       = useState(1);
  const [added,     setAdded]     = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [reviews,   setReviews]   = useState([]);
  const [addedRelated, setAddedRelated] = useState({});

  const { active: zoomActive, setActive: setZoomActive, pos: lensPos, pct: lensPct, containerRef, handleMouseMove } = useLens();

  useEffect(() => {
    setLoading(true);
    setError('');
    setQty(1);
    setActiveImg(0);
    setZoomActive(false);
    getProductById(id)
      .then(p => {
        setProduct(p);
        setReviews(generateReviews(id));
        // Relacionados en paralelo — si falla no rompe la pagina
        getProducts(p.category, { order: 'newest' })
          .then(({ products }) => {
            setRelated(products.filter(r => String(r.id) !== String(id)).slice(0, 4));
          })
          .catch(() => setRelated([]));
      })
      .catch(err => {
        console.error('Error cargando producto:', err);
        setError(err.response?.status === 404 ? 'Producto no encontrado.' : 'No se pudo cargar el producto. Intentá de nuevo.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const cartQty    = cartItems.find(i => i.id === product?.id)?.quantity ?? 0;
  const stock      = product?.stock ?? 0;
  const stockAgotado = stock === 0 || cartQty >= stock;
  const maxQty     = Math.max(0, stock - cartQty);

  const handleAdd = () => {
    if (!product || stockAgotado) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuy = () => {
    if (!product || stockAgotado) return;
    addItem(product);
    setTimeout(() => navigate('/carrito'), 300);
  };

  const handleAddRelated = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(p);
    setAddedRelated(prev => ({ ...prev, [p.id]: true }));
    setTimeout(() => setAddedRelated(prev => ({ ...prev, [p.id]: false })), 1500);
  };

  if (loading) return (
    <div className="pd-state">
      <div className="catalog-state__spinner" aria-label="Cargando" />
      <p>Cargando producto…</p>
    </div>
  );

  if (error || !product) return (
    <div className="pd-state">
      <p style={{ color: '#ef4444' }}>{error || 'Producto no encontrado.'}</p>
      <button className="btn btn--secondary" onClick={() => navigate('/catalogo')}>← Volver al catálogo</button>
    </div>
  );

  const imgSrc = getProductImage(product);
  const thumbs = [imgSrc, imgSrc, imgSrc, imgSrc];
  const specs  = buildSpecs(product);

  return (
    <div className="pd-page">

      {/* ── Breadcrumb ── */}
      <div className="pd-breadcrumb-area">
        <nav className="pd-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/" className="pd-breadcrumb__link">Inicio</Link>
          <span className="pd-breadcrumb__sep">/</span>
          <Link to="/catalogo" className="pd-breadcrumb__link pd-breadcrumb__link--pink">Catálogo</Link>
          {product.category && (
            <>
              <span className="pd-breadcrumb__sep">/</span>
              <Link to={`/catalogo?categoria=${product.category}`} className="pd-breadcrumb__link pd-breadcrumb__link--violet">
                {product.category}
              </Link>
            </>
          )}
          <span className="pd-breadcrumb__sep">/</span>
          <span className="pd-breadcrumb__current">{product.name}</span>
        </nav>
      </div>

      {/* ── Main ── */}
      <div className="pd-main">
        <div className="pd-detail-main">

          {/* Image block con LUPA SEPARADA */}
          <div className="pd-image-block">
            <div className="pd-image-lens-wrapper">
              <motion.div
                className="pd-image-main"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleMouseMove}
                ref={containerRef}
              >
                <img
                  src={thumbs[activeImg]}
                  alt={product.name}
                  className="pd-image-main__img"
                />
                {zoomActive && (
                  <div className="pd-lens-square" style={{ left: lensPos.x - 60, top: lensPos.y - 60 }} />
                )}
                {!zoomActive && (
                  <div className="pd-zoom-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    Zoom
                  </div>
                )}
              </motion.div>

              {zoomActive && (
                <div
                  className="pd-lens-panel"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(${thumbs[activeImg]})`,
                    backgroundSize: `${ZOOM_FACTOR * 100}%`,
                    backgroundPosition: `${lensPct.x}% ${lensPct.y}%`,
                  }}
                />
              )}
            </div>

            <div className="pd-thumbnails">
              {thumbs.map((src, i) => (
                <button key={i}
                  className={`pd-thumb${activeImg === i ? ' pd-thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Purchase block */}
          <motion.div className="pd-purchase-block"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <div className="pd-header-meta">
              {product.category && (
                <p className="pd-category">{product.category.toUpperCase()}</p>
              )}
              <h1 className="pd-name">{product.name}</h1>
              <div className="pd-price-row">
                <span className="pd-price">{formatearPrecio(product.price)}</span>
                {product.original_price && (
                  <span className="pd-price-original">{formatearPrecio(product.original_price)}</span>
                )}
              </div>
            </div>

            <hr className="pd-divider" />

            {product.description && <p className="pd-description">{product.description}</p>}

            {specs.length > 0 && (
              <div className="pd-specs">
                {specs.map(({ label, value }) => (
                  <div key={label} className="pd-spec-row">
                    <span className="pd-spec-label">{label}</span>
                    <span className="pd-spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pd-stock">
              <span className={`pd-stock__dot${stockAgotado ? ' pd-stock__dot--out' : ''}`} />
              <span className="pd-stock__text">
                {stockAgotado ? 'Sin stock'
                  : stock <= 5 ? `Últimas ${stock} unidades en almacén`
                  : `Disponible (${stock} unidades en almacén)`}
              </span>
            </div>

            <div className="pd-buy-actions">
              <div className="pd-qty-row">
                <span className="pd-qty-label">Cantidad:</span>
                <div className="pd-qty-selector">
                  <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q-1))} disabled={qty<=1} aria-label="Restar">−</button>
                  <span className="pd-qty-num">{qty}</span>
                  <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(maxQty, q+1))} disabled={qty>=maxQty} aria-label="Sumar">+</button>
                </div>
              </div>
              <div className="pd-action-btns">
                <button className="pd-btn-add" onClick={handleAdd} disabled={stockAgotado||added}>
                  {added ? '✓ Agregado' : 'Agregar al carrito'}
                </button>
                <button className="pd-btn-buy" onClick={handleBuy} disabled={stockAgotado}>
                  Comprar ahora
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="pd-tabs-area">
        <div className="pd-tabs-header">
          {['descripcion','especificaciones','opiniones'].map(tab => (
            <button key={tab}
              className={`pd-tab${activeTab===tab?' pd-tab--active':''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'descripcion' ? 'Descripción completa' : tab === 'especificaciones' ? 'Especificaciones' : `Opiniones (${reviews.length})`}
            </button>
          ))}
        </div>
        <div className="pd-tab-content">
          {activeTab === 'descripcion' && (
            <p className="pd-tab-text">{product.description || 'Sin descripción disponible.'}</p>
          )}
          {activeTab === 'especificaciones' && (
            <div className="pd-specs-full">
              {specs.length > 0
                ? specs.map(({ label, value }) => (
                  <div key={label} className="pd-spec-row pd-spec-row--light">
                    <span className="pd-spec-label">{label}</span>
                    <span className="pd-spec-value">{value}</span>
                  </div>
                ))
                : <p className="pd-tab-text">Sin especificaciones.</p>
              }
            </div>
          )}
          {activeTab === 'opiniones' && (
            <div className="pd-reviews">
              {/* Resumen */}
              <div className="pd-reviews__summary">
                <div className="pd-reviews__avg">
                  <span className="pd-reviews__avg-num">
                    {(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1)}
                  </span>
                  <Stars rating={Math.round(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length)} size={20}/>
                  <span className="pd-reviews__count">{reviews.length} opiniones</span>
                </div>
                {/* Barras por estrella */}
                <div className="pd-reviews__bars">
                  {[5,4,3,2,1].map(s => {
                    const cnt = reviews.filter(r=>r.rating===s).length;
                    const pct = Math.round((cnt/reviews.length)*100);
                    return (
                      <div key={s} className="pd-reviews__bar-row">
                        <Stars rating={s} size={12}/>
                        <div className="pd-reviews__bar-track">
                          <div className="pd-reviews__bar-fill" style={{width:`${pct}%`}}/>
                        </div>
                        <span className="pd-reviews__bar-pct">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <hr className="pd-reviews__divider"/>
              {/* Lista */}
              <div className="pd-reviews__list">
                {reviews.map(r => (
                  <div key={r.id} className="pd-review">
                    <div className="pd-review__header">
                      <div className="pd-review__avatar">{r.name.charAt(0)}</div>
                      <div className="pd-review__meta">
                        <div className="pd-review__name-row">
                          <span className="pd-review__name">{r.name}</span>
                          {r.verified && <span className="pd-review__verified">✓ Compra verificada</span>}
                        </div>
                        <Stars rating={r.rating} size={14}/>
                      </div>
                      <span className="pd-review__date">{r.date}</span>
                    </div>
                    <p className="pd-review__text">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Productos relacionados CON botón carrito ── */}
      {related.length > 0 && (
        <div className="pd-related">
          <h2 className="pd-related__title">Productos Relacionados</h2>
          <div className="pd-related__grid">
            {related.map(p => {
              const rQty       = cartItems.find(i => i.id === p.id)?.quantity ?? 0;
              const rAgotado   = p.stock === 0 || rQty >= p.stock;
              const rAdded     = addedRelated[p.id];
              return (
                <Link key={p.id} to={`/catalogo/${p.id}`} className="pd-related-card">
                  <div className="pd-related-card__img-wrap">
                    <img src={getProductImage(p)} alt={p.name} loading="lazy" />
                  </div>
                  <div className="pd-related-card__body">
                    <p className="pd-related-card__name">{p.name}</p>
                    <div className="pd-related-card__footer">
                      <p className="pd-related-card__price">{formatearPrecio(p.price)}</p>
                      {rAgotado ? (
                        <span className="pd-related-card__no-stock">Sin stock</span>
                      ) : (
                        <motion.button
                          className={`prod-card__add${rAdded ? ' prod-card__add--done' : ''}`}
                          onClick={(e) => handleAddRelated(p, e)}
                          disabled={rAdded}
                          aria-label={`Agregar ${p.name} al carrito`}
                          whileHover={!rAdded ? { scale: 1.1 } : {}}
                          whileTap={!rAdded ? { scale: 0.9 } : {}}
                        >
                          {rAdded
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="20 6 9 17 4 12" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : <CartIcon />
                          }
                        </motion.button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';

// ── Categorias con iconos SVG reales del diseno Figma ────────────────────────
const CATEGORIES = [
  { icon: '/images/iconos/ico_gaming.svg',     name: 'Gaming',      slug: 'gaming'      },
  { icon: '/images/iconos/ico_notebooks.svg',  name: 'Notebooks',   slug: 'notebooks'   },
  { icon: '/images/iconos/ico_celulares.svg',  name: 'Celulares',   slug: 'celulares'   },
  { icon: '/images/iconos/ico_audio.svg',      name: 'Audio',       slug: 'audio'       },
  { icon: '/images/iconos/ico_gadgets.svg',    name: 'Gadgets',     slug: 'gadgets'     },
];

export default function HomePage() {
  const { addItem, items: cartItems } = useCart();
  const { flashMessage, clearFlash } = useAuth();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [added, setAdded]           = useState(null);

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(clearFlash, 4000);
    return () => clearTimeout(t);
  }, [flashMessage]);

  useEffect(() => {
    getProducts(undefined, { order: 'newest' })
      .then(({ products }) => setProducts(products.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div>
      {/* Toast bienvenida */}
      {flashMessage && (
        <div className="toast toast--success" role="alert" aria-live="polite">
          <span>{flashMessage}</span>
          <button className="toast__close" onClick={clearFlash} aria-label="Cerrar">✕</button>
        </div>
      )}

      {/* ── HERO — imagen de fondo completa ── */}
      <section className="hero-full">
        <img
          src="/images/Estación gamer futurista en neón.png"
          alt="Setup tecnológico NovaMarket"
          className="hero-full__bg"
        />
        <div className="hero-full__overlay" />
        <div className="hero-full__content container">
          <motion.h1
            className="hero-full__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Tecnología que<br />simplifica tu vida
          </motion.h1>
          <motion.p
            className="hero-full__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Descubrí nuestra selección de gadgets, periféricos y accesorios
            diseñados para optimizar tu espacio de trabajo y setup diario.
          </motion.p>
          <motion.div
            className="hero-full__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
              <Link to="/catalogo" className="btn btn--primary btn--hero">
                Explorar productos
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
              <Link to="/catalogo?categoria=gaming" className="btn btn--secondary btn--hero">
                Ver Gaming
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="categories-section">
        <div className="categories-section__inner container">
          <div className="categories-section__header">
            <h2 className="categories-section__title">Categorías Principales</h2>
            <Link to="/catalogo" className="categories-section__link">
              Ver todo <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(({ icon, name, slug }) => (
              <motion.div
                key={name}
                className="category-card-wrapper"
                whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(125,28,226,0.18)' }}
                whileTap={{ scale: 0.97 }}
                style={{ borderRadius: 24 }}
              >
                <Link to={`/catalogo?categoria=${slug}`} className="category-card">
                  <div className="category-card__icon-ring">
                    <img src={icon} alt={name} className="category-card__icon-svg" width="36" height="36" />
                  </div>
                  <span className="category-card__name">{name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section className="featured-section">
        <div className="featured-section__inner">
          <div className="featured-section__header">
            <h2 className="featured-section__title">Productos Destacados</h2>
            <Link to="/catalogo" className="featured-section__link">Ver todos →</Link>
          </div>

          {loading && <p className="featured-section__state">Cargando productos...</p>}
          {!loading && products.length === 0 && (
            <p className="featured-section__state">No hay productos disponibles aún.</p>
          )}

          {!loading && products.length > 0 && (
            <div className="featured-grid">
              {products.map((product) => {
                const cartQty      = cartItems.find(i => i.id === product.id)?.quantity ?? 0;
                const stockAgotado = product.stock === 0 || cartQty >= product.stock;
                return (
                  <motion.div
                    key={product.id}
                    className="featured-card"
                    whileHover={{ y: -8, boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="featured-card__image">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        loading="lazy"
                        className="featured-card__img"
                      />
                    </div>
                    <div className="featured-card__body">
                      <p className="featured-card__name">{product.name}</p>
                      <div className="featured-card__footer">
                        <span className="featured-card__price">
                          ${Number(product.price).toLocaleString('es-AR')}
                        </span>
                        {stockAgotado ? (
                          <span className="catalog-card__no-stock">Sin stock</span>
                        ) : (
                          <motion.button
                            className={`featured-card__add-btn${added === product.id ? ' featured-card__add-btn--added' : ''}`}
                            onClick={() => handleAdd(product)}
                            disabled={added === product.id}
                            aria-label={`Agregar ${product.name} al carrito`}
                            whileHover={added !== product.id ? { scale: 1.12 } : {}}
                            whileTap={added !== product.id ? { scale: 0.92 } : {}}
                          >
                            {added === product.id ? (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" stroke="#050506" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="9" cy="21" r="1" stroke="#050506" strokeWidth="2"/>
                                <circle cx="20" cy="21" r="1" stroke="#050506" strokeWidth="2"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="#050506" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="promo-banner">
        <div className="promo-banner__inner container">
          <div className="promo-banner__images">
            <img src="/images/Banner/Banner-Triptico_1.png" alt="Banner NovaMarket 1" className="promo-banner__img" />
            <img src="/images/Banner/Banner-Triptico_2.png" alt="Banner NovaMarket 2" className="promo-banner__img" />
            <img src="/images/Banner/Banner-Triptico_3.png" alt="Banner NovaMarket 3" className="promo-banner__img" />
          </div>
        </div>
      </section>
    </div>
  );
}

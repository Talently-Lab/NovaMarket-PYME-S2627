import { Link, useSearchParams } from 'react-router-dom';
import { formatearPrecio } from '../utils/formatearPrecio';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/productImage';
import { useReveal } from '../hooks/useReveal';
import BannerTriptico from '../components/ui/BannerTriptico';

// Categorias exactas del Figma — Notebooks featured (violeta), Celulares sin duplicar
const CATEGORIES = [
  { icon: '/images/iconos/ico_gaming.svg',    name: 'Gaming',    slug: 'gaming',    featured: false },
  { icon: '/images/iconos/ico_notebooks.svg', name: 'Notebooks', slug: 'notebooks', featured: false },
  { icon: '/images/iconos/ico_celulares.svg', name: 'Celulares', slug: 'celulares', featured: false },
  { icon: '/images/iconos/ico_audio.svg',     name: 'Audio',     slug: 'audio',     featured: false },
  { icon: '/images/iconos/ico_gadgets.svg',   name: 'Gadgets',   slug: 'gadgets',   featured: false },
];

// SVG carrito para producto destacado
function CartSVG() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="#000000" strokeWidth="1.43" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

export default function HomePage() {
  const { addItem, items: cartItems } = useCart();
  const [searchParams] = useSearchParams();
  const activeSlug = searchParams.get('categoria') ?? '';
  const { flashMessage, clearFlash }  = useAuth();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [added, setAdded]             = useState(null);

  // Reveal refs
  const [heroRef,       heroVis]       = useReveal({ threshold: 0.1 });
  const [catHeaderRef,  catHeaderVis]  = useReveal({ threshold: 0.2 });
  const [catGridRef] = useReveal({ threshold: 0.15 });
  const [featHeaderRef, featHeaderVis] = useReveal({ threshold: 0.2 });
  const [featGridRef] = useReveal({ threshold: 0.1 });
  const [bannerRef,     bannerVis]     = useReveal({ threshold: 0.15 });

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(clearFlash, 4000);
    return () => clearTimeout(t);
  }, [flashMessage]);

  useEffect(() => {
    getProducts(undefined, { order: 'newest' })
      .then(({ products }) => setProducts(products.slice(0, 5)))
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
      {flashMessage && (
        <div className="toast toast--success" role="alert" aria-live="polite">
          <span>{flashMessage}</span>
          <button className="toast__close" onClick={clearFlash} aria-label="Cerrar">✕</button>
        </div>
      )}

      {/* ── HERO — imagen + texto superpuesto (Figma: GROUP position absolute) ── */}
      <section className={`hero-figma reveal${heroVis ? " is-visible" : ""}`} ref={heroRef}>
        <img
          src="/images/Estación gamer futurista en neón.png"
          alt="Setup tecnológico NovaMarket"
          className="hero-figma__bg"
        />
        <div className="hero-figma__text">
          <motion.h1 className="hero-figma__title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
          >
            TECNOLOGÍA QUE SIMPLIFICA TU VIDA
          </motion.h1>
          <motion.p className="hero-figma__subtitle"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22,1,0.36,1] }}
          >
            Todo lo que necesitás, en un solo lugar
          </motion.p>
          <motion.div className="hero-figma__ctas"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.22,1,0.36,1] }}
          >
            <Link to="/catalogo" className="hero-figma__btn-primary">Explorar Catálogo</Link>
            <Link to="/login" className="hero-figma__btn-secondary">Login</Link>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORÍAS — fondo blanco, exacto del Figma ── */}
      <section className="categories-figma">
        <div className={`categories-figma__header reveal${catHeaderVis ? " is-visible" : ""}`} ref={catHeaderRef}>
          <div className="categories-figma__label-row">
            <span className="categories-figma__label-bar" aria-hidden="true" />
            <span className="categories-figma__label">CATEGORÍAS PRINCIPALES</span>
          </div>
          <Link to="/catalogo" className="categories-figma__link">
            Ver todas las categorías →
          </Link>
        </div>
        <div className="categories-figma__grid">
          <div className={`categories-figma__title-col reveal--left${catHeaderVis ? " is-visible" : ""}`}>
            <h2 className="categories-figma__title">TODO LO QUE NECESITÁS</h2>
          </div>
          <div className={`categories-figma__cards`} ref={catGridRef}>
            {CATEGORIES.map(({ icon, name, slug }) => (
              <motion.div key={name}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(125,28,226,0.15)' }}
                whileTap={{ scale: 0.97 }}
                style={{ borderRadius: 24, flex: '1 1 0', minWidth: 0 }}
              >
                <Link to={`/catalogo?categoria=${slug}`}
                  className={`cat-card${activeSlug === slug ? ' cat-card--featured' : ''}`}
                >
                  <img src={icon} alt={name} className="cat-card__icon" width="48" height="40" />
                  <span className="cat-card__name">{name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS — fondo #050506 ── */}
      <section className="featured-figma">
        <div className={`featured-figma__header reveal${featHeaderVis ? " is-visible" : ""}`} ref={featHeaderRef}>
          <h2 className="featured-figma__title">Productos Destacados</h2>
          <Link to="/catalogo" className="featured-figma__link">Ver todos los productos →</Link>
        </div>
        {loading && <p className="featured-figma__state">Cargando productos...</p>}
        {!loading && products.length === 0 && (
          <p className="featured-figma__state">No hay productos disponibles aún.</p>
        )}
        {!loading && products.length > 0 && (
          <div className={`featured-figma__grid`} ref={featGridRef}>
            {products.map((product) => {
              const cartQty      = cartItems.find(i => i.id === product.id)?.quantity ?? 0;
              const stockAgotado = product.stock === 0 || cartQty >= product.stock;
              return (
                <motion.div key={product.id} className="prod-card"
                  whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={`/catalogo/${product.id}`} className="prod-card__link" aria-label={`Ver detalle de ${product.name}`}>
                    <div className="prod-card__image-wrap">
                      <img src={getProductImage(product)} alt={product.name}
                        loading="lazy" className="prod-card__img" />
                    </div>
                    <div className="prod-card__body">
                      <div className="prod-card__meta">
                        <p className="prod-card__name">{product.name}</p>
                        <p className="prod-card__desc">{product.description}</p>
                      </div>
                      <div className="prod-card__footer">
                        <span className="prod-card__price">
                          {formatearPrecio(product.price)}
                        </span>
                        {stockAgotado ? (
                          <span className="prod-card__no-stock">Sin stock</span>
                        ) : (
                          <motion.button
                            className={`prod-card__add${added === product.id ? ' prod-card__add--done' : ''}`}
                            onClick={(e) => { e.preventDefault(); handleAdd(product); }}
                            disabled={added === product.id}
                            aria-label={`Agregar ${product.name} al carrito`}
                            whileHover={added !== product.id ? { scale: 1.1 } : {}}
                            whileTap={added !== product.id ? { scale: 0.92 } : {}}
                          >
                            {added === product.id ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : <CartSVG />}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── BANNER TRIPTICO ── */}
      <BannerTriptico className={`reveal${bannerVis ? " is-visible" : ""}`} innerRef={bannerRef} />
    </div>
  );
}

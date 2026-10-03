import { Link } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import audifonosImg from '../assets/audifonos.png';
import { getProductImage } from '../utils/productImage';

// Three.js cargado de forma lazy para no bloquear el bundle inicial
const HeroParticles = lazy(() => import('../components/ui/HeroParticles'));

// ── Variantes Framer Motion ───────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const heroTitle = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const heroWord = {
  hidden:  { opacity: 0, y: 40, rotateX: -20 },
  visible: { opacity: 1, y: 0,  rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const tagVariant = {
  hidden:  { opacity: 0, x: 30 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.6 + i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

// ── Hook scroll reveal ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return [ref, inView];
}

const CATEGORIES = [
  { icon: 'accessory', name: 'Accesorios',  slug: 'accesorios' },
  { icon: 'peripheral', name: 'Periféricos', slug: 'periféricos' },
  { icon: 'gadget',    name: 'Gadgets',     slug: 'gadgets'    },
  { icon: 'audio',     name: 'Audio',       slug: 'audio'      },
  { icon: 'gaming',    name: 'Gaming',      slug: 'gaming'     },
];

// Íconos SVG por categoría — estilo stroke moderno (line icons, 1.8px, rounded caps)
const CATEGORY_ICONS = {
  accessory: ({ color }) => (
    // Mouse con rueda de scroll
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.686 2 6 4.686 6 8v8c0 3.314 2.686 6 6 6s6-2.686 6-6V8c0-3.314-2.686-6-6-6Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="2" x2="12" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 7v3" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  peripheral: ({ color }) => (
    // Teclado con teclas
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="13" rx="2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gadget: ({ color }) => (
    // Smartphone / gadget
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="17.5" r="1" fill={color}/>
      <line x1="9" y1="6" x2="15" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  audio: ({ color }) => (
    // Auriculares over-ear
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14V11a8 8 0 0 1 16 0v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 14a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 14a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  gaming: ({ color }) => (
    // Gamepad / control
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 8H7L4.5 15A3.5 3.5 0 0 0 8 19.5c1.2 0 2.3-.6 3-1.5h2c.7.9 1.8 1.5 3 1.5a3.5 3.5 0 0 0 3.5-4.5L17 8Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12v3M7.5 13.5h3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="15.5" cy="12" r=".8" fill={color}/>
      <circle cx="17" cy="13.8" r=".8" fill={color}/>
    </svg>
  ),
};

function CategoryIcon({ type, featured }) {
  const color = featured ? '#FEFEFE' : '#7D1CE2';
  const Icon = CATEGORY_ICONS[type];
  return Icon ? <Icon color={color} /> : null;
}

export default function HomePage() {
  const { addItem } = useCart();
  const { flashMessage, clearFlash } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);

  const [catRef,      catInView]      = useScrollReveal();
  const [featRef,     featInView]     = useScrollReveal();
  const [promoRef,    promoInView]    = useScrollReveal();

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(clearFlash, 4000);
    return () => clearTimeout(t);
  }, [flashMessage]);

  useEffect(() => {
    productsAPI.getAll({ order: 'newest' })
      .then(({ data }) => setProducts(data.products.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const titleWords = 'Tecnología que simplifica tu vida'.split(' ');

  return (
    <div>
      {/* Toast */}
      {flashMessage && (
        <div className="toast toast--success" role="alert" aria-live="polite">
          <span>{flashMessage}</span>
          <button className="toast__close" onClick={clearFlash} aria-label="Cerrar">✕</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero" style={{ position: 'relative' }}>

        {/* Fondo Three.js — cargado lazy */}
        <Suspense fallback={null}>
          <HeroParticles />
        </Suspense>

        <div className="hero__inner container" style={{ position: 'relative', zIndex: 1 }}>

          {/* Columna texto con animaciones stagger */}
          <motion.div
            className="hero__content"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Título palabra por palabra */}
            <motion.h1 className="hero__title" variants={heroTitle} initial="hidden" animate="visible" style={{ perspective: 600 }}>
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={heroWord}
                  style={{ display: 'inline-block', marginRight: '0.25em' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtítulo */}
            <motion.p className="hero__subtitle" variants={fadeUp}>
              Descubrí nuestra selección de gadgets, periféricos y accesorios diseñados para optimizar{' '}
              <span className="hero__subtitle--accent">tu espacio de trabajo y setup diario.</span>
            </motion.p>

            {/* Botón CTA */}
            <motion.div variants={fadeUp}>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(210,238,66,0.35)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-block', borderRadius: 4 }}
              >
                <Link to="/catalogo" className="btn btn--primary btn--hero">
                  Explorar productos
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Imagen + panel de tags */}
          <div className="hero__right">
            <motion.div
              className="hero__image-wrapper"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <img
                src={audifonosImg}
                alt="Setup tecnológico NovaMarket"
                className="hero__image"
              />
            </motion.div>

            {/* Tags en cascada */}
            <div className="hero__tags-panel" aria-hidden="true">
              {['TECH','GAMING','ACCESORIOS','PERIFÉRICOS','GADGETS'].map((tag, i) => (
                <motion.span
                  key={tag}
                  className="hero__tag"
                  custom={i}
                  variants={tagVariant}
                  initial="hidden"
                  animate="visible"
                >
                  {tag}
                </motion.span>
              ))}
              <motion.span
                className="hero__tags-line"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS — scroll reveal ── */}
      <section className="categories-section">
        <div className="categories-section__inner container">
          <motion.h2
            className="categories-section__title"
            ref={catRef}
            variants={fadeUp}
            initial="hidden"
            animate={catInView ? 'visible' : 'hidden'}
          >
            Categorías Principales
          </motion.h2>
          <motion.div
            className="categories-grid"
            variants={staggerContainer}
            initial="hidden"
            animate={catInView ? 'visible' : 'hidden'}
          >
            {CATEGORIES.map(({ icon, name, slug, featured }) => (
              <motion.div key={name} variants={staggerItem}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(125,28,226,0.18)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ borderRadius: 20 }}
                >
                  <Link
                    to={`/catalogo?categoria=${slug}`}
                    className={`category-card${featured ? ' category-card--featured' : ''}`}
                  >
                    <div className="category-card__icon-ring">
                      <CategoryIcon type={icon} featured={featured} />
                    </div>
                    <span className="category-card__name">{name}</span>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS — scroll reveal ── */}
      <section className="featured-section" ref={featRef}>
        <div className="featured-section__inner">
          <motion.div
            className="featured-section__header"
            variants={fadeUp}
            initial="hidden"
            animate={featInView ? 'visible' : 'hidden'}
          >
            <h2 className="featured-section__title">Productos Destacados</h2>
            <Link to="/catalogo" className="featured-section__link">
              Ver todos los productos →
            </Link>
          </motion.div>

          {loading && <p className="featured-section__state">Cargando productos...</p>}
          {!loading && products.length === 0 && (
            <p className="featured-section__state">No hay productos disponibles aún.</p>
          )}

          {!loading && products.length > 0 && (
            <motion.div
              className="featured-grid"
              variants={staggerContainer}
              initial="hidden"
              animate={featInView ? 'visible' : 'hidden'}
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  className="featured-card"
                  variants={staggerItem}
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
                      <motion.button
                        className={`featured-card__add-btn${added === product.id ? ' featured-card__add-btn--added' : ''}`}
                        onClick={() => handleAdd(product)}
                        disabled={added === product.id}
                        aria-label={`Agregar ${product.name} al carrito`}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER — scroll reveal ── */}
      <motion.section
        className="promo-banner"
        ref={promoRef}
        variants={fadeUp}
        initial="hidden"
        animate={promoInView ? 'visible' : 'hidden'}
      >
        <div className="promo-banner__card">
          <p className="promo-banner__title">¡Oferta especial de lanzamiento!</p>
          <p className="promo-banner__text">
            Descuento del 20% en toda la categoría de Periféricos usando el código{' '}
            <strong>NOVAFREE</strong>.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

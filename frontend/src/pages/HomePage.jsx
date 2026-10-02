import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import audifonosImg from '../assets/audifonos.png';
import { getProductImage } from '../utils/productImage';

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.686 2 6 4.686 6 8v8c0 3.314 2.686 6 6 6s6-2.686 6-6V8c0-3.314-2.686-6-6-6Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="2" x2="12" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 7v3" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  peripheral: ({ color }) => (
    // Teclado con teclas
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="13" rx="2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gadget: ({ color }) => (
    // Smartphone / gadget
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="17.5" r="1" fill={color}/>
      <line x1="9" y1="6" x2="15" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  audio: ({ color }) => (
    // Auriculares over-ear
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14V11a8 8 0 0 1 16 0v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 14a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 14a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  gaming: ({ color }) => (
    // Gamepad / control
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

  // Auto-cierra el flash a los 4 segundos
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
  return (
    <div>
      {/* Toast de bienvenida post-registro */}
      {flashMessage && (
        <div className="toast toast--success" role="alert" aria-live="polite">
          <span>{flashMessage}</span>
          <button className="toast__close" onClick={clearFlash} aria-label="Cerrar">✕</button>
        </div>
      )}

      <section className="hero">
        <div className="hero__inner container">
          {/* Columna texto */}
          <div className="hero__content">
            <h1 className="hero__title">Tecnología que simplifica tu vida</h1>
            <p className="hero__subtitle">
              Descubrí nuestra selección de gadgets, periféricos y accesorios diseñados para optimizar{' '}
              <span className="hero__subtitle--accent">tu espacio de trabajo y setup diario.</span>
            </p>
            <Link to="/catalogo" className="btn btn--primary btn--lg">
              Explorar productos
            </Link>
          </div>

          {/* Imagen + panel de tags */}
          <div className="hero__right">
            <div className="hero__image-wrapper">
              <img
                src={audifonosImg}
                alt="Setup tecnológico NovaMarket"
                className="hero__image"
              />
            </div>
            <div className="hero__tags-panel" aria-hidden="true">
              <span className="hero__tag">TECH</span>
              <span className="hero__tag">GAMING</span>
              <span className="hero__tag">ACCESORIOS</span>
              <span className="hero__tag">PERIFÉRICOS</span>
              <span className="hero__tag">GADGETS</span>
              <span className="hero__tags-line"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="categories-section">
        <div className="categories-section__inner container">
          <h2 className="categories-section__title">Categorías Principales</h2>
          <div className="categories-grid">
            {CATEGORIES.map(({ icon, name, slug, featured }) => (
              <Link
                to={`/catalogo?categoria=${slug}`}
                key={name}
                className={`category-card${featured ? ' category-card--featured' : ''}`}
              >
                <div className="category-card__icon-ring">
                  <CategoryIcon type={icon} featured={featured} />
                </div>
                <span className="category-card__name">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-section__inner">

          {/* Header de sección */}
          <div className="featured-section__header">
            <h2 className="featured-section__title">Productos Destacados</h2>
            <Link to="/catalogo" className="featured-section__link">
              Ver todos los productos →
            </Link>
          </div>

          {loading && (
            <p className="featured-section__state">Cargando productos...</p>
          )}

          {!loading && products.length === 0 && (
            <p className="featured-section__state">No hay productos disponibles aún.</p>
          )}

          {!loading && products.length > 0 && (
            <div className="featured-grid">
              {products.map((product) => (
                <div className="featured-card" key={product.id}>
                  {/* Imagen */}
                  <div className="featured-card__image">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      className="featured-card__img"
                    />
                  </div>

                  {/* Info */}
                  <div className="featured-card__body">
                    <p className="featured-card__name">{product.name}</p>
                    <div className="featured-card__footer">
                      <span className="featured-card__price">
                        ${Number(product.price).toLocaleString('es-AR')}
                      </span>
                      <button
                        className={`featured-card__add-btn${added === product.id ? ' featured-card__add-btn--added' : ''}`}
                        onClick={() => handleAdd(product)}
                        disabled={added === product.id}
                        aria-label={`Agregar ${product.name} al carrito`}
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
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner Promocional */}
      <section className="promo-banner">
        <div className="promo-banner__card">
          <p className="promo-banner__title">¡Oferta especial de lanzamiento!</p>
          <p className="promo-banner__text">
            Descuento del 20% en toda la categoría de Periféricos usando el código{' '}
            <strong>NOVAFREE</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}

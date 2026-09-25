import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { icon: '🖱️', name: 'Periféricos' },
  { icon: '🎧', name: 'Audio' },
  { icon: '⌨️', name: 'Teclados' },
  { icon: '🖥️', name: 'Monitores' },
  { icon: '📱', name: 'Gadgets' },
  { icon: '🔌', name: 'Accesorios' },
  { icon: '🎮', name: 'Gaming' },
  { icon: '💡', name: 'Iluminación' },
];

export default function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);

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
      {/* Hero */}
      <section className="hero">
        <div className="hero__eyebrow">
          ✦ Tech para vos
        </div>
        <h1 className="hero__title">
          Todo lo que necesitás,<br />
          <span className="gradient">al alcance de un clic</span>
        </h1>
        <p className="hero__subtitle">
          Accesorios, periféricos y gadgets tech seleccionados para que tu setup sea lo que siempre quisiste.
        </p>
        <div className="hero__actions">
          <Link to="/catalogo" className="btn btn--gradient btn--lg">
            Explorar catálogo
          </Link>
          <Link to="/registro" className="btn btn--secondary btn--lg">
            Crear cuenta
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Categorías</h2>
            <Link to="/catalogo" className="section__link">
              Ver todo →
            </Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(({ icon, name }) => (
              <Link to={`/catalogo?categoria=${name.toLowerCase()}`} key={name}>
                <div className="category-card">
                  <span className="category-card__icon">{icon}</span>
                  <span className="category-card__name">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Destacados</h2>
            <Link to="/catalogo" className="section__link">Ver todo →</Link>
          </div>

          {loading && (
            <p style={{ color: 'var(--color-text-secondary)' }}>Cargando productos...</p>
          )}

          {!loading && products.length === 0 && (
            <p style={{ color: 'var(--color-text-secondary)' }}>No hay productos disponibles aún.</p>
          )}

          {!loading && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <div className="card" key={product.id}>
                  <div className="card__image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy" />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', minHeight: 200,
                        background: 'var(--color-surface-2)',
                        display: 'grid', placeItems: 'center',
                        color: 'var(--color-text-disabled)',
                        fontSize: 'var(--text-sm)',
                      }}>
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="card__body">
                    <p className="card__title">{product.name}</p>
                    <p className="card__desc">{product.description}</p>
                    <p className="card__price">
                      ${Number(product.price).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="card__footer">
                    <span className="badge badge--success">En stock</span>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => handleAdd(product)}
                      disabled={added === product.id}
                      style={{ minWidth: 110 }}
                    >
                      {added === product.id ? '✓ Agregado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

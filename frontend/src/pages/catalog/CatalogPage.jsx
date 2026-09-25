import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';

const CATEGORIES = ['Todos', 'Periféricos', 'Teclados', 'Audio', 'Accesorios', 'Gadgets', 'Monitores', 'Gaming'];
const ORDER_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
];

export default function CatalogPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('newest');
  const [added, setAdded] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productsAPI.getAll({ category: category || undefined, order });
        setProducts(data.products);
      } catch {
        setError('No se pudieron cargar los productos. Intentá de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, order]);

  const handleAddToCart = (product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.03em' }}>
          Catálogo
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
          {products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar filtros */}
        <aside className="filters-sidebar">
          <p className="filters-sidebar__title">Filtros</p>

          <div className="filter-group">
            <p className="filter-group__label">Categoría</p>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'Todos' ? '' : cat)}
                className="btn btn--ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 'var(--sp-2) var(--sp-3)',
                  marginBottom: 'var(--sp-1)',
                  color: (category === cat || (cat === 'Todos' && !category))
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: (category === cat || (cat === 'Todos' && !category))
                    ? 'var(--color-primary-subtle)'
                    : 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <p className="filter-group__label">Ordenar por</p>
            <select
              className="form-input"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {ORDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Grilla de productos */}
        <section>
          {loading && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-16)', color: 'var(--color-text-secondary)' }}>
              Cargando productos...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-error)' }}>
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-16)', color: 'var(--color-text-secondary)' }}>
              No hay productos en esta categoría.
            </div>
          )}

          {!loading && !error && products.length > 0 && (
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
                    <span className={`badge ${product.stock > 0 ? 'badge--success' : 'badge--error'}`}>
                      {product.stock > 0 ? 'En stock' : 'Sin stock'}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <Link to={`/catalogo/${product.id}`} className="btn btn--secondary btn--sm">
                        Ver
                      </Link>
                      <button
                        className="btn btn--primary btn--sm"
                        disabled={product.stock === 0 || added === product.id}
                        onClick={() => handleAddToCart(product)}
                        style={{ minWidth: 110 }}
                      >
                        {added === product.id ? '✓ Agregado' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/productImage';

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// ── Constantes ────────────────────────────────────────────────
const CATEGORIES = ['Accesorios', 'Periféricos', 'Gadgets', 'Audio'];
const PAGE_SIZE  = 12;

const ORDER_OPTIONS = [
  { value: 'newest',     label: 'Relevancia'    },
  { value: 'price_asc',  label: 'Menor precio'  },
  { value: 'price_desc', label: 'Mayor precio'  },
];

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

// ── Icono chevron para select ─────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="2 4 6 8 10 4"/>
    </svg>
  );
}

// ── Tarjeta de producto ───────────────────────────────────────
function ProductCard({ product, onAdd, added, cartQty = 0 }) {
  const inStock = product.stock > 0;
  const stockAgotado = !inStock || cartQty >= product.stock;

  return (
    <motion.article
      className="catalog-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
      transition={{ type: 'tween', duration: 0.25 }}
    >
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
        <p className="catalog-card__desc">{product.description}</p>
      </div>

      <div className="catalog-card__footer">
        <span className="catalog-card__price">
          ${Number(product.price).toLocaleString('es-AR')}
        </span>
        {stockAgotado ? (
          <span className="catalog-card__no-stock">Sin stock</span>
        ) : (
          <motion.button
            className={`catalog-card__add-btn${added ? ' catalog-card__add-btn--added' : ''}`}
            onClick={() => onAdd(product)}
            disabled={added}
            aria-label={`Agregar ${product.name} al carrito`}
            whileHover={!added ? { scale: 1.12 } : {}}
            whileTap={!added ? { scale: 0.92 } : {}}
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
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function CatalogPage() {
  const { addItem, items: cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Estado de filtros (sincronizado con URL) ──
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get('categoria');
    return cat ? [cat] : [];
  });
  const [priceMin, setPriceMin]   = useState('');
  const [priceMax, setPriceMax]   = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [order, setOrder]         = useState('newest');
  const [page, setPage]           = useState(1);

  // ── Estado de datos ──
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [added, setAdded]             = useState(null);

  // ── Marcas únicas derivadas de los productos ──
  const brands = useMemo(() => {
    const set = new Set(allProducts.map(p => p.brand).filter(Boolean));
    return [...set].sort();
  }, [allProducts]);

  const [selectedBrands, setSelectedBrands] = useState([]);

  // ── Fetch inicial — trae todos, filtra en cliente ──
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productsAPI.getAll({ order });
        setAllProducts(data.products ?? []);
      } catch {
        setError('No se pudieron cargar los productos. Intentá de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [order]);

  // ── Filtrado en cliente ──
  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (selectedCategories.length > 0) {
      list = list.filter(p =>
        selectedCategories.some(cat => p.category?.toLowerCase() === cat.toLowerCase())
      );
    }
    if (selectedBrands.length > 0) {
      list = list.filter(p =>
        selectedBrands.some(b => p.brand?.toLowerCase() === b.toLowerCase())
      );
    }
    if (priceMin !== '') {
      list = list.filter(p => Number(p.price) >= Number(priceMin));
    }
    if (priceMax !== '') {
      list = list.filter(p => Number(p.price) <= Number(priceMax));
    }
    if (onlyStock) {
      list = list.filter(p => p.stock > 0);
    }

    return list;
  }, [allProducts, selectedCategories, selectedBrands, priceMin, priceMax, onlyStock]);

  // ── Paginación en cliente ──
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const pageProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => { setPage(1); }, [selectedCategories, selectedBrands, priceMin, priceMax, onlyStock]);

  // ── Handlers ──
  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleBrand = useCallback((brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }, []);

  const handleAddToCart = useCallback((product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }, [addItem]);

  // Páginas a mostrar en la paginación (máx 5)
  const pageNumbers = useMemo(() => {
    const nums = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="catalog-page-v2">

      {/* ── Breadcrumb + título (fondo oscuro) ── */}
      <div className="catalog-hero">
        <nav className="catalog-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/" className="catalog-breadcrumb__link">Inicio</Link>
          <span className="catalog-breadcrumb__sep" aria-hidden="true">/</span>
          <span className="catalog-breadcrumb__current">Catálogo</span>
        </nav>
        <h1 className="catalog-hero__title">Catálogo</h1>
      </div>

      {/* ── Layout principal ── */}
      <div className="catalog-layout-v2">

        {/* ── Sidebar de filtros ── */}
        <aside className="catalog-sidebar" aria-label="Filtros">

          <p className="catalog-sidebar__heading">Filtros</p>

          {/* Categoría */}
          <div className="catalog-filter-group">
            <p className="catalog-filter-group__label">Categoría</p>
            {CATEGORIES.map(cat => (
              <label key={cat} className="catalog-filter-check">
                <input
                  type="checkbox"
                  className="catalog-filter-check__input"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span className="catalog-filter-check__box" aria-hidden="true" />
                <span className="catalog-filter-check__text">{cat}</span>
              </label>
            ))}
          </div>

          <div className="catalog-sidebar__divider" />

          {/* Marca */}
          <div className="catalog-filter-group">
            <p className="catalog-filter-group__label">Marca</p>
            {brands.length === 0 ? (
              <span className="catalog-filter-group__empty">Sin marcas disponibles</span>
            ) : (
              brands.map(brand => (
                <label key={brand} className="catalog-filter-check">
                  <input
                    type="checkbox"
                    className="catalog-filter-check__input"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span className="catalog-filter-check__box" aria-hidden="true" />
                  <span className="catalog-filter-check__text">{brand}</span>
                </label>
              ))
            )}
          </div>

          <div className="catalog-sidebar__divider" />

          {/* Rango de precio */}
          <div className="catalog-filter-group">
            <p className="catalog-filter-group__label">Rango de precio</p>
            <div className="catalog-price-range">
              <input
                type="number"
                className="catalog-price-input"
                placeholder="Min"
                value={priceMin}
                min={0}
                onChange={e => setPriceMin(e.target.value)}
                aria-label="Precio mínimo"
              />
              <input
                type="number"
                className="catalog-price-input"
                placeholder="Max"
                value={priceMax}
                min={0}
                onChange={e => setPriceMax(e.target.value)}
                aria-label="Precio máximo"
              />
            </div>
          </div>

          <div className="catalog-sidebar__divider" />

          {/* Solo disponibles */}
          <div className="catalog-stock-toggle">
            <span className="catalog-stock-toggle__label">Solo disponibles</span>
            <button
              role="switch"
              aria-checked={onlyStock}
              className={`catalog-toggle${onlyStock ? ' catalog-toggle--on' : ''}`}
              onClick={() => setOnlyStock(v => !v)}
              aria-label="Mostrar solo productos disponibles"
            >
              <span className="catalog-toggle__thumb" />
            </button>
          </div>

        </aside>

        {/* ── Área de resultados ── */}
        <section className="catalog-results" aria-label="Resultados del catálogo">

          {/* Barra de ordenamiento */}
          <div className="catalog-sort-bar">
            <span className="catalog-sort-bar__count">
              {loading
                ? 'Cargando...'
                : `Mostrando ${pageProducts.length} de ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
              }
            </span>
            <div className="catalog-sort-bar__right">
              <span className="catalog-sort-bar__label">Ordenar por:</span>
              <div className="catalog-sort-select-wrapper">
                <select
                  className="catalog-sort-select"
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  aria-label="Ordenar productos"
                >
                  {ORDER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="catalog-sort-select__chevron" aria-hidden="true">
                  <ChevronIcon />
                </span>
              </div>
            </div>
          </div>

          {/* Estados: cargando / error / vacío */}
          {loading && (
            <div className="catalog-state">
              <div className="catalog-state__spinner" aria-label="Cargando productos" />
              <p>Cargando productos…</p>
            </div>
          )}

          {!loading && error && (
            <div className="catalog-state catalog-state--error">
              <p>{error}</p>
              <button
                className="btn btn--primary"
                onClick={() => setOrder(o => o)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="catalog-state">
              <p>No hay productos que coincidan con los filtros seleccionados.</p>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedBrands([]);
                  setPriceMin('');
                  setPriceMax('');
                  setOnlyStock(false);
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Grilla de productos */}
          {!loading && !error && pageProducts.length > 0 && (
            <div className="catalog-grid">
              <AnimatePresence mode="popLayout">
                {pageProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={handleAddToCart}
                    added={added === product.id}
                    cartQty={cartItems.find(i => i.id === product.id)?.quantity ?? 0}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Paginación */}
          {!loading && !error && totalPages > 1 && (
            <nav className="catalog-pagination" aria-label="Paginación">
              <button
                className="catalog-pagination__prev"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>

              {pageNumbers.map(n => (
                <button
                  key={n}
                  className={`catalog-pagination__page${safePage === n ? ' catalog-pagination__page--active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-current={safePage === n ? 'page' : undefined}
                  aria-label={`Página ${n}`}
                >
                  {n}
                </button>
              ))}

              <button
                className="catalog-pagination__next"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </nav>
          )}

        </section>
      </div>
    </div>
  );
}

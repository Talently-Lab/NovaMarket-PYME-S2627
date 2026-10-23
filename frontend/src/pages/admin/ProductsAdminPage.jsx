import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { productsAPI } from '../../services/api';
import ProductFormModal from './ProductFormModal';

import { formatearPrecio } from '../../utils/formatearPrecio';

const PAGE_SIZE = 10;

// Sin tildes y en minúsculas, para que «camara» encuentre «Cámara»
const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Semáforo de stock: 0 = agotado (rojo), 1 a 3 = bajo (ámbar oscuro para mantener el contraste con el texto blanco)
function nivelStock(stock) {
  const n = Number(stock ?? 0);
  if (n <= 0) return { texto: 'Agotado', color: 'var(--color-error)' };
  if (n <= 3) return { texto: 'Bajo', color: '#b45309' };
  return null;
}

function StockCell({ product, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(String(product.stock ?? 0));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSave = async () => {
    const newStock = parseInt(value);
    if (isNaN(newStock) || newStock < 0) { setError('Stock inválido'); return; }
    if (newStock === product.stock) { setEditing(false); return; }
    setSaving(true); setError('');
    try {
      await productsAPI.update(product.id, { stock: newStock });
      onUpdated(product.id, newStock);
      setEditing(false);
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') { setEditing(false); setValue(String(product.stock)); setError(''); }
  };

  if (editing) {
    return (
      <div className="stock-edit">
        <input
          className="stock-edit__input"
          type="number"
          value={value}
          min={0}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={saving}
        />
        <button
          className="btn btn--primary btn--sm stock-edit__save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '…' : '✓'}
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => { setEditing(false); setValue(String(product.stock)); setError(''); }}
          disabled={saving}
        >
          ✕
        </button>
        {error && <span className="stock-edit__error">{error}</span>}
      </div>
    );
  }

  return (
    <div className="stock-display">
      <span
        className="stock-display__value"
        style={{
          color: product.stock === 0 ? 'var(--color-error)'
               : product.stock <= 3 ? '#b45309'
               : 'var(--color-text)',
        }}
      >
        {product.stock}
      </span>
      {nivelStock(product.stock) && (
        <span className="admin-badge" style={{ '--badge-color': nivelStock(product.stock).color }}>
          {nivelStock(product.stock).texto}
        </span>
      )}
      <button
        className="btn btn--ghost btn--sm stock-display__edit"
        onClick={() => { setValue(String(product.stock)); setEditing(true); }}
        title="Editar stock"
      >
        ✎
      </button>
    </div>
  );
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  // null = modal cerrado · {} = producto nuevo · producto = edición
  const [modalProduct, setModalProduct] = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    productsAPI.getAllAdmin()
      .then(({ data }) => setProducts(data.products ?? []))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStockUpdated = (productId, newStock) => {
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, stock: newStock } : p)
    );
  };

  const handleSaved = (saved) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === saved.id);
      return exists ? prev.map(p => p.id === saved.id ? { ...p, ...saved } : p) : [saved, ...prev];
    });
    setModalProduct(null);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Desactivar «${product.name}»? Dejará de mostrarse en la tienda pero podrás reactivarlo.`)) return;
    setDeletingId(product.id);
    setError('');
    try {
      await productsAPI.remove(product.id);
      // Marca como inactivo en la lista local en lugar de eliminarlo
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: false, stock: 0 } : p));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo desactivar el producto.');
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  // ── Búsqueda, filtros y paginación ──
  const [busqueda,  setBusqueda]  = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado,    setEstado]    = useState('todos');
  const [page,      setPage]      = useState(1);
  const busquedaDemorada = useDebouncedValue(busqueda, 300);

  const hayFiltros = busqueda !== '' || categoria !== '' || estado !== 'todos';

  // Al cambiar un filtro se vuelve a la página 1 (en el manejador, sin efectos)
  const cambiarFiltro = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const limpiarFiltros = () => { setBusqueda(''); setCategoria(''); setEstado('todos'); setPage(1); };

  const filtrados = useMemo(() => {
    // Al vaciar el campo no hay nada que esperar: se muestra todo enseguida
    const q = normalizar((busqueda === '' ? '' : busquedaDemorada).trim()).replace(/^#/, '');
    return products.filter((p) => {
      if (q && !(normalizar(p.name).includes(q) || normalizar(p.category).includes(q) || String(p.id) === q)) return false;
      if (categoria && p.category !== categoria) return false;
      const stock = Number(p.stock ?? 0);
      switch (estado) {
        case 'activos':   return p.is_active !== false;
        case 'inactivos': return p.is_active === false;
        case 'agotado':   return stock <= 0;
        case 'bajo':      return stock >= 1 && stock <= 3;
        default:          return true;
      }
    });
  }, [products, busqueda, busquedaDemorada, categoria, estado]);

  const totalPages   = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const pageProducts = filtrados.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Hasta 5 números de página alrededor de la actual (igual que el catálogo)
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Productos</h1>
          <p className="admin-dashboard__subtitle">
            {loading ? '…' : hayFiltros ? `${filtrados.length} de ${products.length} productos` : `${products.length} productos en total`}
          </p>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => setModalProduct({})}
        >
          + Nuevo producto
        </button>
        <button
          className="btn btn--primary btn--sm"
          onClick={load}
          disabled={loading}
          title="Actualizar lista"
        >
          {loading ? 'Cargando…' : '↻ Actualizar'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-filters" role="search">
        <div className="admin-filters__field admin-filters__field--grow">
          <label className="form-label" htmlFor="filtro-busqueda">Buscar</label>
          <input
            id="filtro-busqueda"
            type="search"
            className="form-input"
            placeholder="Nombre, categoría o #ID"
            value={busqueda}
            onChange={cambiarFiltro(setBusqueda)}
            autoComplete="off"
          />
        </div>
        <div className="admin-filters__field">
          <label className="form-label" htmlFor="filtro-categoria">Categoría</label>
          <select id="filtro-categoria" className="form-input" value={categoria} onChange={cambiarFiltro(setCategoria)}>
            <option value="">Todas</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="admin-filters__field">
          <label className="form-label" htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" className="form-input" value={estado} onChange={cambiarFiltro(setEstado)}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="agotado">Agotado</option>
            <option value="bajo">Stock bajo (1 a 3)</option>
          </select>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={limpiarFiltros} disabled={!hayFiltros}>
          Limpiar filtros
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  Cargando productos…
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  {products.length === 0 ? 'No hay productos aún.' : 'Ningún producto coincide con los filtros.'}
                </td>
              </tr>
            ) : (
              pageProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
                    #{p.id}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-medium)' }}>{p.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {p.category || '—'}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>
                    {formatearPrecio(p.price)}
                  </td>
                  <td>
                    <StockCell product={p} onUpdated={handleStockUpdated} />
                  </td>
                  <td>
                    <span className="admin-badge" style={{
                      '--badge-color': p.is_active === false ? '#6b7280' : p.stock > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {p.is_active === false ? 'Inactivo' : p.stock > 0 ? 'Activo' : 'Sin stock'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => setModalProduct(p)}
                        aria-label={`Editar ${p.name}`}
                      >
                        Editar
                      </button>
                      {p.is_active === false ? (
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={async () => {
                            try {
                              await productsAPI.update(p.id, { is_active: true });
                              setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: true } : x));
                            } catch {
                              setError('No se pudo reactivar el producto.');
                            }
                          }}
                          aria-label={`Reactivar ${p.name}`}
                        >
                          Reactivar
                        </button>
                      ) : (
                        <button
                          className="btn btn--ghost btn--sm admin-row-actions__delete"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          aria-label={`Desactivar ${p.name}`}
                        >
                          {deletingId === p.id ? 'Desactivando…' : 'Eliminar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <nav className="catalog-pagination" aria-label="Paginación de productos">
          <button
            className="catalog-pagination__prev"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          {pageNumbers.map((n) => (
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
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </nav>
      )}

      {modalProduct && (
        <ProductFormModal
          product={modalProduct.id ? modalProduct : null}
          categories={categories}
          onSaved={handleSaved}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}

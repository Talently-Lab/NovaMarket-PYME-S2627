import { useEffect, useState, useCallback } from 'react';
import { productsAPI } from '../../services/api';
import ProductFormModal from './ProductFormModal';

const fmt = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

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
               : product.stock < 5  ? '#f59e0b'
               : 'var(--color-text)',
        }}
      >
        {product.stock}
      </span>
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

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Productos</h1>
          <p className="admin-dashboard__subtitle">
            {loading ? '…' : `${products.length} productos en total`}
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  No hay productos aún.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
                    #{p.id}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-medium)' }}>{p.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {p.category || '—'}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>
                    ${fmt(p.price)}
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

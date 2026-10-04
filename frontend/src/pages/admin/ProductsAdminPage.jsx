import { useEffect, useState, useCallback } from 'react';
import { productsAPI } from '../../services/api';

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
          className="btn btn--secondary btn--sm"
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  Cargando productos…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
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
                      '--badge-color': p.stock > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {p.stock > 0 ? 'Activo' : 'Sin stock'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

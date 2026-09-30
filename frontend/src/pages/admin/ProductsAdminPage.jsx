import { useEffect, useState } from 'react';
import { productsAPI } from '../../services/api';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    productsAPI.getAllAdmin()
      .then(({ data }) => setProducts(data.products ?? []))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Productos</h1>
        <p className="admin-dashboard__subtitle">
          {loading ? '…' : `${products.length} productos en total`}
        </p>
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
                    <span style={{
                      fontWeight: 'var(--weight-semibold)',
                      color: p.stock === 0
                        ? 'var(--color-error)'
                        : p.stock < 5
                        ? '#f59e0b'
                        : 'var(--color-text)',
                    }}>
                      {p.stock}
                    </span>
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

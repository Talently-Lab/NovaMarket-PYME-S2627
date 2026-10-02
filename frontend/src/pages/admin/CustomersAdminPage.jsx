import { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';

export default function CustomersAdminPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    usersAPI.getAllAdmin()
      .then(({ data }) => setUsers(data.users ?? []))
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Clientes</h1>
        <p className="admin-dashboard__subtitle">
          {loading ? '…' : `${users.length} usuarios registrados`}
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Pedidos</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  Cargando clientes…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  No hay usuarios aún.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
                    #{u.id}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-medium)' }}>{u.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{u.email}</td>
                  <td>
                    <span className="admin-badge" style={{
                      '--badge-color': u.role === 'admin' ? '#7D1CE2' : '#6b7280',
                    }}>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'var(--weight-semibold)', textAlign: 'center' }}>
                    {u.order_count ?? 0}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {new Date(u.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-disabled)' }}>
                      {new Date(u.created_at).toLocaleTimeString('es-AR', {
                        hour: '2-digit', minute: '2-digit',
                      })}
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

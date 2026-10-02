import { useEffect, useState } from 'react';
import { ordersAPI } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pendiente'  },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'shipped',   label: 'En camino'  },
  { value: 'delivered', label: 'Entregado'  },
  { value: 'cancelled', label: 'Cancelado'  },
];

const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#7D1CE2',
  shipped:   '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const METHOD_LABEL = {
  tarjeta:       'Tarjeta',
  billetera:     'Billetera',
  transferencia: 'Transferencia',
};

export default function OrdersAdminPage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    ordersAPI.getAllAdmin()
      .then(({ data }) => setOrders(data.orders ?? []))
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: data.order.status } : o)
      );
    } catch {
      alert('Error al actualizar el estado.');
    } finally {
      setUpdating(null);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Pedidos</h1>
        <p className="admin-dashboard__subtitle">
          {loading ? '…' : `${orders.length} pedidos en total`}
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Ciudad</th>
              <th>Pago</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  Cargando pedidos…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  No hay pedidos aún.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 'var(--weight-semibold)', fontFamily: 'var(--font-mono)' }}>
                    #{String(order.id).padStart(5, '0')}
                  </td>
                  <td>{order.user_name ?? order.user?.name ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {order.shipping_city || '—'}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {METHOD_LABEL[order.payment_method] || '—'}
                    {order.card_last4 && (
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-disabled)' }}>
                        ****{order.card_last4}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>
                    ${fmt(order.total_with_tax ?? order.total_amount ?? order.total)}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ '--sel-color': STATUS_COLORS[order.status] ?? '#7D1CE2' }}
                    >
                      {STATUS_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
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

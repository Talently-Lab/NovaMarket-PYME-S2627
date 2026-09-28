import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const STATUS_LABEL = {
  pending:   { text: 'Pendiente',  badge: 'badge--warning' },
  confirmed: { text: 'Confirmado', badge: 'badge--primary' },
  shipped:   { text: 'En camino',  badge: 'badge--primary' },
  delivered: { text: 'Entregado',  badge: 'badge--success' },
  cancelled: { text: 'Cancelado',  badge: 'badge--error'   },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersAPI.getAll()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('No se pudieron cargar tus pedidos. Intentá de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando tus pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
        <p className="form-error">{error}</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: 'var(--sp-4)' }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16) var(--sp-4)' }}>
        <p style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>📦</p>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--sp-2)' }}>
          Todavía no hiciste pedidos
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-8)' }}>
          Explorá el catálogo y encontrá algo que te guste.
        </p>
        <Link to="/catalogo" className="btn btn--gradient btn--lg">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cart-page-title">Mis pedidos</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {orders.map((order) => {
          const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
          return (
            <div key={order.id} className="order-card">
              {/* Cabecera */}
              <div className="order-card__header">
                <div>
                  <span className="order-card__id">
                    Pedido #{String(order.id).padStart(6, '0')}
                  </span>
                  <span className="order-card__date">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <span className={`badge ${status.badge}`}>{status.text}</span>
              </div>

              {/* Items */}
              <div className="order-card__items">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-card__item">
                    <span className="truncate">{item.product_name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                      x{item.quantity}
                    </span>
                    <span style={{ fontWeight: 'var(--weight-semibold)', flexShrink: 0 }}>
                      ${Number(item.unit_price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card__footer">
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    Envío a {order.shipping_city}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Total</p>
                  <p style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)' }}>
                    ${Number(order.total_amount).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

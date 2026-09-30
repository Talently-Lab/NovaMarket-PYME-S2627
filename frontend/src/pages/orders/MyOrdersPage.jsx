import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const STATUS_MAP = {
  pending:   { label: 'Pendiente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmado', color: '#7D1CE2' },
  shipped:   { label: 'En camino',  color: '#3b82f6' },
  delivered: { label: 'Entregado',  color: '#22c55e' },
  cancelled: { label: 'Cancelado',  color: '#ef4444' },
};

function PackageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ color: 'var(--color-text-disabled)' }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    ordersAPI.getAll()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('No se pudieron cargar tus pedidos. Intentá de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="orders-state">
        <p className="orders-state__text">Cargando tus pedidos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-state">
        <p className="form-error">{error}</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: 'var(--sp-4)' }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-state">
        <PackageIcon />
        <h1 className="orders-state__title">Todavía no hiciste pedidos</h1>
        <p className="orders-state__text">
          Explorá el catálogo y encontrá algo que te guste.
        </p>
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-wrapper container">

      <div className="orders-header">
        <h1 className="orders-title">Mis pedidos</h1>
        <p className="orders-subtitle">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} realizados</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
          return (
            <div key={order.id} className="order-card">

              {/* Cabecera */}
              <div className="order-card__header">
                <div className="order-card__meta">
                  <span className="order-card__id">
                    Pedido #{String(order.id).padStart(6, '0')}
                  </span>
                  <span className="order-card__date">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <span
                  className="order-card__badge"
                  style={{ '--badge-bg': st.color }}
                >
                  {st.label}
                </span>
              </div>

              {/* Productos */}
              <div className="order-card__items">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-card__item">
                    <span className="order-card__item-name truncate">
                      {item.product_name}
                    </span>
                    <span className="order-card__item-qty">x{item.quantity}</span>
                    <span className="order-card__item-price">
                      ${Number(item.unit_price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card__footer">
                <span className="order-card__city">
                  📍 {order.shipping_city || 'Sin ciudad'}
                </span>
                <div className="order-card__total">
                  <span className="order-card__total-label">Total</span>
                  <span className="order-card__total-value">
                    ${Number(order.total_amount).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

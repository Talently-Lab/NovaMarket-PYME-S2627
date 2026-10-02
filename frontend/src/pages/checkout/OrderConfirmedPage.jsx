import { useLocation, Link } from 'react-router-dom';

export default function OrderConfirmedPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="order-confirmed">

      {/* Ícono animado */}
      <div className="order-confirmed__icon">🎉</div>

      <h1 className="order-confirmed__title">¡Pedido confirmado!</h1>

      <p className="order-confirmed__subtitle">
        Gracias por tu compra. Tu pedido fue registrado exitosamente.
      </p>

      {order && (
        <div className="order-confirmed__card">

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Número de pedido</span>
            <span className="order-confirmed__row-value">
              #{String(order.id).padStart(6, '0')}
            </span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Estado</span>
            <span className="badge badge--warning">Pendiente</span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Envío a</span>
            <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right', maxWidth: 200 }}>
              {order.shipping_name}<br />
              {order.shipping_address}, {order.shipping_city}
            </span>
          </div>

          <hr className="order-confirmed__divider" />

          <div className="order-confirmed__row" style={{ marginBottom: 0 }}>
            <span className="order-confirmed__total-label">Total</span>
            <span className="order-confirmed__total-value">
              ${Number(order.total).toLocaleString('es-AR')}
            </span>
          </div>

        </div>
      )}

      <div className="order-confirmed__actions">
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Seguir comprando
        </Link>
        <Link to="/mis-pedidos" className="btn btn--secondary btn--lg">
          Ver mis pedidos
        </Link>
      </div>

    </div>
  );
}

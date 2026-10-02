import { useLocation, Link } from 'react-router-dom';

const fmt = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const METHOD_LABEL = {
  tarjeta:       'Tarjeta de crédito/débito',
  billetera:     'Billetera virtual',
  transferencia: 'Transferencia bancaria',
};

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#050506" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function OrderConfirmedPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="order-confirmed">

      {/* Ícono de éxito */}
      <div className="order-confirmed__check">
        <CheckIcon />
      </div>

      <h1 className="order-confirmed__title">¡Pedido confirmado!</h1>

      <p className="order-confirmed__subtitle">
        Gracias por tu compra. Tu pedido fue registrado exitosamente.
      </p>

      {order && (
        <div className="order-confirmed__card">

          {/* Número y fecha */}
          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Número de pedido</span>
            <span className="order-confirmed__row-value">
              #{String(order.id).padStart(6, '0')}
            </span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Fecha</span>
            <span className="order-confirmed__row-value" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>
              {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Envío a</span>
            <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right', maxWidth: 200 }}>
              {order.shipping_name}<br />
              {order.shipping_address}, {order.shipping_city}
            </span>
          </div>

          <hr className="order-confirmed__divider" />

          {/* Desglose financiero */}
          {order.subtotal != null && (
            <div className="order-confirmed__row">
              <span className="order-confirmed__row-label">Subtotal</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>${fmt(order.subtotal)}</span>
            </div>
          )}

          {order.discount_amount > 0 && (
            <div className="order-confirmed__row" style={{ color: '#22c55e' }}>
              <span className="order-confirmed__row-label">Descuento</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>− ${fmt(order.discount_amount)}</span>
            </div>
          )}

          {order.tax_amount > 0 && (
            <div className="order-confirmed__row">
              <span className="order-confirmed__row-label">IVA (21%)</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>${fmt(order.tax_amount)}</span>
            </div>
          )}

          <hr className="order-confirmed__divider" />

          <div className="order-confirmed__row" style={{ marginBottom: 0 }}>
            <span className="order-confirmed__total-label">Total pagado</span>
            <span className="order-confirmed__total-value">
              ${fmt(order.total_with_tax ?? order.total)}
            </span>
          </div>

          {/* Medio de pago */}
          {order.payment_method && (
            <div className="order-confirmed__row" style={{ marginTop: 'var(--sp-2)', marginBottom: 0 }}>
              <span className="order-confirmed__row-label">Medio de pago</span>
              <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right' }}>
                {METHOD_LABEL[order.payment_method] || order.payment_method}
                {order.card_last4 && ` · ****${order.card_last4}`}
                {order.installments > 1 && (
                  <><br />{order.installments} cuotas de ${fmt(order.installment_amount)}</>
                )}
              </span>
            </div>
          )}

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

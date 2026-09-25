import { useLocation, Link } from 'react-router-dom';

export default function OrderConfirmedPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: 'var(--sp-16) var(--sp-4)',
      gap: 'var(--sp-4)',
    }}>
      {/* Ícono animado */}
      <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite' }}>🎉</div>

      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-extrabold)',
        letterSpacing: '-0.03em',
      }}>
        ¡Pedido confirmado!
      </h1>

      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 480 }}>
        Gracias por tu compra. Tu pedido fue registrado exitosamente.
      </p>

      {order && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--sp-6)',
          width: '100%',
          maxWidth: 480,
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Número de pedido
            </span>
            <span style={{ fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-mono)' }}>
              #{String(order.id).padStart(6, '0')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Estado</span>
            <span className="badge badge--warning">Pendiente</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Envío a
            </span>
            <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right', maxWidth: 200 }}>
              {order.shipping_name}<br />
              {order.shipping_address}, {order.shipping_city}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 'var(--sp-4)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <span style={{ fontWeight: 'var(--weight-semibold)' }}>Total</span>
            <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)' }}>
              ${Number(order.total).toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--sp-4)' }}>
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Seguir comprando
        </Link>
        <Link to="/" className="btn btn--secondary btn--lg">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

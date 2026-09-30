import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [shipping, setShipping] = useState({
    name:    user?.name || '',
    address: '',
    city:    '',
    phone:   '',
    notes:   '',
  });

  const handleChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handleConfirm = async () => {
    if (!shipping.name || !shipping.address || !shipping.city) {
      setError('Nombre, dirección y ciudad son requeridos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity:   item.quantity,
        unit_price: Number(item.price),
      }));
      const { data } = await ordersAPI.create({ items: orderItems, shipping });
      setConfirmed(true);
      clearCart();
      navigate('/pedido-confirmado', { state: { order: data.order } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!confirmed && items.length === 0) {
    navigate('/carrito');
    return null;
  }

  return (
    <div className="checkout-wrapper container">

      {/* Título */}
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Completá tus datos para finalizar el pedido.</p>
      </div>

      <div className="checkout-layout">

        {/* ── Formulario de envío ── */}
        <div className="checkout-form-card">
          <h2 className="checkout-form-card__title">Datos de envío</h2>

          <div className="checkout-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre completo *</label>
              <input className="form-input" type="text" id="name" name="name"
                value={shipping.name} onChange={handleChange}
                placeholder="Tu nombre completo" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Dirección *</label>
              <input className="form-input" type="text" id="address" name="address"
                value={shipping.address} onChange={handleChange}
                placeholder="Calle 123, Piso 4, Depto B" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">Ciudad *</label>
              <input className="form-input" type="text" id="city" name="city"
                value={shipping.city} onChange={handleChange}
                placeholder="Buenos Aires" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Teléfono</label>
              <input className="form-input" type="tel" id="phone" name="phone"
                value={shipping.phone} onChange={handleChange}
                placeholder="+54 9 11 1234 5678" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notas (opcional)</label>
              <input className="form-input" type="text" id="notes" name="notes"
                value={shipping.notes} onChange={handleChange}
                placeholder="Instrucciones para el repartidor" />
            </div>
          </div>
        </div>

        {/* ── Resumen del pedido ── */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Tu pedido</h2>

          <div className="cart-summary__lines">
            {items.map((item) => (
              <div key={item.id} className="cart-summary__row">
                <span className="cart-summary__row-label truncate">
                  {item.name} <span className="cart-summary__qty">x{item.quantity}</span>
                </span>
                <span className="cart-summary__row-value">
                  ${Number(item.price * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Total</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>

          {error && (
            <p className="form-error" style={{ marginTop: 'var(--sp-3)' }}>⚠ {error}</p>
          )}

          <button
            className="btn btn--primary btn--full btn--lg cart-summary__cta"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirmando...' : '✓ Confirmar pedido'}
          </button>

          <p className="checkout-secure-note">
            <LockIcon />
            Checkout simulado — no se realizará ningún cobro real
          </p>
        </aside>

      </div>
    </div>
  );
}

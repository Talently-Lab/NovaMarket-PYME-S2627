import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    phone: '',
    notes: '',
  });

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

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
        quantity: item.quantity,
        unit_price: Number(item.price),
      }));

      const { data } = await ordersAPI.create({
        items: orderItems,
        shipping,
      });

      clearCart();
      navigate('/pedido-confirmado', { state: { order: data.order } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-extrabold)',
        letterSpacing: '-0.03em',
        marginBottom: 'var(--sp-8)',
      }}>
        Checkout
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: 'var(--sp-8)',
        alignItems: 'start',
      }}>
        {/* Datos de envío */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--sp-8)',
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--sp-6)' }}>
            Datos de envío
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre completo *</label>
            <input className="form-input" type="text" id="name" name="name"
              value={shipping.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="address">Dirección *</label>
            <input className="form-input" type="text" id="address" name="address"
              value={shipping.address} onChange={handleChange} placeholder="Calle 123, Piso 4" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="city">Ciudad *</label>
            <input className="form-input" type="text" id="city" name="city"
              value={shipping.city} onChange={handleChange} placeholder="Buenos Aires" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Teléfono</label>
            <input className="form-input" type="tel" id="phone" name="phone"
              value={shipping.phone} onChange={handleChange} placeholder="+54 9 11 1234 5678" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notas (opcional)</label>
            <input className="form-input" type="text" id="notes" name="notes"
              value={shipping.notes} onChange={handleChange} placeholder="Instrucciones para el envío" />
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="cart-summary">
          <h2 className="cart-summary__title">Tu pedido</h2>

          {items.map((item) => (
            <div key={item.id} className="cart-summary__row">
              <span className="truncate" style={{ maxWidth: 160 }}>
                {item.name} x{item.quantity}
              </span>
              <span>${Number(item.price * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>

          {error && (
            <p className="form-error" style={{ marginTop: 'var(--sp-4)' }}>⚠ {error}</p>
          )}

          <button
            className="btn btn--gradient btn--full btn--lg"
            onClick={handleConfirm}
            disabled={loading}
            style={{ marginTop: 'var(--sp-6)' }}
          >
            {loading ? 'Confirmando...' : '✓ Confirmar pedido'}
          </button>

          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-disabled)',
            textAlign: 'center',
            marginTop: 'var(--sp-3)',
          }}>
            🔒 Checkout simulado — no se realizará ningún cobro real
          </p>
        </div>
      </div>
    </div>
  );
}

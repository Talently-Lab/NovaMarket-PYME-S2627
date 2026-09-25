import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-16) var(--sp-4)' }}>
        <p style={{ fontSize: '4rem', marginBottom: 'var(--sp-4)' }}>🛒</p>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--sp-2)' }}>
          Tu carrito está vacío
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-8)' }}>
          Agregá productos desde el catálogo para empezar.
        </p>
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-extrabold)',
        letterSpacing: '-0.03em',
        marginBottom: 'var(--sp-8)'
      }}>
        Tu carrito ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
      </h1>

      <div className="cart-page">
        {/* Items */}
        <div>
          {items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              gap: 'var(--sp-4)',
              padding: 'var(--sp-4)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: 'var(--sp-3)',
              alignItems: 'center',
            }}>
              {/* Imagen */}
              <div style={{
                width: 80, height: 80, flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--color-surface-2)',
              }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>📦</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-1)' }} className="truncate">
                  {item.name}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  ${Number(item.price).toLocaleString('es-AR')} c/u
                </p>
              </div>

              {/* Cantidad */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexShrink: 0 }}>
                <button
                  className="btn btn--secondary btn--sm btn--icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Restar"
                >−</button>
                <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 'var(--weight-semibold)' }}>
                  {item.quantity}
                </span>
                <button
                  className="btn btn--secondary btn--sm btn--icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Sumar"
                >+</button>
              </div>

              {/* Subtotal */}
              <p style={{ fontWeight: 'var(--weight-bold)', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>
                ${Number(item.price * item.quantity).toLocaleString('es-AR')}
              </p>

              {/* Eliminar */}
              <button
                className="btn btn--ghost btn--sm btn--icon"
                onClick={() => removeItem(item.id)}
                aria-label="Eliminar producto"
                style={{ color: 'var(--color-error)', flexShrink: 0 }}
              >✕</button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="btn btn--ghost btn--sm"
            style={{ color: 'var(--color-text-disabled)', marginTop: 'var(--sp-2)' }}
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="cart-summary">
          <h2 className="cart-summary__title">Resumen</h2>

          {items.map((item) => (
            <div key={item.id} className="cart-summary__row">
              <span className="truncate" style={{ maxWidth: 160 }}>{item.name} x{item.quantity}</span>
              <span>${Number(item.price * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>

          <button
            className="btn btn--gradient btn--full btn--lg"
            onClick={handleCheckout}
            style={{ marginTop: 'var(--sp-6)' }}
          >
            {isAuthenticated ? 'Confirmar pedido' : 'Ingresar para comprar'}
          </button>

          <Link
            to="/catalogo"
            className="btn btn--ghost btn--full"
            style={{ marginTop: 'var(--sp-2)' }}
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

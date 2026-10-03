import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const itemVariants = {
  hidden:  { opacity: 0, height: 0, marginBottom: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -40, height: 0, marginBottom: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/carrito' } });
    } else {
      navigate('/checkout');
    }
  };

  // Carrito vacío
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--color-text-disabled)' }}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h1 className="cart-empty__title">Tu carrito está vacío</h1>
        <p className="cart-empty__desc">
          Agregá productos desde el catálogo para empezar.
        </p>
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper container">

      {/* Título */}
      <div className="cart-page-header">
        <h1 className="cart-page-title">
          Tu carrito
          <span className="cart-page-title__count">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="btn btn--ghost btn--sm cart-clear-btn"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="cart-layout">

        {/* ── Lista de items ── */}
        <div className="cart-items-list">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="cart-item"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >

                {/* Imagen */}
                <div className="cart-item__img">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} />
                    : <div className="cart-item__img-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          style={{ color: 'var(--color-text-disabled)' }}>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="cart-item__info">
                  <p className="cart-item__name">{item.name}</p>
                  <p className="cart-item__price">
                    ${Number(item.price).toLocaleString('es-AR')} c/u
                  </p>
                </div>

                {/* Cantidad */}
                <div className="cart-item__qty-wrapper">
                  <div className="cart-item__qty">
                    <motion.button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Restar uno"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >−</motion.button>
                    <motion.span
                      key={item.quantity}
                      className="cart-item__qty-num"
                      initial={{ scale: 1.3, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.quantity}
                    </motion.span>
                    <motion.button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Sumar uno"
                      disabled={item.stock != null && item.quantity >= item.stock}
                      whileHover={item.stock == null || item.quantity < item.stock ? { scale: 1.1 } : {}}
                      whileTap={item.stock == null || item.quantity < item.stock ? { scale: 0.9 } : {}}
                    >+</motion.button>
                  </div>
                  {item.stock != null && item.quantity >= item.stock && (
                    <span className="cart-item__stock-limit">Máx. disponible</span>
                  )}
                </div>

                {/* Subtotal */}
                <p className="cart-item__subtotal">
                  ${Number(item.price * item.quantity).toLocaleString('es-AR')}
                </p>

                {/* Eliminar */}
                <motion.button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Eliminar ${item.name}`}
                  whileHover={{ scale: 1.15, rotate: -8 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <TrashIcon />
                </motion.button>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Resumen lateral ── */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen</h2>

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

          <button
            className="btn btn--primary btn--full btn--lg cart-summary__cta"
            onClick={handleCheckout}
          >
            {isAuthenticated ? 'Confirmar pedido →' : 'Ingresar para comprar'}
          </button>

          <Link
            to="/catalogo"
            className="btn btn--ghost btn--full cart-summary__back"
          >
            ← Seguir comprando
          </Link>
        </aside>

      </div>
    </div>
  );
}

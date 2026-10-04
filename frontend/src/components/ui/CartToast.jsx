import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartToast() {
  const { lastAdded, itemCount } = useCart();

  return (
    <AnimatePresence>
      {lastAdded && (
        <motion.div
          className="cart-toast"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          role="status"
          aria-live="polite"
        >
          <span className="cart-toast__check">✓</span>
          <span className="cart-toast__text">
            <strong>{lastAdded.name}</strong> agregado al carrito
          </span>
          <Link to="/carrito" className="cart-toast__btn">
            Ver carrito ({itemCount})
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

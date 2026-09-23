import { Link } from 'react-router-dom';

export default function CartPage() {
  return (
    <div className="cart">
      <h1>Tu carrito</h1>
      {/* Items del carrito — pendiente de conectar con CartContext */}
      <p>El carrito está vacío.</p>
      <Link to="/catalogo" className="btn btn--secondary">
        Seguir comprando
      </Link>
    </div>
  );
}

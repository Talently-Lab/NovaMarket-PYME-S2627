import { Link } from 'react-router-dom';

export default function OrderConfirmedPage() {
  return (
    <div className="order-confirmed">
      <h1>¡Pedido confirmado!</h1>
      <p>Gracias por tu compra. Te enviaremos los detalles por email.</p>
      <Link to="/" className="btn btn--primary">
        Volver al inicio
      </Link>
    </div>
  );
}

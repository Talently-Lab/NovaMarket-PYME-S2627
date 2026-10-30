import { Link } from 'react-router-dom';

export default function SeguimientoPedidosPage() {
  return (
    <div className="help-page container">
      <nav className="help-page__breadcrumb" aria-label="Ruta de navegación">
        <Link to="/" className="help-page__breadcrumb-link">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Seguimiento de pedidos</span>
      </nav>

      <h1 className="help-page__title">Seguimiento de pedidos</h1>

      <section className="help-page__section">
        <h2>¿Cómo rastrear mi pedido?</h2>
        <p>Una vez confirmado tu pedido, recibirás un correo con el número de seguimiento. También podés consultarlo desde tu cuenta en <Link to="/mis-pedidos">Mis Pedidos</Link>.</p>
      </section>

      <section className="help-page__section">
        <h2>Tiempos de entrega estimados</h2>
        <ul className="help-page__list">
          <li><strong>CABA y GBA:</strong> 2 a 4 días hábiles</li>
          <li><strong>Interior del país:</strong> 5 a 10 días hábiles</li>
          <li><strong>Zonas remotas:</strong> hasta 15 días hábiles</li>
        </ul>
      </section>

      <section className="help-page__section">
        <h2>¿Tu pedido no llegó en el plazo estimado?</h2>
        <p>Contactanos por correo a <a href="mailto:ventas@novamarket.com.ar" className="help-page__link">ventas@novamarket.com.ar</a> con tu número de pedido y te respondemos dentro de las 48 hs hábiles.</p>
      </section>

      <div className="help-page__cta">
        <Link to="/mis-pedidos" className="btn btn--primary">Ver mis pedidos</Link>
        <Link to="/ayuda/contacto" className="btn btn--secondary">Contactar soporte</Link>
      </div>
    </div>
  );
}

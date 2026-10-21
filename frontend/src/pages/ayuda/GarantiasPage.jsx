import { Link } from 'react-router-dom';

export default function GarantiasPage() {
  return (
    <div className="help-page container">
      <nav className="help-page__breadcrumb" aria-label="Ruta de navegación">
        <Link to="/" className="help-page__breadcrumb-link">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Garantías y devoluciones</span>
      </nav>

      <h1 className="help-page__title">Garantías y devoluciones</h1>

      <section className="help-page__section">
        <h2>Garantía oficial</h2>
        <p>Todos los productos vendidos en NovaMarket cuentan con <strong>12 meses de garantía oficial del fabricante</strong> contra defectos de fabricación, a partir de la fecha de compra.</p>
      </section>

      <section className="help-page__section">
        <h2>¿Qué cubre la garantía?</h2>
        <ul className="help-page__list">
          <li>Defectos de fabricación</li>
          <li>Fallas de funcionamiento en condiciones normales de uso</li>
          <li>Componentes internos defectuosos</li>
        </ul>
        <h2>¿Qué no cubre?</h2>
        <ul className="help-page__list">
          <li>Daños por mal uso o accidentes</li>
          <li>Desgaste normal del producto</li>
          <li>Daños por líquidos o golpes</li>
          <li>Modificaciones no autorizadas</li>
        </ul>
      </section>

      <section className="help-page__section">
        <h2>Política de devoluciones</h2>
        <p>Aceptamos devoluciones dentro de los <strong>30 días corridos</strong> desde la recepción del producto, siempre que:</p>
        <ul className="help-page__list">
          <li>El producto esté sin uso y en su embalaje original</li>
          <li>Se incluya el comprobante de compra</li>
          <li>No presente daños ocasionados por el cliente</li>
        </ul>
        <p>Para iniciar una devolución, contactanos a <a href="mailto:ventas@novamarket.com.ar" className="help-page__link">ventas@novamarket.com.ar</a> indicando tu número de pedido.</p>
      </section>

      <section className="help-page__section">
        <h2>Proceso de devolución</h2>
        <ol className="help-page__list help-page__list--ordered">
          <li>Envianos un correo con tu número de pedido y el motivo de la devolución</li>
          <li>Te confirmaremos la elegibilidad dentro de las 48 hs hábiles</li>
          <li>Te indicaremos la dirección de envío del producto</li>
          <li>Una vez recibido e inspeccionado, procesamos el reembolso en 5 a 10 días hábiles</li>
        </ol>
      </section>

      <div className="help-page__cta">
        <a href="mailto:ventas@novamarket.com.ar" className="btn btn--primary">Iniciar devolución</a>
        <Link to="/ayuda/faq" className="btn btn--secondary">Ver preguntas frecuentes</Link>
      </div>
    </div>
  );
}

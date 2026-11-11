import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Simulado — abre el cliente de correo con los datos prellenados
    const subject = encodeURIComponent(`[NovaMarket] ${form.asunto}`);
    const body = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\n\n${form.mensaje}`);
    window.location.href = `mailto:ventas@novamarket.com.ar?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="help-page container">
      <nav className="help-page__breadcrumb" aria-label="Ruta de navegación">
        <Link to="/" className="help-page__breadcrumb-link">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Contacto con ventas</span>
      </nav>

      <h1 className="help-page__title">Contacto con ventas</h1>
      <p className="help-page__intro">¿Tenés consultas sobre productos, precios o tu pedido? Escribinos y te respondemos dentro de las 48 hs hábiles.</p>

      <div className="contact-layout">

        {/* Formulario */}
        <div className="contact-form-card">
          {sent ? (
            <div className="contact-sent">
              <p className="contact-sent__title">¡Mensaje enviado!</p>
              <p>Tu cliente de correo se abrió con los datos prellenados. Si no se abrió, escribinos directamente a <a href="mailto:ventas@novamarket.com.ar" className="help-page__link">ventas@novamarket.com.ar</a>.</p>
              <button className="btn btn--secondary" onClick={() => setSent(false)}>Enviar otro mensaje</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="c-nombre">Nombre completo</label>
                <input className="form-input" id="c-nombre" name="nombre"
                  value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-email">Email</label>
                <input className="form-input" id="c-email" name="email" type="email"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-asunto">Asunto</label>
                <input className="form-input" id="c-asunto" name="asunto"
                  value={form.asunto} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-mensaje">Mensaje</label>
                <textarea className="form-input" id="c-mensaje" name="mensaje" rows={5}
                  value={form.mensaje} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
                Enviar consulta
              </button>
            </form>
          )}
        </div>

        {/* Info de contacto */}
        <div className="contact-info">
          <div className="contact-info__item">
            <span className="contact-info__label">Email</span>
            <a href="mailto:ventas@novamarket.com.ar" className="help-page__link">
              ventas@novamarket.com.ar
            </a>
          </div>
          <div className="contact-info__item">
            <span className="contact-info__label">Horario de atención</span>
            <span>Lunes a viernes de 9 a 18 hs</span>
          </div>
          <div className="contact-info__item">
            <span className="contact-info__label">Tiempo de respuesta</span>
            <span>Hasta 48 hs hábiles</span>
          </div>
          <div className="contact-info__divider" />
          <p className="contact-info__note">
            Para consultas urgentes sobre pedidos en tránsito, indicá tu número de pedido en el asunto.
          </p>
        </div>

      </div>
    </div>
  );
}

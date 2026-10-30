import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }
    // Simulado — en producción conectar a Brevo / Mailchimp
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="newsletter__inner container">
        <div className="newsletter__text">
          <p className="newsletter__eyebrow">NEWSLETTER</p>
          <h2 className="newsletter__title" id="newsletter-title">
            Suscribite y obtené <span className="newsletter__highlight">10% OFF</span> en tu primera compra
          </h2>
          <p className="newsletter__subtitle">
            Ofertas exclusivas, lanzamientos y novedades tech directo a tu correo.
          </p>
        </div>

        <div className="newsletter__form-col">
          {status === 'success' ? (
            <div className="newsletter__success" role="status">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#D2EE42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p>¡Listo! Revisá tu correo para recibir tu cupón.</p>
            </div>
          ) : (
            <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
              <div className="newsletter__input-row">
                <input
                  className={`newsletter__input${status === 'error' ? ' newsletter__input--error' : ''}`}
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  aria-label="Tu correo electrónico"
                  required
                />
                <button type="submit" className="newsletter__btn">
                  Suscribirme
                </button>
              </div>
              {status === 'error' && (
                <p className="newsletter__error" role="alert">
                  Ingresá un correo válido para continuar.
                </p>
              )}
              <p className="newsletter__disclaimer">
                Sin spam. Podés darte de baja cuando quieras.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

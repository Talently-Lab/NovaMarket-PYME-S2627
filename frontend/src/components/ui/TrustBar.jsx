const PILLARS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Envíos a todo el país',
    desc: 'CABA y GBA en 2-4 días. Interior en 5-10 días hábiles.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: 'Múltiples medios de pago',
    desc: 'Tarjeta, transferencia y billetera virtual. Hasta 12 cuotas.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Garantía oficial',
    desc: '12 meses de garantía de fábrica en todos los productos.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Soporte post-venta',
    desc: 'Atención de lunes a viernes de 9 a 18 hs por email.',
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Propuesta de valor">
      <div className="trust-bar__inner container">
        {PILLARS.map(({ icon, title, desc }) => (
          <div key={title} className="trust-bar__pillar">
            <span className="trust-bar__icon">{icon}</span>
            <div className="trust-bar__text">
              <p className="trust-bar__title">{title}</p>
              <p className="trust-bar__desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

/**
 * Tríptico de banners (Gaming / Smartphones / Next Level Tech).
 * Se usa igual en Home y en Catálogo para que tengan el mismo contenido.
 */
export default function BannerTriptico({ className = '', innerRef }) {
  return (
    <div className={`banner-triptico ${className}`.trim()} ref={innerRef}>

      {/* ── Banner 1 — Gaming ── */}
      <section className="banner-card" style={{ backgroundImage: "url('/images/Banner/Banner-Triptico_1.png')", backgroundSize: '100% 100%', backgroundPosition: 'center center' }}>
        <div className="banner-card__content banner-card__content--b1">
          <div className="banner-card__label-row">
            <span className="banner-card__label-bar" aria-hidden="true" />
            <span className="banner-card__label">GAMING</span>
          </div>
          <h2 className="banner-card__title banner-card__title--b1">JUGÁ SIN<br />LÍMITES</h2>
          <p className="banner-card__subtitle banner-card__subtitle--b1">Equipate con lo mejor<br />en tecnología gamer.</p>
          <Link to="/catalogo?categoria=gaming" className="banner-card__btn banner-card__btn--lime">
            VER GAMING →
          </Link>
        </div>
      </section>

      {/* ── Banner 2 — Smartphones ── */}
      <section className="banner-card" style={{ backgroundImage: "url('/images/Banner/Banner-Triptico_2.png')", backgroundSize: '100% 100%', backgroundPosition: 'center center' }}>
        <div className="banner-card__content banner-card__content--b2">
          <span className="banner-card__label banner-card__label--violet">SMARTPHONES</span>
          <h2 className="banner-card__title banner-card__title--b2">La tecnología<br />en tus manos</h2>
          <p className="banner-card__subtitle banner-card__subtitle--b2">Los mejores celulares<br />y accesorios.</p>
          <Link to="/catalogo?categoria=celulares" className="banner-card__btn banner-card__btn--outline">
            VER CELULARES →
          </Link>
        </div>
      </section>

      {/* ── Banner 3 — Next Level Tech ── */}
      <section className="banner-card" style={{ backgroundImage: "url('/images/Banner/Banner-Triptico_3.png')", backgroundSize: '100% 100%', backgroundPosition: 'center center' }}>
        <div className="banner-card__content banner-card__content--b3">
          {/* Corona SVG */}
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
            <path d="M1 20L5 6L11 14L14 2L17 14L23 6L27 20H1Z" fill="#7D1CE2"/>
            <path d="M1 20L5 6L11 14L14 2L17 14L23 6L27 20H1Z" stroke="#9b4de0" strokeWidth="0.5"/>
          </svg>
          <div className="banner-b3__titulo">
            <span className="banner-b3__line1">NEXT LEVEL</span>
            <div className="banner-b3__bottom-row">
              <span className="banner-b3__line2">TECH</span>
              <Link to="/catalogo" className="banner-card__btn-circle" aria-label="Ver catálogo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

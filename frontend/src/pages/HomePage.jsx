import { Link } from 'react-router-dom';

const CATEGORIES = [
  { icon: '🖱️', name: 'Periféricos' },
  { icon: '🎧', name: 'Audio' },
  { icon: '⌨️', name: 'Teclados' },
  { icon: '🖥️', name: 'Monitores' },
  { icon: '📱', name: 'Gadgets' },
  { icon: '🔌', name: 'Accesorios' },
  { icon: '🎮', name: 'Gaming' },
  { icon: '💡', name: 'Iluminación' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero__eyebrow">
          ✦ Tech para vos
        </div>
        <h1 className="hero__title">
          Todo lo que necesitás,<br />
          <span className="gradient">al alcance de un clic</span>
        </h1>
        <p className="hero__subtitle">
          Accesorios, periféricos y gadgets tech seleccionados para que tu setup sea lo que siempre quisiste.
        </p>
        <div className="hero__actions">
          <Link to="/catalogo" className="btn btn--gradient btn--lg">
            Explorar catálogo
          </Link>
          <Link to="/registro" className="btn btn--secondary btn--lg">
            Crear cuenta
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Categorías</h2>
            <Link to="/catalogo" className="section__link">
              Ver todo →
            </Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(({ icon, name }) => (
              <Link to={`/catalogo?categoria=${name.toLowerCase()}`} key={name}>
                <div className="category-card">
                  <span className="category-card__icon">{icon}</span>
                  <span className="category-card__name">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados — placeholder hasta conectar con API */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Destacados</h2>
            <Link to="/catalogo" className="section__link">
              Ver todo →
            </Link>
          </div>
          <div className="products-grid">
            {[1, 2, 3, 4].map(i => (
              <div className="card" key={i}>
                <div className="card__image">
                  <div style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 200,
                    background: 'var(--color-surface-2)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text-disabled)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    Sin imagen
                  </div>
                </div>
                <div className="card__body">
                  <p className="card__title">Producto de ejemplo #{i}</p>
                  <p className="card__desc">Descripción del producto. Se cargará desde el backend.</p>
                  <p className="card__price">
                    $XX.XXX
                    <span className="card__price--old">$XX.XXX</span>
                  </p>
                </div>
                <div className="card__footer">
                  <span className="badge badge--success">En stock</span>
                  <button className="btn btn--primary btn--sm">Agregar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

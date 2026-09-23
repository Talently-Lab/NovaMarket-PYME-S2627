import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__title">Tecnología que se adapta a vos</h1>
          <p className="home__subtitle">
            Accesorios, periféricos y gadgets tech. Encontrá lo que necesitás.
          </p>
          <Link to="/catalogo" className="btn btn--primary">
            Ver catálogo
          </Link>
        </div>
      </section>

      <section className="home__categories">
        <h2>Categorías</h2>
        <div className="home__categories-grid">
          {/* Categorías se cargarán dinámicamente desde el backend */}
          <div className="category-card">Periféricos</div>
          <div className="category-card">Accesorios</div>
          <div className="category-card">Gadgets</div>
          <div className="category-card">Audio</div>
        </div>
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="catalog">
      <h1>Catálogo</h1>
      <div className="catalog__layout">
        <aside className="catalog__filters">
          {/* Filtros — pendiente de implementar con datos del backend */}
          <h3>Filtros</h3>
        </aside>
        <section className="catalog__products">
          {/* Grilla de productos — pendiente de conectar con API */}
          <p>Cargando productos...</p>
        </section>
      </div>
    </div>
  );
}

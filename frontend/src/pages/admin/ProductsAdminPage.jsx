export default function ProductsAdminPage() {
  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h1>Gestión de Productos</h1>
        <button className="btn btn--primary">+ Nuevo producto</button>
      </div>
      {/* Tabla de productos — pendiente de conectar con API */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4}>Cargando productos...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

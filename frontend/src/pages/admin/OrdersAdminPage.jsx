export default function OrdersAdminPage() {
  return (
    <div className="admin-orders">
      <h1>Pedidos</h1>
      {/* Tabla de pedidos — pendiente de conectar con API */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5}>Cargando pedidos...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard__stats">
        {/* Métricas básicas — pendiente de conectar con API */}
        <div className="stat-card">
          <h3>Productos</h3>
          <p>—</p>
        </div>
        <div className="stat-card">
          <h3>Pedidos</h3>
          <p>—</p>
        </div>
      </div>
    </div>
  );
}

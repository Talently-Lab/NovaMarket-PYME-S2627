import { Outlet, Link } from 'react-router-dom';

// Layout del panel de administración — separado del layout público
export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar__title">NovaMarket Admin</h2>
        <nav className="admin-sidebar__nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/pedidos">Pedidos</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ScrollToTop from '../../components/ui/ScrollToTop';

// Layout del panel de administración — separado del layout público
export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Header />

      <div className="admin-body">
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

      <Footer />
      <ScrollToTop />
    </div>
  );
}
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Layout principal — envuelve todas las páginas públicas
export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

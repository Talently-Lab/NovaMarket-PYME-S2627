import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import RouteScrollReset from '../ui/RouteScrollReset';
import CartToast from '../ui/CartToast';
import RouteTitle from '../ui/RouteTitle';

export default function Layout() {
  return (
    <div className="layout">
      <RouteScrollReset />
      <RouteTitle />
      <a href="#contenido-principal" className="skip-link">Saltar al contenido</a>
      <Header />
      <main className="main" id="contenido-principal" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <CartToast />
    </div>
  );
}

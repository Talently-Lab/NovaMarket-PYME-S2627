import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import RouteScrollReset from '../ui/RouteScrollReset';
import CartToast from '../ui/CartToast';

export default function Layout() {
  return (
    <div className="layout">
      <RouteScrollReset />
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <CartToast />
    </div>
  );
}

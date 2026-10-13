import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import RouteScrollReset from '../ui/RouteScrollReset';
import CartToast from '../ui/CartToast';

// Variantes de transición de página — fade suave sin flash
// mode="sync": entrada y salida corren en paralelo → no hay gap de pantalla vacía
// exit sin desplazamiento Y → evita el flash visual al cambiar de ruta
const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0,        transition: { duration: 0.15, ease: 'easeOut' } },
};

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <RouteScrollReset />
      <Header />
      <main className="main">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
      <CartToast />
    </div>
  );
}

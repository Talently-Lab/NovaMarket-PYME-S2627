import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import { ProtectedRoute, AdminRoute } from './components/ui/ProtectedRoute';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/catalog/CatalogPage';
import ProductDetailPage from './pages/catalog/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderConfirmedPage from './pages/checkout/OrderConfirmedPage';
import MyOrdersPage from './pages/orders/MyOrdersPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import CustomersAdminPage from './pages/admin/CustomersAdminPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import ConfigAdminPage from './pages/admin/ConfigAdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Puente entre AuthContext y CartContext — pasa el userId al carrito
function CartWrapper({ children }) {
  const { user } = useAuth();
  return (
    <CartProvider userId={user?.id ?? null}>
      {children}
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartWrapper>
          <Routes>
            {/* Rutas públicas */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/catalogo/:id" element={<ProductDetailPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
              <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
              <Route path="/terminos" element={<TermsPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />

              {/* Checkout y pedidos — requiere estar autenticado */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedido-confirmado" element={<OrderConfirmedPage />} />
                <Route path="/mis-pedidos" element={<MyOrdersPage />} />
              </Route>
            </Route>

            {/* Rutas de administración */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"              element={<DashboardPage />} />
                <Route path="/admin/productos"    element={<ProductsAdminPage />} />
                <Route path="/admin/pedidos"      element={<OrdersAdminPage />} />
                <Route path="/admin/clientes"     element={<CustomersAdminPage />} />
                <Route path="/admin/categorias"   element={<CategoriesAdminPage />} />
                <Route path="/admin/config"       element={<ConfigAdminPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartWrapper>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

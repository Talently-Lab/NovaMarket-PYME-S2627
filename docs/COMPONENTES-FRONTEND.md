# NovaMarket · Componentes del Frontend (SCRUM-28)

Documento de revisión de diseño y componentización del frontend. Actualizado el 9/10/2026 leyendo el código de `frontend/src` en la rama `develop` (commit `16ff9c9`). La primera versión, del 6/10, estaba hecha sobre `main` y quedó vieja: `develop` tiene 49 commits más.

> **Alcance y límites.** Es una lectura estática del código. No se ejecutó la app, ni lint ni tests. **Todavía no se contrastó con el Figma de NovaMarket** (falta el link directo del archivo): la sección 7 lista lo que hay que validar contra el diseño.

## 1. Cómo está armado hoy
- **Stack:** React 19 + Vite 8 + React Router 7 + Axios. Para animaciones usa `framer-motion`; la home usa `three` y `@react-three/fiber` (`HeroParticles`); el PDF del comprobante usa `jspdf`. **No usa Tailwind** (el ticket SCRUM-38 lo pedía).
- **Estilos:** un único `src/index.css` (~5.800 líneas) con tokens y nomenclatura tipo BEM. Hoy hay un solo tema, el claro: `ThemeProvider` borra cualquier preferencia guardada y fija el color del navegador en `#F6F8FD`.
- **Estado global:** tres contextos (`AuthContext`, `CartContext`, `ThemeContext`). `App.jsx` tiene un puente (`CartWrapper`) que le pasa el `userId` al carrito.
- **Componentes reales:** 10 (3 de layout y 7 de UI). El resto de la interfaz vive dentro de las páginas con clases globales y estilos inline.

## 2. Componentes que ya existen

| Componente | Archivo | Props | Estados / comportamiento |
|---|---|---|---|
| `Layout` | `components/layout/Layout.jsx` | ninguna | Envuelve las rutas públicas: `RouteScrollReset`, `Header`, `<Outlet/>` con transición de página (fade + slide con `framer-motion`), `Footer`, `ScrollToTop` y `CartToast`. |
| `Header` | `components/layout/Header.jsx` | ninguna | Barra superior con logo, chip **Admin** (solo `role === 'admin'`), cuenta, carrito y **Salir**. Con sesión la cuenta muestra el primer nombre y lleva a «Mis pedidos»; sin sesión dice «Mi Cuenta» y lleva a `/login`. Barra secundaria de navegación y menú hamburguesa en mobile (`aria-expanded`). Badge del carrito (muestra `99+` desde 100). |
| `Footer` | `components/layout/Footer.jsx` | ninguna | Contenido estático con íconos SVG y links. No se revisó en detalle. |
| `ScrollToTop` | `components/ui/ScrollToTop.jsx` | ninguna | Botón que aparece después de 300 px de scroll. `aria-label="Volver al inicio"`. |
| `RouteScrollReset` | `components/ui/RouteScrollReset.jsx` | ninguna | No dibuja nada: lleva el scroll al tope cada vez que cambia la ruta. |
| `CartToast` | `components/ui/CartToast.jsx` | ninguna | Aviso «<producto> agregado al carrito» con link «Ver carrito (n)». Usa `lastAdded` del carrito, que se borra solo a los 2,5 s. `role="status"` y `aria-live="polite"`. |
| `HeroParticles` | `components/ui/HeroParticles.jsx` | ninguna | Fondo animado en 3D de la home. Se carga de forma diferida (`lazy`). |
| `ThemeToggle` | `components/ui/ThemeToggle.jsx` | ninguna | **No se usa en ningún lado.** Quedó de cuando había tema oscuro. Revisar si se elimina. |
| `ProtectedRoute` / `AdminRoute` | `components/ui/ProtectedRoute.jsx` | ninguna | `ProtectedRoute` redirige a `/login` si no hay sesión. `AdminRoute` además redirige a `/` si no es admin. |
| `AdminLayout` | `pages/admin/AdminLayout.jsx` | ninguna | Estructura del panel de administración (navegación lateral + `<Outlet/>`). |

## 3. Componentes a extraer (hoy están dentro de las páginas)
Propuesta de props y estados, tomada de lo que ya hacen las pantallas.

| Componente propuesto | Dónde está hoy | Props propuestas | Estados a cubrir |
|---|---|---|---|
| **`Button`** | Clase `.btn` repetida en todas las páginas | `variant` (`primary`, `secondary`, `ghost`, `outline`), `size`, `full`, `loading`, `disabled`, `as`/`to` | normal, hover, foco, deshabilitado, cargando (textos como «Creando cuenta...») |
| **`FormField`** (Input) | Login, Registro, Recuperar y Restablecer contraseña, Checkout, Admin | `label`, `name`, `type`, `value`, `onChange`, `error`, `hint`, `required`, `placeholder` | normal, foco, error (`.form-input.error`), deshabilitado |
| **`PasswordInput`** | Login, Registro y Restablecer contraseña (botón del ojo) | igual que `FormField` + `autoComplete` | contraseña oculta / visible |
| **`AuthCard`** | Login, Registro, Recuperar y Restablecer | `title`, `tabs`, `footer`, `children` | — |
| **`ProductCard`** | `CatalogPage` y `HomePage` | `product`, `onAdd`, `added` | en stock, sin stock, «agregado» |
| **`CategoryFilter`** | `CatalogPage` (lista `CATEGORIES` propia) | `categories`, `value`, `onChange` | categoría activa |
| **`CartItem`** | `CartPage` | `item`, `onQuantity`, `onRemove` | cantidad máxima según stock, al llegar a 0 se elimina |
| **`CartSummary`** | `CartPage` y `CheckoutPage` | `items`, `total`, `action`, `error` | con/sin sesión, cargando, error |
| **`PaymentMethodSelector`** | `CheckoutPage` (`PAYMENT_METHODS`: tarjeta, billetera virtual, transferencia) | `value`, `onChange` | método elegido; campos de tarjeta solo con «Tarjeta» |
| **`StatusBadge`** | Mis pedidos y Admin | `tone`, `children` | por estado de pedido |
| **`OrderCard`** | `MyOrdersPage` | `order` | loading, error, vacío |
| **`StatCard`** | `DashboardPage` (admin) | `label`, `value` | loading, error |
| **`Toast` genérico** | `CartToast` y el mensaje de bienvenida de `HomePage` (`flashMessage`) | `message`, `tone`, `onClose` | éxito, cierre |
| **`AdminTable`** | Productos, Pedidos, Clientes y Categorías (admin) | `columns`, `rows`, `loading`, `empty` | loading, vacío |

**Sobre `CartModal`:** el ticket lo cita como ejemplo, pero el carrito actual es una **página** (`/carrito`) más el aviso `CartToast`, no un modal. Hay que confirmar con el Figma si el diseño lo pide.

## 4. Contextos y utilidades

| Nombre | Archivo | API |
|---|---|---|
| `AuthContext` / `useAuth` | `context/AuthContext.jsx` | `user`, `isAuthenticated`, `isAdmin`, `loading`, `login(userData, token)`, `logout()`, `flashMessage`, `setFlashMessage`, `clearFlash`. Token en `localStorage` (`nm-token`). Al montar llama `GET /api/auth/me`. |
| `CartContext` / `useCart` | `context/CartContext.jsx` | `items`, `addItem(product, qty)`, `removeItem(id)`, `updateQuantity(id, qty)`, `clearCart()`, `total`, `itemCount`, `lastAdded`. Un carrito por usuario en `localStorage` (`nm-cart-{userId}`, o `nm-cart-guest`); al iniciar sesión se fusiona el carrito de invitado con el del usuario. Respeta el stock máximo de cada producto. |
| `ThemeContext` / `useTheme` | `context/ThemeContext.jsx` | Hoy el valor del contexto está vacío (`{}`): solo fuerza el tema claro. |
| `services/api.js` | `services/api.js` | Instancia de Axios con el JWT en cada pedido. Grupos: `authAPI`, `productsAPI`, `ordersAPI` (incluye cupones), `usersAPI` y `checkHealth`. Ante un 401 borra el token. |
| `getProductImage` | `utils/productImage.js` | Imagen del producto con respaldo según la categoría. |

## 5. Páginas y rutas

| Ruta | Página | Acceso | Estado |
|---|---|---|---|
| `/` | `HomePage` | pública | Hero con partículas 3D, categorías y secciones. |
| `/catalogo` | `CatalogPage` | pública | Con filtros, orden, loading, error y vacío. |
| `/catalogo/:id` | `ProductDetailPage` | pública | Conectada a la API (`productsAPI.getById`), con loading, error y «Producto no encontrado.». |
| `/carrito` | `CartPage` | pública | Con estado vacío. |
| `/login`, `/registro` | `LoginPage`, `RegisterPage` | pública | Con error y cargando. |
| `/olvide-contrasena`, `/restablecer-contrasena` | `ForgotPasswordPage`, `ResetPasswordPage` | pública | Flujo de recuperación de contraseña. |
| `/terminos`, `/privacidad` | `TermsPage`, `PrivacyPage` | pública | Estáticas. |
| `/checkout`, `/pedido-confirmado`, `/mis-pedidos` | `CheckoutPage`, `OrderConfirmedPage`, `MyOrdersPage` | requiere sesión | Checkout con tres métodos de pago (tarjeta, billetera virtual, transferencia). |
| `/admin` | `DashboardPage` | requiere rol admin | Indicadores. |
| `/admin/productos`, `/admin/pedidos`, `/admin/clientes`, `/admin/categorias`, `/admin/config` | `ProductsAdminPage`, `OrdersAdminPage`, `CustomersAdminPage`, `CategoriesAdminPage`, `ConfigAdminPage` | requiere rol admin | Panel completo con `AdminLayout`. |
| `*` | `NotFoundPage` | pública | Página 404. |

## 6. Hallazgos para resolver
1. **Estilos inline:** hay 85 `style={{…}}` repartidos en las páginas (los más cargados: `CategoriesAdminPage` 15, `OrderConfirmedPage` 15, `OrdersAdminPage` 10, `CustomersAdminPage` 9, `ProductsAdminPage` 8). Dificulta mantener el sistema de diseño (SCRUM-8).
2. **Categorías en tres lugares:** `CatalogPage` y `HomePage` definen cada una su `CATEGORIES`, y el `Header` tiene sus propios links por categoría. Conviene una sola fuente, y que coincida con las que administra `CategoriesAdminPage`.
3. **`ThemeToggle` sin uso** y `ThemeContext` vacío: hoy la app es solo clara. Decidir si se elimina el código del tema oscuro o se retoma.
4. **Tailwind:** el ticket SCRUM-38 lo pide y el proyecto no lo usa. Hay que decidir con Gisele.
5. **Token guardado dos veces:** `LoginPage` y `RegisterPage` hacen `localStorage.setItem('nm-token', …)` y luego `login()` lo vuelve a guardar. Es redundante.
6. **Sesión y 401:** el interceptor de `services/api.js` borra el token ante un 401 pero no limpia `user` en el contexto, así que la interfaz puede seguir mostrando al usuario logueado. Se corrige en el PR #5 (SCRUM-45).
7. **Registro:** no tiene el campo «Repetir contraseña». Se agrega en el PR #5.
8. **Páginas muy largas:** `MyOrdersPage` (573 líneas), `CheckoutPage` (570) y `CatalogPage` (462) concentran mucha lógica y se benefician de la extracción de la sección 3.
9. **Sin cobertura de estados verificada:** no se revisó una por una si cada pantalla de admin cubre loading, error y vacío.

## 7. Pendiente de validar contra el Figma
- Que cada componente propuesto coincida con el sistema de diseño (SCRUM-34, en revisión).
- Si el diseño pide `CartModal`, galería o selector de cantidad en el detalle de producto.
- Si el diseño final mantiene el tema claro único o vuelve el oscuro.
- Colores, tipografías y textos finales, para reemplazar los tokens actuales.
- Estados de cada componente (hover, foco, deshabilitado, error) y breakpoints responsive.

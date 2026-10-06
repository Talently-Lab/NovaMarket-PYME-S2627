# NovaMarket · Componentes del Frontend (SCRUM-28)

Documento de revisión de diseño y componentización del frontend. Armado el 6/10/2026 leyendo el código de `frontend/src` en la rama `main` (commit `580064e`).

> **Alcance y límites.** Es una lectura estática del código. No se ejecutó la app, ni lint ni tests. **Todavía no se contrastó con el Figma de NovaMarket** (falta el link directo del archivo): la sección 6 lista lo que hay que validar contra el diseño.

## 1. Cómo está armado hoy
- **Stack:** React 19 + Vite 8 + React Router 7 + Axios. **No usa Tailwind** (el ticket SCRUM-38 lo pedía).
- **Estilos:** un único `src/index.css` (~2.480 líneas) con tokens (`--brand-*`, `--accent-*`, `--sp-*`, `--text-*`, `--color-*`), nomenclatura tipo BEM y tema oscuro por defecto con `[data-theme="light"]`.
- **Estado global:** tres contextos (`AuthContext`, `CartContext`, `ThemeContext`) y un hook (`usePagination`).
- **Componentes reales:** solo 7. El resto de la interfaz vive dentro de las páginas con clases globales y estilos inline.

## 2. Componentes que ya existen

| Componente | Archivo | Props | Estados / comportamiento |
|---|---|---|---|
| `Layout` | `components/layout/Layout.jsx` | ninguna | Envuelve las rutas públicas: `Header`, `<Outlet/>`, `Footer`, `ScrollToTop`. |
| `Header` | `components/layout/Header.jsx` | ninguna | Transparente en la home al tope y sólido al hacer scroll. Menú hamburguesa en mobile (`aria-expanded`). Con sesión: nombre, "Mis pedidos" y "Salir"; sin sesión: "Ingresar". Link a Administración solo para `role === 'admin'`. Badge del carrito (muestra `99+` desde 100). |
| `Footer` | `components/layout/Footer.jsx` | ninguna | Contenido estático con íconos SVG y links. No se revisó en detalle. |
| `ScrollToTop` | `components/ui/ScrollToTop.jsx` | ninguna | Aparece después de 300 px de scroll. `aria-label="Volver al inicio"`. |
| `ThemeToggle` | `components/ui/ThemeToggle.jsx` | ninguna | Alterna claro/oscuro con `useTheme()`. `aria-label` y `title` cambian según el tema. |
| `Pagination` | `components/ui/Pagination.jsx` | `page`, `totalPages`, `onChange(page)`, `totalItems`, `pageSize` | No renderiza si `totalPages <= 1`. "Anterior" deshabilitado en la primera página y "Siguiente" en la última. |
| `ProtectedRoute` / `AdminRoute` | `components/ui/ProtectedRoute.jsx` | ninguna | `ProtectedRoute` redirige a `/login` si no hay sesión. `AdminRoute` además redirige a `/` si no es admin. |

## 3. Componentes a extraer (hoy están dentro de las páginas)
Propuesta de props y estados, tomada de lo que ya hacen las pantallas.

| Componente propuesto | Dónde está hoy | Props propuestas | Estados a cubrir |
|---|---|---|---|
| **`Button`** | Clase `.btn` repetida en todas las páginas | `variant` (`primary`, `secondary`, `ghost`, `outline`, `gradient`), `size` (`sm`, `md`, `lg`), `full`, `icon`, `loading`, `disabled`, `as`/`to` | normal, hover, foco, deshabilitado, cargando (texto "Ingresando…", "Confirmando…") |
| **`FormField`** (Input) | Login, Registro, Checkout, Admin | `label`, `name`, `type`, `value`, `onChange`, `error`, `hint`, `required`, `placeholder` | normal, foco, error (`.form-input.error`), deshabilitado |
| **`PasswordInput`** | Login y Registro (botón del ojo) | igual que `FormField` + `autoComplete` | contraseña oculta / visible |
| **`ProductCard`** | `CatalogPage` | `product`, `onAdd`, `added` | en stock, sin stock (botón deshabilitado), "✓ Agregado" por 1,5 s |
| **`ProductGrid` (con estados)** | `CatalogPage` | `products`, `loading`, `error` | **loading**, **error**, **vacío** (ya existen los tres, con estilos inline) |
| **`CategoryFilter`** | `CatalogPage` (sidebar) | `categories`, `value`, `onChange` | categoría activa |
| **`CartItem`** | `CartPage` | `item`, `onQuantity`, `onRemove` | cantidad mínima (al llegar a 0 se elimina), sin imagen (ícono 📦) |
| **`CartSummary`** | `CartPage` y `CheckoutPage` | `items`, `total`, `action`, `error` | con/sin sesión (cambia el texto del botón), cargando, error |
| **`Badge` / `StatusBadge`** | Catálogo, Pedidos, Admin | `tone` (`success`, `error`, `warning`, `neutral`, `primary`), `children` | por estado de pedido: pendiente, confirmado, enviado, entregado, cancelado |
| **`OrderCard`** | `MyOrdersPage` | `order` | loading, error, vacío |
| **`StatCard`** | `DashboardPage` (admin) | `label`, `value` | loading, error |
| **`Toast`** | `HomePage` (muestra `flashMessage` del `AuthContext`, p. ej. tras registrarse) | `message`, `tone`, `onClose` | éxito, cierre |
| **`AuthCard`** | Login y Registro | `title`, `subtitle`, `footer`, `children` | — |

**Sobre `CartModal`:** el ticket lo cita como ejemplo, pero el carrito actual es una **página** (`/carrito`), no un modal. Hay que confirmar con el Figma si el diseño lo pide.

## 4. Contextos y hooks

| Nombre | Archivo | API |
|---|---|---|
| `AuthContext` / `useAuth` | `context/AuthContext.jsx` | `user`, `isAuthenticated`, `isAdmin`, `loading`, `login(userData, token)`, `logout()`, `flashMessage`, `setFlashMessage`, `clearFlash`. Token en `localStorage` (`nm-token`). Al montar llama `GET /api/auth/me`. |
| `CartContext` / `useCart` | `context/CartContext.jsx` | `items`, `addItem(product, qty)`, `removeItem(id)`, `updateQuantity(id, qty)`, `clearCart()`, `total`, `itemCount`. Persiste en `localStorage` (`nm-cart`). |
| `ThemeContext` / `useTheme` | `context/ThemeContext.jsx` | `isDark`, `toggleTheme()`. |
| `usePagination(items, pageSize = 10)` | `hooks/usePagination.js` | `{ page, setPage, totalPages, pageItems }`. Corrige la página si queda fuera de rango. |

## 5. Páginas y rutas

| Ruta | Página | Acceso | Estado |
|---|---|---|---|
| `/` | `HomePage` | pública | Hero, categorías y secciones. |
| `/catalogo` | `CatalogPage` | pública | Con filtros, orden, loading, error y vacío. |
| `/catalogo/:id` | `ProductDetailPage` | pública | **Placeholder**: muestra "Cargando producto #id…" y dice "pendiente de conectar con API". |
| `/carrito` | `CartPage` | pública | Con estado vacío. |
| `/login`, `/registro` | `LoginPage`, `RegisterPage` | pública | Con error y cargando. |
| `/terminos`, `/privacidad` | `TermsPage`, `PrivacyPage` | pública | Estáticas. |
| `/checkout`, `/pedido-confirmado`, `/mis-pedidos` | `CheckoutPage`, `OrderConfirmedPage`, `MyOrdersPage` | requiere sesión | Checkout simulado, sin cobro real. |
| `/admin`, `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id/editar`, `/admin/pedidos` | páginas de admin | requiere rol admin | Panel con dashboard, productos y pedidos. `EditProductAdminPage` tiene solo 8 líneas: revisar si está completa. |
| `*` | `NotFoundPage` | pública | Página 404 con estilo de terminal. |

## 6. Hallazgos para resolver
1. **`ProductDetailPage` es un placeholder**, pero el catálogo tiene un botón "Ver" que lleva a esa ruta. Es la brecha funcional más visible del flujo de compra.
2. **Categorías duplicadas:** `constants/categories.js` tiene 8 y `CatalogPage` define su propia lista con "Todos". Conviene usar una sola fuente.
3. **Imágenes distintas según la pantalla:** el catálogo usa `getProductImage(product)` (con respaldo por categoría), pero el carrito usa `item.image_url` y, si falta, un ícono 📦. El mismo producto puede verse diferente.
4. **Estilos inline:** muchos estados (loading, error, vacío) y el sidebar de filtros usan `style={{…}}` en vez de clases. Dificulta mantener el sistema de diseño (SCRUM-8).
5. **Tailwind:** el ticket SCRUM-38 lo pide y el proyecto no lo usa. Hay que decidir con Gisele.
6. **Token guardado dos veces:** `LoginPage` hace `localStorage.setItem('nm-token', …)` y luego `login()` lo vuelve a guardar. Es redundante.
7. **Sesión y 401:** el interceptor de `services/api.js` borra el token ante un 401 pero no limpia `user` en el contexto, así que la interfaz puede seguir mostrando al usuario logueado (SCRUM-45).
8. **Registro:** `register()` no está en `AuthContext`; `RegisterPage` llama a la API directamente (SCRUM-45).
9. **Estados no verificados:** no se revisó si `ProductsAdminPage` y `OrdersAdminPage` cubren loading, error y vacío.

## 7. Pendiente de validar contra el Figma
- Que cada componente propuesto coincida con el sistema de diseño (SCRUM-34, en revisión).
- Si el diseño pide `CartModal`, galería o selector de cantidad en el detalle de producto.
- Colores, tipografías y textos finales, para reemplazar los tokens actuales.
- Estados de cada componente (hover, foco, deshabilitado, error) y breakpoints responsive.

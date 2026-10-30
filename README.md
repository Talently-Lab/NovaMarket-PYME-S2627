# NovaMarket — Plataforma E-commerce para PYME

Plataforma de e-commerce B2C para venta de accesorios tecnológicos, periféricos y gadgets. Desarrollada para PYMEs que necesitan independizarse de marketplaces de terceros, controlar su catálogo, gestionar pedidos y mejorar la experiencia del cliente.

**Versión:** 1.0.0  
**Estado:** Producción  
**Repositorio:** github.com/Talently-Lab/NovaMarket-PYME-S2627

---

## Propuesta de Valor

NovaMarket resuelve el problema de dependencia de plataformas externas mediante:

- **Canal de venta propio:** Control total sobre catálogo, precios y experiencia de compra
- **Gestión centralizada:** Panel administrativo para productos, pedidos y clientes
- **Experiencia personalizada:** Catálogo con filtros, carrito persistente y checkout optimizado
- **Escalabilidad:** Arquitectura modular y QA automatizado para crecimiento sostenible

---

## Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://novamarket-pyme-s2627.netlify.app/ |
| Backend API | https://novamarket-api-ikcm.onrender.com |
| Health Check | https://novamarket-api-ikcm.onrender.com/api/health |

> **Nota:** El backend corre en Render free tier. El primer request tras inactividad puede tardar hasta 30 segundos mientras arranca el contenedor.

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 22.x | Runtime JavaScript |
| Express | 5.x | Framework HTTP |
| PostgreSQL | — | Base de datos relacional (hosting: Supabase) |
| pg | 8.x | Cliente PostgreSQL |
| jsonwebtoken | 9.x | Autenticación JWT |
| bcryptjs | 2.x | Hash de contraseñas |
| express-rate-limit | 7.x | Rate limiting de API |
| nodemailer / resend | — | Email transaccional |
| @supabase/supabase-js | 2.x | Cliente Supabase |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.x | UI library |
| Vite | 8.x | Bundler y dev server |
| React Router | 7.x | Navegación SPA |
| Axios | 1.x | Cliente HTTP |
| Framer Motion | 11.x | Animaciones |
| Three.js + R3F | 0.169/9.x | Componentes 3D (hero particles) |
| jsPDF | 2.x | Generación de PDFs |

### Testing y QA
| Herramienta | Uso |
|-------------|-----|
| Jest + Supertest | Tests unitarios y de integración de API |
| pg-mem | Base de datos en memoria para tests aislados |
| Playwright | Tests E2E (multi-browser, mobile) |
| GitHub Actions | Pipeline CI/CD automatizado |
| Netlify | Deploy frontend con preview environments |
| Render | Deploy backend |

---

## Estructura del Repositorio

```
NovaMarket-PYME-S2627/
├── backend/                 # API REST con Express + PostgreSQL
│   ├── src/
│   │   ├── config/         # Configuración de base de datos
│   │   ├── controllers/    # Lógica de negocio por módulo
│   │   ├── middlewares/    # Auth, rate limiting, validación
│   │   ├── models/         # Modelos de datos (User, Product, Order)
│   │   ├── routes/         # Definición de endpoints REST
│   │   ├── services/       # Servicios externos (email)
│   │   └── index.js        # Entry point del servidor
│   ├── .env.example        # Plantilla de variables de entorno
│   └── package.json        # Dependencias y scripts backend
│
├── frontend/                # SPA React + Vite
│   ├── src/
│   │   ├── components/     # Componentes UI reutilizables
│   │   │   ├── layout/     # Header, Footer, Layout
│   │   │   └── ui/         # Button, ProductCard, modales
│   │   ├── context/        # Estado global (Auth, Cart, Theme)
│   │   ├── hooks/          # Custom hooks React
│   │   ├── pages/          # Páginas de la aplicación
│   │   │   ├── admin/      # Panel administrativo
│   │   │   ├── auth/       # Login, registro, recuperación
│   │   │   ├── catalog/    # Catálogo y detalle de producto
│   │   │   ├── cart/       # Carrito de compras
│   │   │   ├── checkout/   # Flujo de compra
│   │   │   └── orders/     # Historial de pedidos
│   │   ├── services/       # Cliente API y servicios
│   │   ├── utils/          # Utilidades (helpers)
│   │   ├── App.jsx         # Enrutador principal
│   │   ├── main.jsx        # Entry point React
│   │   └── index.css       # Design system (8100+ líneas)
│   ├── public/             # Assets estáticos
│   ├── netlify.toml        # Configuración deploy Netlify
│   └── package.json        # Dependencias y scripts frontend
│
├── tests/                   # Suite de pruebas automatizadas
│   ├── api/                # Tests de integración de API (Jest + Supertest)
│   │   ├── auth.api.test.ts
│   │   ├── products.api.test.ts
│   │   ├── orders.api.test.ts
│   │   └── health.api.test.ts
│   ├── e2e/                # Tests end-to-end (Playwright)
│   │   ├── pages/          # Page Object Models
│   │   └── specs/          # Suites de pruebas E2E
│   ├── security/           # Tests de seguridad (OWASP Top 10)
│   │   └── owasp/          # A01, A02, A05, A07, A09
│   ├── unit/               # Tests unitarios aislados
│   ├── helpers/            # Helpers para tests (pg-mem)
│   ├── playwright.config.ts # Configuración Playwright
│   └── reports/            # Reportes de ejecución
│
├── docs/                    # Documentación técnica y QA
│   ├── TEST_PLAN.md        # Plan de pruebas y estrategia QA
│   ├── bug-report.md       # Registro oficial de bugs (30 bugs documentados)
│   ├── qa-guides/          # Guías de Postman y automatización
│   ├── qa/                 # Auditorías responsive y reports
│   ├── sql/                # Migraciones y seeds de base de datos
│   ├── capturas/           # Capturas de pantalla del producto
│   └── CONTEXT.md          # Contexto completo del proyecto
│
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline CI/CD (GitHub Actions)
│
├── .kiro/
│   └── hooks/              # Git hooks personalizados
│
├── package.json            # Scripts raíz (tests globales)
├── jest.config.json        # Configuración Jest
├── tsconfig.json           # Configuración TypeScript (tests)
└── update-repo.sh          # Script de sincronización de ramas
```

---

## Requisitos Previos

- Node.js 22.x o superior
- npm 10.x o superior
- Cuenta en Supabase (PostgreSQL hosting)
- Git para control de versiones

---

## Instalación y Ejecución Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Talently-Lab/NovaMarket-PYME-S2627.git
cd NovaMarket-PYME-S2627
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales reales de Supabase
npm run dev
```

**Servidor backend:** http://localhost:3000

**Variables de entorno requeridas en `backend/.env`:**
```env
PORT=3000
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=tu_email@gmail.com
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env
npm run dev
```

**Aplicación frontend:** http://localhost:5173

**Variables de entorno en `frontend/.env`:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### 4. Ejecutar Migraciones de Base de Datos

Ejecutar en orden en el SQL Editor de Supabase (archivos en `docs/sql/`):

1. `001_create_users.sql` — Tabla users
2. `002_create_products.sql` — Tabla products
3. `003_create_orders.sql` — Tablas orders y order_items
4. `004_seed_products.sql` — 8 productos iniciales
5. `005_seed_more_products.sql` — +12 productos
6. `006_fix_product_images.sql` — Fix URLs de imágenes
7. `007_fix_product_images_v2.sql` — Fix v2
8. `008_add_payment_fields.sql` — Campos de pago
9. `009_add_reset_token.sql` — Token de recuperación
10. `010_create_coupons.sql` — Tabla coupons
11. `011_seed_celulares_notebooks.sql` — 10 productos nuevos
12. `012_multi_image_convention.sql` — Convención de múltiples imágenes

---

## Estrategia de Calidad y Pruebas

### Alcance de Pruebas

La estrategia QA cubre los siguientes módulos críticos:

- **Autenticación:** Registro, login, sesión JWT, recuperación de contraseña
- **Catálogo:** Listado, filtros, búsqueda, detalle de producto
- **Carrito:** Agregar/eliminar productos, persistencia, sincronización
- **Checkout:** Formulario de envío, medios de pago, validación, cupones
- **Panel Admin:** CRUD productos, gestión de pedidos, gestión de clientes
- **Seguridad:** OWASP Top 10, control de acceso, rate limiting

### Tipos de Pruebas

#### 1. Tests Unitarios y de Integración (Jest + Supertest)

Ejecutan lógica de negocio y endpoints API en aislamiento.

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con reporte de cobertura
npm run test:coverage
```

**Resultados actuales:**
- Test Suites: 11 passed, 1 failed
- Tests: 320 passed, 1 failed, 23 todo
- Cobertura: 87% líneas (threshold: 80%)
- Tiempo de ejecución: ~54s

**Ubicación:** `tests/api/`, `tests/unit/`, `tests/security/`

#### 2. Tests E2E (Playwright)

Validan flujos completos de usuario en el navegador real (multi-browser, mobile).

```bash
# Ejecutar tests E2E
npm run test:e2e

# Ver reporte HTML
npm run test:e2e:report
```

**Configuración:**
- Browsers: Chromium, Firefox
- Mobile: Pixel 5 (Android), iPhone 13 (iOS)
- Base URL: Netlify (producción) o localhost:5173 (desarrollo)
- Reportes: HTML + screenshots en fallos

**Ubicación:** `tests/e2e/specs/` (6 archivos de especificaciones)

#### 3. Tests de Seguridad (OWASP Top 10)

Tests automatizados contra vulnerabilidades comunes según OWASP.

**Categorías cubiertas:**
- A01: Broken Access Control
- A02: Cryptographic Failures
- A05: Security Misconfiguration
- A07: Authentication Failures
- A09: Logging and Monitoring

**Ubicación:** `tests/security/owasp/`

### Documentación QA

- **Plan de Pruebas:** [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) — Estrategia completa, alcance, roadmap de 8 semanas
- **Bug Report:** [`docs/bug-report.md`](docs/bug-report.md) — 30 bugs documentados con severidad y estado
- **Guías Postman:** [`docs/qa-guides/`](docs/qa-guides/) — Fundamentos de payloads HTTP, aserciones, automatización
- **Responsive Audit:** [`docs/qa/responsive-audit/`](docs/qa/responsive-audit/) — Reportes Lighthouse y Playwright mobile

---

## CI/CD y Despliegue

### Pipeline GitHub Actions

Workflow CI configurado en [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

**Jobs:**
1. **Lint & Type Check** — Validación de código (ESLint pendiente de configuración)
2. **Unit & API Tests** — Ejecución de Jest con cobertura
3. **E2E Tests** — Playwright (actualmente deshabilitado en CI, pendiente frontend + db:seed:test)
4. **Notify** — Comentario automático en PR con resultado

**Trigger:** Push y Pull Requests hacia rama `develop`

**Secretos requeridos en GitHub:**
- `DATABASE_URL_TEST` — Connection string de DB de tests
- `JWT_SECRET_TEST` — Clave JWT exclusiva para entorno de test

### Despliegue

- **Frontend:** Netlify (deploy automático desde rama `main`)
- **Backend:** Render (deploy manual o automático según configuración)

---

## API REST — Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | — |
| POST | `/api/auth/login` | Login + token JWT | — |
| GET | `/api/auth/me` | Restaurar sesión actual | JWT |
| POST | `/api/auth/forgot-password` | Enviar código de recuperación | — |
| POST | `/api/auth/reset-password` | Restablecer contraseña | — |

### Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Listado con filtros, orden y paginación | — |
| GET | `/api/products/:id` | Detalle de producto específico | — |
| POST | `/api/products/admin` | Crear producto | Admin |
| PUT | `/api/products/admin/:id` | Actualizar producto | Admin |
| DELETE | `/api/products/admin/:id` | Desactivar producto (soft delete) | Admin |
| GET | `/api/products/admin/all` | Listado completo para admin | Admin |
| GET | `/api/products/admin/categories` | Obtener categorías disponibles | Admin |
| PATCH | `/api/products/admin/categories/rename` | Renombrar categoría | Admin |

### Pedidos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Crear pedido (checkout) | JWT |
| GET | `/api/orders/my` | Historial de pedidos del usuario | JWT |
| GET | `/api/orders/:id` | Detalle de pedido específico | JWT |
| GET | `/api/orders/admin/all` | Listado completo de pedidos | Admin |
| PATCH | `/api/orders/admin/:id/status` | Cambiar estado de pedido | Admin |
| POST | `/api/orders/validate-coupon` | Validar cupón de descuento | — |
| GET | `/api/orders/admin/coupons` | Listado de cupones | Admin |
| POST | `/api/orders/admin/coupons` | Crear cupón | Admin |
| DELETE | `/api/orders/admin/coupons/:code` | Eliminar cupón | Admin |

### Usuarios (Admin)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/admin/users` | Listado de usuarios registrados | Admin |
| PATCH | `/api/auth/admin/change-password` | Cambiar contraseña de usuario | Admin |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificar estado del servidor |

---

## Panel de Administración

Para habilitar acceso de administrador, ejecutar en Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```

Cerrar sesión y volver a iniciar para regenerar el token JWT con el rol actualizado.

**Funcionalidades del panel:**
- Dashboard con métricas (ventas, pedidos, productos, clientes)
- Gestión de productos (crear, editar, desactivar, stock inline)
- Gestión de pedidos (ver detalles, cambiar estado)
- Gestión de clientes (listado de usuarios)
- Gestión de categorías (renombrar, ver productos activos)
- Configuración general

---

## Estado Actual del Proyecto

**Versión:** 1.0.0  
**Fecha:** Octubre 2026  
**Estado:** Producción

**Módulos implementados:**
- ✅ Autenticación (registro, login, recuperación de contraseña)
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Carrito de compras persistente (guest + usuario autenticado)
- ✅ Checkout simulado con múltiples medios de pago
- ✅ Panel administrativo completo
- ✅ Sistema de cupones de descuento
- ✅ Historial de pedidos por usuario
- ✅ Responsive design (desktop + mobile)

**Deuda técnica conocida:**
- Job `lint` en CI sin ESLint configurado en backend
- Tests E2E deshabilitados en CI (pendiente script `db:seed:test`)
- 1 test unitario fallando (auth.api.test.ts — timeout)
- 23 tests marcados como todo (pendientes de implementación)

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Christian Santibañez | QA Tester / Frontend / Backend |
| Carina Luna | Frontend Developer |
| Gisele Ortiz | Project Manager |
| Nicolas Toloza | UX/UI Designer |
| Ismael Jensen | UX/UI Designer |
| Lucia Chiarandini | Marketing |
| Agustina Fernandez Maidana | QA Tester |
| Gastón Paniagua | Frontend Developer |

---

## Licencia

Este proyecto es propiedad de NovaMarket. Todos los derechos reservados.

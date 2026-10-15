# NovaMarket — E-commerce PYME

> Plataforma de e-commerce para venta de accesorios tecnologicos, perifericos y gadgets.
> Proyecto **Talently Lab** — simulacion laboral Scrum.

---

## Produccion

| Servicio | URL |
|---------|-----|
| Frontend | https://novamarket-pyme-s2627.netlify.app/ |
| Backend API | https://novamarket-api-ikcm.onrender.com |
| Health | https://novamarket-api-ikcm.onrender.com/api/health |

> Render free tier — puede tardar 30s si estuvo inactivo.

---

## Stack tecnologico

### Backend
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Node.js | 24.x | Runtime |
| Express | 5.x | Framework HTTP |
| PostgreSQL via Supabase | — | Base de datos |
| pg | 8.x | Cliente PostgreSQL |
| jsonwebtoken | 9.x | Autenticacion JWT |
| bcryptjs | 2.x | Hash de contrasenas |
| express-rate-limit | 7.x | Rate limiting |
| Brevo API HTTP | — | Email transaccional |
| pg-mem | 3.x | BD en memoria para tests |

### Frontend
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| React | 19.x | UI library |
| Vite | 8.x | Bundler |
| React Router | 7.x | Navegacion SPA |
| Axios | — | Cliente HTTP |
| Framer Motion | 11.x | Animaciones |
| Three.js + R3F | 0.169/9.x | Hero particles lazy |
| jsPDF | 2.x | Generacion de PDFs |

### Testing y CI/CD
| Herramienta | Uso |
|------------|-----|
| Jest + Supertest | Tests unitarios y de API |
| pg-mem | Integracion con BD en memoria |
| Playwright | Tests E2E |
| GitHub Actions | CI pipeline |
| Netlify | Deploy frontend |
| Render | Deploy backend |

---

## Instalacion local

### Prerrequisitos
- Node.js 22+
- npm 10+
- Cuenta en Supabase

### 1. Clonar
```bash
git clone https://github.com/Talently-Lab/NovaMarket-PYME-S2627.git
cd NovaMarket-PYME-S2627
```

### 2. Backend
```bash
cd backend && npm install
cp .env.example .env  # completar con credenciales Supabase
npm run dev
```
Servidor: http://localhost:3000

### 3. Frontend
```bash
cd frontend && npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env
npm run dev
```
App: http://localhost:5173

### 4. Tests
```bash
npm test               # Jest
npm run test:coverage  # Con coverage
npm run test:e2e       # Playwright
```

---

## Variables de entorno

### backend/.env
```env
PORT=3000
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d
BREVO_API_KEY=xkeysib-xxxx
BREVO_SENDER_EMAIL=tu_email@gmail.com
```

### frontend/.env
```env
VITE_API_URL=http://localhost:3000/api
```

---

## API — Endpoints principales

### Auth
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login + JWT |
| GET | /api/auth/me | Restaurar sesion |
| POST | /api/auth/forgot-password | Codigo recuperacion |
| POST | /api/auth/reset-password | Restablecer contrasena |

### Productos
| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | /api/products | Listado filtros/orden/paginacion | — |
| GET | /api/products/:id | Detalle | — |
| POST | /api/products | Crear | Admin |
| PUT | /api/products/admin/:id | Actualizar | Admin |
| DELETE | /api/products/admin/:id | Eliminar | Admin |

### Pedidos
| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | /api/orders | Checkout | JWT |
| GET | /api/orders/my | Mis pedidos | JWT |
| GET | /api/orders/admin/all | Todos | Admin |
| PATCH | /api/orders/:id/status | Cambiar estado | Admin |
| POST | /api/orders/validate-coupon | Validar cupon | — |

---

## Migraciones SQL

Ejecutar en orden en Supabase SQL Editor (docs/sql/):

| Archivo | Descripcion |
|---------|-------------|
| 001_create_users.sql | Tabla users |
| 002_create_products.sql | Tabla products |
| 003_create_orders.sql | orders + order_items |
| 004_seed_products.sql | 8 productos iniciales |
| 005_seed_more_products.sql | +12 productos |
| 006-007_fix_product_images.sql | Fix URLs imagenes |
| 008_add_payment_fields.sql | Campos de pago |
| 009_add_reset_token.sql | Token recuperacion |
| 010_create_coupons.sql | Tabla coupons |
| 011_seed_celulares_notebooks.sql | 10 productos nuevos |

---

## Tests

```
Test Suites : 12 passed
Tests       : 321 passed, 23 todo
Coverage    : 87% lines
Threshold   : 80%
```

---

## Ser administrador

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```

Cerrar sesion y volver a iniciarla para regenerar el token JWT.

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

---

Proyecto educativo — Talently Lab 2026

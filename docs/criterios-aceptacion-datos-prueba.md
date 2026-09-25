# Criterios de Aceptación y Datos de Prueba — NovaMarket-PYME (SCRUM-14)

**Autor:** Christian Rodrigo Santibáñez Martínez (QA / Frontend / Backend)
**Ticket:** SCRUM-14 — En revisión
**Sprint:** SCRUM Sprint 0 → Sprint 1
**Basado en:** TEST_PLAN.md v1.0.9 + estado real del repo y backlog Jira al 25/sep/2026
**Última actualización:** 25/sep/2026

---

## 1. Objetivo

Formalizar los criterios de aceptación técnicos de cada tarea del Sprint 0 (SCRUM-1 a SCRUM-13) con lenguaje verificable, y dejar listos los fixtures de datos de prueba que usarán las suites automatizadas (Unit, API, E2E). Este documento es el contrato de calidad entre QA, Backend y Frontend.

---

## 2. Criterios de Aceptación por Ticket

### SCRUM-1 — Inicializar proyecto Node.js + Express (Backend)
*Estado en Jira: Finalizado ✅*

1. ✅ El servidor levanta sin errores al ejecutar `node src/index.js`, y `GET /api/health` responde HTTP 200 con body `{"status": "ok", "message": "...", "timestamp": "..."}` — verificado con test smoke (`tests/api/health.api.test.ts` pasa en verde).
2. ✅ Existen los directorios `/src/routes`, `/src/controllers`, `/src/models`, `/src/middlewares`, `/src/config` — implementados el 25/sep/2026 con Auth, Productos y Pedidos completos.
3. ✅ El repositorio está subido a GitHub sin el archivo `.env` commiteado (cubierto por `.gitignore`).

### SCRUM-2 — Agregar equipo al repo + organizar Git
*Estado en Jira: Finalizado ✅*

1. ✅ El equipo tiene acceso al repositorio `Talently-Lab/NovaMarket-PYME-S2627`.
2. ✅ Ramas activas: `main`, `feature/qa-automation` (mergeada), `feature/frontend-development` (en desarrollo). Push directo a `main` requiere PR.
3. ✅ `README.md` contiene secciones de instalación, variables de entorno y cómo ejecutar pruebas.

> **Nota:** Florencia Sombra salió del proyecto el 22/sep/2026. Christian asumió Backend y Frontend.

### SCRUM-3 — Configuración de entorno compartido
*Estado en Jira: En curso*

1. ✅ Cualquier integrante puede clonar el repo, ejecutar `npm install` sin errores y levantar el servidor.
2. ✅ El proyecto arranca con `node src/index.js` y `GET /api/health` responde 200 con conexión a Supabase confirmada.
3. ✅ `backend/.env.example` actualizado con formato correcto del Session Pooler de Supabase y JWT_SECRET.

> **Nota:** Florencia Sombra ya no está. Laura Cuenca es la responsable de completar este ticket.

### SCRUM-4 — Colaboradores GitHub (Subtask de SCRUM-2)
*Estado en Jira: Por hacer*

1. Cada colaborador invitado puede hacer `git clone` sin errores de autenticación.
2. Push directo a `main` requiere PR aprobado.

### SCRUM-5 — Arquitectura + conexión DB
*Estado en Jira: Finalizado ✅*
*Confirmado: PostgreSQL vía Supabase Session Pooler (`pg`), no MongoDB Atlas.*

1. ✅ `connectDB()` establece conexión al pool de Supabase usando `aws-0-us-east-1.pooler.supabase.com` (IPv4 compatible). `SELECT NOW()` devuelve resultado sin lanzar excepción.
2. ✅ `GET /api/health` responde HTTP 200 con `Content-Type: application/json`.
3. ✅ `DATABASE_URL` se lee desde `.env` (en `.gitignore`). Connection string usa Session Pooler — el host directo `db.lrlncesqddzmhfsinkvl.supabase.co` es solo IPv6.
4. ✅ Tablas creadas en Supabase: `users`, `products`, `orders`, `order_items` — migraciones en `docs/sql/001-003`.

### SCRUM-6 — Inicializar Frontend (React + Vite)
*Estado en Jira: Finalizado ✅*

1. ✅ `npm run build` en `/frontend` completa con exit code 0 y genera `/frontend/dist`.
2. ✅ Vite dev server levanta y la página renderiza sin errores en consola.
3. ✅ React Router 7 configurado: rutas públicas, protegidas (JWT) y admin (JWT + rol admin).
4. ✅ Desplegado en Netlify: `https://novamarket-pyme-s2627.netlify.app`.

### SCRUM-7 — Estructura base + consumo de API (Frontend)
*Estado en Jira: En curso*

1. ✅ El cliente Axios consume `GET /api/products` sin errores de CORS (CORS configurado en backend para Netlify).
2. ✅ Las rutas `/checkout` y `/admin` redirigen a `/login` cuando no hay JWT válido en `localStorage`.
3. ✅ Si el Backend está caído (Render spin-up), el frontend muestra mensaje de error amigable, no stack trace.

### SCRUM-8 — Sistema de diseño en Figma
*Estado en Jira: Por hacer*

1. Los Design Tokens (colores, tipografía, botones) están definidos en Figma y el equipo completo tiene acceso al archivo.
2. Existen wireframes de baja fidelidad para Home, Catálogo, Detalle de Producto, Carrito y Login.

### SCRUM-9 — Mapa mental de pruebas (QA)
*Estado en Jira: En revisión*

1. El mapa mental tiene un nodo central "NovaMarket MVP" con exactamente 5 ramas: AUTH, CATÁLOGO, CARRITO, CHECKOUT, ADMIN CRUD.
2. Existen al menos 15 edge cases documentados, cada uno con su pregunta preventiva "¿Qué pasa si...?".
3. El link público a XMind/Miro, la captura PNG y el archivo `.xmind` están adjuntos al ticket, y Gisele/Marcia Torre validaron la versión final.

### SCRUM-10 — Prototipo navegable
*Estado en Jira: Por hacer*

1. El prototipo cubre el flujo completo: Home → Catálogo → Detalle → Carrito → Checkout → Confirmación.
2. Existen frames específicos para los estados de error: carrito vacío, producto no encontrado (404) y login con credenciales incorrectas.

### SCRUM-11 — Identidad y análisis de competencia
*Estado en Jira: Finalizado ✅*

1. El documento en Notion incluye el moodboard de al menos 3 e-commerce de referencia con capturas.
2. El tono de comunicación de NovaMarket queda definido explícitamente (ej. juvenil/tech/gamer/profesional) y documentado.

### SCRUM-12 — Buyer Persona y propuesta de valor
*Estado en Jira: Por hacer*

1. Existe un buyer persona documentado que responde "¿a quién le vendemos accesorios/periféricos/gadgets?".
2. La propuesta de valor de NovaMarket está redactada en una frase clara, entregada al equipo de diseño (Ismael Jensen / Nicolás Toloza) para los textos del Figma.

### SCRUM-13 — Contenido base para el catálogo
*Estado en Jira: Por hacer*

1. El Excel/Sheet entregado tiene exactamente 10 productos con los campos Nombre, Categoría, Precio, Descripción e Imagen (link), distribuidos entre las 3 categorías del brief (accesorios, periféricos, gadgets).
2. Ningún campo obligatorio está vacío o es `null`, y los 10 productos se cargan correctamente en la base de datos vía script de seed.

---

## 3. Datos de Prueba (Fixtures)

Basado en la sección 3.2.4 del TEST_PLAN.md. Estos fixtures son datos falsos creados exclusivamente para testing — **prohibido usar nombres o emails reales del equipo**.

### 3.1 Usuarios

| Tipo | Email | Password | Rol |
|---|---|---|---|
| Usuario válido | `test.user@novamarket.com` | `Test1234!` | customer |
| Admin válido | `admin@novamarket.com` | `Admin1234!` | admin |
| Email duplicado (para TC002) | `test.user@novamarket.com` | `OtroPass!` | customer |
| E2E (sesión persistida) | `e2e@novamarket.com` | `E2ETest1234!` | customer |

> **Nota:** En producción ya existe el usuario `christian@novamarket.com` (id=1) y `test@novamarket.com` (id=2) creados durante pruebas. No usar en tests automatizados.

### 3.2 Productos

✅ 20 productos cargados en Supabase (seeds 004 y 005 ejecutados). Distribuidos en 8 categorías: Periféricos, Teclados, Audio, Accesorios, Gadgets, Monitores, Gaming, Iluminación.

Para tests automatizados usar IDs del 1 al 20. Para stock insuficiente usar Monitor Gaming (id=7, stock=4) o Silla Gamer (id=8, stock=3).

### 3.3 Órdenes

- **Payload válido:** `{ items: [{ product_id: 1, quantity: 1 }], shipping: { name, address, city } }` → 201 con `order.id`
- **Producto inexistente:** `product_id: 9999` → 404
- **Carrito vacío:** `items: []` → 400
- **Stock insuficiente:** `quantity > stock_disponible` → 409

### 3.4 Reglas de manejo

- **Unit tests:** se mockea el `pool` de `pg` (`jest.mock('../../src/config/db')`), nunca se conecta a una DB real.
- **Integration tests (pendiente):** usar `pg-mem` o schema separado en Supabase `novamarket_test`. Limpiar con `TRUNCATE` en `beforeEach`.
- **E2E:** estado de sesión autenticada guardado en `tests/e2e/fixtures/.auth/` (en `.gitignore`). Corre contra `https://novamarket-pyme-s2627.netlify.app`.
- **JWT en tests:** `process.env.JWT_SECRET` = `test_secret_para_jest_minimo_32_chars_ok` (definido en el test antes de importar `app`).

---

## 4. Estado de implementación al 25/sep/2026

| Módulo | Backend | Frontend | Tests |
|--------|---------|----------|-------|
| Auth (register/login/JWT) | ✅ Completo | ✅ Conectado | ✅ 7 tests activos en A07 |
| Productos (CRUD) | ✅ Completo | ✅ Catálogo con filtros | ⚠️ Pendiente tests integración |
| Pedidos (checkout) | ✅ Completo | ✅ Checkout funcional | ⚠️ Pendiente tests integración |
| Panel Admin | ✅ Rutas backend | 🔲 Frontend pendiente | 🔲 Pendiente |
| Auth Admin | ✅ requireAdmin middleware | 🔲 Sin UI | 🔲 Pendiente |

## 5. Pendientes antes de cerrar el documento

- [x] ~~Confirmar DB~~ → PostgreSQL vía Supabase ✅
- [x] ~~Estructura `/tests` creada~~ ✅
- [x] ~~Backend Auth implementado~~ ✅
- [x] ~~Frontend conectado a API real~~ ✅
- [x] ~~Deploy en producción~~ → Render + Netlify ✅
- [ ] Definir estrategia de aislamiento de tests con Laura (pg-mem vs schema separado Supabase)
- [ ] Completar descripción de SCRUM-3, SCRUM-4 y SCRUM-7 en Jira
- [ ] Revisión de Agustina antes de cerrar SCRUM-14
- [ ] Implementar tests de integración reales (Auth con DB, Productos, Pedidos)
- [ ] Subir imágenes propias a Supabase Storage para los 20 productos

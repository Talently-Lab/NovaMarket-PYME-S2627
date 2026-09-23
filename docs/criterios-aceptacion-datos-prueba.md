# Criterios de Aceptación y Datos de Prueba — NovaMarket-PYME (SCRUM-14)

**Autor:** Christian Rodrigo Santibáñez Martínez (QA)
**Ticket:** SCRUM-14 — En revisión
**Sprint:** SCRUM Sprint 0
**Basado en:** TEST_PLAN.md v1.0.4 (secciones 1.2, 1.4, 3.2.4) + estado real del backlog en Jira

---

## 1. Objetivo

Formalizar los criterios de aceptación técnicos de cada tarea del Sprint 0 (SCRUM-1 a SCRUM-13) con lenguaje verificable, y dejar listos los fixtures de datos de prueba que usarán las suites automatizadas (Unit, API, E2E). Este documento es el contrato de calidad entre QA, Backend y Frontend.

---

## 2. Criterios de Aceptación por Ticket

### SCRUM-1 — Inicializar proyecto Node.js + Express (Backend)
*Estado en Jira: Finalizado*

1. ✅ El servidor levanta sin errores al ejecutar `node src/index.js`, y `GET /api/health` responde HTTP 200 con body `{"status": "OK", "timestamp": "..."}` — verificado con test smoke (`tests/api/health.api.test.ts` pasa en verde).
2. Existen los directorios `/src/routes`, `/src/controllers`, `/src/models`, `/src/middlewares`, `/src/config`, y el repositorio está subido a GitHub sin el archivo `.env` commiteado.

### SCRUM-2 — Agregar equipo al repo + organizar Git
*Estado en Jira: Finalizado*

1. Florencia Sombra, María Emilia Orioni y Gisele Ortiz tienen acceso de colaborador efectivo al repositorio (pueden clonar y hacer push a una rama `feature/*`).
2. Las ramas `main` y `develop` existen; un push directo a `main` es rechazado por la protección de rama y requiere Pull Request aprobado.
3. El `README.md` contiene las secciones "Instalación", "Variables de Entorno" y "Cómo ejecutar las pruebas".

### SCRUM-3 — Configuración de entorno compartido
*Estado en Jira: En curso · Sin descripción cargada*

1. Cualquier integrante del equipo puede clonar el repo, ejecutar `npm install` sin errores (exit code 0) y sin vulnerabilidades high/critical reportadas.
2. El proyecto arranca en modo desarrollo (`npm run dev` o `node src/index.js`) y `GET /api/health` responde 200.

> ⚠️ Pendiente: pedir a Florencia que complete la descripción de este ticket en Jira para confirmar el alcance exacto.

### SCRUM-4 — Colaboradores GitHub (Subtask de SCRUM-2)
*Estado en Jira: Por hacer · Sin descripción cargada*

1. Cada colaborador invitado puede hacer `git clone` sin errores de autenticación y ver el historial con `git log`.
2. Un push directo a `main` es rechazado por la protección de rama configurada en SCRUM-2.

### SCRUM-5 — Arquitectura + conexión DB
*Estado en Jira: Finalizado*
*Confirmado: PostgreSQL vía Supabase (`pg` + connection pooling), no MongoDB Atlas.*

1. Al inicializar el servidor, `connectDB()` establece la conexión al pool de Supabase sin errores; una consulta de prueba (`SELECT NOW()`) devuelve resultado sin lanzar excepción.
2. ✅ Existe un endpoint `GET /api/health` que responde HTTP 200 con `Content-Type: application/json` y body con `status` y `timestamp` — implementado en `src/index.js` y verificado por test smoke.
3. ✅ Ninguna cadena de conexión ni credencial aparece hardcodeada en el código fuente; `DATABASE_URL` se lee desde `.env`, que está listado en `.gitignore`.

### SCRUM-6 — Inicializar Frontend (React + Vite)
*Estado en Jira: Finalizado*

1. `npm run build` dentro de `/client` completa con exit code 0 y genera `/client/dist`.
2. El servidor de desarrollo de Vite levanta (`npm run dev`) y la página de inicio renderiza sin errores en consola.
3. React Router está configurado: la ruta raíz `/` renderiza el componente Home, y una ruta inexistente muestra un 404 o redirige al home.

### SCRUM-7 — Estructura base + consumo de API (Frontend)
*Estado en Jira: En curso · Sin descripción cargada*

1. El cliente HTTP consume `GET /api/products` sin errores de CORS, y los productos se renderizan en pantalla.
2. Las rutas privadas (`/admin`, `/checkout`) redirigen a `/login` cuando no existe un JWT válido en `localStorage`.
3. Si el Backend está caído, el Frontend muestra un mensaje de error amigable (no un stack trace ni "Network Error 500" crudo).

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
| Usuario válido | `test.user@novamarket.com` | `Test1234!` | user |
| Admin válido | `admin@novamarket.com` | `Admin1234!` | admin |
| Email duplicado (para TC002) | `test.user@novamarket.com` | `OtroPass!` | user |
| E2E (sesión persistida) | `e2e@novamarket.com` | `E2ETest1234!` | user |

### 3.2 Productos (semilla, según SCRUM-13)

10 productos falsos distribuidos en 3 categorías: Accesorios, Periféricos, Gadgets. Cada uno con: `name`, `category`, `price`, `description`, `imageUrl`. Al menos un producto debe tener `imageUrl` vacío para validar el placeholder (TC018).

### 3.3 Órdenes

- Payload válido: producto existente + cantidad ≥ 1 → debe generar número de orden único.
- Payload inválido: producto inexistente → 404.
- Carrito vacío `[]` → 400.

### 3.4 Reglas de manejo

- **Unit tests:** se mockea el `pool` de `pg` (`jest.mock('../../src/config/db')`), nunca se conecta a una DB real.
- **Integration tests:** se usa una base de test aislada en Supabase (ej. un schema o proyecto separado `novamarket_test`) o `pg-mem` para simular Postgres en memoria sin red; se limpia con `TRUNCATE` o transacciones revertidas en `beforeEach`/`afterEach`.
- **E2E:** el estado de sesión autenticada se guarda en `tests/e2e/fixtures/.auth/user.json`, listado en `.gitignore`.

> ⚠️ Pendiente de decisión con Laura: si el equipo prefiere un schema separado en el mismo proyecto de Supabase o una instancia de Postgres local (Docker) para CI, dado que `mongodb-memory-server` ya no aplica.

---

## 4. Pendientes antes de cerrar el documento

- [x] Confirmar con Laura si la DB definitiva es PostgreSQL o MongoDB Atlas — **Resuelto: PostgreSQL vía Supabase.**
- [x] Estructura `/tests` creada y fixtures de usuarios disponibles en `tests/api/fixtures/users.fixture.ts`.
- [ ] Definir con Laura/Florencia la estrategia de aislamiento de tests para Postgres (schema separado en Supabase vs. Docker local vs. `pg-mem`).
- [ ] Completar la descripción de SCRUM-3, SCRUM-4 y SCRUM-7 en Jira para afinar sus criterios.
- [ ] Revisión de Agustina antes de marcar SCRUM-14 como Finalizado (requisito del propio ticket).

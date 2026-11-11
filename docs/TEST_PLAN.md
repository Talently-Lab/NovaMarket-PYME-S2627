# PLAN DE PRUEBAS Y ESTRATEGIA DE AUTOMATIZACIÓN QA

**Proyecto:** NovaMarket-PYME
**Repositorio:** github.com/Talently-Lab/NovaMarket-PYME-S2627
**Rama Base:** `main` (mergeada desde `feature/qa-automation` el 23/sep/2026)
**Versión del Documento:** 1.0.0
**Fecha de Creación:** 16 de septiembre de 2026
**Estado:** v1.1.0 — Activo | Sujeto a revisión del equipo
**Autores:** Christian Santibáñez Martínez (QA) · Agustina Fernandez Maidana (QA)
**Revisión pendiente:** Marcia Torre (PM) · Gisele Lorena Ortiz (PM)

> ⚠️ Este documento está en construcción. Fue armado al inicio del Sprint 0 con la información disponible hasta la fecha. Algunos ítems todavía no tienen confirmación del equipo completo y están señalados como **[PENDIENTE CONFIRMAR]**. Cualquier cambio que se haga debe quedar registrado en el historial de abajo.

---

## HISTORIAL DE VERSIONES

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 16/sep/2026 | Agustina F. · Christian S. | Primera versión del plan. Borrador inicial del Sprint 0. |
| 1.0.1 | 16/sep/2026 | Christian S. | Revisión post-mapa mental: se incorporan los módulos reales relevados por Agustina, se marcan los ítems pendientes de confirmación del equipo y se agregan las opciones de herramientas TMS sugeridas por Gisele. |
| 1.0.2 | 19/sep/2026 | Christian S. | Actualización de integrantes del equipo con datos oficiales confirmados: nombres completos, emails, roles reales (Florencia como Backend, Ismael Jensen y Nicolás Toloza como UX/UI, Marcia Torre como PM). |
| 1.0.3 | 19/sep/2026 | Christian S. | Se confirma PostgreSQL/Supabase como base de datos (no MongoDB). Se actualizan criterios BDD de SCRUM-5 y estrategia de fixtures en sección 3.2.4. Se agrega observación de QA sobre connectDB() en src/app.js. |
| 1.0.4 | 19/sep/2026 | Christian S. | Semana 1 ejecutada: estructura /tests creada, Jest + Supertest + Playwright + pg-mem instalados, tsconfig.json agregado, /api/health implementado en src/index.js, test smoke pasando en verde, .gitignore actualizado. |
| 1.0.5 | 21/sep/2026 | Christian S. | Sincronización con estado real del tablero Jira (verificado via MCP Atlassian): 7 estados actualizados en sección 1.2, 2 en criterios-aceptacion-datos-prueba.md, notas de CI/CD en checklist-pr-review.md. |
| 1.0.6 | 21/sep/2026 | Christian S. | Comparación del User Flow de Figma (MCP Figma) contra los TCs del plan: se agregan 7 nuevos escenarios BDD (TC011, TC012b, TC016b, TC032b, TC032c, TC039, TC040) y sus entradas en la Regression Checklist. |
| 1.0.7 | 22/sep/2026 | Christian S. | TC011, TC012b y TC016b marcados como excluidos del MVP v1.0 — funcionalidades no confirmadas por el equipo (señalado por Agustina) y no implementadas en proyecto de referencia analizado. Candidatas para Sprint 2. |
| 1.0.8 | 24/sep/2026 | Christian S. | 68 tests E2E Playwright implementados y pasando contra Netlify (chromium). POMs creados: BasePage, HomePage, AuthPage, CatalogPage. Suites: navigation, header, home, auth/login, auth/register, security/frontend-security. playwright.config.ts actualizado con BASE_URL de Netlify y proyectos mobile (Pixel 5, iPhone 13). 2 hallazgos de seguridad documentados: X-Frame-Options y X-Content-Type-Options no configurados en Netlify — pendiente resolución en Vercel. |
| 1.0.9 | 25/sep/2026 | Christian S. | MVP completo implementado y desplegado. Backend: Auth JWT, Productos CRUD, Pedidos con transacción atómica — 72 tests Jest pasando. Supabase: 3 tablas creadas (users, products, order_items), 20 productos seed. Deploy: Render (`https://novamarket-api-ikcm.onrender.com`) + Netlify (`https://novamarket-pyme-s2627.netlify.app`). Frontend conectado end-to-end: login/registro reales, catálogo con filtros, carrito persistente, checkout funcional con OrderConfirmedPage. Paleta Vice City (GTA 6) integrada. Flujo completo probado en producción. Pendiente: imágenes propias en Supabase Storage, panel admin, PR a main. |
| 1.1.0 | 25/sep/2026 | Christian S. | Sincronización con estado real del tablero Jira (verificado via MCP Jira): backlog ampliado a SCRUM-31 (Sprint 2 activo). Nuevo integrante: Gastón Paniagua (Frontend — SCRUM-22, 26, 28, 29). Florencia Sombra confirmada fuera del proyecto desde 22/sep/2026. Estados corregidos: SCRUM-9 → Finalizado ✅, SCRUM-11/12/13 → Finalizado ✅. SCRUM-30 (Test Cases de Agustina) identificado como potencial solapamiento con suites Playwright existentes — pendiente coordinación. Contactos de Florencia en sección 5.5 actualizados para reflejar su salida. |

---

## TABLA DE CONTENIDOS

1. [Alcance y Matriz de Cobertura de Pruebas](#1-alcance-y-matriz-de-cobertura-de-pruebas)
2. [Equipo y Roles](#2-equipo-y-roles)
3. [Arquitectura de Pruebas](#3-arquitectura-de-pruebas)
4. [Roadmap de Implementación — Estrategia de 8 Semanas](#4-roadmap-de-implementación--estrategia-de-8-semanas)
5. [Estrategia CI/CD y Gobernanza del Código](#5-estrategia-cicd-y-gobernanza-del-código)

---

## RESUMEN EJECUTIVO

NovaMarket es una PYME que vende accesorios, periféricos y gadgets tecnológicos. Hoy opera a través de redes sociales y marketplaces de terceros, y el objetivo del proyecto es construir su propio e-commerce en 8 semanas, trabajando en equipo bajo metodología Scrum.

Este documento define cómo vamos a probar el MVP: qué se prueba, quién lo hace, con qué herramientas y en qué orden. Cubre los módulos principales — Autenticación, Catálogo, Carrito, Checkout y Panel de Administración — y establece la estrategia de automatización que vamos a implementar progresivamente a lo largo del proyecto.

**Stack del proyecto:** Node.js + Express + PostgreSQL (Supabase) · React + Vite · JWT
**Stack de automatización:** Playwright (TypeScript) · Supertest · Jest/Vitest · GitHub Actions

**Meta de cobertura:** superar el 80% en los módulos críticos al cerrar la Semana 8.

---

## 1. ALCANCE Y MATRIZ DE COBERTURA DE PRUEBAS

### 1.1 Definición del Alcance

#### Dentro del Alcance (IN SCOPE)

Los siguientes módulos y flujos funcionales están dentro del alcance de pruebas para el MVP:

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| **Autenticación (Auth)** | Registro de usuario, login de cliente, login de administrador, validación de JWT, manejo de sesión. ⚠️ **[PENDIENTE CONFIRMAR]:** Cerrar sesión y Recuperar contraseña. | Crítica |
| **Catálogo de Productos** | Listado de productos, filtros por categoría (accesorios, periféricos, gadgets), detalle de producto, manejo de producto inexistente (404). ⚠️ **[PENDIENTE CONFIRMAR]:** Buscar producto y Ver detalle del producto. | Alta |
| **Carrito de Compras** | Agregar producto, eliminar producto, actualización de subtotal, persistencia de sesión, carrito vacío. ⚠️ **[PENDIENTE CONFIRMAR]:** Modificar cantidad de unidades. | Crítica |
| **Checkout Simulado** | Formulario de envío, confirmación de orden, generación de número de orden, validación de campos vacíos. ⚠️ **[PENDIENTE CONFIRMAR]:** Mensaje de compra finalizada. | Crítica |
| **Panel Administrador** | CRUD de productos (Crear/Leer/Actualizar/Eliminar), visualización de pedidos de clientes, control de acceso por rol. | Alta |
| **Seguridad y Roles** | Acceso no autorizado a rutas admin, manipulación de JWT en localStorage, respuesta 403 Forbidden para roles incorrectos. | Alta |
| **API REST** | Validación de todos los endpoints expuestos: códigos de estado HTTP, estructura del payload JSON, manejo de errores. | Alta |

> 📌 Los ítems marcados como **[PENDIENTE CONFIRMAR]** son funcionalidades que todavía no fueron confirmadas por el equipo. Están relevadas como posibles pero necesitan validación antes de incorporarse al backlog de pruebas automatizadas.

#### Fuera del Alcance (OUT OF SCOPE)

Según el brief oficial del proyecto, los siguientes elementos quedan explícitamente excluidos de las pruebas:

- Pasarela de pagos real (Stripe, MercadoPago, etc.)
- Gestión de envíos y tracking de logística
- Integraciones con APIs externas de terceros
- Aplicación móvil nativa (iOS / Android)
- Optimización extrema de performance bajo carga masiva (> 10.000 usuarios concurrentes)
- Pruebas de accesibilidad profunda (WCAG 2.1 AA — requiere revisión manual especializada)

---

### 1.2 Mapeo del Backlog de Jira — SCRUM-1 a SCRUM-14

A continuación se detalla cada una de las 14 tareas del Sprint 0 con su mapeo completo hacia el plan de pruebas:

---

#### SCRUM-1 — Inicializar proyecto Node.js + Express (Backend)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-1 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Highest |
| **Asignado** | Laura Cuenca (Backend) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 16/sep/26 |

**Descripción técnica:** Crear proyecto Node.js + Express en VS Code. Ejecutar `npm init -y`, instalar dependencias `express`, `dotenv`, `cors`, `pg` o driver de DB. Crear estructura de carpetas `/src/routes`, `/controllers`, `/models`, `/middlewares`, `/config`. Subir a GitHub.

**Tipos de prueba asociados:** Integration · API · Unit

**Escenarios BDD:**

```gherkin
Feature: Inicialización del servidor Express

  Scenario: El servidor levanta y responde en el puerto configurado
    Given que el archivo .env contiene PORT=3000
    When se ejecuta el comando "node src/index.js"
    Then el servidor debe levantar sin errores en la consola
    And una petición GET a http://localhost:3000/api/health debe devolver status 200
    And el body de la respuesta debe ser { "status": "OK" }

  Scenario: El servidor carga las variables de entorno correctamente
    Given que existe el archivo .env con la variable DATABASE_URL definida
    When se inicializa la aplicación
    Then process.env.DATABASE_URL no debe ser undefined
    And no deben aparecer credenciales hardcodeadas en ningún archivo de código fuente

  Scenario: La estructura de carpetas cumple el estándar del proyecto
    Given que el repositorio fue clonado correctamente
    When se inspecciona el sistema de archivos del backend
    Then deben existir los directorios: /src/routes, /src/controllers, /src/models, /src/middlewares, /src/config
    And debe existir el archivo .env.example con las claves de entorno documentadas (sin valores reales)
    And el archivo .env NO debe estar commiteado en el historial de Git
```

---

#### SCRUM-2 — Agregar al equipo al repo + organizar Git

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-2 |
| **Tipo** | Historia de Usuario |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Highest |
| **Asignado** | Laura Cuenca (Backend) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 17/sep/26 |

**Descripción técnica:** Agregar como colaboradores en GitHub a: Florencia Sombra, Emilia Orioni, Gisele Ortiz. Crear branch `main` (protegida), `develop` y branches `feature/nombre-tarea`. Crear `README.md` con instrucciones de instalación y `.gitignore`.

**Tipos de prueba asociados:** Integration (Git Flow) · Security (protección de ramas)

**Escenarios BDD:**

```gherkin
Feature: Organización del repositorio Git

  Scenario: La rama main está protegida contra pushes directos
    Given que el repositorio está configurado en GitHub
    When un colaborador intenta hacer git push directamente a main
    Then GitHub debe rechazar el push con un error de protección de rama
    And debe requerirse un Pull Request aprobado para mergear a main

  Scenario: El flujo de ramas sigue el estándar Git Flow
    Given que el repositorio tiene las ramas main, develop configuradas
    When un desarrollador crea una nueva funcionalidad
    Then debe crear una rama con el prefijo "feature/" (ej: feature/login-usuario)
    And el merge debe realizarse hacia develop, no hacia main

  Scenario: El archivo .gitignore protege archivos sensibles
    Given que existe el archivo .gitignore en la raíz del repositorio
    When se revisa su contenido
    Then debe incluir la entrada ".env" para ignorar variables de entorno
    And debe incluir "node_modules/" para ignorar dependencias
    And debe incluir "/tests/reports/" para ignorar reportes temporales de pruebas
    And debe incluir "*.log" para ignorar logs del sistema

  Scenario: El README.md contiene instrucciones completas de instalación
    Given que se clona el repositorio por primera vez
    When se lee el archivo README.md
    Then debe existir una sección "Instalación" con los comandos npm install
    And debe existir una sección "Variables de Entorno" que referencia al .env.example
    And debe existir una sección "Cómo ejecutar las pruebas"
```

---

#### SCRUM-3 — Task 3 (Configuración inicial de infraestructura)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-3 |
| **Tipo** | Tarea |
| **Estado** | En Curso |
| **Prioridad** | Sin especificar |
| **Asignado** | Florencia Sombra (PM) |
| **Sprint** | Sin sprint asignado |

**Descripción técnica:** Tarea de configuración de infraestructura inicial del proyecto. Basado en el contexto del Sprint 0, corresponde a la configuración del entorno de desarrollo compartido y la validación de que todos los integrantes pueden clonar, instalar y ejecutar el proyecto localmente.

**Tipos de prueba asociados:** Integration · Smoke Test

**Escenarios BDD:**

```gherkin
Feature: Entorno de desarrollo compartido operativo

  Scenario: Todos los integrantes pueden instalar el proyecto sin errores
    Given que un integrante del equipo clona el repositorio desde GitHub
    When ejecuta "npm install" en el directorio raíz
    Then el comando debe completar sin errores (exit code 0)
    And no deben aparecer mensajes de vulnerabilidades críticas (high/critical) en el output de npm

  Scenario: El proyecto arranca en modo desarrollo
    Given que el archivo .env está configurado con los valores del .env.example
    When se ejecuta "npm run dev" o "node src/index.js"
    Then el servidor debe iniciar y mostrar el puerto en consola
    And GET /api/health debe devolver HTTP 200 con body {"status": "OK"}
```

---

#### SCRUM-4 — Subtask 2.1 (Configuración de colaboradores GitHub)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-4 |
| **Tipo** | Subtask de SCRUM-2 |
| **Estado** | Por Hacer |
| **Prioridad** | Sin especificar |
| **Sprint** | Sin sprint asignado |

**Descripción técnica:** Subtarea de SCRUM-2. Confirmar que todos los colaboradores declarados en SCRUM-2 tienen acceso efectivo al repositorio y pueden realizar operaciones de push/pull correctamente.

**Tipos de prueba asociados:** Integration · Smoke Test

**Escenarios BDD:**

```gherkin
Feature: Acceso efectivo de colaboradores al repositorio

  Scenario: Cada integrante puede hacer clone del repositorio
    Given que un colaborador recibió la invitación de GitHub y la aceptó
    When ejecuta "git clone [url-repositorio]"
    Then el clon debe completarse sin errores de autenticación
    And el integrante debe poder ver el historial de commits con "git log"

  Scenario: Los permisos de escritura están restringidos correctamente
    Given que un integrante tiene rol de "Collaborator" en el repositorio
    When intenta hacer push a la rama feature que le corresponde
    Then el push debe ser aceptado por GitHub
    And cuando intenta hacer push directo a main, debe ser rechazado por la protección de rama
```

---

#### SCRUM-5 — Armar la arquitectura + conexión DB

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-5 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Medium |
| **Asignado** | Laura Cuenca (Backend) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 25/sep/26 |

**Descripción técnica:** ✅ Confirmado: se usa **PostgreSQL vía Supabase** (librería `pg`). Crear archivo `db.js` con conexión al pool. Crear servidor base `app.js` que levante en el puerto 3000. Documentar arquitectura MVC. Crear endpoint de prueba `GET /api/health`.

**Tipos de prueba asociados:** Integration · API · Unit

**Escenarios BDD:**

```gherkin
Feature: Conexión a base de datos y arquitectura MVC

  Scenario: ✅ La conexión a PostgreSQL/Supabase es exitosa al arrancar el servidor
    Given que la variable DATABASE_URL en .env apunta al pool de Supabase válido
    When se inicializa el servidor Node.js
    Then el pool de pg debe establecerse sin errores
    And una consulta de prueba SELECT NOW() debe devolver resultado sin lanzar excepción
    And no deben aparecer errores de "ECONNREFUSED" o "password authentication failed"

  Scenario: ✅ El endpoint de health check responde correctamente (ya implementado)
    Given que el servidor está corriendo en el puerto 3000
    When se realiza una petición GET a /api/health
    Then la respuesta debe tener status HTTP 200
    And el body debe contener { "status": "OK", "timestamp": "[ISO timestamp]" }
    And el Content-Type de la respuesta debe ser "application/json"

  Scenario: La arquitectura MVC tiene separación correcta de responsabilidades
    Given que el proyecto está inicializado
    When se revisa la estructura de carpetas
    Then los controladores solo deben contener lógica de negocio, no queries directas a DB
    And las queries SQL deben estar en los modelos o en un módulo de acceso a datos
    And las rutas solo deben mapear URLs a controladores

  Scenario: ✅ La cadena de conexión nunca aparece expuesta en el código
    Given que se realiza una búsqueda en todos los archivos .js del proyecto
    When se buscan strings que contengan credenciales de Supabase hardcodeadas
    Then ningún archivo de código fuente debe contener credenciales directas
    And DATABASE_URL se lee desde .env, que está listado en .gitignore
```

> ⚠️ **Observación QA — src/app.js:** `connectDB()` se llama sin `await` antes de `app.listen()`, lo que puede causar comportamiento intermitente en CI si el servidor recibe requests antes de que la conexión a Supabase esté lista. Se sugiere al equipo Backend refactorizar el arranque del servidor así:
>
> ```javascript
> const startServer = async () => {
>   await connectDB();
>   app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
> };
> startServer();
> ```

---

#### SCRUM-6 — Inicializar Frontend (React + Vite)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-6 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Medium |
| **Asignado** | María Emilia Orioni (Frontend) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 16/sep/26 |

**Descripción técnica:** En VS Code, dentro del mismo repositorio crear carpeta `/client`. Ejecutar `npm create vite@latest` con React. Instalar React Router. Conectar al repositorio compartido.

**Tipos de prueba asociados:** Unit · Integration · E2E (smoke)

**Escenarios BDD:**

```gherkin
Feature: Inicialización del proyecto Frontend con React + Vite

  Scenario: La aplicación React compila sin errores
    Given que el directorio /client está inicializado con Vite + React
    When se ejecuta "npm run build" dentro de /client
    Then el proceso debe completar con exit code 0
    And la carpeta /client/dist debe generarse con los archivos compilados

  Scenario: El servidor de desarrollo de Vite levanta correctamente
    Given que las dependencias están instaladas con npm install
    When se ejecuta "npm run dev" en /client
    Then Vite debe iniciar en http://localhost:5173 (o el puerto configurado)
    And la página de inicio debe renderizarse en el navegador sin errores en consola

  Scenario: React Router está configurado y las rutas base funcionan
    Given que la aplicación React está corriendo en modo desarrollo
    When el usuario navega a la ruta raíz "/"
    Then debe renderizarse el componente Home sin error "Cannot GET /"
    When el usuario navega a una ruta inexistente "/ruta-no-existe"
    Then debe mostrarse un componente 404 o redirigir al home
```

---

#### SCRUM-7 — Estructura base + consumo de API (Frontend)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-7 |
| **Tipo** | Tarea |
| **Estado** | En Curso |
| **Prioridad** | High |
| **Asignado** | María Emilia Orioni (Frontend) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 18/sep/26 |

**Descripción técnica:** Crear la estructura base de componentes y páginas del SPA. Configurar el cliente HTTP (Axios o Fetch) para consumir los endpoints del Backend. Implementar las rutas con React Router para: Home, Login, Registro, Catálogo, Detalle Producto, Carrito, Checkout, Panel Admin.

**Tipos de prueba asociados:** Integration · E2E · Unit (componentes)

**Escenarios BDD:**

```gherkin
Feature: Comunicación Frontend-Backend y estructura de rutas SPA

  Scenario: El cliente HTTP consume la API del Backend sin errores CORS
    Given que el servidor Backend tiene CORS configurado para el origen del Frontend
    When el componente de Catálogo realiza una petición GET a /api/products
    Then la respuesta debe llegar sin error "CORS policy: No 'Access-Control-Allow-Origin'"
    And los productos deben renderizarse en la pantalla

  Scenario: Las rutas privadas redirigen al login si no hay sesión activa
    Given que el usuario no ha iniciado sesión (no existe JWT en localStorage)
    When intenta navegar directamente a /admin o /checkout
    Then debe ser redirigido automáticamente a /login
    And no debe visualizarse ningún contenido privado

  Scenario: El manejo de errores de red muestra feedback al usuario
    Given que el servidor Backend está caído o inaccesible
    When el Frontend intenta cargar el catálogo de productos
    Then debe mostrarse un mensaje de error amigable (ej: "No se pudo cargar el catálogo")
    And no debe mostrarse un error técnico crudo en la pantalla (ej: "Network Error 500")

  Scenario: El componente Navbar refleja el estado de autenticación
    Given que el usuario acaba de iniciar sesión exitosamente
    When se renderiza el componente Navbar
    Then debe mostrar el nombre del usuario o un avatar de perfil
    And debe mostrar la opción "Cerrar sesión" en lugar de "Iniciar sesión"
```

---

#### SCRUM-8 — Sistema de diseño en Figma (UX/UI)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-8 |
| **Tipo** | Tarea |
| **Estado** | Por Hacer |
| **Prioridad** | Highest |
| **Asignado** | Ismael Jensen · Nicolás Toloza (UX/UI) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 18/sep/26 |

**Descripción técnica:** En Figma: definir Design Tokens (colores NovaMarket, tipografía, botones). Armar Wireframes de baja fidelidad: Home, Catálogo, Detalle Producto, Carrito, Login. Compartir acceso a todo el equipo.

**Tipos de prueba asociados:** Pruebas de Usabilidad · Regresión Visual

**Escenarios BDD:**

```gherkin
Feature: Consistencia del sistema de diseño con la implementación

  Scenario: Los Design Tokens del Figma se reflejan en el CSS de la aplicación
    Given que el Figma define el color primario como #[color-primario] y la tipografía como [fuente]
    When se inspecciona el CSS compilado de la aplicación
    Then la variable CSS --color-primary debe coincidir con el token del Figma
    And la familia tipográfica aplicada debe coincidir con la definida en el Design System

  Scenario: Los wireframes de baja fidelidad cubren todos los flujos críticos
    Given que el sistema de diseño en Figma está publicado
    When QA revisa el prototipo navegable
    Then deben existir frames para: Home, Catálogo, Detalle Producto, Carrito, Login, Checkout, Panel Admin
    And cada frame debe tener anotaciones de comportamiento esperado para el Frontend

  Scenario: El diseño es responsivo en breakpoints clave
    Given que la aplicación está renderizada en producción
    When se visualiza en viewport de 375px (mobile) y 1440px (desktop)
    Then no deben existir elementos que se desborden del viewport (overflow horizontal)
    And los botones de acción (Agregar al carrito, Comprar) deben ser clicables en touch
```

---

#### SCRUM-9 — Armar Test. Mapa Mental en XMind/Miro (QA)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-9 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Highest |
| **Asignado** | Agustina Fernandez Maidana (QA Tester) · Christian Rodrigo Santibáñez Martínez (QA Tester) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 21/sep/26 |

**Descripción técnica:** Crear un mapa mental en XMind o Miro con el nodo central "NovaMarket MVP". Ramas obligatorias: AUTH (Registro, Login, Admin Login), CATÁLOGO (ver productos, filtrar, detalle, 404), CARRITO (agregar, eliminar, vacío, stock), CHECKOUT (simulado, confirmación), ADMIN CRUD (crear/editar/eliminar producto, 403). Mínimo 5 ramas y 15 edge cases. Entregar: link público, captura PNG, archivo .xmind.

**Avances y observaciones:**

- Agustina entregó una primera versión del mapa mental que fue revisada por Gisele (PM), quien identificó dos puntos a corregir antes de dar el visto bueno:
  - Faltaban las preguntas preventivas del tipo *"¿Qué pasa si...?"* en cada escenario.
  - El mapa solo mostraba flujos felices, sin los 15 edge cases mínimos requeridos.
- Agustina entregó una segunda versión corregida el mismo día, disponible en XMind: https://app.xmind.com/share/mqkXAglu?xid=YnRZwQsT
- El ticket queda en estado **"En curso"** hasta que el PM valide la versión corregida.

**Estructura del mapa mental — ítems relevados:**

| Rama | Ítems confirmados | Pendiente de confirmar con el equipo |
|------|-------------------|--------------------------------------|
| **Autenticación** | Registro, Login de usuarios, Login de administrador | Cerrar sesión, Recuperar contraseña |
| **Catálogo** | Ver producto, Filtrar producto, Añadir al carrito | Buscar producto, Ver detalle del producto |
| **Carrito** | Ver productos añadidos, Ver cantidad de unidades, Ver subtotal | Modificar cantidad de unidades |
| **Checkout** | Elegir método de pago, Ingresar ubicación, Confirmar compra | Mensaje de compra finalizada |
| **Admin** | Ver productos, Crear producto, Modificar producto, Eliminar producto, Ver pedidos de clientes | — |

**Tipos de prueba asociados:** Análisis · Diseño de Casos de Prueba · E2E

**Escenarios BDD:**

```gherkin
Feature: Mapa mental de cobertura de pruebas NovaMarket MVP

  Scenario: El mapa mental cubre los 5 módulos críticos del MVP
    Given que el mapa mental ha sido creado en XMind o Miro
    When se revisa su estructura
    Then debe tener un nodo central llamado "NovaMarket MVP"
    And debe tener exactamente 5 ramas principales: AUTH, CATÁLOGO, CARRITO, CHECKOUT, ADMIN CRUD
    And cada rama debe contener al menos 3 casos de prueba específicos

  Scenario: Los edge cases están documentados con la pregunta preventiva
    Given que se revisan los casos de prueba del mapa mental
    When se buscan escenarios negativos
    Then debe existir el caso "¿Qué pasa si el email ya está registrado?"
    And debe existir el caso "¿Qué pasa si intento comprar cantidad -5 de un producto?"
    And debe existir el caso "¿Qué pasa si el token JWT en localStorage es manipulado manualmente?"
    And debe existir el caso "¿Qué pasa si intento acceder a /admin sin ser administrador?"
    And debe existir el caso "¿Qué pasa si el carrito está vacío y voy a /checkout?"

  Scenario: Los entregables del mapa mental están subidos correctamente
    Given que la tarea SCRUM-9 está lista para revisión
    When el PM inspecciona el ticket en Jira
    Then debe haber un link público a XMind adjunto al comentario del ticket
    And debe haber una captura PNG del mapa mental subida como adjunto
    And el archivo .xmind debe estar disponible en el Drive del equipo
```

---

#### SCRUM-10 — Prototipo navegable (UX/UI)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-10 |
| **Tipo** | Tarea |
| **Estado** | Por Hacer |
| **Prioridad** | Medium |
| **Asignado** | Ismael Jensen · Nicolás Toloza (UX/UI) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 26/sep/26 |

**Descripción técnica:** Unir los wireframes en un flujo de compra básico en Figma para que QA y Frontend puedan revisarlo. El prototipo debe cubrir el flujo: Home → Catálogo → Detalle → Carrito → Checkout → Confirmación.

**Tipos de prueba asociados:** Pruebas de Usabilidad · E2E (referencia de flujo)

**Escenarios BDD:**

```gherkin
Feature: Validación del prototipo navegable contra la implementación

  Scenario: El flujo de compra del prototipo coincide con la implementación real
    Given que el prototipo navegable de Figma está publicado
    When QA compara cada pantalla del prototipo con la implementación en el navegador
    Then las transiciones de pantalla deben coincidir con el flujo: Home → Catálogo → Detalle → Carrito → Checkout → Confirmación
    And los textos de los CTAs (Call-to-Action) deben coincidir con el microcopy definido por Marketing

  Scenario: El prototipo documenta el comportamiento de los estados de error
    Given que se revisa el prototipo de Figma
    When se navega por los flujos de error
    Then debe existir un frame para "Carrito vacío" con su mensaje de estado vacío
    And debe existir un frame para "Producto no encontrado (404)"
    And debe existir un frame para "Error de login — credenciales incorrectas"
```

---

#### SCRUM-11 — Identidad y análisis de competencia (Marketing)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-11 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Highest |
| **Asignado** | Lucía Chiarandini (Marketing) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 18/sep/26 |

**Descripción técnica:** Analizar cómo venden Instagram y MercadoLibre hoy (puntos de dolor del brief). Armar moodboard de 3 e-commerce de tecnología (ej: Compra Gamer, Gezatek). Definir tono de NovaMarket: juvenil/tech/gamer/profesional. Entregar: doc en Notion con links y capturas.

**Tipos de prueba asociados:** Pruebas de Contenido · Validación de Microcopy

**Escenarios BDD:**

```gherkin
Feature: Consistencia de identidad de marca en la plataforma

  Scenario: El tono de comunicación definido se refleja en los textos de la UI
    Given que el análisis de identidad define un tono "tech-profesional con accesibilidad juvenil"
    When se revisan todos los textos de la interfaz (botones, títulos, mensajes de error)
    Then ningún mensaje de error debe usar lenguaje técnico crudo (ej: "Error 500 Internal Server Error")
    And los CTAs deben usar lenguaje activo (ej: "Agregar al carrito" en lugar de "Submit")
    And los mensajes de confirmación deben ser afirmativos y claros

  Scenario: La propuesta de valor de NovaMarket es visible en la Home
    Given que la aplicación está deployada
    When un usuario visita la página principal por primera vez
    Then debe ser visible una sección "hero" que comunique la propuesta de valor definida en SCRUM-11
    And debe estar presente el logo y la paleta de colores de NovaMarket
```

---

#### SCRUM-12 — Buyer Persona y propuesta de valor (Marketing)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-12 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Medium |
| **Asignado** | Lucía Chiarandini (Marketing) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 22/sep/26 |

**Descripción técnica:** Crear 1 buyer persona para el MVP: "¿A quién le vendemos accesorios/periféricos/gadgets?". Definir propuesta de valor de NovaMarket (ej: "Control total, compra sin fricción, soporte directo"). Este entregable lo necesita el equipo de Diseño Gráfico para los textos del Figma.

**Tipos de prueba asociados:** Validación de Experiencia de Usuario · Pruebas de Usabilidad

**Escenarios BDD:**

```gherkin
Feature: La UX refleja las necesidades del Buyer Persona definido

  Scenario: El flujo de compra no tiene más de 3 pasos hasta el checkout
    Given que el Buyer Persona tiene perfil de comprador con poco tiempo disponible
    When se cuenta la cantidad de clics necesarios desde "Ver producto" hasta "Confirmar orden"
    Then el flujo debe completarse en 3 pasos o menos (Agregar al carrito → Checkout → Confirmar)
    And en ningún paso se debe requerir información que no sea estrictamente necesaria

  Scenario: El catálogo tiene filtros que responden al perfil del Buyer Persona
    Given que el Buyer Persona busca periféricos gaming de rango medio
    When se utilizan los filtros de categoría disponibles
    Then deben existir las categorías: "Accesorios", "Periféricos", "Gadgets"
    And los resultados filtrados deben mostrar únicamente productos de la categoría seleccionada
```

---

#### SCRUM-13 — Contenido base para el catálogo (Data/Marketing)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-13 |
| **Tipo** | Tarea |
| **Estado** | Finalizado ✅ |
| **Prioridad** | Medium |
| **Asignado** | Lucía Chiarandini (Marketing) |
| **Sprint** | SCRUM Sprint 0 |
| **Fecha límite** | 24/sep/26 |

**Descripción técnica:** Crear 10 productos falsos pero realistas (con nombre, categoría, descripción corta, precio) para que Backend pueda cargar la base de datos y Frontend tenga datos que mostrar. Categorías del brief: accesorios, periféricos y gadgets. Entregable: Excel/Google Sheet con: Nombre | Categoría | Precio | Descripción | Imagen (link).

**Tipos de prueba asociados:** Unit (seed data) · Integration (carga en DB) · E2E (visualización)

**Escenarios BDD:**

```gherkin
Feature: Carga y visualización del catálogo de productos semilla

  Scenario: Los 10 productos semilla se cargan correctamente en la base de datos
    Given que existe el Excel/Sheet con los 10 productos definidos en SCRUM-13
    When el Backend ejecuta el script de seed de la base de datos
    Then deben existir exactamente 10 documentos en la colección "products"
    And cada producto debe tener los campos: name, category, price, description, imageUrl
    And ningún campo obligatorio debe ser null o undefined

  Scenario: El catálogo muestra los 10 productos en el Frontend
    Given que la base de datos fue sembrada con los 10 productos
    When el usuario navega a la página /catalog
    Then deben visualizarse 10 tarjetas de producto (ProductCard)
    And cada tarjeta debe mostrar: imagen, nombre, categoría, precio
    And los productos con imageUrl vacío deben mostrar una imagen placeholder, no un ícono de error

  Scenario: Los filtros por categoría devuelven resultados correctos
    Given que los 10 productos están distribuidos entre las 3 categorías del brief
    When el usuario selecciona el filtro "Periféricos"
    Then solo deben mostrarse los productos cuyo campo category sea "Periféricos"
    And el contador de resultados debe actualizarse reflejando la cantidad filtrada

  Scenario: Cada producto tiene una página de detalle accesible
    Given que el catálogo muestra 10 productos
    When el usuario hace clic en la tarjeta de un producto específico
    Then debe navegar a la ruta /products/:id con el ID del producto
    And la página de detalle debe mostrar: nombre completo, descripción, precio, botón "Agregar al carrito"
    When el usuario ingresa manualmente a /products/id-que-no-existe
    Then debe recibir un error 404 con mensaje amigable "Producto no encontrado"
```

---

#### SCRUM-14 — Definir Criterios de Aceptación y Datos de Prueba (QA)

| Campo | Detalle |
|-------|---------|
| **Clave** | SCRUM-14 |
| **Tipo** | Tarea |
| **Estado** | En Revisión |
| **Prioridad** | Medium |
| **Asignado** | Christian Rodrigo Santibáñez Martínez (QA Tester) |
| **Sprint** | SCRUM Sprint 0 |

**Descripción técnica:** Definir formalmente los criterios de aceptación técnicos para todos los módulos del MVP y preparar los fixtures de datos de prueba (usuarios, productos, órdenes) que serán utilizados en los tests automatizados. Este documento sirve como "contrato de calidad" entre QA, Backend y Frontend.

**Tipos de prueba asociados:** Unit · Integration · E2E · API · Security

**Escenarios BDD:**

```gherkin
Feature: Criterios de Aceptación formalizados y Datos de Prueba preparados

  Scenario: Los fixtures de usuario de prueba están disponibles para los tests
    Given que los criterios de aceptación han sido formalizados
    When se ejecuta el setup de la suite de tests automatizados
    Then deben estar disponibles los siguientes fixtures:
      | tipo           | email                      | password   | role  |
      | Usuario válido | test.user@novamarket.com   | Test1234!  | user  |
      | Admin válido   | admin@novamarket.com       | Admin1234! | admin |
      | Email duplicado| test.user@novamarket.com   | OtroPass!  | user  |
    And los fixtures no deben contener datos reales de usuarios del equipo

  Scenario: Los criterios de aceptación están vinculados a cada ticket de Jira
    Given que el documento de criterios está redactado
    When se compara con las tareas SCRUM-1 a SCRUM-13
    Then cada tarea debe tener al menos 2 criterios de aceptación documentados
    And los criterios deben usar lenguaje verificable (no "debe funcionar bien", sino condiciones medibles)
```

---

### 1.3 Tabla Consolidada: Mapeo Requisito → Tipo de Prueba

| Ticket | Módulo | Título Resumido | Unit | Integration | E2E | API | Performance | Security |
|--------|--------|-----------------|------|-------------|-----|-----|-------------|----------|
| SCRUM-1 | Backend Setup | Inicializar Node.js + Express | ✅ | ✅ | — | ✅ | — | — |
| SCRUM-2 | DevOps/Git | Organizar repositorio Git | — | ✅ | — | — | — | ✅ |
| SCRUM-3 | Infraestructura | Config entorno compartido | — | ✅ | ✅ | — | — | — |
| SCRUM-4 | DevOps/Git | Colaboradores GitHub | — | ✅ | — | — | — | ✅ |
| SCRUM-5 | Backend/DB | Arquitectura + conexión DB | ✅ | ✅ | — | ✅ | — | ✅ |
| SCRUM-6 | Frontend | Inicializar React + Vite | ✅ | ✅ | ✅ | — | — | — |
| SCRUM-7 | Frontend | Estructura base + consumo API | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| SCRUM-8 | UX/UI | Sistema de diseño Figma | — | — | ✅ | — | — | — |
| SCRUM-9 | QA | Mapa Mental de Pruebas | — | — | ✅ | — | — | ✅ |
| SCRUM-10 | UX/UI | Prototipo navegable | — | — | ✅ | — | — | — |
| SCRUM-11 | Marketing | Identidad y competencia | — | — | ✅ | — | — | — |
| SCRUM-12 | Marketing | Buyer Persona y propuesta | — | — | ✅ | — | — | — |
| SCRUM-13 | Data/Catálogo | Contenido base catálogo | ✅ | ✅ | ✅ | ✅ | — | — |
| SCRUM-14 | QA | Criterios de aceptación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Leyenda:** ✅ = Aplica directamente | — = No aplica o indirecto

---

### 1.4 Módulos Adicionales del MVP (Flujos Implícitos del Brief)

Los siguientes módulos surgen del análisis funcional del brief y los contenidos del curso, pero no tienen un ticket de Jira dedicado en el Sprint 0. Serán cubiertos por los sprints futuros:

#### Módulo AUTH — Autenticación y Sesión

**Tipos de prueba:** E2E · API · Security · Integration

```gherkin
Feature: Registro de nuevo usuario cliente

  Scenario: TC001 - Registro exitoso con datos válidos
    Given que el usuario no tiene cuenta en NovaMarket
    When completa el formulario con email "nuevo@test.com", password "Pass1234!", nombre "Juan"
    And hace clic en "Registrarme"
    Then la API POST /api/auth/register debe responder HTTP 201
    And el body debe contener { "message": "Usuario creado exitosamente", "userId": "[id]" }
    And el usuario debe ser redirigido a la página de inicio o dashboard
    And el Navbar debe mostrar el nombre del usuario

  Scenario: TC002 - Registro con email ya registrado (email duplicado)
    Given que el email "existente@test.com" ya existe en la base de datos
    When se intenta registrar con ese mismo email
    Then la API debe responder HTTP 409 Conflict
    And el mensaje de error debe ser "El email ya está registrado"
    And el formulario debe mostrar el error debajo del campo email

  Scenario: TC003 - Registro con contraseña menor a 6 caracteres
    Given que el usuario completa el formulario con password "123"
    When intenta enviar el formulario
    Then la validación debe ejecutarse ANTES de llamar a la API (client-side)
    And debe mostrarse el mensaje "La contraseña debe tener al menos 6 caracteres"
    And la API POST /api/auth/register NO debe ser llamada

  Scenario: TC004 - Registro con campos obligatorios vacíos
    Given que el usuario deja el campo email vacío
    When intenta enviar el formulario
    Then no debe ejecutarse la llamada a la API
    And debe mostrarse el mensaje "El email es obligatorio"

  Scenario: TC005 - Login exitoso con credenciales válidas
    Given que el usuario tiene cuenta con email "user@test.com" y password "Pass1234!"
    When completa el formulario de login y hace clic en "Iniciar sesión"
    Then la API POST /api/auth/login debe responder HTTP 200
    And el body debe contener un campo "token" con el JWT
    And el JWT debe guardarse en localStorage bajo la clave "authToken"
    And el Navbar debe actualizar mostrando el nombre del usuario

  Scenario: TC006 - Login con contraseña incorrecta
    Given que el usuario existe pero ingresa password "PassIncorrecta"
    When envía el formulario de login
    Then la API debe responder HTTP 401 Unauthorized
    And el mensaje debe ser "Credenciales inválidas" (sin especificar si fue el email o la contraseña)
    And el formulario debe mostrar el error de manera visible

  Scenario: TC007 - Prueba de seguridad: acceso a /admin sin ser administrador
    Given que el usuario autenticado tiene role = "user" (no admin)
    When navega directamente a la URL /admin
    Then debe ser redirigido automáticamente a /home o /catalog
    And debe mostrarse un mensaje "Acceso no autorizado"

  Scenario: TC008 - Prueba de seguridad: manipulación del JWT en localStorage
    Given que el usuario está autenticado con un JWT válido de rol "user"
    When abre DevTools > Application > Local Storage y modifica el token manualmente
    And recarga la página
    Then la aplicación debe detectar el token inválido
    And debe redirigir al usuario al login con el mensaje "Sesión inválida, por favor inicia sesión"

  Scenario: TC009 - API POST /api/auth/register con body vacío (Postman)
    Given que se envía una petición POST a /api/auth/register con body {}
    Then la API debe responder HTTP 400 Bad Request
    And el body debe detallar los campos requeridos faltantes

  Scenario: TC010 - Admin Login exitoso
    Given que existe un usuario con role "admin" en la base de datos
    When ese usuario inicia sesión con sus credenciales
    Then la API debe responder HTTP 200 con JWT
    And el JWT debe contener el campo role: "admin" en el payload decodificado
    And el usuario debe ver el acceso al panel de administración en el Navbar

  # TC011 - Búsqueda por texto libre
  # EXCLUIDA DEL MVP v1.0 — decisión tomada el 22/sep/2026.
  # Evaluada contra proyecto de referencia desplegado: el parámetro ?search=
  # no filtra correctamente (devuelve todos los productos). Agustina señaló
  # además que nunca fue discutida como funcionalidad del MVP con el equipo.
  # Candidata para Sprint 2 si el tiempo lo permite.

  # TC012b - Comparar productos
  # EXCLUIDA DEL MVP v1.0 — decisión tomada el 22/sep/2026.
  # Funcionalidad presente en el User Flow de Figma pero nunca confirmada
  # por el equipo (señalado por Agustina en el chat del grupo).
  # El proyecto de referencia tampoco la implementó. Candidata para Sprint 2.

  # TC016b - Evaluar alternativas relacionadas desde el detalle
  # EXCLUIDA DEL MVP v1.0 — decisión tomada el 22/sep/2026.
  # Mismo criterio que TC012b — presente en Figma, no confirmada por el equipo
  # y fuera del alcance del brief original. Candidata para Sprint 2.

  Scenario: TC032b - Checkout - Pantalla de Finalizar post-confirmación
    Given que el usuario completó el checkout y ve la pantalla de "Pedido confirmado"
    When visualiza el número y resumen del pedido
    And hace clic en el botón "Finalizar"
    Then debe ser redirigido a la página principal o al catálogo
    And el carrito debe quedar vacío después de finalizar

  Scenario: TC032c - Checkout - "¿Continuar comprando?" → No (ir directo a Checkout)
    Given que el usuario tiene productos en el carrito y está en la vista de carrito
    When responde "No" a la opción de continuar comprando
    Then debe ser redirigido directamente a la pantalla de Checkout
    And los productos del carrito deben seguir presentes

  Scenario: TC039 - Admin - Ver listado de pedidos de clientes
    Given que el administrador está autenticado y en el Dashboard
    When navega a la sección "Pedidos"
    Then debe ver un listado de los pedidos realizados por clientes
    And cada pedido debe mostrar al menos: número de orden, estado y datos básicos del cliente

  Scenario: TC040 - Admin - Ver detalle de un pedido específico
    Given que el administrador está en el listado de pedidos
    When selecciona un pedido de la lista
    Then debe ver la información básica del pedido: productos, cantidades, total y datos del cliente
    And debe poder volver al listado sin perder el estado de la página
```

---

## 2. EQUIPO Y ROLES

### 2.1 Integrantes del Equipo

| Integrante | Email | Rol en el Proyecto | Responsabilidades |
|------------|-------|-------------------|-------------------|
| **Marcia Torre** | marciatorre.pacc@gmail.com | Project Manager | Coordinación general del proyecto, validación de entregables, aprobación de go/no-go |
| **Gisele Lorena Ortiz** | giseleortizuriel@gmail.com | Project Manager | Gestión del backlog en Jira, coordinación de dailys, feedback y validación de entregables QA |
| **Laura Cuenca** | laura.cuenca1@gmail.com | Backend Developer (Node.js) | Setup del servidor, arquitectura, conexión DB, endpoints REST |
| **Florencia Alicia Sombra** | sombraflorencia097@gmail.com | Backend Developer (Node.js) | ⚠️ Salió del proyecto el 22/sep/2026. Sus responsabilidades fueron absorbidas por Christian. |
| **María Emilia Orioni** | emyorioni@gmail.com | Frontend Developer (React) | Sin actividad confirmada desde el 23/sep/2026. Christian tomó el desarrollo frontend. |
| **Gastón Paniagua** | — | Frontend Developer (React) | Incorporado en Sprint 2. Asignado a SCRUM-22, 26, 28, 29. |
| **Ismael Jensen** | ismaeljensen08@gmail.com | Diseñador UX/UI | Sistema de diseño, wireframes, prototipo navegable |
| **Nicolás Toloza** | nicolastoloza1989@gmail.com | Diseñador UX/UI | Sistema de diseño, wireframes, prototipo navegable |
| **Lucía Chiarandini** | luciaavrchiarandini@gmail.com | Especialista de Marketing | Identidad de marca, buyer persona, contenido del catálogo |
| **Agustina Fernandez Maidana** | agustinafm2018@gmail.com | QA Tester | Mapa mental de pruebas, estrategia de testing, ejecución de casos |
| **Christian Rodrigo Santibáñez Martínez** | christiansanti.martinez@gmail.com | QA Tester | Criterios de aceptación, datos de prueba, automatización |

---

### 2.2 Asignación de Roles por Módulo de Pruebas

Basado en las fortalezas demostradas en el backlog y el rol de cada integrante en el proyecto:

#### Módulo: Frontend (UI/UX Testing)
- **QA Tester:** Agustina Fernandez Maidana
- **Apoyo:** María Emilia Orioni (Frontend), Ismael Jensen y Nicolás Toloza (UX/UI)
- Agustina tiene la visión del flujo completo del MVP. Emilia conoce la arquitectura de los componentes React e Ismael/Nicolás pueden validar que lo implementado coincide con el diseño.
- **Responsabilidades QA:** Tests E2E con Playwright, regresión visual, validación de responsividad móvil.

#### Módulo: Backend y API (API Testing)
- **QA Tester:** Christian Rodrigo Santibáñez Martínez
- **Apoyo:** Laura Cuenca y Florencia Sombra (Backend)
- Christian tiene a cargo los criterios de aceptación técnicos y los contratos de API, así que es el más indicado para validarlos. Laura aporta el contexto de implementación cuando algo no está claro.
- **Responsabilidades QA:** Tests de API con Supertest, validación de endpoints REST, pruebas de autorización JWT.

#### Módulo: Base de Datos (Data Quality Testing)
- **QA Tester:** Christian Rodrigo Santibáñez Martínez
- **Apoyo:** Laura Cuenca y Florencia Sombra (Backend), Lucía Chiarandini (Marketing)
- Los fixtures de datos de prueba y el contenido semilla del catálogo son responsabilidad directa de Christian y Lucía, lo que facilita la coordinación para las pruebas de integridad.
- **Responsabilidades QA:** Validación de seeds, integridad referencial en Orders, unicidad de email en usuarios.

#### Módulo: CI/CD y Automatización
- **QA Tester:** Christian Rodrigo Santibáñez Martínez
- **Apoyo:** Laura Cuenca y Florencia Sombra (integración con el pipeline de backend)
- Christian tiene la responsabilidad técnica de automatizar los criterios de aceptación y mantener el pipeline en verde.
- **Responsabilidades:** Configurar GitHub Actions, mantener el pipeline verde en cada PR a develop, configurar Playwright, Supertest y Jest.

#### Módulo: Seguridad y Roles
- **QA Tester:** Agustina Fernandez Maidana
- **Apoyo:** Christian Rodrigo Santibáñez Martínez
- Los edge cases de seguridad (acceso a /admin sin ser admin, manipulación de token) fueron relevados por Agustina en el mapa mental, así que tiene el contexto para liderarlos.
- **Responsabilidades:** Pruebas de autorización (401/403), validación de JWT, pruebas básicas de rutas protegidas.

---

### 2.3 Matriz de Habilidades del Equipo QA

Habilidades actuales del equipo QA y las brechas a cerrar para ejecutar este plan:

| Integrante | HTML/CSS/JS | React | Node.js/API | MongoDB | Git/GitHub | Postman/API Testing | Playwright/E2E | Jest/Vitest | GitHub Actions | BDD/Gherkin |
|------------|------------|-------|-------------|---------|------------|--------------------|--------------------|-------------|----------------|-------------|
| Agustina Fernandez | ✅ | ✅ | ✅ | ✅ | ✅ | ✅✅ | ⚠️ Brecha | ⚠️ Brecha | ⚠️ Brecha | ✅ |
| Christian Santibáñez | ✅ | ✅ | ✅ | ✅ | ✅✅ | ✅✅ | ⚠️ Brecha | ⚠️ Brecha | ⚠️ Brecha | ✅ |

**Leyenda:** ✅✅ = Dominio sólido | ✅ = Conocimiento funcional | ⚠️ Brecha = Requiere capacitación

---

### 2.4 Plan de Cierre de Brechas

El principal gap del equipo QA está en el stack de automatización — Playwright, Jest, GitHub Actions y BDD son herramientas que no todos manejan todavía. El plan es cerrar eso en las primeras dos semanas con recursos concretos y ejercicios prácticos, para que cuando llegue el Sprint 1 ya podamos escribir tests reales sin trabas.

#### Semana 1 — Playwright (Agustina + Christian)

**Objetivo:** Poder escribir el primer test E2E funcional antes de que arranque el Sprint 1.

**Recursos recomendados:**
- Documentación oficial: https://playwright.dev/docs/intro (Getting Started)
- Tutorial práctico: "Playwright TypeScript Tutorial" (canal Fireship o LearnWithJon en YouTube)
- Ejercicio práctico: Escribir un test que navegue a la Home de NovaMarket y verifique que el título `<h1>` contiene "NovaMarket"

**Checklist de validación al final de la semana:**
- [x] Playwright instalado en `/tests/` del repositorio
- [ ] Primer test E2E que pasa: navegación a la Home (pendiente — frontend no disponible aún)
- [x] Configuración de `playwright.config.ts` con baseURL apuntando a localhost

#### Semana 1 — Jest + Supertest para API Testing (Christian)

**Objetivo:** Poder escribir tests de integración contra el backend Express antes de la Semana 3.

**Recursos recomendados:**
- Documentación Supertest: https://github.com/ladjs/supertest
- Tutorial: "Testing Node.js APIs with Jest and Supertest" (artículo de LogRocket)
- Ejercicio práctico: Test que valida que `GET /api/health` responde 200

**Checklist de validación:**
- [x] Jest y Supertest instalados como devDependencies
- [x] Primer test de API que pasa: GET /api/health → HTTP 200

#### Semana 2 — GitHub Actions CI/CD (Christian + Laura)

**Objetivo:** Tener el pipeline básico operativo antes del Sprint 1.

**Recursos recomendados:**
- GitHub Actions Quickstart: https://docs.github.com/en/actions/quickstart
- Ejemplo de workflow Node.js en GitHub Actions Marketplace
- Ejercicio práctico: Crear `.github/workflows/ci.yml` que ejecute `npm test` en cada push a develop

**Checklist de validación:**
- [ ] Workflow de CI creado y visible en la pestaña Actions del repositorio
- [ ] El pipeline ejecuta y el badge de estado es visible en el README
- [ ] Los tests pasan en el entorno CI (no solo en local)

#### Semana 2 — Sintaxis BDD con Gherkin (Agustina + Christian)

**Objetivo:** Estandarizar cómo escribimos los escenarios de prueba en formato Given-When-Then.

**Recursos recomendados:**
- Guía BDD: https://cucumber.io/docs/bdd/
- Referencia de sintaxis Gherkin: https://cucumber.io/docs/gherkin/reference/
- Ejercicio práctico: Traducir los 10 primeros casos de la planilla de SCRUM-14 a escenarios Gherkin

**Checklist de validación:**
- [ ] Al menos 10 escenarios escritos en formato BDD y revisados por ambos QA
- [ ] Los escenarios están vinculados a los tickets de Jira correspondientes

---

## 3. ARQUITECTURA DE PRUEBAS

### 3.1 Pirámide de Tests — Estrategia Adoptada

Se adopta la pirámide de testing clásica con énfasis en la base sólida de tests unitarios y de integración, reservando los E2E para los flujos críticos de negocio:

```
                    ┌────────────────────┐
                    │    E2E / UI Tests   │  ~15% del total
                    │   (Playwright)      │  ~20–25 tests
                    └────────────────────┘
               ┌──────────────────────────────┐
               │   Integration / API Tests    │  ~35% del total
               │   (Supertest + Jest)         │  ~50–60 tests
               └──────────────────────────────┘
          ┌──────────────────────────────────────────┐
          │            Unit Tests                    │  ~50% del total
          │          (Jest / Vitest)                 │  ~80–100 tests
          └──────────────────────────────────────────┘
```

**Principios generales:**
- Los tests E2E deben ser estables y no "flaky". Si un test falla intermitentemente sin cambio de código, debe ser aislado y corregido antes de mergear.
- La decisión de qué automatizar y qué no vale la pena automatizar recae en el equipo QA. No todo bug requiere un test automatizado.
- Los tests de CI deben mantenerse rápidos. El pipeline completo no debe superar los 5 minutos en promedio.

---

### 3.2 Stack Tecnológico de Automatización

#### 3.2.1 E2E / UI Testing — Playwright (TypeScript)

**Herramienta elegida:** Playwright v1.x (TypeScript)

**Justificación técnica:**

Playwright es la herramienta elegida para los tests E2E. Los motivos técnicos concretos son:

1. **Multi-browser nativo:** Chromium, Firefox y WebKit en un solo runner, sin configuración adicional. Cypress solo soporta Chromium por defecto en su versión gratuita.
2. **Soporte TypeScript de primera clase:** Playwright lo soporta sin transpilación adicional, lo que encaja con el stack del proyecto.
3. **Auto-wait:** Playwright espera automáticamente a que los elementos sean visibles y accionables, reduciendo los `waitForTimeout()` que generan flaky tests.
4. **Modo API request nativo:** Playwright permite hacer requests HTTP directamente desde los tests sin necesidad de Postman, lo que simplifica los tests de setup/teardown.
5. **Playwright Report:** Genera reportes HTML visuales nativos sin configuración adicional (alternativa a Allure para equipos pequeños).
6. **Trazas grabadas:** `--trace on` graba una traza completa (screenshots, network, console) que permite reproducir fallos en CI con un click.

**Arquitectura: Page Object Model (POM)**

Se implementará el patrón Page Object Model para desacoplar la lógica de navegación de los assertions de prueba. Esto evita que un cambio en el selector de un botón rompa 15 tests diferentes.

```
tests/
├── e2e/
│   ├── pages/                    # Page Objects
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── CatalogPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── AdminPage.ts
│   ├── specs/                    # Test specs organizados por módulo
│   │   ├── auth/
│   │   │   ├── register.spec.ts
│   │   │   └── login.spec.ts
│   │   ├── catalog/
│   │   │   ├── catalog-listing.spec.ts
│   │   │   └── product-detail.spec.ts
│   │   ├── cart/
│   │   │   └── cart-operations.spec.ts
│   │   ├── checkout/
│   │   │   └── checkout-flow.spec.ts
│   │   └── admin/
│   │       └── admin-crud.spec.ts
│   └── fixtures/                 # Datos de prueba para E2E
│       ├── users.ts
│       └── products.ts
├── api/                          # Tests de API con Supertest
│   ├── auth.api.test.ts
│   ├── products.api.test.ts
│   └── orders.api.test.ts
├── unit/                         # Tests unitarios con Jest/Vitest
│   ├── utils/
│   └── components/
└── playwright.config.ts
```

**Ejemplo de Page Object — LoginPage:**

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByRole('button', { name: 'Iniciar sesión' });
    this.errorMessage = page.getByTestId('login-error');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

**Ejemplo de spec de login:**

```typescript
// tests/e2e/specs/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Módulo de Autenticación — Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC005 - Login exitoso redirige al catálogo', async ({ page }) => {
    await loginPage.login('test.user@novamarket.com', 'Test1234!');
    await expect(page).toHaveURL('/catalog');
    await expect(page.getByTestId('navbar-user-name')).toBeVisible();
  });

  test('TC006 - Login con contraseña incorrecta muestra error', async ({ page }) => {
    await loginPage.login('test.user@novamarket.com', 'PassIncorrecta');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Credenciales inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('TC008 - Acceso directo a /admin sin admin redirige al home', async ({ page }) => {
    // Sin token en localStorage
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});
```

**Configuración de Playwright:**

```typescript
// tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/reports/playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

#### 3.2.2 API Testing — Supertest + Jest

**Herramienta elegida:** Supertest v7.x + Jest v29.x

**Justificación técnica:** Supertest se integra directamente con la instancia de la aplicación Express sin necesidad de levantar un servidor real en un puerto. Esto elimina la dependencia de puertos disponibles en CI y hace los tests más rápidos y deterministas. La combinación con Jest provee mocking, cobertura de código y reporters integrados.

**Estrategia de validación de API:**

Para cada endpoint se valida:
1. **Código de estado HTTP** (200, 201, 400, 401, 403, 404, 409, 500)
2. **Estructura del payload JSON** (campos obligatorios presentes, tipos de datos correctos)
3. **Headers de respuesta** (Content-Type: application/json)
4. **Casos de error** (body inválido, campos faltantes, autenticación incorrecta)

**Ejemplo de test de API — Auth endpoints:**

```typescript
// tests/api/auth.api.test.ts
import request from 'supertest';
import app from '../../src/app'; // La instancia Express sin listen()
import { connectDB, disconnectDB } from '../../src/config/db';

describe('POST /api/auth/register', () => {
  beforeAll(async () => { await connectDB(); });
  afterAll(async () => { await disconnectDB(); });

  it('TC001 - Registro exitoso devuelve 201 con userId', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `test.${Date.now()}@novamarket.com`,
        password: 'Test1234!'
      });

    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('userId');
    expect(response.body.message).toBe('Usuario creado exitosamente');
  });

  it('TC002 - Email duplicado devuelve 409 Conflict', async () => {
    const email = 'duplicate@novamarket.com';
    // Primer registro
    await request(app).post('/api/auth/register').send({
      name: 'User One', email, password: 'Pass1234!'
    });
    // Segundo intento con el mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email, password: 'OtroPass!' });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('El email ya está registrado');
  });

  it('TC009 - Body vacío devuelve 400 Bad Request con detalle de campos', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  it('TC005 - Login exitoso devuelve 200 con token JWT', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test.user@novamarket.com', password: 'Test1234!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.split('.')).toHaveLength(3); // JWT tiene 3 partes
  });

  it('TC006 - Credenciales inválidas devuelven 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test.user@novamarket.com', password: 'WrongPass' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });
});

describe('Seguridad: Rutas protegidas', () => {
  it('TC - POST /api/products sin token devuelve 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Producto test', price: 100 });

    expect(response.status).toBe(401);
  });

  it('TC - POST /api/products con token de user (no admin) devuelve 403 Forbidden', async () => {
    // Login como user normal para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test.user@novamarket.com', password: 'Test1234!' });

    const userToken = loginResponse.body.token;

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Producto no autorizado', price: 999 });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden: se requiere rol de administrador');
  });
});
```

---

#### 3.2.3 Pruebas Unitarias e Integración — Jest + Vitest

**Herramienta elegida:**
- **Backend:** Jest v29.x (estándar en ecosistema Node.js)
- **Frontend:** Vitest v1.x (integrado nativamente con Vite, misma sintaxis que Jest)

**Qué se prueba a nivel unitario:**

En el Backend (Jest):
- Funciones de validación de datos (validators)
- Lógica de negocio en controladores (mockeando el pool de `pg`)
- Funciones de utilería (generación de JWT, hash de passwords con bcrypt)
- Middleware de autenticación (verificación del token)

En el Frontend (Vitest):
- Funciones de cálculo del carrito (total, subtotal, descuentos)
- Utilidades de formateo (precios, fechas)
- Hooks customizados (useCart, useAuth)
- Componentes aislados con React Testing Library

**Ejemplo de test unitario — Middleware de autenticación:**

```typescript
// tests/unit/middleware/auth.middleware.test.ts
import { verifyToken } from '../../src/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

describe('Middleware de autenticación JWT', () => {
  const SECRET = process.env.JWT_SECRET || 'test-secret';

  it('acepta un token válido y llama a next()', () => {
    const token = jwt.sign({ userId: '123', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = {} as any;
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toHaveProperty('userId', '123');
  });

  it('rechaza un token expirado con 401', () => {
    const expiredToken = jwt.sign({ userId: '123' }, SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza una petición sin token con 401', () => {
    const req = { headers: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

**Ejemplo de test unitario — Cálculo del carrito (Frontend/Vitest):**

```typescript
// tests/unit/utils/cart.utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTotal } from '../../src/utils/cart.utils';

describe('Utilidades del Carrito — Cálculo de precios', () => {
  const cartItems = [
    { id: '1', name: 'Mouse Gamer', price: 4500, quantity: 2 },
    { id: '2', name: 'Teclado Mecánico', price: 12000, quantity: 1 },
  ];

  it('calcula el subtotal correctamente para múltiples ítems', () => {
    const subtotal = calculateSubtotal(cartItems);
    // (4500 * 2) + (12000 * 1) = 9000 + 12000 = 21000
    expect(subtotal).toBe(21000);
  });

  it('retorna 0 si el carrito está vacío', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('no acepta cantidades negativas', () => {
    const itemsConCantidadNegativa = [{ id: '1', name: 'Mouse', price: 4500, quantity: -5 }];
    expect(() => calculateSubtotal(itemsConCantidadNegativa)).toThrow('La cantidad no puede ser negativa');
  });
});
```

---

#### 3.2.4 Manejo de Datos y Privacidad — Mocks, Stubs y Fixtures

**Principio fundamental:** Los tests nunca deben tocar la base de datos de producción ni la de desarrollo compartido. Cada suite de tests maneja sus propios datos de forma aislada y los limpia al finalizar.

**Estrategia por capa:**

**Capa Unit (Jest/Vitest):**
- Se usa `jest.mock()` para reemplazar el módulo del pool de `pg` con una implementación simulada. Ningún test unitario hace conexión real a la base de datos.
- Los mocks se resetean entre cada test con `jest.resetAllMocks()` en el `afterEach`.

```typescript
// Ejemplo de mock del pool de pg en test unitario
jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));
```

**Capa Integration (Supertest):**
- Se usa una **base de datos de test aislada** para no tocar los datos de desarrollo. Las opciones en evaluación con el equipo Backend son:
  - **Schema separado en Supabase** (`novamarket_test`): misma instancia, schema aislado. Fácil de configurar, no requiere infraestructura adicional.
  - **`pg-mem`**: simula Postgres completamente en memoria, sin red. Ideal para CI rápido y sin dependencias externas.
  - **Docker local**: instancia de Postgres real en contenedor. Más fiel a producción pero requiere Docker en el entorno de CI.
- La base de datos de test se limpia antes de cada suite con `BEGIN`/`ROLLBACK` por transacción o con `TRUNCATE` en `beforeEach`/`afterEach`.
- Los **fixtures** de datos son objetos estáticos en `/tests/api/fixtures/`:

> ⚠️ **Pendiente de decisión con el equipo Backend (Laura / Florencia):** confirmar qué estrategia de aislamiento usar — Supabase schema separado, `pg-mem` o Docker local — antes de implementar los tests de integración.

```typescript
// tests/api/fixtures/users.fixture.ts
export const testUser = {
  name: 'Test User',
  email: 'test.user@novamarket.com',
  password: 'Test1234!',
  role: 'user'
};

export const adminUser = {
  name: 'Admin NovaMarket',
  email: 'admin@novamarket.com',
  password: 'Admin1234!',
  role: 'admin'
};

// IMPORTANTE: Estos fixtures son datos falsos creados para testing.
// Nunca usar datos reales del equipo.
```

**Capa E2E (Playwright):**
- Se usan **global setup/teardown** de Playwright para crear un usuario de prueba y limpiarlo al finalizar.
- Los tests E2E usan `storageState` para reutilizar sesiones autenticadas sin hacer login en cada test.

```typescript
// tests/e2e/fixtures/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('crear usuario de prueba y guardar sesión', async ({ request, page }) => {
  // Crear usuario via API
  await request.post('/api/auth/register', {
    data: { name: 'E2E Test User', email: 'e2e@novamarket.com', password: 'E2ETest1234!' }
  });

  // Login y guardar estado de sesión
  await page.goto('/login');
  await page.getByTestId('login-email').fill('e2e@novamarket.com');
  await page.getByTestId('login-password').fill('E2ETest1234!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForURL('/catalog');

  // Guardar el estado del localStorage con el JWT
  await page.context().storageState({ path: 'tests/e2e/fixtures/.auth/user.json' });
});
```

**Política de privacidad en fixtures:**
- Prohibido incluir nombres o emails reales de los integrantes del equipo en fixtures de test.
- El archivo `.auth/user.json` (que contiene el JWT de sesión) debe estar listado en `.gitignore`.
- Los fixtures de fixtures no deben contener datos de clientes reales.

---

### 3.3 Criterios de Calidad de los Tests (Anti-Flakiness)

Se establecen las siguientes reglas para prevenir tests inestables (flaky):

1. **No usar `waitForTimeout()` con tiempos fijos.** En su lugar, usar los auto-waits de Playwright (`waitForSelector`, `waitForURL`, `waitForResponse`).
2. **Usar selectores semánticos.** Preferir `getByRole()`, `getByLabel()`, `getByTestId()` sobre selectores CSS frágiles como `.btn-azul:nth-child(2)`.
3. **Agregar atributos `data-testid` en el HTML** para los elementos críticos que los tests necesitan interactuar, acordado con el equipo Frontend desde el inicio.
4. **Limpiar el estado entre tests.** Cada test debe arrancar con un estado conocido, sin depender del orden de ejecución.
5. **No hacer assertions de tiempo.** No verificar que algo tarda menos de X ms en un test E2E (esto es trabajo de los tests de performance).
6. **Quarantine de tests flaky.** Si un test falla en CI más de 2 veces seguidas sin cambio de código, se pasa a un directorio `/tests/quarantine/` y se crea un issue en Jira para investigar.

---

### 3.4 Herramientas de Gestión de Casos de Prueba (TMS)

Las siguientes herramientas fueron recomendadas por Gisele Lorena Ortiz directamente en el comentario del ticket SCRUM-9 (16/sep/26) como opciones para organizar, ejecutar y hacer seguimiento de los casos de prueba del equipo. La elección final debe acordarse en la daily con Agustina, Christian, Gisele y Marcia.

| Herramienta | Tipo | Descripción | Recomendada para NovaMarket |
|-------------|------|-------------|----------------------------|
| **TestRail** | TMS standalone | Herramienta estándar de la industria. Permite organizar casos por secciones (Auth, Catálogo, Carrito), ejecutar suites, guardar históricos de ejecuciones y generar gráficos de métricas de calidad. | ✅ Opción sólida para documentar los 55+ TCs del plan |
| **Xray** | Plugin de Jira | Extensión que se integra directamente dentro de Jira. Permite vincular cada caso de prueba a su Historia de Usuario de desarrollo para saber exactamente qué fue testeado por ticket. | ✅ Ideal si el equipo quiere todo centralizado en el Jira existente |
| **Zephyr** | Plugin de Jira | Similar a Xray, integración nativa con Jira. Permite crear ciclos de prueba y reportes de ejecución vinculados al backlog. | ✅ Alternativa a Xray con funcionalidades similares |
| **Qase.io** | TMS standalone | Opción moderna, interfaz limpia y rápida de configurar. Cuenta con plan gratuito robusto para equipos pequeños. Soporta integración con Jira y GitHub. | ✅ Opción recomendada para equipos chicos que arrancan rápido |

> ⚠️ **[PENDIENTE CONFIRMAR CON EL EQUIPO]:** La herramienta TMS no ha sido elegida al cierre de esta versión del documento. Debe definirse en la daily de la Semana 1 con Agustina, Christian y Gisele. La elección impacta directamente en cómo se documentan y vinculan los 55+ casos de prueba al backlog de Jira.

---

## 4. ROADMAP DE IMPLEMENTACIÓN — ESTRATEGIA DE 8 SEMANAS

### Resumen del Roadmap

| Semana | Sprint | Foco QA | Entregable Principal |
|--------|--------|---------|---------------------|
| 1 | Sprint 0 | Setup de entorno + análisis funcional | Estructura `/tests` creada, primer test smoke pasando en CI |
| 2 | Sprint 0/1 | Casos de prueba documentados (50+) | Planilla de Test Cases, Git Flow configurado |
| 3 | Sprint 1 | Entorno de pruebas + herramientas | Postman collection, tracker de bugs, tests de API health |
| 4 | Sprint 1 | Automatización módulo Auth | Suite de tests Auth (Unit + API + E2E) completa |
| 5 | Sprint 2 | Automatización Catálogo + CRUD Admin | Suite Catálogo/Productos (Integration + E2E) completa |
| 6 | Sprint 2 | Automatización Carrito + Checkout E2E | Suite E2E flujo de compra completa |
| 7 | Sprint 3 | Regresión completa + reportes | Regression suite completa, Postman collection exportada |
| 8 | Sprint 3 | Smoke Test en producción + cierre | Reporte ejecutivo de cierre, coverage > 80% |

---

### Semana 1 — Sprint 0: Setup del Entorno de Automatización

**Duración estimada QA:** 6 horas
**Herramientas a instalar:** Playwright, Jest, Supertest, ts-node

#### Objetivos de la Semana 1

1. **Análisis funcional completo** del brief de NovaMarket. Leer todos los documentos disponibles e identificar las funcionalidades críticas: Autenticación, Catálogo, Carrito, Checkout, Admin.
2. **Crear el mapa mental** en XMind/Miro (entregable SCRUM-9).
3. **Inicializar la estructura de carpetas de tests** en el repositorio.
4. **Instalar y configurar el stack de automatización** base.
5. **Escribir el primer test smoke** que verifique que la aplicación levanta.
6. **Configurar el pipeline CI/CD** básico en GitHub Actions.

#### Estructura de carpetas a crear

```bash
# Ejecutar desde la raíz del repositorio
mkdir -p tests/e2e/pages
mkdir -p tests/e2e/specs/auth
mkdir -p tests/e2e/specs/catalog
mkdir -p tests/e2e/specs/cart
mkdir -p tests/e2e/specs/checkout
mkdir -p tests/e2e/specs/admin
mkdir -p tests/e2e/fixtures/.auth
mkdir -p tests/api
mkdir -p tests/unit/middleware
mkdir -p tests/unit/utils
mkdir -p tests/reports
```

#### Instalación de dependencias

```bash
# Desde la raíz del proyecto backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

# Playwright (desde la raíz del proyecto o una carpeta /tests dedicada)
npm init playwright@latest tests -- --quiet --browser chromium --browser firefox --lang ts

# pg-mem para tests de integración aislados (o schema separado en Supabase — pendiente de decisión)
npm install --save-dev pg-mem
```

#### Configuración de Jest (backend)

```json
// jest.config.json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests/api", "<rootDir>/tests/unit"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/config/db.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "coverageReporters": ["html", "lcov", "text-summary"],
  "coverageDirectory": "tests/reports/coverage"
}
```

#### Entregables de la Semana 1

- [x] Mapa mental SCRUM-9 creado y subido al ticket de Jira
- [x] Estructura `/tests` creada y commiteada en `feature/qa-automation`
- [x] Playwright instalado y configurado con `playwright.config.ts`
- [x] Jest + Supertest instalados como devDependencies
- [x] Primer test smoke pasando: GET /api/health → HTTP 200 ✅
- [ ] Pipeline CI básico en `.github/workflows/ci.yml` ejecutando `npm test`
- [x] `.gitignore` actualizado con las entradas de protección de datos de test

---

### Semana 2 — Sprint 0/1: Estandarización y Documentación de Test Cases

**Duración estimada QA:** 6 horas
**Herramientas:** Google Sheets/Notion, Playwright, Git

#### Objetivos de la Semana 2

1. **Escribir los 50+ casos de prueba** en la planilla de Test Cases basándose en los wireframes de UX/UI (entrega de SCRUM-8 y SCRUM-10).
2. **Traducir los casos de prueba al formato BDD** (Given-When-Then) para los módulos críticos.
3. **Consolidar el Git Flow** con las ramas `develop`, `feature/qa-automation`, `feature/backend-*`, `feature/frontend-*`.
4. **Documentar los criterios de aceptación técnicos** para SCRUM-14.

#### Planilla de Test Cases — Estructura obligatoria

```
ID | Módulo | Caso de Prueba | Precondiciones | Pasos | Resultado Esperado | Tipo | Prioridad | Estado
```

#### Distribución de los 50+ Test Cases por módulo

| Módulo | Cantidad de TCs | Cobertura |
|--------|----------------|-----------|
| Auth (Registro + Login) | 12 | Happy path + 5 edge cases + 3 security |
| Catálogo y Productos | 10 | Listado, filtros, detalle, 404 |
| Carrito de Compras | 10 | Agregar, eliminar, cantidades, persistencia |
| Checkout | 8 | Formulario, confirmación, validaciones, carrito vacío |
| Admin CRUD | 8 | Crear/editar/eliminar producto, acceso denegado |
| API (Postman) | 7 | Health check, endpoints REST con status codes |
| **Total** | **55** | **Todos los módulos del MVP** |

#### Validación del Git Flow

```bash
# Verificar que las ramas existen y están protegidas
git branch -a | grep -E "main|develop|feature/"

# La rama feature/qa-automation debe apuntar al último commit de develop
git log --oneline feature/qa-automation -5
```

#### Entregables de la Semana 2

- [ ] Planilla con 55 Test Cases documentados y compartida con el equipo
- [ ] Criterios de Aceptación formalizados para SCRUM-14
- [ ] Ramas de Git Flow confirmadas y funcionales
- [ ] Tests BDD de Autenticación escritos en Playwright (aunque no todos pasen aún)

---

### Semana 3 — Sprint 1: Entorno de Pruebas y Herramientas

**Duración estimada QA:** 4-6 horas
**Herramientas:** Postman, Chrome DevTools, Google Sheets

#### Objetivos de la Semana 3

1. **Configurar Postman** con una colección específica para la API de NovaMarket.
2. **Configurar el Tracker de Bugs** (tabla en Jira o Google Sheets) con el formato estándar.
3. **Actualizar los Test Cases** en base a los diseños de alta fidelidad entregados por UX/UI en el handoff.
4. **Configurar la estrategia de aislamiento de tests para PostgreSQL** (`pg-mem` o schema separado en Supabase — pendiente de decisión con el equipo Backend).
5. **Ejecutar manualmente los primeros tests** del módulo de Auth contra el backend en desarrollo.

#### Configuración de la Colección Postman

Crear en Postman una colección llamada `NovaMarket API vMVP` con las siguientes carpetas y requests:

```
NovaMarket API vMVP/
├── Auth/
│   ├── POST Register (valid) → expects 201
│   ├── POST Register (duplicate email) → expects 409
│   ├── POST Register (empty body) → expects 400
│   ├── POST Login (valid) → expects 200 + token
│   ├── POST Login (wrong password) → expects 401
│   └── POST Login (user not found) → expects 401
├── Products/
│   ├── GET /api/products → expects 200 + array
│   ├── GET /api/products/:id (valid) → expects 200 + product object
│   ├── GET /api/products/:id (not found) → expects 404
│   ├── POST /api/products (admin token) → expects 201
│   ├── POST /api/products (user token) → expects 403
│   └── POST /api/products (no token) → expects 401
├── Orders/
│   ├── POST /api/orders (valid payload) → expects 201
│   ├── POST /api/orders (product not found) → expects 404
│   └── POST /api/orders (empty cart) → expects 400
└── Health/
    └── GET /api/health → expects 200 {"status":"OK"}
```

#### Formato del Tracker de Bugs (columnas)

```
BUG-ID | Módulo | Descripción | Pasos para Reproducir | Resultado Actual | Resultado Esperado | Severidad | Estado | Asignado a | Sprint
```

**Escala de severidad:**
- **Blocker (S1):** Impide completar una compra. Ej: botón "Confirmar compra" no hace nada.
- **Critical (S2):** Rompe un flujo importante pero tiene workaround. Ej: filtros de categoría no funcionan.
- **Major (S3):** Afecta funcionalidad secundaria. Ej: el subtotal no actualiza al cambiar cantidad.
- **Minor (S4):** Error cosmético o de usabilidad. Ej: la imagen de un producto se desborda del contenedor.

#### Entregables de la Semana 3

- [ ] Colección Postman `NovaMarket API vMVP` creada con todos los requests documentados
- [ ] Tracker de Bugs configurado en Jira o Google Sheets y compartido con el equipo
- [ ] Variables de entorno en Postman configuradas: `baseUrl`, `authToken`, `adminToken`
- [ ] Tests de integración de API con Supertest ejecutando contra base de datos de test aislada (pg-mem o Supabase schema separado)

---

### Semana 4 — Sprint 1: Automatización del Módulo de Autenticación

**Duración estimada QA:** 6 horas
**Herramientas:** Playwright, Supertest, DevTools

#### Objetivos de la Semana 4

1. **Ejecutar manualmente todos los Test Cases de Auth** (TC001–TC010) y documentar resultados.
2. **Automatizar los happy paths y sad paths de Auth** con Playwright E2E.
3. **Automatizar los tests de API de Auth** con Supertest (POST /register, POST /login).
4. **Ejecutar las pruebas de seguridad de Auth:** acceso a /admin sin ser admin, manipulación de JWT.
5. **Reportar todos los bugs encontrados** con formato estricto en el tracker.

#### Suite de tests a completar esta semana

**E2E con Playwright (Semana 4):**

```typescript
// Archivo: tests/e2e/specs/auth/register.spec.ts
// Tests a implementar:
// - TC001: Registro exitoso → redirige al inicio
// - TC002: Email duplicado → muestra error específico
// - TC003: Password < 6 chars → error client-side sin llamar a API
// - TC004: Campos vacíos → validación client-side
```

```typescript
// Archivo: tests/e2e/specs/auth/login.spec.ts
// Tests a implementar:
// - TC005: Login exitoso → JWT en localStorage + Navbar actualizado
// - TC006: Password incorrecta → error "Credenciales inválidas"
// - TC007: Acceso a /admin sin ser admin → redirect a /home
// - TC008: Token manipulado en localStorage → redirect a /login
// - TC010: Admin login exitoso → acceso al panel de administración
```

**API con Supertest (Semana 4):**

```typescript
// Archivo: tests/api/auth.api.test.ts
// Tests a implementar:
// - 200 Login exitoso con token en body
// - 201 Registro exitoso con userId
// - 400 Body vacío en register
// - 401 Login con credenciales incorrectas
// - 409 Email duplicado en register
// - 403 Crear producto con token de user normal
```

#### Entregables de la Semana 4

- [ ] Todos los TC001–TC010 ejecutados manualmente con resultado PASS/FAIL documentado
- [ ] Suite `register.spec.ts` automatizada (mínimo 4 tests pasando en CI)
- [ ] Suite `login.spec.ts` automatizada (mínimo 5 tests pasando en CI)
- [ ] Tests de API de Auth automatizados (mínimo 6 tests pasando en CI)
- [ ] Reporte de bugs de Autenticación entregado al equipo Backend

---

### Semana 5 — Sprint 2: Automatización del Catálogo, Productos y Admin CRUD

**Duración estimada QA:** 6 horas
**Herramientas:** Playwright, Postman, DevTools

#### Objetivos de la Semana 5

1. **Pruebas de integración Frontend-Backend del Catálogo:** verificar que los filtros del Frontend pegan a las URLs correctas del Backend.
2. **Pruebas del CRUD de Administrador:** crear, editar y eliminar productos con cuenta admin.
3. **Pruebas de seguridad de roles:** POST /api/products con token de usuario común → 403.
4. **Validar imágenes rotas:** que el Frontend muestra placeholder cuando imageUrl es null/vacío.

#### Tests a implementar esta semana

```typescript
// tests/e2e/specs/catalog/catalog-listing.spec.ts
// - Ver todos los productos: GET /api/products retorna 10+ items, todos visibles en UI
// - Filtrar por "Periféricos": solo muestra productos de esa categoría
// - Filtrar por "Gadgets": solo muestra gadgets
// - Limpiar filtro: muestra todos los productos nuevamente
// - Producto con imageUrl null: muestra imagen placeholder, no ícono de error roto

// tests/e2e/specs/catalog/product-detail.spec.ts
// - Ver detalle de producto válido: muestra nombre, precio, descripción, botón agregar
// - Navegar a /products/id-inexistente: muestra error 404 amigable

// tests/e2e/specs/admin/admin-crud.spec.ts (usa fixture de sesión admin)
// - Crear producto nuevo: aparece en el catálogo
// - Editar producto: los cambios se reflejan inmediatamente
// - Eliminar producto: desaparece del catálogo
// - Acceder a /admin con cuenta de usuario normal: redirige con error 403
```

```typescript
// tests/api/products.api.test.ts
// - GET /api/products → 200, array de productos con estructura correcta
// - GET /api/products/:id (válido) → 200, objeto producto con todos los campos
// - GET /api/products/:id (inválido) → 404, mensaje amigable
// - POST /api/products (admin) → 201, producto creado con _id
// - PUT /api/products/:id (admin) → 200, producto actualizado
// - DELETE /api/products/:id (admin) → 200 o 204, producto eliminado
// - POST /api/products (user normal) → 403 Forbidden
// - POST /api/products (sin token) → 401 Unauthorized
```

#### Entregables de la Semana 5

- [ ] Suite `catalog-listing.spec.ts` automatizada (mínimo 5 tests pasando)
- [ ] Suite `product-detail.spec.ts` automatizada (mínimo 3 tests pasando)
- [ ] Suite `admin-crud.spec.ts` automatizada (mínimo 4 tests pasando)
- [ ] Tests de API de Products automatizados (mínimo 8 tests pasando)
- [ ] Reporte de bugs de Integración (errores Frontend-Backend) entregado al equipo

---

### Semana 6 — Sprint 2: E2E Completo del Flujo de Compra

**Duración estimada QA:** 6 horas
**Herramientas:** Playwright, Postman, DevTools

#### Objetivos de la Semana 6

1. **Ejecutar el flujo E2E completo de compra:** Login → Catálogo → Detalle → Carrito → Checkout → Confirmación.
2. **Pruebas de persistencia del carrito:** recargar página con productos en el carrito y verificar que persisten.
3. **Pruebas de matemática del carrito:** verificar que el subtotal y total son exactos.
4. **Edge cases del checkout:** carrito vacío en /checkout, campos obligatorios vacíos en formulario.
5. **Prueba de API:** POST /api/orders con producto inexistente → error claro.

#### Tests a implementar esta semana

```typescript
// tests/e2e/specs/cart/cart-operations.spec.ts
// - Agregar producto al carrito en 2 clics: ver subtotal actualizado
// - Agregar el mismo producto dos veces: quantity se incrementa, no duplica
// - Eliminar producto del carrito: subtotal se actualiza correctamente
// - Carrito vacío: muestra mensaje "Tu carrito está vacío" con CTA al catálogo
// - Persistencia: agregar 2 productos, recargar F5, verificar que siguen en el carrito
// - Cantidad negativa: no debe ser posible ingresar -5 en el input de cantidad
// - Subtotal matemático: 2 productos × precios conocidos = total exacto

// tests/e2e/specs/checkout/checkout-flow.spec.ts
// - Camino feliz: flujo completo Login → Catálogo → Carrito → Checkout → Confirmación
// - La confirmación muestra un número de orden único
// - Checkout con carrito vacío: redirect al catálogo con mensaje
// - Checkout con campos de envío vacíos: muestra validaciones por campo
// - POST /api/orders desde Postman con producto inexistente → 404 con mensaje claro
```

```typescript
// tests/api/orders.api.test.ts
// - POST /api/orders (payload válido) → 201, número de orden en body
// - POST /api/orders (producto no existe) → 404
// - POST /api/orders (carrito vacío []) → 400
// - POST /api/orders (sin token) → 401
```

#### Entregables de la Semana 6

- [ ] Flujo E2E completo automatizado y pasando en CI: Login → Confirmación de orden
- [ ] Suite `cart-operations.spec.ts` con 7 tests automatizados pasando
- [ ] Suite `checkout-flow.spec.ts` con 5 tests automatizados pasando
- [ ] Tests de API de Orders automatizados (mínimo 4 tests pasando)
- [ ] Reporte de Bugs Críticos priorizados (Blockers y Criticals) entregado al PM

---

### Semana 7 — Sprint 3: Pruebas de Regresión Completas

**Duración estimada QA:** 8 horas
**Herramientas:** Playwright, Postman, DevTools

#### Objetivos de la Semana 7

1. **Ejecutar TODOS los test cases** de las semanas 4, 5 y 6 en el entorno que se acerca a producción.
2. **Documentar resultado PASS/FAIL** para cada test case.
3. **Reportar regresiones:** funcionalidades que antes pasaban y ahora fallan.
4. **Exportar la Colección de Postman** como `novamarket-api.postman_collection.json`.
5. **Generar el Reporte Ejecutivo** de QA para el PM.

#### Regression Checklist

```
MÓDULO AUTH
[ ] TC001 - Registro exitoso                          [PASS/FAIL]
[ ] TC002 - Email duplicado                           [PASS/FAIL]
[ ] TC003 - Password < 6 chars                        [PASS/FAIL]
[ ] TC004 - Campos vacíos                             [PASS/FAIL]
[ ] TC005 - Login exitoso                             [PASS/FAIL]
[ ] TC006 - Password incorrecta                       [PASS/FAIL]
[ ] TC007 - Acceso /admin sin admin                   [PASS/FAIL]
[ ] TC008 - Token manipulado                          [PASS/FAIL]
[ ] TC009 - API POST register body vacío              [PASS/FAIL]
[ ] TC010 - Admin login exitoso                       [PASS/FAIL]

MÓDULO CATÁLOGO
[ ] TC011 - Ver todos los productos                   [PASS/FAIL]
[ ] TC012 - Filtrar por Periféricos                   [PASS/FAIL]
[ ] TC013 - Filtrar por Gadgets                       [PASS/FAIL]
[ ] TC014 - Filtrar por Accesorios                    [PASS/FAIL]
[ ] TC015 - Limpiar filtro                            [PASS/FAIL]
[ ] TC016 - Ver detalle de producto válido            [PASS/FAIL]
[ ] TC017 - Producto no encontrado /404               [PASS/FAIL]
[ ] TC018 - Imagen rota → placeholder visible         [PASS/FAIL]
[ ] TC019 - GET /api/products → 200 + array           [PASS/FAIL]
[ ] TC020 - GET /api/products/:id válido → 200        [PASS/FAIL]
[ ] TC021b - Búsqueda por texto libre — ⛔ EXCLUIDA DEL MVP v1.0
[ ] TC022b - Comparar productos       — ⛔ EXCLUIDA DEL MVP v1.0
[ ] TC023b - Evaluar alternativas en detalle — ⛔ EXCLUIDA DEL MVP v1.0

MÓDULO CARRITO
[ ] TC021 - Agregar producto en 2 clics               [PASS/FAIL]
[ ] TC022 - Subtotal actualizado                      [PASS/FAIL]
[ ] TC023 - Eliminar producto del carrito             [PASS/FAIL]
[ ] TC024 - Carrito vacío muestra mensaje             [PASS/FAIL]
[ ] TC025 - Persistencia tras recarga F5              [PASS/FAIL]
[ ] TC026 - Cantidad negativa no permitida            [PASS/FAIL]
[ ] TC027 - Cálculo matemático exacto                 [PASS/FAIL]

MÓDULO CHECKOUT
[ ] TC028 - Flujo completo E2E happy path             [PASS/FAIL]
[ ] TC029 - Número de orden generado                  [PASS/FAIL]
[ ] TC030 - Checkout con carrito vacío → redirect     [PASS/FAIL]
[ ] TC031 - Campos obligatorios vacíos → validación   [PASS/FAIL]
[ ] TC032 - POST /api/orders producto inexistente     [PASS/FAIL]
[ ] TC032b - Finalizar post-confirmación               [PASS/FAIL]
[ ] TC032c - Continuar comprando → No → Checkout       [PASS/FAIL]

MÓDULO ADMIN CRUD
[ ] TC033 - Crear producto nuevo                      [PASS/FAIL]
[ ] TC034 - Editar producto existente                 [PASS/FAIL]
[ ] TC035 - Eliminar producto                         [PASS/FAIL]
[ ] TC036 - Acceso como usuario normal → 403          [PASS/FAIL]
[ ] TC037 - POST /api/products sin token → 401        [PASS/FAIL]
[ ] TC038 - POST /api/products user normal → 403      [PASS/FAIL]
[ ] TC039 - Admin ver listado de pedidos               [PASS/FAIL]
[ ] TC040 - Admin ver detalle de un pedido             [PASS/FAIL]
```

#### Reporte Ejecutivo — Formato estándar

```markdown
## Reporte Ejecutivo QA — NovaMarket MVP
**Semana:** 7 | **Fecha:** [fecha]
**Total de casos ejecutados:** 38
**PASS:** [número]
**FAIL:** [número]
**Bloqueadores activos:** [número]
**Bugs pendientes de resolución:** [número]

### Bugs críticos abiertos
| BUG-ID | Módulo | Descripción | Severidad | Impacto en Venta |
|--------|--------|-------------|-----------|-----------------|
| [ID] | [módulo] | [descripción] | Blocker | Sí/No |

### Decisión de go/no-go para producción
[ ] GO: todos los Blockers resueltos
[ ] NO-GO: [motivo + bugs pendientes]
```

#### Entregables de la Semana 7

- [ ] Regression Checklist completa (38 TCs ejecutados y documentados)
- [ ] Colección Postman exportada: `docs/novamarket-api.postman_collection.json`
- [ ] Reporte Ejecutivo de Bugs entregado al PM (Florencia Sombra + Gisele Ortiz)
- [ ] Pipeline CI pasando con el 100% de los tests automatizados en verde

---

### Semana 8 — Sprint 3: Smoke Test en Producción + Cierre

**Duración estimada QA:** 6 horas
**Herramientas:** Entorno de producción (URL pública), Postman, DevTools

#### Objetivos de la Semana 8

1. **Ejecutar los 10 test cases más críticos directamente en la URL de producción** (Vercel/Netlify, Render).
2. **Preparar el Reporte de Cierre del Proyecto** para la Retrospectiva.
3. **Calcular las métricas finales de cobertura** (coverage report de Jest).
4. **Documentar los bugs de baja prioridad** que quedan abiertos con su justificación.

#### Smoke Test en Producción — Top 10 Critical

```
SMOKE TEST — PRODUCCIÓN
URL de producción: https://[dominio-produccion].vercel.app

[ ] ST001 - La Home carga en menos de 5 segundos y sin errores en consola
[ ] ST002 - Registro de usuario nuevo en producción → 201
[ ] ST003 - Login con usuario registrado → JWT válido
[ ] ST004 - Catálogo muestra 10+ productos con imágenes cargadas
[ ] ST005 - Filtro por categoría funciona correctamente
[ ] ST006 - Agregar producto al carrito → subtotal visible
[ ] ST007 - Flujo completo de checkout → número de orden generado
[ ] ST008 - Login como admin → panel de administración accesible
[ ] ST009 - Crear nuevo producto desde el admin panel → visible en catálogo
[ ] ST010 - Acceso /admin sin token → redirect a /login

RESULTADO FINAL: [PASS] / [NO-GO — Motivo: ____]
```

#### Reporte de Cierre del Proyecto

```markdown
## Reporte Ejecutivo de Cierre QA — NovaMarket MVP
**Fecha de cierre:** [Semana 8]
**Versión del producto:** MVP v1.0

### Resumen Ejecutivo
El MVP de NovaMarket [cumple / no cumple] los criterios de aceptación
definidos en el Test Plan oficial (docs/TEST_PLAN.md).

### Métricas Finales
| Métrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Total de casos de prueba documentados | [número] | 55+ | [PASS/FAIL] |
| Casos ejecutados en regresión | [número] | 38 | [PASS/FAIL] |
| Casos PASS | [número] | 100% | [%] |
| Bugs totales encontrados | [número] | — | — |
| Bugs Blockers resueltos | [número] | 100% | [PASS/FAIL] |
| Bugs pendientes (aceptables) | [número] | 0 Blockers | [PASS/FAIL] |
| Cobertura de código (Jest) | [%] | > 80% | [PASS/FAIL] |
| Smoke Test en Producción | [PASS/FAIL] | PASS | [PASS/FAIL] |

### Bugs Pendientes Aceptables (no bloquean la venta)
| BUG-ID | Descripción | Severidad | Justificación |
|--------|-------------|-----------|---------------|
| [ID] | [descripción] | Minor/Low | No bloquea el flujo de compra |

### Decisión Final
[x] **GO TO PRODUCTION** — El MVP cumple todos los criterios de aceptación críticos.
[ ] **NO-GO** — Existen bloqueadores sin resolver: [lista]
```

#### Entregables de la Semana 8

- [ ] Smoke Test en producción ejecutado y documentado (10 casos PASS/FAIL)
- [ ] Reporte de Cierre del Proyecto preparado para la Retrospectiva
- [ ] Coverage report de Jest generado: `tests/reports/coverage/index.html`
- [ ] Colección de Postman final actualizada con URLs de producción
- [ ] Todos los archivos de reporte excluidos del repositorio Git (en .gitignore)

---

## 5. ESTRATEGIA CI/CD Y GOBERNANZA DEL CÓDIGO

### 5.1 Pipeline de GitHub Actions

El pipeline se configura en `.github/workflows/ci.yml` y se ejecuta automáticamente en cada Pull Request hacia la rama `develop`, así como en cada push directo a `develop`.

#### Archivo completo del Pipeline CI

```yaml
# .github/workflows/ci.yml
name: NovaMarket QA — CI Pipeline

on:
  push:
    branches:
      - develop
  pull_request:
    branches:
      - develop
    types: [opened, synchronize, reopened]

env:
  NODE_VERSION: '20.x'
  CI: true

jobs:
  # ─────────────────────────────────────────────
  # JOB 1: Linting y verificación de código
  # ─────────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar ESLint
        run: npm run lint

      - name: Verificar tipos TypeScript
        run: npm run type-check

  # ─────────────────────────────────────────────
  # JOB 2: Tests Unitarios y de API (Jest + Supertest)
  # ─────────────────────────────────────────────
  unit-and-api-tests:
    name: Unit & API Tests (Jest)
    runs-on: ubuntu-latest
    needs: lint

    # Nota: el service de base de datos se define aquí cuando se confirme
    # la estrategia de aislamiento (pg-mem no requiere service externo;
    # Supabase schema separado usa la DATABASE_URL del secret de CI).
    # ⚠️ Pendiente de decisión con el equipo Backend antes de activar este job.

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar tests unitarios y de API con cobertura
        run: npm run test:coverage
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
          NODE_ENV: test
          PORT: 3001

      - name: Verificar umbral de cobertura (> 80%)
        run: npm run test:coverage -- --coverageThreshold='{"global":{"lines":80}}'

      - name: Subir reporte de cobertura como artefacto
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: tests/reports/coverage/
          retention-days: 7

  # ─────────────────────────────────────────────
  # JOB 3: Tests E2E con Playwright
  # ─────────────────────────────────────────────
  e2e-tests:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: unit-and-api-tests

    # Service de base de datos pendiente de definir según estrategia de aislamiento acordada con Backend.

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Instalar dependencias del backend
        run: npm ci

      - name: Instalar dependencias del frontend
        run: npm ci
        working-directory: client

      - name: Instalar browsers de Playwright
        run: npx playwright install --with-deps chromium firefox

      - name: Sembrar base de datos de test con fixtures
        run: npm run db:seed:test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
          NODE_ENV: test

      - name: Ejecutar tests E2E de Playwright
        run: npx playwright test
        env:
          BASE_URL: http://localhost:5173
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
          NODE_ENV: test

      - name: Subir Playwright Report como artefacto
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/reports/playwright-report/
          retention-days: 7

      - name: Subir trazas de tests fallidos
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 3

  # ─────────────────────────────────────────────
  # JOB 4: Notificación de resultado del pipeline
  # ─────────────────────────────────────────────
  notify:
    name: Notificar resultado del pipeline
    runs-on: ubuntu-latest
    needs: [lint, unit-and-api-tests, e2e-tests]
    if: always()
    steps:
      - name: Comentar resultado en el PR
        uses: actions/github-script@v7
        with:
          script: |
            const jobs = context.payload.workflow_run || {};
            const status = '${{ needs.e2e-tests.result }}';
            const emoji = status === 'success' ? '✅' : '❌';
            const body = `## ${emoji} NovaMarket QA Pipeline — ${status.toUpperCase()}
            
            | Job | Estado |
            |-----|--------|
            | Lint & Type Check | ${{ needs.lint.result }} |
            | Unit & API Tests | ${{ needs.unit-and-api-tests.result }} |
            | E2E Tests | ${{ needs.e2e-tests.result }} |
            
            Los reportes están disponibles como artefactos en este workflow run.
            `;
            if (context.payload.pull_request) {
              github.rest.issues.createComment({
                issue_number: context.payload.pull_request.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
            }
```

---

### 5.2 Estrategia de Reportes

#### Playwright Report (HTML nativo)

Playwright genera automáticamente un reporte HTML completo al finalizar cada ejecución. El reporte incluye:
- Resumen de tests PASS/FAIL con tiempo de ejecución
- Screenshots automáticos de los tests que fallan
- Videos de los tests que fallan (configurado con `video: 'retain-on-failure'`)
- Trazas completas (red, console, screenshots paso a paso) para debugging

**Cómo visualizar el reporte localmente:**

```bash
# Después de ejecutar los tests
npx playwright show-report tests/reports/playwright-report
```

**En CI:** El reporte se sube como artefacto de GitHub Actions y se puede descargar desde la pestaña "Artifacts" del workflow run.

#### Jest Coverage Report (HTML)

```bash
# Generar reporte de cobertura
npm run test:coverage

# Abrir el reporte en el navegador
open tests/reports/coverage/index.html
# o en Linux:
xdg-open tests/reports/coverage/index.html
```

El reporte muestra:
- Porcentaje de cobertura por archivo (líneas, branches, funciones, statements)
- Visualización de las líneas cubiertas (verde) y no cubiertas (rojo)
- Historial de cobertura si se integra con Codecov

#### Scripts de npm para QA

```json
// package.json — scripts de testing
{
  "scripts": {
    "test": "jest --testPathPattern='tests/(unit|api)'",
    "test:watch": "jest --watch --testPathPattern='tests/(unit|api)'",
    "test:coverage": "jest --coverage --testPathPattern='tests/(unit|api)'",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report tests/reports/playwright-report",
    "test:all": "npm run test && npm run test:e2e",
    "lint": "eslint src/ tests/ --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "db:seed:test": "ts-node scripts/seed.test.ts"
  }
}
```

---

### 5.3 Política de Privacidad y Zero-Trace

Esta política es de cumplimiento obligatorio para todos los integrantes del equipo. Su objetivo es garantizar que ningún dato sensible, credencial o insumo confidencial quede registrado en el historial público de Git.

#### Entradas obligatorias en `.gitignore`

```gitignore
# ─── Variables de entorno y secretos ───────────────────────────────────────
.env
.env.local
.env.development
.env.production
.env.test
.env.*.local
*.pem
*.key
*.cert

# ─── Sesiones y tokens de autenticación de tests ───────────────────────────
tests/e2e/fixtures/.auth/
tests/e2e/fixtures/*.json
.auth/

# ─── Reportes temporales de pruebas (no son código fuente) ─────────────────
tests/reports/
test-results/
playwright-report/
coverage/
*.lcov

# ─── Artefactos de Playwright ───────────────────────────────────────────────
/test-results/
/playwright/.cache/

# ─── Dependencias ──────────────────────────────────────────────────────────
node_modules/
client/node_modules/

# ─── Insumos de negocio confidenciales ─────────────────────────────────────
docs/*.csv
docs/*.xlsx
docs/*.pdf
# NOTA: Los archivos de negocio (Jira.csv, NovaMarket.xlsx, PDFs del brief)
# no deben estar en el repositorio público. Se gestionan por Drive compartido.

# ─── Logs del sistema ──────────────────────────────────────────────────────
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ─── Archivos de sistema operativo ─────────────────────────────────────────
.DS_Store
Thumbs.db
```

#### Reglas de gobernanza del código QA

**Regla 1 — Nunca hardcodear credenciales:**
Ningún archivo de test puede contener contraseñas, tokens JWT, connection strings o API keys directamente en el código. Deben ser leídas de `process.env` o de fixtures que estén en `.gitignore`.

```typescript
// ❌ PROHIBIDO
const response = await request(app)
  .post('/api/auth/login')
  .send({ email: 'real.teammate@gmail.com', password: 'MiPasswordReal123' });

// ✅ CORRECTO
const response = await request(app)
  .post('/api/auth/login')
  .send({ email: testUser.email, password: testUser.password }); // fixture desde fixtures/users.ts
```

**Regla 2 — Variables de entorno en GitHub Secrets:**
Los valores sensibles usados en CI (JWT_SECRET, DATABASE_URL de producción) se configuran exclusivamente como GitHub Secrets, nunca en el archivo `.yml` del workflow.

```yaml
# ❌ PROHIBIDO en el .yml
JWT_SECRET: "mi-secreto-super-seguro-123"

# ✅ CORRECTO
JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
```

**Regla 3 — Los reportes no se comitean:**
Los reportes HTML de Playwright y los coverage reports de Jest son artefactos temporales. Se suben a GitHub Actions Artifacts automáticamente, pero nunca se comitean al repositorio.

**Regla 4 — Los insumos del proyecto no van al repo:**
Los archivos `Jira.csv`, `NovaMarket.xlsx` y los PDFs del brief contienen información de negocio confidencial. Se gestionan en el Google Drive compartido del equipo, no en el repositorio de GitHub.

**Regla 5 — Revisión de seguridad antes de cada PR:**
Antes de crear un Pull Request hacia `develop`, verificar con el siguiente comando que no hay archivos sensibles staged:

```bash
# Verificar que .env no está staged
git status | grep ".env"

# Verificar que no hay credenciales hardcodeadas en los archivos modificados
git diff --cached | grep -i "password\|secret\|token\|api_key" | grep -v "process.env\|secrets\." | grep "+"
# Si el comando anterior devuelve resultados, revisar antes de commitear.
```

**Regla 6 — Pre-commit hook (recomendado):**
Instalar `husky` para ejecutar verificaciones automáticas antes de cada commit:

```bash
npm install --save-dev husky lint-staged
npx husky init

# .husky/pre-commit
#!/bin/sh
npx lint-staged
npm run type-check
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    ".env*": ["echo 'ERROR: Intentando commitear un archivo .env' && exit 1"]
  }
}
```

---

### 5.4 Definición de Listo (Definition of Done) para QA

Una historia de usuario o tarea se considera **Done** desde la perspectiva de QA cuando:

1. **Todos los Test Cases asociados** al ticket de Jira han sido ejecutados.
2. **No existen bugs Blocker o Critical** abiertos relacionados con la historia.
3. **Los tests automatizados** (Unit + API + E2E según aplique) están escritos y pasando en CI.
4. **El pipeline de GitHub Actions** pasa en verde para el PR correspondiente.
5. **El reporte de cobertura** no baja del 80% en los módulos afectados.
6. **Los bugs de baja prioridad** encontrados están documentados en el tracker con su severidad y justificación.
7. **El código del test** fue revisado por el otro QA (peer review) antes de mergear.

---

### 5.5 Contactos y Escalamiento

| Rol | Nombre | Responsabilidad QA |
|-----|--------|--------------------|
| **QA Tester** | Agustina Fernandez Maidana | Estrategia de testing, tests E2E, escalamiento de bugs críticos |
| **QA Tester** | Christian Rodrigo Santibáñez Martínez | Automatización, tests de API, pipeline CI/CD, cobertura de código |
| **PM** | Marcia Torre | Aprobación de go/no-go, priorización de bugs con el equipo de desarrollo |
| **PM** | Gisele Lorena Ortiz | Gestión del backlog en Jira, coordinación de handoffs entre roles |
| **Backend** | Laura Cuenca | Resolución de bugs de API y backend, revisión de tests de Supertest |
| **Backend** | ~~Florencia Alicia Sombra~~ | ⚠️ Salió del proyecto el 22/sep/2026. Escalamiento backend ahora va a Laura Cuenca y Christian. |
| **Frontend** | Christian Santibáñez | Desarrollo y bugs de UI desde el 23/sep/2026 (tomó el rol de Emilia Orioni). |
| **Frontend** | Gastón Paniagua | Frontend Sprint 2 — SCRUM-22, 26, 28, 29. |

**Cómo escalar un bug según su severidad:**

- **Minor/Major:** Se reporta en el tracker de Jira, se asigna al desarrollador correspondiente y se resuelve dentro del sprint en curso.
- **Critical:** Se notifica en el canal de Discord/Slack del equipo además de crear el ticket en Jira con prioridad Alta. El desarrollador asignado debe confirmar que lo recibió dentro de las 24 horas.
- **Blocker:** Notificación inmediata a Florencia Sombra (PM), al desarrollador responsable y en el canal general del equipo. Ningún PR relacionado con esa funcionalidad puede mergearse hasta que el bug esté resuelto.

---

*TEST_PLAN.md v1.1.0 — NovaMarket PYME · Sprint 0 + Sprint 2 · Septiembre 2026*

# Guía 05 — Organización de Colecciones y Collection Runner

> **Objetivo de esta guía**
> Organizar todos los requests de NovaMarket en una colección estructurada por carpetas, y ejecutar toda la suite de una sola vez usando el Collection Runner de Postman.

---

## 1. Estructura de la Colección

En Postman, una **Colección** agrupa requests relacionados. Dentro de la colección, las **Carpetas** organizan los requests por dominio funcional.

La colección de NovaMarket se organiza así:

```
📁 NovaMarket QA — API Tests
  │
  ├── 📂 00. Setup
  │     └── GET  Health Check
  │
  ├── 📂 01. Auth
  │     ├── POST  Register — Happy Path
  │     ├── POST  Register — Email duplicado
  │     ├── POST  Register — Password corta
  │     ├── POST  Register — Nombre con espacios (BR01)
  │     ├── POST  Login — Happy Path
  │     ├── POST  Login — Credenciales incorrectas
  │     ├── GET   Me — Con token válido
  │     ├── GET   Me — Sin token (401)
  │     ├── POST  Forgot Password — Email registrado (BR18)
  │     └── POST  Reset Password — Token inválido (BR18)
  │
  ├── 📂 02. Catálogo
  │     ├── GET   Listar productos — Sin filtros
  │     ├── GET   Listar productos — Filtro por categoría
  │     ├── GET   Listar productos — Filtro de precio
  │     ├── GET   Producto por ID — Existente
  │     ├── GET   Producto por ID — Inexistente (404)
  │     └── GET   Producto por ID — ID no numérico (400)
  │
  ├── 📂 03. Checkout
  │     ├── POST  Validate Coupon — NOVA20 válido
  │     ├── POST  Validate Coupon — Cupón inválido (404)
  │     ├── POST  Crear pedido — Tarjeta happy path
  │     ├── POST  Crear pedido — Transferencia (BR13 IVA)
  │     ├── POST  Crear pedido — Billetera + cupón
  │     ├── POST  Crear pedido — Sin autenticación (401)
  │     ├── POST  Crear pedido — Stock insuficiente (409)
  │     ├── POST  Crear pedido — Items vacíos (400)
  │     └── POST  Crear pedido — CVV inválido (400)
  │
  ├── 📂 04. Mis Pedidos
  │     ├── GET   Listar mis pedidos (BR11)
  │     ├── GET   Detalle pedido — ID válido
  │     └── GET   Detalle pedido — ID inexistente (404)
  │
  └── 📂 05. Admin
        ├── GET   Todos los pedidos (BR08)
        ├── PATCH Cambiar estado pedido
        ├── GET   Categorías (BR17)
        ├── GET   Todos los productos
        ├── POST  Crear producto
        ├── PUT   Actualizar producto
        ├── DELETE Eliminar producto
        ├── GET   Listar cupones
        ├── POST  Crear cupón
        └── DELETE Eliminar cupón
```

---

## 2. Cómo crear la Colección en Postman

### 2.1 Crear la colección

1. En el sidebar izquierdo → click en **"Collections"**
2. Click en el botón **"+"** o en **"New Collection"**
3. Nombre: `NovaMarket QA — API Tests`
4. En la pestaña **"Variables"** de la colección, podés agregar variables de colección (opcionales):

| Variable | Value |
|----------|-------|
| `apiVersion` | `api` |

### 2.2 Crear las carpetas

Dentro de la colección:
1. Click derecho → **"Add Folder"**
2. Nombrar cada carpeta como se muestra en la estructura de arriba

### 2.3 Agregar el Pre-request Script a nivel colección

En la colección → pestaña **"Pre-request Script"** → este script se ejecuta **antes de cada request** de toda la colección:

```javascript
// Verificar que hay un environment seleccionado
if (!pm.environment.name) {
    console.warn("⚠️ No hay environment seleccionado. Seleccioná 'NovaMarket — Local' o 'NovaMarket — Producción'.");
}

// Log del request actual para debugging
console.log(`[${new Date().toLocaleTimeString()}] ${pm.request.method} ${pm.request.url}`);
```

---

## 3. Orden de ejecución y dependencias

La clave para que el Collection Runner funcione correctamente es que los requests estén en el orden correcto — los de autenticación primero, para que el token esté disponible para los demás.

### Carpeta 00. Setup

**GET `/api/health`**

```javascript
// Tests
pm.test("Servidor responde correctamente", function () {
    pm.response.to.have.status(200);
});
pm.test("Tiempo de respuesta aceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

---

### Carpeta 01. Auth — Primer request: Register

Este request debe ir primero porque crea el usuario que van a usar todos los demás tests.

**Pre-request Script:**
```javascript
// Generar credenciales únicas para esta ejecución
const ts = Date.now();
pm.environment.set("testEmail",    `qa.${ts}@novamarket.test`);
pm.environment.set("testName",     `QA Runner ${ts}`);
pm.environment.set("testPassword", "AutoTest123!");
```

**Tests:**
```javascript
pm.test("Register — Status 201", function () {
    pm.response.to.have.status(201);
});

// Guardar token para los requests siguientes
const res = pm.response.json();
if (res.token) {
    pm.environment.set("authToken", res.token);
    pm.environment.set("userId",    res.user.id);
}
```

---

## 4. Usar el Collection Runner

### 4.1 Abrir el Runner

1. En la colección → click en el botón **"▶ Run"** (arriba a la derecha)
2. O en el sidebar: click derecho en la colección → **"Run collection"**

### 4.2 Configurar la ejecución

Se abre el panel del Runner con estas opciones:

| Opción | Qué hace | Configuración recomendada |
|--------|----------|--------------------------|
| **Environment** | El entorno a usar | `NovaMarket — Local` o `NovaMarket — Producción` |
| **Iterations** | Cuántas veces corre toda la suite | `1` para smoke test, `3` para stress básico |
| **Delay** | Tiempo entre requests (ms) | `300` para producción (evita rate limiting) |
| **Save responses** | Guarda el body de cada response | Activar para debugging |
| **Run order** | Orden de ejecución | Dejar el orden por defecto (el que configuraste en las carpetas) |

### 4.3 Ejecutar

Click en **"Run NovaMarket QA — API Tests"** → Postman ejecuta todos los requests en orden.

---

## 5. Interpretar el reporte de resultados

### Panel de resultados en tiempo real

Durante la ejecución, el panel muestra cada test con su estado:

```
✅ Health Check — Servidor responde correctamente
✅ Health Check — Tiempo de respuesta aceptable

✅ Register — Status 201
✅ Register — Response tiene message, user y token
✅ Register — user.role es 'customer'

✅ Login — Status 200 OK
✅ Login — token es un JWT válido

❌ Me — GET /api/auth/me
   AssertionError: expected 401 to equal 200
   (Causa probable: authToken no fue guardado correctamente)
```

### Resumen final

Al terminar, Postman muestra:
- **Total tests:** cantidad de aserciones ejecutadas
- **Passed:** tests que pasaron ✅
- **Failed:** tests que fallaron ❌

### Cómo interpretar los fallos

| Tipo de fallo | Causa probable | Cómo investigar |
|--------------|----------------|-----------------|
| `401 Unauthorized` en requests que requieren auth | El token no se guardó en el step anterior | Verificar que el test de login tiene `pm.environment.set("authToken", ...)` |
| `404 Not Found` con ID de recurso | El recurso (producto, pedido) no existe en el entorno | Verificar que el ID guardado en `productId` u `orderId` es válido |
| `AssertionError: expected X to equal Y` | El schema de la respuesta cambió | Revisar si el backend fue modificado — actualizar el schema del test |
| Todos los tests fallan desde el medio | El servidor en Render se reinició | Agregar delay de 500ms y correr de nuevo |
| `Error: authToken no encontrado` | Pre-request Script bloqueó la ejecución | Correr primero el request de login manualmente |

---

## 6. Exportar e importar la colección

### Exportar para compartir con el equipo (ej: Christian)

1. Click derecho en la colección → **"Export"**
2. Elegir formato **Collection v2.1** (el más compatible)
3. Guardar como `novamarket-qa-collection.json`
4. Agregar al repositorio en `docs/qa-guides/postman/`

### Importar

1. En Postman → click en **"Import"**
2. Arrastrar el archivo `.json` o buscarlo
3. Seleccionar el environment correspondiente

> **Tip:** también podés compartir la colección via link de Postman. En la colección → click en los tres puntos `...` → **"Share"** → copiar el link público.

---

## 7. Checklist de release — Cómo usar la suite antes de cada deploy

Antes de hacer merge a `main` o deploy a producción, corré esta suite como smoke test:

```
☐ 1. Seleccionar environment "NovaMarket — Producción"
☐ 2. Asegurarse de que adminToken está configurado
☐ 3. Abrir Collection Runner → configurar Delay: 300ms
☐ 4. Ejecutar la colección completa
☐ 5. Verificar que el resultado es 0 fallos
☐ 6. Si hay fallos → reportar como bug antes de aprobar el PR
☐ 7. Guardar captura del reporte como evidencia en el ticket de Jira
```

---

## 8. Próximos pasos sugeridos

Una vez que tengas la colección corriendo sin errores, podés escalar a:

1. **Newman** — ejecutar la colección desde la línea de comandos:
   ```bash
   npx newman run novamarket-qa-collection.json \
     --environment novamarket-produccion.json \
     --reporters cli,json \
     --reporter-json-export resultados.json
   ```

2. **Integración con CI/CD** — agregar Newman al pipeline de GitHub Actions para que la suite de Postman corra automáticamente en cada PR (junto con Jest y Playwright).

3. **Variables de datos (Data Files)** — usar archivos CSV o JSON para correr los mismos tests con múltiples conjuntos de datos en una sola ejecución (ej: probar 10 cupones diferentes en una sola corrida del Runner).

---

**Guía anterior:** [04 — Regresión Automática sobre Bugs BR](./04-regresion-automatica-bugs-br.md)

---

> Estas guías fueron creadas por Christian Santibáñez (QA/Frontend) para el equipo de NovaMarket PYME.
> Cualquier pregunta o corrección, contactar por Discord en #testing o #frontend.

# Guía 02 — Variables de Entorno y Pre-request Scripts

> **Objetivo de esta guía**
> Aprender a configurar Postman para trabajar con múltiples entornos (local, producción) y a generar datos dinámicos automáticamente, para que tus pruebas no fallen por emails duplicados o datos hardcodeados.

---

## 1. ¿Por qué usar Variables?

Imaginá que estás probando el registro con el email `agustina@test.com`. La primera vez funciona. La segunda vez, el backend devuelve `409 "Ya existe una cuenta con ese email."` porque el email ya está registrado.

Sin variables, tendrías que cambiar el email a mano cada vez. Con variables y datos dinámicos, Postman genera un email único automáticamente en cada ejecución.

Otro escenario: tenés 20 requests que usan la URL base `https://novamarket-api-ikcm.onrender.com`. Si el día de mañana cambia el dominio, tendrías que actualizar las 20. Con una variable `{{baseUrl}}`, cambiás en un solo lugar.

---

## 2. Environments en Postman

### 2.1 Crear el Environment

1. En Postman, click en el ícono de engranaje ⚙️ arriba a la derecha (o en "Environments" en el sidebar izquierdo)
2. Click en **"Add"** → ponerle nombre `NovaMarket — Local`
3. Repetir para `NovaMarket — Producción`

### 2.2 Variables a configurar

**Environment: `NovaMarket — Local`**

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `authToken` | *(vacío)* | *(se llena automáticamente al hacer login)* |
| `adminToken` | *(vacío)* | *(se llena automáticamente al hacer login como admin)* |
| `productId` | `1` | `1` |
| `orderId` | *(vacío)* | *(se llena al crear un pedido)* |

**Environment: `NovaMarket — Producción`**

| Variable | Initial Value |
|----------|---------------|
| `baseUrl` | `https://novamarket-api-ikcm.onrender.com` |
| `authToken` | *(vacío)* |
| `adminToken` | *(vacío)* |
| `productId` | `1` |
| `orderId` | *(vacío)* |

### 2.3 Usar las variables en los requests

En la URL del request, escribís:
```
{{baseUrl}}/api/auth/login
```

En los Headers:
```
Authorization: Bearer {{authToken}}
```

En el Body:
```json
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

> **Tip:** las variables entre `{{ }}` se resuelven automáticamente con el valor del environment activo. Si el environment no está seleccionado, Postman te lo muestra en rojo.

---

## 3. Pre-request Scripts

La pestaña **"Pre-request Script"** ejecuta código JavaScript **antes** de enviar el request. Es perfecta para:
- Generar datos únicos (emails, nombres) en cada ejecución
- Calcular valores que dependen del tiempo (`Date.now()`)
- Preparar datos que se usan en el body del request

### 3.1 Generar un email único para registro

El problema de los tests de registro es que el mismo email solo funciona una vez. La solución es generar un email diferente en cada ejecución.

**Tab "Pre-request Script" del request `POST /api/auth/register`:**

```javascript
// Genera un email único usando timestamp: agustina.1728504000000@qa.novamarket.com
const timestamp = Date.now();
const testEmail = `agustina.${timestamp}@qa.novamarket.com`;
const testName  = `QA Tester ${timestamp}`;

// Guardar en variables de entorno para usarlos en el body y en tests posteriores
pm.environment.set("testEmail",    testEmail);
pm.environment.set("testName",     testName);
pm.environment.set("testPassword", "TestPass123!");

console.log("Email generado:", testEmail);
```

**Body del request (usa las variables que se acaban de crear):**
```json
{
  "name":     "{{testName}}",
  "email":    "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

---

### 3.2 Generar datos de tarjeta para checkout

```javascript
// Genera datos de tarjeta de prueba realistas
const testCards = [
  { number: "4111 1111 1111 1111", brand: "Visa",       cvv: "123" },
  { number: "5500 0000 0000 0004", brand: "Mastercard", cvv: "456" },
  { number: "3714 496353 98431",   brand: "Amex",       cvv: "7890" }
];

// Elegir una tarjeta al azar para variar las pruebas
const card = testCards[Math.floor(Math.random() * testCards.length)];

pm.environment.set("cardNumber", card.number);
pm.environment.set("cardBrand",  card.brand);
pm.environment.set("cardCvv",    card.cvv);

// Fecha de vencimiento siempre futura
const year = new Date().getFullYear() + 2;
pm.environment.set("cardExpiry", `12/${year.toString().slice(-2)}`);

console.log(`Tarjeta seleccionada: ${card.brand} ${card.number}`);
```

**Body del checkout que usa estas variables:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 1 }
  ],
  "shipping": {
    "name":    "QA Tester",
    "address": "Av. Testing 1234",
    "city":    "Buenos Aires"
  },
  "payment": {
    "method":       "tarjeta",
    "card_number":  "{{cardNumber}}",
    "card_name":    "QA TESTER",
    "card_expiry":  "{{cardExpiry}}",
    "card_cvv":     "{{cardCvv}}",
    "card_brand":   "{{cardBrand}}",
    "card_type":    "credito",
    "installments": 1
  }
}
```

---

### 3.3 Verificar que el token está disponible antes de un request protegido

Antes de ejecutar cualquier request que requiere autenticación, podés verificar que el token existe:

```javascript
// Pre-request Script para requests que requieren auth
const token = pm.environment.get("authToken");

if (!token) {
    console.warn("⚠️ authToken está vacío. Ejecutá primero el request de login.");
    // Opcional: lanzar un error que detiene la ejecución
    throw new Error("authToken no encontrado. Ejecutá login primero.");
}

console.log("Token disponible:", token.substring(0, 20) + "...");
```

---

## 4. Flujo completo con variables — Ejemplo práctico

Este es el flujo real que vas a usar para probar el registro y checkout:

### Paso 1 — Registro con email dinámico

**Request:** `POST {{baseUrl}}/api/auth/register`

**Pre-request Script:**
```javascript
const ts = Date.now();
pm.environment.set("testEmail",    `qa.${ts}@novamarket.test`);
pm.environment.set("testName",     "QA Automation");
pm.environment.set("testPassword", "AutoTest123!");
```

**Body:**
```json
{
  "name":     "{{testName}}",
  "email":    "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

**Tests (tab "Tests"):**
```javascript
// Guardar el token para usarlo en los próximos requests
const response = pm.response.json();
if (response.token) {
  pm.environment.set("authToken", response.token);
  console.log("Token guardado correctamente.");
}
```

---

### Paso 2 — Obtener un producto para el checkout

**Request:** `GET {{baseUrl}}/api/products/1`

**Tests:**
```javascript
// Guardar el ID y el precio del producto
const res = pm.response.json();
if (res.product) {
  pm.environment.set("productId",    res.product.id);
  pm.environment.set("productPrice", res.product.price);
  pm.environment.set("productStock", res.product.stock);
  console.log(`Producto: ${res.product.name}, Stock: ${res.product.stock}`);
}
```

---

### Paso 3 — Checkout usando el token y el producto guardados

**Request:** `POST {{baseUrl}}/api/orders`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Body:**
```json
{
  "items": [
    { "product_id": {{productId}}, "quantity": 1 }
  ],
  "shipping": { "name": "QA", "address": "Calle Falsa 123", "city": "BA" },
  "payment": { "method": "transferencia" }
}
```

**Tests:**
```javascript
const res = pm.response.json();
if (res.order?.id) {
  pm.environment.set("orderId", res.order.id);
  console.log("Pedido creado, ID:", res.order.id);
}
```

---

## 5. Variables de entorno vs Variables de colección vs Variables globales

| Tipo | Alcance | Cuándo usarlo |
|------|---------|---------------|
| **Environment** | Solo el environment activo | URLs, tokens, IDs — cosas que cambian entre local y producción |
| **Collection** | Toda la colección | Valores fijos compartidos por todos los requests de la colección |
| **Global** | Todos los environments | No recomendado — contamina todo Postman |
| **Local** | Solo el request actual (creadas con `pm.variables.set`) | Valores temporales dentro de un solo script |

> **Tip:** para NovaMarket usá siempre **Environment variables**. Nunca hardcodees la URL base ni el token JWT directamente en los requests — si cambia algo, tenés que actualizarlo en 20 lugares.

---

**Guía anterior:** [01 — Fundamentos de Postman y Payloads](./01-fundamentos-postman-payloads.md)
**Siguiente guía:** [03 — Aserciones y Tests en JavaScript →](./03-aserciones-y-tests-javascript.md)

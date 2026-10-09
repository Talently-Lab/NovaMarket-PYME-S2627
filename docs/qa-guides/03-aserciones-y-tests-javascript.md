# Guía 03 — Aserciones y Tests en JavaScript

> **Objetivo de esta guía**
> Aprender a escribir tests automáticos en Postman usando `pm.test` y `pm.expect`, validar la estructura del JSON con contratos de schema, y encadenar requests para que el token del login esté disponible en las peticiones siguientes.

---

## 1. La pestaña "Tests" en Postman

Cada request en Postman tiene una pestaña **"Tests"** donde escribís código JavaScript que se ejecuta **después** de recibir la respuesta. Acá es donde verificás que el servidor respondió lo que esperabas.

Si el test pasa → aparece en verde en el panel de resultados.
Si falla → aparece en rojo con el mensaje de error que vos definiste.

---

## 2. Sintaxis básica — `pm.test` y `pm.expect`

```javascript
pm.test("Descripción del test", function () {
    pm.expect(valorActual).to.equal(valorEsperado);
});
```

- `pm.test(nombre, función)` — registra un test con nombre descriptivo
- `pm.expect(valor)` — inicia una cadena de aserciones (usa la librería Chai internamente)
- `.to.equal()`, `.to.have.property()`, `.to.be.a()` — los matchers más comunes

> **Tip:** el nombre del test es lo que va a aparecer en el reporte. Escribilo como una oración que describe el comportamiento esperado: `"El status code debe ser 200"` es mejor que `"test1"`.

---

## 3. Plantillas de código listas para usar

### 3.1 Validar código de estado HTTP

```javascript
// ✅ Verificar que la respuesta tiene el status esperado
pm.test("Status code es 201", function () {
    pm.response.to.have.status(201);
});

// Variante para múltiples códigos aceptables
pm.test("Status code es 200 o 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

**Códigos más comunes en NovaMarket:**

| Endpoint | Método | Status esperado |
|----------|--------|----------------|
| `/api/auth/register` | POST | `201` |
| `/api/auth/login` | POST | `200` |
| `/api/auth/me` | GET | `200` |
| `/api/products` | GET | `200` |
| `/api/orders` | POST | `201` |
| `/api/orders/admin/:id/status` | PATCH | `200` |
| Cualquier error de validación | cualquiera | `400` |
| Sin token | cualquiera | `401` |
| Sin permisos de admin | cualquiera | `403` |
| Recurso no encontrado | cualquiera | `404` |

---

### 3.2 Validar tiempo de respuesta (SLA)

```javascript
// ✅ La API debe responder en menos de 1500ms (Render free tier tiene spin-up lento)
pm.test("Tiempo de respuesta menor a 1500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1500);
});

// Para el backend local, podés ser más exigente:
pm.test("Tiempo de respuesta menor a 500ms (local)", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

> **Tip:** el backend en Render free tier puede tardar hasta 30 segundos en el primer request (spin-up en frío). Una vez que está caliente, los tiempos son normales. Para los tests de SLA, ejecutá primero un GET `/api/products` para "despertar" el servidor antes de medir.

---

### 3.3 Validar propiedades del JSON

```javascript
// Parsear el body de la respuesta
const response = pm.response.json();

// ✅ Verificar que existen propiedades clave
pm.test("Response contiene 'user' y 'token'", function () {
    pm.expect(response).to.have.property("user");
    pm.expect(response).to.have.property("token");
});

// ✅ Verificar tipos de datos
pm.test("user.id es un número", function () {
    pm.expect(response.user.id).to.be.a("number");
});

pm.test("user.role es 'customer' o 'admin'", function () {
    pm.expect(response.user.role).to.be.oneOf(["customer", "admin"]);
});

pm.test("token es un string no vacío", function () {
    pm.expect(response.token).to.be.a("string").and.not.equal("");
});

// ✅ Verificar valores específicos
pm.test("user.email coincide con el registrado", function () {
    pm.expect(response.user.email).to.equal(pm.environment.get("testEmail"));
});
```

---

### 3.4 Validar estructura con JSON Schema

El **JSON Schema** es un "contrato" que describe cómo debe verse el JSON. En lugar de verificar campo por campo, definís la forma completa esperada y validás de una sola vez.

Postman tiene soporte nativo para validación de schema desde la versión 9+:

```javascript
// ✅ Validación de schema nativa de Postman (recomendado)
const userSchema = {
    "type": "object",
    "required": ["id", "name", "email", "role"],
    "properties": {
        "id":    { "type": "number" },
        "name":  { "type": "string", "minLength": 2 },
        "email": { "type": "string" },
        "role":  { "type": "string", "enum": ["customer", "admin"] }
    },
    "additionalProperties": true
};

pm.test("Response de user cumple con el JSON Schema", function () {
    const response = pm.response.json();
    pm.expect(response.user).to.have.jsonSchema(userSchema);
});
```

> **Tip:** `"additionalProperties": true` permite que el objeto tenga campos extra (como `created_at`) sin que el test falle. Si querés un contrato estricto sin campos adicionales, cambialo a `false`.

---

#### Schema completo para `POST /api/auth/login`

```javascript
const loginResponseSchema = {
    "type": "object",
    "required": ["message", "user", "token"],
    "properties": {
        "message": { "type": "string" },
        "token":   { "type": "string", "minLength": 10 },
        "user": {
            "type": "object",
            "required": ["id", "name", "email", "role"],
            "properties": {
                "id":    { "type": "number" },
                "name":  { "type": "string" },
                "email": { "type": "string" },
                "role":  { "type": "string", "enum": ["customer", "admin"] }
            }
        }
    }
};

pm.test("Login response cumple con el schema", function () {
    pm.expect(pm.response.json()).to.have.jsonSchema(loginResponseSchema);
});
```

---

#### Schema para `GET /api/products`

```javascript
const productsResponseSchema = {
    "type": "object",
    "required": ["products", "total"],
    "properties": {
        "total": { "type": "number", "minimum": 0 },
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "price", "stock", "category"],
                "properties": {
                    "id":          { "type": "number" },
                    "name":        { "type": "string" },
                    "price":       { "type": "string" },
                    "stock":       { "type": "number", "minimum": 0 },
                    "category":    { "type": "string" },
                    "description": { "type": ["string", "null"] },
                    "image_url":   { "type": ["string", "null"] }
                }
            }
        }
    }
};

pm.test("Catálogo de productos cumple con el schema", function () {
    pm.expect(pm.response.json()).to.have.jsonSchema(productsResponseSchema);
});
```

> **Tip:** en NovaMarket el `price` viene como **string** desde PostgreSQL (`"29999.00"`), no como número. Esto es un detalle importante del schema — si lo ponés como `"type": "number"` el test va a fallar.

---

#### Schema para `POST /api/orders` (checkout)

```javascript
const orderResponseSchema = {
    "type": "object",
    "required": ["message", "order"],
    "properties": {
        "message": { "type": "string" },
        "order": {
            "type": "object",
            "required": ["id", "status", "total", "total_with_tax", "payment_method"],
            "properties": {
                "id":              { "type": "number" },
                "status":          { "type": "string", "enum": ["pending", "confirmed", "shipped", "delivered", "cancelled"] },
                "total":           { "type": "number" },
                "subtotal":        { "type": "number" },
                "discount_amount": { "type": "number", "minimum": 0 },
                "tax_amount":      { "type": "number", "minimum": 0 },
                "total_with_tax":  { "type": "number", "minimum": 0 },
                "payment_method":  { "type": "string", "enum": ["tarjeta", "billetera", "transferencia"] },
                "card_last4":      { "type": ["string", "null"] },
                "coupon_code":     { "type": ["string", "null"] }
            }
        }
    }
};

pm.test("Checkout response cumple con el schema", function () {
    pm.expect(pm.response.json()).to.have.jsonSchema(orderResponseSchema);
});
```

---

### 3.5 AJV — Alternativa avanzada para schemas complejos

Si necesitás validaciones más avanzadas (patrones regex, formatos personalizados, validaciones cruzadas entre propiedades), podés usar **AJV** directamente en Postman:

```javascript
// ✅ AJV en Postman — para validaciones avanzadas
var Ajv = require('ajv');
var ajv = new Ajv({ allErrors: true });

var userSchema = {
    "type": "object",
    "required": ["id", "name", "email", "role"],
    "properties": {
        "id":    { "type": "integer" },
        "name":  { "type": "string",  "minLength": 2 },
        "email": { "type": "string",  "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        "role":  { "type": "string",  "enum": ["customer", "admin"] }
    },
    "additionalProperties": false
};

pm.test("Response user cumple con el JSON Schema estricto (AJV)", function () {
    var jsonData = pm.response.json();
    var valid = ajv.validate(userSchema, jsonData.user);
    if (!valid) {
        console.log("Errores de schema:", JSON.stringify(ajv.errors, null, 2));
    }
    pm.expect(valid, "JSON Schema no coincide: " + JSON.stringify(ajv.errors)).to.be.true;
});
```

> **Cuándo usar AJV vs `pm.expect(...).to.have.jsonSchema()`:**
> - Empezá con `pm.expect(...).to.have.jsonSchema()` — es más simple y suficiente para la mayoría de los casos.
> - Usá AJV cuando necesites: patrones regex en strings, formatos como `date-time`, validaciones condicionales (`if/then/else`), o mensajes de error más detallados.

---

## 4. Test Chaining — Guardar valores para el siguiente request

El **Test Chaining** consiste en guardar valores del response de un request en variables de entorno, para usarlos en el siguiente request de la secuencia.

### Ejemplo: Login → Guardar token → Usarlo en checkout

**Request 1: `POST /api/auth/login` — Tests:**
```javascript
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
});

// Guardar el token para los próximos requests
const response = pm.response.json();
pm.environment.set("authToken", response.token);
pm.environment.set("userId",    response.user.id);

console.log("Token guardado para el usuario:", response.user.email);
```

**Request 2: `GET /api/auth/me` — Headers:**
```
Authorization: Bearer {{authToken}}
```

**Request 2 — Tests:**
```javascript
pm.test("Me devuelve el mismo usuario que hizo login", function () {
    const res = pm.response.json();
    pm.expect(res.user.id).to.equal(pm.environment.get("userId"));
});
```

---

### Ejemplo: Crear pedido → Guardar ID → Verificar en mis pedidos

**Request: `POST /api/orders` — Tests:**
```javascript
pm.test("Pedido creado exitosamente", function () {
    pm.response.to.have.status(201);
});

// Guardar el ID del pedido recién creado
const res = pm.response.json();
if (res.order?.id) {
    pm.environment.set("orderId", res.order.id);

    // Verificaciones adicionales
    pm.test("El pedido tiene status 'confirmed'", function () {
        pm.expect(res.order.status).to.equal("confirmed");
    });

    pm.test("total_with_tax es mayor que cero", function () {
        pm.expect(res.order.total_with_tax).to.be.above(0);
    });
}
```

**Request siguiente: `GET /api/orders/{{orderId}}` — Tests:**
```javascript
pm.test("Detalle del pedido encontrado", function () {
    pm.response.to.have.status(200);
});

pm.test("El ID del pedido coincide", function () {
    const res = pm.response.json();
    pm.expect(res.order.id).to.equal(pm.environment.get("orderId"));
});
```

---

## 5. Tests completos para endpoints clave de NovaMarket

### Tests para `POST /api/auth/register`

```javascript
const res = pm.response.json();

pm.test("Status 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Response tiene message, user y token", function () {
    pm.expect(res).to.have.all.keys("message", "user", "token");
});

pm.test("user.role es 'customer' (no admin)", function () {
    pm.expect(res.user.role).to.equal("customer");
});

pm.test("token es un JWT (3 partes separadas por punto)", function () {
    const parts = res.token.split(".");
    pm.expect(parts.length).to.equal(3);
});

pm.test("user.email coincide con el registrado", function () {
    pm.expect(res.user.email).to.equal(pm.environment.get("testEmail"));
});

// Guardar para los siguientes requests
pm.environment.set("authToken", res.token);
```

---

### Tests para `GET /api/products`

```javascript
const res = pm.response.json();

pm.test("Status 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contiene 'products' array y 'total'", function () {
    pm.expect(res).to.have.property("products").that.is.an("array");
    pm.expect(res).to.have.property("total").that.is.a("number");
});

pm.test("total coincide con la longitud del array", function () {
    pm.expect(res.total).to.equal(res.products.length);
});

pm.test("Todos los productos tienen id, name, price, stock", function () {
    res.products.forEach(function (product) {
        pm.expect(product).to.have.property("id");
        pm.expect(product).to.have.property("name");
        pm.expect(product).to.have.property("price");
        pm.expect(product).to.have.property("stock");
    });
});

pm.test("Ningún producto tiene stock negativo", function () {
    res.products.forEach(function (product) {
        pm.expect(product.stock).to.be.at.least(0);
    });
});

// Guardar el ID del primer producto para el checkout
if (res.products.length > 0) {
    pm.environment.set("productId", res.products[0].id);
}
```

---

**Guía anterior:** [02 — Variables y Pre-request Scripts](./02-variables-y-pre-request-scripts.md)
**Siguiente guía:** [04 — Regresión Automática sobre Bugs BR →](./04-regresion-automatica-bugs-br.md)

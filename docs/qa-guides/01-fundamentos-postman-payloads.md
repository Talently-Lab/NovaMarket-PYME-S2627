# Guía 01 — Fundamentos de Postman y Payloads HTTP

> **Para quién es esta guía**
> Esta guía es para vos, Agustina. Si ya hacés pruebas manuales en la app, este es el próximo paso natural: en lugar de hacer clic en la interfaz, vas a enviar las mismas acciones directamente a la API y verificar que el backend responde exactamente como se espera.

---

## 1. Métodos HTTP — qué hace cada uno

Cuando el frontend de NovaMarket hace algo (login, agregar un producto, crear un pedido), por detrás envía una petición HTTP con un **método** que indica la intención:

| Método | Intención | Ejemplo en NovaMarket |
|--------|-----------|----------------------|
| `GET` | Leer datos sin modificar nada | Obtener el catálogo de productos |
| `POST` | Crear un recurso nuevo | Registrar un usuario, crear un pedido |
| `PUT` | Reemplazar un recurso completo | Actualizar todos los datos de un producto (admin) |
| `PATCH` | Modificar un campo específico | Cambiar el estado de un pedido (`confirmed` → `shipped`) |
| `DELETE` | Eliminar un recurso | Desactivar un producto (admin) |

> **Tip:** en NovaMarket el `DELETE` de productos es un **soft delete** — no borra el registro de la base de datos, solo lo marca como inactivo (`is_active = false`). Los clientes dejan de verlo, pero el historial de pedidos sigue intacto.

---

## 2. ¿Qué es un Payload?

Un **payload** es el cuerpo (body) del mensaje HTTP.

- **Request Payload** → los datos que vos le enviás al servidor. Ejemplo: cuando registrás un usuario, el payload contiene `name`, `email` y `password`.
- **Response Payload** → los datos que el servidor te devuelve. Ejemplo: cuando el registro es exitoso, el servidor devuelve el `user` creado y un `token` JWT.

En NovaMarket todos los payloads son JSON. Siempre hay que agregar el header:

```
Content-Type: application/json
```

---

## 3. Endpoints reales de NovaMarket

**Base URL producción:** `https://novamarket-api-ikcm.onrender.com`
**Base URL local:** `http://localhost:3000`

> **Tip:** el backend en producción corre en Render (free tier). Si estuvo inactivo, el primer request puede tardar hasta 30 segundos mientras arranca. Es normal — esperá y reintentá.

### 3.1 Auth — Autenticación

#### POST `/api/auth/register` — Registrar un usuario

**Request Payload:**
```json
{
  "name":     "Agustina Fernandez",
  "email":    "agustina@test.com",
  "password": "TestPass123"
}
```

**Response exitoso (201 Created):**
```json
{
  "message": "Cuenta creada exitosamente.",
  "user": {
    "id":    42,
    "name":  "Agustina Fernandez",
    "email": "agustina@test.com",
    "role":  "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Reglas del backend:**
- `name`: mínimo 2 caracteres, no puede ser solo espacios
- `email`: formato válido (`usuario@dominio.com`), no puede estar ya registrado
- `password`: mínimo 8 caracteres

---

#### POST `/api/auth/login` — Iniciar sesión

**Request Payload:**
```json
{
  "email":    "agustina@test.com",
  "password": "TestPass123"
}
```

**Response exitoso (200 OK):**
```json
{
  "message": "Sesión iniciada correctamente.",
  "user": {
    "id":    42,
    "name":  "Agustina Fernandez",
    "email": "agustina@test.com",
    "role":  "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### GET `/api/auth/me` — Ver mi perfil (requiere JWT)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Sin body** — es un GET.

**Response exitoso (200 OK):**
```json
{
  "user": {
    "id":         42,
    "name":       "Agustina Fernandez",
    "email":      "agustina@test.com",
    "role":       "customer",
    "created_at": "2026-10-09T19:00:00.000Z"
  }
}
```

---

### 3.2 Catálogo — Productos

#### GET `/api/products` — Listar productos (público)

**Sin headers, sin body.**

Parámetros de query opcionales:
```
?category=Gaming
?minPrice=5000
?maxPrice=50000
?order=price_asc
```

Valores válidos para `order`: `price_asc`, `price_desc`, `newest`.

**Response exitoso (200 OK):**
```json
{
  "products": [
    {
      "id":          1,
      "name":        "Mouse Gamer Logitech G203",
      "description": "Mouse inalámbrico con sensor HERO",
      "price":       "29999.00",
      "stock":       15,
      "category":    "Periféricos",
      "image_url":   "https://...",
      "created_at":  "2026-09-14T00:00:00.000Z"
    }
  ],
  "total": 20
}
```

---

#### GET `/api/products/:id` — Detalle de un producto (público)

**Ejemplo:** `GET /api/products/1`

**Response exitoso (200 OK):**
```json
{
  "product": {
    "id":          1,
    "name":        "Mouse Gamer Logitech G203",
    "description": "...",
    "price":       "29999.00",
    "stock":       15,
    "category":    "Periféricos",
    "image_url":   "https://...",
    "is_active":   true,
    "created_at":  "2026-09-14T00:00:00.000Z",
    "updated_at":  "2026-09-14T00:00:00.000Z"
  }
}
```

---

### 3.3 Carrito y Checkout

#### POST `/api/orders` — Crear pedido (requiere JWT)

Este es el endpoint del checkout. Ejemplo con pago por transferencia (el más simple para pruebas):

**Headers:**
```
Authorization: Bearer <tu_token>
Content-Type: application/json
```

**Request Payload (transferencia):**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 }
  ],
  "shipping": {
    "name":    "Agustina Fernandez",
    "address": "Av. Corrientes 1234",
    "city":    "Buenos Aires",
    "phone":   "1112345678"
  },
  "payment": {
    "method": "transferencia"
  }
}
```

**Request Payload (tarjeta con cupón):**
```json
{
  "items": [
    { "product_id": 1, "quantity": 1 }
  ],
  "shipping": {
    "name":    "Agustina Fernandez",
    "address": "Av. Corrientes 1234",
    "city":    "Buenos Aires"
  },
  "payment": {
    "method":       "tarjeta",
    "coupon_code":  "NOVA20",
    "card_number":  "4111 1111 1111 1111",
    "card_name":    "AGUSTINA FERNANDEZ",
    "card_expiry":  "12/28",
    "card_cvv":     "123",
    "card_type":    "credito",
    "installments": 1
  }
}
```

**Response exitoso (201 Created):**
```json
{
  "message": "Pedido confirmado exitosamente.",
  "order": {
    "id":              1,
    "status":          "confirmed",
    "total":           29999.00,
    "payment_method":  "tarjeta",
    "card_last4":      "1111",
    "coupon_code":     "NOVA20",
    "discount_amount": 5999.80,
    "tax_amount":      11339.62,
    "total_with_tax":  35339.42,
    "subtotal":        29999.00,
    "created_at":      "2026-10-09T20:00:00.000Z"
  }
}
```

---

## 4. Casos de Prueba — Happy Path y casos límite

### 4.1 Registro de usuario

| # | Caso | Payload clave | Respuesta esperada |
|---|------|---------------|-------------------|
| TC-REG-01 | Happy path | `name`, `email`, `password` válidos | 201 + `token` en response |
| TC-REG-02 | Email duplicado | Email ya registrado | 409 `"Ya existe una cuenta con ese email."` |
| TC-REG-03 | Password corto | `"password": "abc"` (< 8 chars) | 400 `"La contraseña debe tener al menos 8 caracteres."` |
| TC-REG-04 | Nombre vacío | `"name": ""` | 400 `"Nombre, email y contraseña son requeridos."` |
| TC-REG-05 | Nombre solo espacios | `"name": "   "` | 400 (espacios se trimmean → nombre vacío) |
| TC-REG-06 | Email sin formato | `"email": "noesunmail"` | 400 `"El email no tiene un formato válido."` |
| TC-REG-07 | Sin body | `{}` | 400 |

### 4.2 Login

| # | Caso | Payload clave | Respuesta esperada |
|---|------|---------------|-------------------|
| TC-LOG-01 | Happy path | Email y password correctos | 200 + `token` |
| TC-LOG-02 | Password incorrecta | Password que no coincide | 401 `"Credenciales inválidas."` |
| TC-LOG-03 | Email inexistente | Email no registrado | 401 `"Credenciales inválidas."` |
| TC-LOG-04 | Sin password | `{ "email": "x@x.com" }` | 400 `"Email y contraseña son requeridos."` |

> **Tip de seguridad:** notá que TC-LOG-02 y TC-LOG-03 devuelven el **mismo mensaje de error**. Esto es intencional — se llama "Generic Error Message" y es una buena práctica de seguridad (OWASP A01): si el backend dijera "email no encontrado" vs "contraseña incorrecta", un atacante podría enumerar qué emails están registrados.

### 4.3 Catálogo

| # | Caso | Request | Respuesta esperada |
|---|------|---------|-------------------|
| TC-CAT-01 | Listar todos | `GET /api/products` | 200 + array de productos activos |
| TC-CAT-02 | Filtrar por categoría | `?category=Gaming` | 200 + solo productos de Gaming |
| TC-CAT-03 | Producto existente | `GET /api/products/1` | 200 + objeto producto |
| TC-CAT-04 | Producto inexistente | `GET /api/products/99999` | 404 `"Producto no encontrado."` |
| TC-CAT-05 | ID no numérico | `GET /api/products/abc` | 400 `"El ID del producto debe ser un número."` |

### 4.4 Checkout — Validaciones de tarjeta

| # | Caso | Payload clave | Respuesta esperada |
|---|------|---------------|-------------------|
| TC-CHK-01 | Happy path tarjeta | Todos los campos válidos | 201 + pedido confirmado |
| TC-CHK-02 | Happy path transferencia | `"method": "transferencia"` | 201 sin campos de tarjeta |
| TC-CHK-03 | Tarjeta sin CVV | Omitir `card_cvv` | 400 `"CVV inválido."` |
| TC-CHK-04 | Stock insuficiente | `quantity` mayor al stock disponible | 409 `"Stock insuficiente..."` |
| TC-CHK-05 | Producto inexistente | `product_id: 99999` | 404 `"Producto #99999 no encontrado."` |
| TC-CHK-06 | Sin autenticación | Sin header `Authorization` | 401 `"Token de autenticación requerido."` |
| TC-CHK-07 | Items vacíos | `"items": []` | 400 `"El pedido debe tener al menos un producto."` |

---

## 5. Respuestas de error comunes

Todos los errores del backend siguen el mismo formato:

```json
{ "error": "Descripción del problema." }
```

| Código HTTP | Significado | Cuándo ocurre |
|-------------|-------------|---------------|
| `400` | Bad Request | Datos faltantes o con formato inválido |
| `401` | Unauthorized | Sin token, token expirado, o credenciales incorrectas |
| `403` | Forbidden | Token válido pero sin permiso (ej: cliente intentando acceder a admin) |
| `404` | Not Found | El recurso (producto, pedido) no existe |
| `409` | Conflict | El recurso ya existe (email duplicado, stock insuficiente) |
| `500` | Internal Error | Error inesperado en el servidor — revisar logs |

---

**Siguiente guía:** [02 — Variables y Pre-request Scripts →](./02-variables-y-pre-request-scripts.md)

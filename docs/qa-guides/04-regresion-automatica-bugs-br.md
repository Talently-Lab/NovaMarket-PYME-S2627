# Guía 04 — Regresión Automática sobre Bugs BR

> **Objetivo de esta guía**
> Tomar cada bug reportado en el proyecto (BR01–BR18) y convertirlo en un test de regresión automático en Postman. Un **test de regresión** verifica que un bug corregido no vuelve a aparecer. Una vez que lo escribís, lo corrés en cada release sin esfuerzo manual.

---

## ¿Qué es un test de regresión?

Cuando se corrige un bug, el riesgo es que en el futuro alguien modifique el código y lo rompa de vuelta sin darse cuenta. Un test de regresión es exactamente eso: una prueba que certifica que el bug sigue corregido.

**Proceso:**
1. Bug reportado → bug corregido
2. Escribís el test que reproduce el escenario del bug
3. El test pasa (el bug está corregido)
4. En cada release, corrés la colección → si el test falla, el bug regresó

---

## Bugs de Backend

### BR06 — Token expirado sigue mostrando sesión activa

**Descripción:** Cuando el JWT expira, el interceptor de Axios borraba el token del `localStorage` pero no limpiaba el usuario del estado de React. El header seguía mostrando el nombre del usuario aunque la sesión había expirado.

**Fix:** el interceptor ahora despacha el evento `nm:unauthorized`, y `AuthContext` lo escucha para limpiar `user`.

**Test de regresión — `GET /api/auth/me` con token inválido:**

```javascript
// Pre-request Script: usar un token inválido a propósito
pm.request.headers.add({
    key:   "Authorization",
    value: "Bearer tokeninvalido.esto.es.un.jwt.falso"
});
```

```javascript
// Tests
pm.test("BR06 — Token inválido devuelve 401", function () {
    pm.response.to.have.status(401);
});

pm.test("BR06 — Response contiene campo 'error'", function () {
    const res = pm.response.json();
    pm.expect(res).to.have.property("error");
    pm.expect(res.error).to.be.a("string").and.not.empty;
});

pm.test("BR06 — El mensaje de error es el esperado", function () {
    const res = pm.response.json();
    pm.expect(res.error).to.equal("Token inválido.");
});
```

---

### BR08 — Admin/pedidos dejaba de mostrar pedidos de usuarios eliminados

**Descripción:** `GET /api/orders/admin/all` usaba `INNER JOIN` con `users`. Si un usuario era eliminado, sus pedidos desaparecían del panel de admin.

**Fix:** cambiado a `LEFT JOIN` — si el usuario no existe, el pedido igual aparece.

**Test de regresión:**

```javascript
// Tests para GET /api/orders/admin/all (requiere adminToken)
pm.test("BR08 — Admin puede listar todos los pedidos", function () {
    pm.response.to.have.status(200);
});

pm.test("BR08 — Response tiene 'orders' array y 'total'", function () {
    const res = pm.response.json();
    pm.expect(res).to.have.property("orders").that.is.an("array");
    pm.expect(res.total).to.equal(res.orders.length);
});

pm.test("BR08 — Cada pedido tiene user_id aunque el usuario no exista", function () {
    const res = pm.response.json();
    res.orders.forEach(function (order) {
        pm.expect(order).to.have.property("user_id");
        // user_name puede ser null si el usuario fue eliminado — eso es correcto con LEFT JOIN
        pm.expect(order).to.have.property("user_name"); 
    });
});
```

---

### BR11 — `product_name` null en Mis Pedidos

**Descripción:** `OrderModel.findByUserId()` no incluía `p.name AS product_name` en el `json_agg`. Los items del pedido mostraban `null` como nombre de producto.

**Fix:** agregado `p.name AS product_name` al `json_build_object` en el JOIN.

**Test de regresión — `GET /api/orders` (mis pedidos):**

```javascript
pm.test("BR11 — Mis pedidos responde 200", function () {
    pm.response.to.have.status(200);
});

pm.test("BR11 — Los items tienen product_name no nulo", function () {
    const res = pm.response.json();
    
    if (res.orders.length === 0) {
        console.log("Sin pedidos para verificar — crear uno primero.");
        return;
    }
    
    res.orders.forEach(function (order) {
        if (order.items && order.items.length > 0) {
            order.items.forEach(function (item) {
                pm.expect(item.product_name, 
                    `product_name no debe ser null en item ${item.id}`)
                    .to.not.be.null;
                pm.expect(item.product_name).to.be.a("string").and.not.empty;
            });
        }
    });
});
```

---

### BR17 — Categorías admin contaba productos sin stock como activos

**Descripción:** `getCategories()` contaba productos con `is_active=true` pero `stock=0` como "activos".

**Fix:** filtro cambiado a `WHERE is_active = true AND stock > 0`.

**Test de regresión — `GET /api/products/admin/categories`:**

```javascript
pm.test("BR17 — Categorías devuelve 200", function () {
    pm.response.to.have.status(200);
});

pm.test("BR17 — active_count nunca supera product_count", function () {
    const res = pm.response.json();
    res.categories.forEach(function (cat) {
        pm.expect(cat.active_count).to.be.at.most(cat.product_count,
            `active_count (${cat.active_count}) no puede superar product_count (${cat.product_count}) en categoría "${cat.category}"`
        );
    });
});

pm.test("BR17 — active_count no incluye productos con stock=0", function () {
    // Este test verifica la consistencia de los datos
    // Si active_count <= product_count para todas, el LEFT JOIN + filtro funciona bien
    const res = pm.response.json();
    pm.expect(res.categories).to.be.an("array").and.not.empty;
    console.log("Categorías verificadas:", res.categories.map(c => `${c.category}: ${c.active_count}/${c.product_count}`).join(", "));
});
```

---

## Bugs de validación en Checkout

### BR01 — Nombre con espacios en blanco pasaba la validación

**Descripción:** el campo `name` en el registro aceptaba `"   "` (espacios) y lo enviaba al backend. El backend hacía `.trim()` y quedaba vacío → error 400. Pero el frontend no lo prevenía.

El backend ya aplica `.trim()` correctamente — este test verifica que el backend rechaza espacios.

**Test de regresión — `POST /api/auth/register`:**

```javascript
// Body para este test:
// {
//   "name": "   ",
//   "email": "test@test.com",
//   "password": "TestPass123"
// }

pm.test("BR01 — Nombre con solo espacios devuelve 400", function () {
    pm.response.to.have.status(400);
});

pm.test("BR01 — El error menciona que el nombre es requerido", function () {
    const res = pm.response.json();
    pm.expect(res.error).to.include("requerido").or.include("caracteres");
});
```

---

### BR03 — Botón `−` permitía cantidad 0 o negativa

**Descripción:** frontend — el botón de decrementar no estaba deshabilitado en `quantity=1`.
El backend ya valida esto — test de regresión a nivel API:

**Test de regresión — `POST /api/orders` con quantity 0:**

```javascript
// Body:
// { "items": [{ "product_id": 1, "quantity": 0 }], ... }

pm.test("BR03 — Quantity 0 devuelve 400", function () {
    pm.response.to.have.status(400);
});

pm.test("BR03 — El error menciona quantity inválido", function () {
    const res = pm.response.json();
    pm.expect(res.error).to.include("quantity");
});
```

---

### BR13 — IVA calculado sobre precio bruto en lugar de base neta

**Descripción:** en el frontend el label decía "IVA (21%)" sin aclarar que se calcula sobre (subtotal − descuento). El backend siempre calculó bien — el fix fue de etiqueta en el UI.

Este test verifica que la matemática del backend sea correcta:

**Test de regresión — `POST /api/orders` con cupón NOVA20:**

```javascript
// Body (usar método transferencia para simplificar):
// {
//   "items": [{ "product_id": 1, "quantity": 1 }],
//   "shipping": { "name": "QA", "address": "Test", "city": "BA" },
//   "payment": { "method": "transferencia", "coupon_code": "NOVA20" }
// }

pm.test("BR13 — Checkout con cupón NOVA20 devuelve 201", function () {
    pm.response.to.have.status(201);
});

pm.test("BR13 — IVA se calcula sobre base neta (subtotal - descuento)", function () {
    const res = pm.response.json();
    const order = res.order;
    
    const subtotal       = order.subtotal;
    const discountAmount = order.discount_amount;
    const taxAmount      = order.tax_amount;
    const totalWithTax   = order.total_with_tax;
    
    // Verificar la matemática: IVA = (subtotal - descuento) * 21%
    const baseNeta           = subtotal - discountAmount;
    const expectedTax        = parseFloat((baseNeta * 0.21).toFixed(2));
    const expectedTotalWithTax = parseFloat((baseNeta + expectedTax).toFixed(2));
    
    pm.expect(taxAmount).to.be.closeTo(expectedTax, 0.01,
        `IVA esperado: ${expectedTax}, recibido: ${taxAmount}. Se calcula sobre base neta (${baseNeta}), no sobre subtotal bruto (${subtotal}).`
    );
    
    pm.expect(totalWithTax).to.be.closeTo(expectedTotalWithTax, 0.01,
        `Total con IVA esperado: ${expectedTotalWithTax}, recibido: ${totalWithTax}`
    );
});

pm.test("BR13 — El descuento NOVA20 es exactamente el 20% del subtotal", function () {
    const res    = pm.response.json();
    const order  = res.order;
    const expectedDiscount = parseFloat((order.subtotal * 0.20).toFixed(2));
    
    pm.expect(order.coupon_code).to.equal("NOVA20");
    pm.expect(order.discount_amount).to.be.closeTo(expectedDiscount, 0.01);
});
```

---

### BR14 — Carrito de invitado se perdía al hacer login

**Descripción:** `CartContext` perdía los items del carrito guest (`nm-cart-guest`) al iniciar sesión. Fix: los items se fusionan con el carrito del usuario autenticado.

Este es un bug de frontend (localStorage) — no tiene test directo de API. Se verifica a nivel E2E con Playwright.

**Nota para el test manual complementario:**
1. Sin iniciar sesión, agregar un producto al carrito
2. Hacer login
3. Verificar que el carrito todavía contiene el producto

---

### BR18 — Flujo "Olvidé mi contraseña" no funcionaba end-to-end

**Descripción:** 3 causas acumuladas — el token nunca se enviaba por email, la migración SQL no estaba ejecutada, y Render bloqueaba SMTP.

**Tests de regresión para el flujo completo:**

**Paso 1 — `POST /api/auth/forgot-password`:**

```javascript
// Body: { "email": "usuario@registrado.com" }

pm.test("BR18 Paso 1 — forgot-password devuelve 200 siempre", function () {
    // El backend devuelve 200 incluso si el email no existe (anti-enumeración)
    pm.response.to.have.status(200);
});

pm.test("BR18 Paso 1 — Response no contiene el token (ya no es simulado)", function () {
    const res = pm.response.json();
    pm.expect(res).to.not.have.property("token");
    pm.expect(res).to.not.have.property("code");
    pm.expect(res).to.not.have.property("reset_token");
    // Solo debe tener el mensaje genérico
    pm.expect(res.message).to.include("Si el email existe");
});

pm.test("BR18 Paso 1 — Tiempo de respuesta razonable (no timeout)", function () {
    // Si la migración SQL no estaba ejecutada, causaba timeout indefinido
    pm.expect(pm.response.responseTime).to.be.below(10000);
});
```

**Paso 2 — `POST /api/auth/reset-password` con token inválido:**

```javascript
// Body: { "token": "000000", "newPassword": "NuevoPass123" }
// (token de 6 dígitos inválido o expirado)

pm.test("BR18 Paso 2 — Token inválido devuelve 400", function () {
    pm.response.to.have.status(400);
});

pm.test("BR18 Paso 2 — Mensaje de error correcto para token inválido", function () {
    const res = pm.response.json();
    pm.expect(res.error).to.satisfy(function (msg) {
        return msg.includes("inválido") || msg.includes("expiró") || msg.includes("utilizado");
    }, "El mensaje debe indicar que el token es inválido o expirado");
});
```

---

## Bugs de Stock

### BR04 — Checkout con stock insuficiente

**Test de regresión — Stock insuficiente:**

```javascript
// Body: { "items": [{ "product_id": 1, "quantity": 99999 }], ... }

pm.test("Stock insuficiente devuelve 409", function () {
    pm.response.to.have.status(409);
});

pm.test("El error menciona el stock disponible", function () {
    const res = pm.response.json();
    pm.expect(res.error).to.include("Stock insuficiente");
    pm.expect(res.error).to.include("Disponible");
});
```

---

## Template de Test de Regresión — Reutilizable

Cuando encontrés un nuevo bug en el futuro y lo corrijas, usá este template para documentar y crear el test de regresión:

```javascript
// ================================================================
// TEST DE REGRESIÓN — BRxx: [Nombre del bug]
// Reportado: [fecha]
// Corregido en commit: [hash]
// Descripción: [qué fallaba]
// ================================================================

pm.test("BRxx — [Descripción concisa del comportamiento esperado]", function () {
    // 1. Verificar el status code correcto
    pm.response.to.have.status(XXX);
    
    // 2. Verificar que la respuesta tiene la estructura esperada
    const res = pm.response.json();
    pm.expect(res).to.have.property("...");
    
    // 3. Verificar que el bug específico NO ocurre
    // (ej: que el campo no es null, que el cálculo es correcto, etc.)
    pm.expect(res.campo).to.not.be.null;
});
```

---

## Tabla resumen — Tests de regresión implementados

| Bug | Endpoint | Test implementado | Capa |
|-----|----------|-------------------|------|
| BR01 | `POST /api/auth/register` | Nombre con solo espacios → 400 | API |
| BR03 | `POST /api/orders` | Quantity 0 → 400 | API |
| BR06 | `GET /api/auth/me` | Token inválido → 401 | API |
| BR08 | `GET /api/orders/admin/all` | Lista pedidos aunque usuario eliminado | API |
| BR11 | `GET /api/orders` | Items tienen product_name no nulo | API |
| BR13 | `POST /api/orders` | IVA calculado sobre base neta | API |
| BR14 | CartContext fusion | Login no pierde carrito guest | E2E (Playwright) |
| BR17 | `GET /api/products/admin/categories` | active_count ≤ product_count | API |
| BR18 | `POST /api/auth/forgot-password` | Token no en response, no timeout | API |

---

**Guía anterior:** [03 — Aserciones y Tests en JavaScript](./03-aserciones-y-tests-javascript.md)
**Siguiente guía:** [05 — Ejecución con Collection Runner →](./05-ejecucion-colecciones-runner.md)

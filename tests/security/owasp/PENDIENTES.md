# Categorías OWASP pendientes de implementar

Estas categorías no tienen tests activos porque los endpoints o funcionalidades
que las cubren aún no existen en el backend. Retomar cuando Backend implemente
las rutas correspondientes.

---

## A01 — Broken Access Control (parcial)
**Pendiente:** Rutas protegidas por JWT y por rol (admin).
- `POST /api/products` — solo admin
- `DELETE /api/products/:id` — solo admin
- `GET /api/orders` — solo usuario autenticado
- `GET /api/admin/*` — cualquier ruta del panel admin

**Activar cuando:** Backend implemente middleware de autenticación JWT y rutas con control de roles.

---

## A03 — Injection
**Pendiente:** Ningún query SQL está escrito todavía en el backend.
Cuando Backend implemente consultas con `pg`, verificar:
- Que todas usen parámetros (`$1`, `$2`) y nunca concatenación de strings con input del usuario.
- Endpoints a revisar: `GET /api/products?category=...`, `POST /api/auth/login`, `GET /api/orders/:id`.

**Activar cuando:** Backend implemente al menos un endpoint que reciba input del usuario y consulte la DB.

---

## A04 — Insecure Design
**Pendiente:** Lógica de negocio no implementada aún.
- Checkout sin stock disponible
- Manipulación de precios en el payload de orden
- Creación de usuario con rol `admin` via API pública

**Activar cuando:** Backend implemente módulos de checkout y órdenes.

---

## A06 — Vulnerable and Outdated Components
**Pendiente:** Requiere integración con Snyk, npm audit en CI, o OWASP Dependency Check.
El `package.json` actual no tiene vulnerabilidades conocidas (`npm audit` reporta 0),
pero conviene automatizar este check en el pipeline de CI.

**Activar cuando:** Se agregue el step de `npm audit --audit-level=high` en `.github/workflows/ci.yml`.

---

## A07 — Identification and Authentication Failures (parcial)
**Pendiente:** JWT no está implementado en el backend.
Cuando Backend implemente autenticación, verificar:
- `POST /api/auth/login` — respuesta ante credenciales inválidas (no revelar si el usuario existe)
- `POST /api/auth/register` — rate limiting (brute force)
- Token JWT: expiración configurada, secret no débil ("secret", "123456", etc.)
- Token JWT: algoritmo `none` rechazado
- Token JWT: firma inválida rechazada con 401

**Tests esqueleto ya creados en:** `tests/security/owasp/A07-auth-failures.test.ts`
**Activar cuando:** `jsonwebtoken` esté instalado y middleware de auth implementado.

---

## A08 — Software and Data Integrity Failures
**Pendiente:** No hay deserialización de objetos ni pipeline de dependencias con checksums.
Revisar cuando el proyecto incorpore dependencias de terceros más complejas o webhooks.

---

## A10 — Server-Side Request Forgery (SSRF)
**Pendiente:** No hay endpoints que hagan fetch/request a URLs externas todavía.
Revisar cuando Backend implemente integraciones con APIs de pago, envío u otras.

# Checklist de PR Review — NovaMarket-PYME
**QA:** Christian Santibáñez · Basado en `TEST_PLAN.md` v1.0.9 y `criterios-aceptacion-datos-prueba.md` (SCRUM-14)
**Última actualización:** 25/sep/2026

> Copiar y pegar como comentario en cada Pull Request antes de aprobar merge a `main`.

---

## 1. Cobertura de tests
- [ ] El PR incluye tests para el código nuevo/modificado (Unit, API o E2E según el módulo)
- [ ] Si el módulo es Auth, Catálogo, Carrito o Checkout (prioridad **Crítica/Alta**), tiene tests en al menos 2 capas (Unit + API, o API + E2E)
- [ ] Los tests Jest siguen pasando: `npm test` → 72 passed, 0 failed
- [ ] No se agregó código de negocio nuevo sin al menos un test asociado

## 2. Criterios de aceptación
- [ ] El PR cumple los criterios de aceptación definidos para su ticket en `criterios-aceptacion-datos-prueba.md`
- [ ] Los criterios verificados usan lenguaje medible (status HTTP, estructura de payload, comportamiento observable)
- [ ] Si el ticket toca Auth, verificar: register devuelve 201 + JWT, login devuelve 200 + JWT, credenciales inválidas devuelven 401 con mismo mensaje (anti-enumeración)
- [ ] Si el ticket toca Productos, verificar: GET /api/products devuelve array, GET /api/products/:id devuelve 404 si no existe, rutas admin devuelven 401 sin token
- [ ] Si el ticket toca Pedidos, verificar: POST /api/orders con carrito vacío devuelve 400, con stock insuficiente devuelve 409, exitoso devuelve 201 con order.id

## 3. Datos de prueba / Fixtures
- [ ] Si el PR toca Auth, usa los fixtures oficiales (`test.user@novamarket.com`, `admin@novamarket.com`) y **no** credenciales reales del equipo
- [ ] Ningún test hardcodea password/token — se leen de `process.env` o fixtures
- [ ] `JWT_SECRET` disponible en entorno de test: `process.env.JWT_SECRET` configurado antes de importar `app`
- [ ] Si el PR toca Productos, contempla `image_url` null (el helper `getProductImage` debe manejarlo)
- [ ] Si el PR toca Órdenes, contempla los 3 casos: payload válido, producto inexistente (404), carrito vacío (400)

## 4. CI/CD (GitHub Actions)
- [ ] El pipeline pasa en verde en la rama del PR
- [ ] ⚠️ `npm run lint` aún no existe en backend — no bloquear por esto, es deuda técnica conocida
- [ ] No se agregaron secretos en `.yml` (deben ir en GitHub Secrets: `DATABASE_URL_TEST`, `JWT_SECRET_TEST`)
- [ ] El job `e2e-tests` corre contra Netlify con `BASE_URL=https://novamarket-pyme-s2627.netlify.app`

> **Estado actual del pipeline:**
> - Job `unit-and-api-tests` ✅ activo — corre `npm test` (72 tests)
> - Job `e2e-tests` ✅ activo — Playwright contra Netlify (68 tests)
> - Job `lint` ⚠️ activo pero sin ESLint en backend todavía

## 5. Seguridad (sección 5.3 Test Plan)
- [ ] `.env` no está en el commit (`git check-ignore backend/.env frontend/.env` → ignorados)
- [ ] Sin credenciales hardcodeadas en el código fuente
- [ ] Endpoints protegidos: sin token → 401, con token de rol incorrecto → 403
- [ ] JWT: rol en payload verificado en middleware, no solo en frontend
- [ ] Login no distingue "email no existe" vs "password incorrecta" — mismo mensaje `"Credenciales inválidas."`
- [ ] CORS solo permite orígenes autorizados (localhost:5173, Netlify)
- [ ] `x-powered-by` deshabilitado en Express

## 6. Frontend (cuando aplica)
- [ ] Build de producción sin errores: `npm run build` en `frontend/`
- [ ] No hay errores en consola del browser al cargar la página en Netlify
- [ ] Responsive: verificado en mobile (390px) y desktop (1280px)
- [ ] Modo claro/oscuro funciona sin romper layout
- [ ] `getProductImage()` maneja correctamente productos sin nombre conocido (fallback por categoría)

## 7. Base de datos
- [ ] Si el PR agrega tablas, el SQL está en `docs/sql/` con nombre secuencial (`00X_descripcion.sql`)
- [ ] El SQL usa `IF NOT EXISTS` para ser idempotente
- [ ] Las foreign keys tienen `ON DELETE` definido explícitamente
- [ ] No se modifica data de producción en Supabase sin respaldo previo

## 8. Definition of Done
- [ ] Todos los test cases del ticket fueron ejecutados
- [ ] No hay bugs Blocker/Critical abiertos relacionados a esta historia
- [ ] El otro QA (Agustina) revisó los tests antes de mergear
- [ ] Bugs de baja prioridad documentados en Jira con severidad y justificación
- [ ] CONTEXT.md actualizado con los cambios del PR

---

**Nota sobre deudas técnicas conocidas (no bloquean el merge):**
- ESLint no instalado en backend
- Imágenes de productos usan Unsplash (sin garantía) — migrar a Supabase Storage
- Tests E2E solo corren en Chromium — pendiente Firefox y mobile
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options) no configurados en Netlify

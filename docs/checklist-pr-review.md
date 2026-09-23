# Checklist de PR Review — NovaMarket-PYME
**QA Automation:** Christian Santibáñez · Basado en `TEST_PLAN.md` v1.0.5 y `criterios-aceptacion-datos-prueba.md` (SCRUM-14)

> Copiar y pegar como comentario en cada Pull Request antes de aprobar merge a `develop`.

---

## 1. Cobertura de tests
- [ ] El PR incluye tests para el código nuevo/modificado (Unit, API o E2E según el módulo — ver matriz de la sección 1.3 de `TEST_PLAN.md`)
- [ ] La cobertura no baja del **80%** en los módulos afectados (`coverageThreshold` en `jest.config.json`)
- [ ] Si el módulo es Auth, Catálogo, Carrito o Checkout (prioridad **Crítica/Alta**), tiene tests en al menos 2 capas de la pirámide (Unit + API, o API + E2E)
- [ ] No se agregó código de negocio nuevo sin al menos un test asociado

## 2. Criterios de aceptación
- [ ] El PR cumple los criterios de aceptación definidos para su ticket en `criterios-aceptacion-datos-prueba.md`
- [ ] Si el ticket es SCRUM-3, SCRUM-4 o SCRUM-7 (marcados como "sin descripción cargada" en el documento), confirmar con Jira antes de dar por válido el criterio — **no asumir**
- [ ] Los criterios verificados usan lenguaje medible (status HTTP, estructura de payload, comportamiento observable), no "funciona bien"

## 3. Datos de prueba / Fixtures
- [ ] Si el PR toca Auth, usa los fixtures oficiales (`test.user@novamarket.com`, `admin@novamarket.com`) y **no** credenciales o emails reales del equipo
- [ ] Ningún test hardcodea password/token — se leen de `process.env` o de `tests/api/fixtures/`
- [ ] Si el PR toca Catálogo/Productos, valida contra los 10 productos semilla (3 categorías: Accesorios, Periféricos, Gadgets) y contempla el caso `imageUrl` vacío (placeholder, TC018)
- [ ] Si el PR toca Órdenes, contempla los 3 casos: payload válido, producto inexistente (404), carrito vacío (400)

## 4. CI/CD (GitHub Actions)
- [ ] El pipeline completo pasa en verde: `lint` → `unit-and-api-tests` *(el job `e2e-tests` está deshabilitado — ver nota abajo)*
- [ ] `npm run lint` y `type-check` sin errores *(⚠️ estos scripts aún no existen en `package.json` — los pasos están comentados en `ci.yml` hasta que se instale ESLint)*
- [ ] Si el job de tests de integración usa DB de test, no apunta a la base de desarrollo compartida (schema aislado / pg-mem — **verificar cuál se acordó finalmente con Backend**, según nota pendiente en el doc)
- [ ] No se agregaron secretos ni URLs de conexión directamente en `.yml` (deben ir en GitHub Secrets)

> ⚠️ **Estado actual del pipeline (`.github/workflows/ci.yml`):**
> - Job `lint`: activo pero sin pasos reales de ESLint/type-check todavía (solo valida instalación de dependencias).
> - Job `unit-and-api-tests`: activo — corre `npm run test:coverage`.
> - Job `e2e-tests`: **comentado** — se activa cuando el frontend esté disponible en `/client`, exista `npm run db:seed:test` y se resuelva la estrategia de DB.
> - Scripts faltantes en `package.json`: `lint` y `type-check`.

## 5. Seguridad (Política Zero-Trace, sección 5.3)
- [ ] `.env` no está en el commit (`git status | grep ".env"` limpio)
- [ ] Sin credenciales/tokens/API keys hardcodeadas: `git diff --cached | grep -i "password\|secret\|token\|api_key"` sin resultados fuera de `process.env`/`secrets.`
- [ ] Endpoints protegidos devuelven 401 sin token y 403 con rol incorrecto (ver ejemplos TC007/TC037/TC038)
- [ ] Si el PR toca JWT, valida que el rol (`user`/`admin`) va en el payload y se verifica en el middleware, no solo en el frontend
- [ ] No se expone información sensible en mensajes de error (ej. no distinguir "email no existe" vs "password incorrecta" en login)

## 6. Alcance del QA (recordatorio para mí mismo)
- [ ] Reporté hallazgos como comentario en el PR o bug en Jira — **no corregí código de otro directamente**
- [ ] Si encontré un Blocker o Critical, escalé según la sección 5.5 (Discord/Slack + Jira, no solo un comentario en el PR)

## 7. Definition of Done (sección 5.4 del Test Plan)
- [ ] Todos los test cases del ticket fueron ejecutados
- [ ] No hay bugs Blocker/Critical abiertos relacionados a esta historia
- [ ] El otro QA (Agustina) revisó el código de test antes de mergear (peer review)
- [ ] Bugs de baja prioridad quedaron documentados en el tracker con severidad y justificación

---

**Nota:** los puntos marcados como pendientes en el documento oficial (estrategia de aislamiento de DB para tests, descripciones faltantes de SCRUM-3/4/7, herramienta TMS aún sin elegir) no tienen criterio verificable todavía — si un PR depende de una de esas decisiones, señalarlo explícitamente en el comentario en vez de asumir una respuesta.

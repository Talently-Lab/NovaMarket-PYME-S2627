# Contexto del Proyecto — NovaMarket PYME S2627

> Este archivo es para uso interno de Christian Santibáñez (QA).
> Sirve como punto de partida para sesiones nuevas de Kiro.
> Última actualización: 22/sep/2026

---

## El Proyecto

**NovaMarket** es una PYME que vende accesorios, periféricos y gadgets tecnológicos.
El objetivo es construir un e-commerce propio en 8 semanas bajo metodología Scrum.
Proyecto del curso Talently Lab — simulación laboral.

**Repo oficial:** https://github.com/Talently-Lab/NovaMarket-PYME-S2627
**Tablero Jira:** https://novamarket.atlassian.net/jira/software/projects/SCRUM/boards/1
**User Flow Figma:** https://app.xmind.com/share/mqkXAglu (mapa mental QA) · https://www.figma.com/board/7lQK5msLDnr4NnMkg8Og1B/NovaMarket---User-Flow

---

## Mi Rol

**Christian Rodrigo Santibáñez Martínez** — QA Tester
- Email: christiansanti.martinez@gmail.com
- Usuario Jira: christian.santibanez
- Ticket asignado: SCRUM-14 (Criterios de Aceptación y Datos de Prueba) — En revisión
- Co-QA: Agustina Fernandez Maidana (agustinafm2018@gmail.com) — SCRUM-9 (Mapa Mental)

---

## Equipo Actual

| Nombre | Rol | Estado |
|--------|-----|--------|
| Marcia Torre | Project Manager | Activa |
| Gisele Lorena Ortiz | PM / Coordinación | Activa |
| Laura Cuenca | Backend Developer (Node.js) | Activa — necesita apoyo con Git |
| María Emilia Orioni | Frontend Developer (React) | En el equipo pero sin actividad confirmada |
| Ismael Jensen | UX/UI Designer | Activo |
| Nicolás Toloza | UX/UI Designer | Activo |
| Lucía Chiarandini | Marketing | Activa |
| Agustina Fernandez Maidana | QA Tester | Activa |
| Christian Santibáñez | QA Tester | Activo |

**Nota:** Florencia Sombra (Backend) salió del proyecto el 22/sep/2026. Laura queda como única Backend.
Christian ayudará a Laura con Frontend y Backend cuando sea necesario.

---

## Stack Tecnológico

**Backend:** Node.js + Express 5 + PostgreSQL vía Supabase (librería `pg`)
**Frontend:** React 19 + Vite 8 + React Router 7 + Axios
**Auth:** JWT (pendiente de implementar)
**Deploy objetivo:** Backend en Render, Frontend en Vercel
**Testing:** Jest + Supertest + Playwright + pg-mem
**CI/CD:** GitHub Actions (`.github/workflows/ci.yml`)

---

## Estructura del Repo

```
NovaMarket-PYME-S2627/
├── backend/                    # Node.js + Express (Laura)
│   ├── src/
│   │   ├── config/db.js        # Pool PostgreSQL/Supabase con SSL automático
│   │   ├── controllers/        # Vacío — pendiente de implementar
│   │   ├── middlewares/        # Vacío — pendiente de implementar
│   │   ├── models/             # Vacío — pendiente de implementar
│   │   ├── routes/             # Vacío — pendiente de implementar
│   │   └── index.js            # Servidor Express con /api/health ✅
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite (Laura / a definir)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── tests/                      # Infraestructura QA (Christian)
│   ├── api/
│   │   ├── fixtures/users.fixture.ts
│   │   └── health.api.test.ts  # Smoke test ✅ pasando
│   ├── security/owasp/         # 5 archivos OWASP Top 10
│   ├── e2e/                    # Playwright — vacío, espera frontend
│   ├── unit/                   # Jest — vacío, espera backend
│   └── playwright.config.ts
├── docs/
│   ├── TEST_PLAN.md            # v1.0.7 — plan oficial de pruebas
│   ├── criterios-aceptacion-datos-prueba.md  # SCRUM-14
│   ├── checklist-pr-review.md # Checklist para revisar PRs
│   └── CONTEXT.md             # Este archivo
├── BRIEF.md                    # Brief del proyecto + User Flow
├── .github/workflows/ci.yml   # Pipeline GitHub Actions
├── jest.config.json
├── tsconfig.json
├── package.json                # Scripts de test en la raíz
└── update-repo.sh              # Script de sincronización diaria Git
```

---

## Estado de los Tests

```
Test Suites: 6 passed
Tests:       40 passed · 26 todo · 0 failed
```

| Suite | Estado |
|-------|--------|
| `tests/api/health.api.test.ts` | ✅ 1 test pasando |
| `tests/security/owasp/A01` | ✅ Pasando |
| `tests/security/owasp/A02` | ✅ Pasando |
| `tests/security/owasp/A05` | ✅ Pasando |
| `tests/security/owasp/A07` | ✅ Pasando (todos .todo — JWT no implementado) |
| `tests/security/owasp/A09` | ✅ Pasando |

---

## Estado del Backlog Jira (al 22/sep/2026)

| Ticket | Estado | Responsable |
|--------|--------|-------------|
| SCRUM-1 | ✅ Finalizado | Laura Cuenca |
| SCRUM-2 | ✅ Finalizado | Laura Cuenca |
| SCRUM-3 | 🟡 En curso | Sin asignar |
| SCRUM-4 | 🔵 Por hacer | Sin asignar |
| SCRUM-5 | ✅ Finalizado | Florencia (salió) |
| SCRUM-6 | ✅ Finalizado | Emilia Orioni |
| SCRUM-7 | 🟡 En curso | Emilia Orioni |
| SCRUM-8 | 🔵 Por hacer | Ismael / Nicolás |
| SCRUM-9 | 🟡 En revisión | Agustina |
| SCRUM-10 | 🔵 Por hacer | Ismael / Nicolás |
| SCRUM-11 | ✅ Finalizado | Lucía Chiarandini |
| SCRUM-12 | 🔵 Por hacer | Lucía Chiarandini |
| SCRUM-13 | 🔵 Por hacer | Lucía Chiarandini |
| SCRUM-14 | 🟡 En revisión | Christian |

---

## Decisiones Técnicas Tomadas

1. **PostgreSQL vía Supabase** — confirmado. No MongoDB.
2. **pg-mem** — estrategia preferida para tests de integración aislados. Pendiente de confirmar con Laura.
3. **TC011, TC012b, TC016b excluidos del MVP v1.0** — búsqueda por texto, comparar productos y alternativas relacionadas no son parte del MVP. El proyecto de referencia analizado tampoco las implementó.
4. **`connectDB()` con `await`** — implementado en `backend/src/index.js` del nuevo repo. Solo se llama cuando el servidor arranca directamente, no cuando los tests lo importan.
5. **`x-powered-by` deshabilitado** — `app.disable('x-powered-by')` aplicado.
6. **Error handler global** — implementado en `backend/src/index.js`.

---

## Pendientes Técnicos

- [ ] Decidir estrategia de aislamiento de tests para Postgres con Laura (pg-mem vs schema Supabase separado)
- [ ] Completar descripción de SCRUM-3, SCRUM-4 y SCRUM-7 en Jira
- [ ] Revisión de Agustina del documento `criterios-aceptacion-datos-prueba.md` antes de cerrar SCRUM-14
- [ ] Instalar ESLint en el backend (el frontend ya lo tiene)
- [ ] Activar scripts `lint` y `type-check` en el pipeline de CI cuando estén listos
- [ ] Configurar secrets en GitHub del nuevo repo: `DATABASE_URL_TEST` y `JWT_SECRET_TEST`
- [ ] Cuando se abra el PR del frontend, ajustar `playwright.config.ts` con la URL real del frontend
- [ ] Cuando Laura suba más código de backend, actualizar la cobertura de los tests de seguridad OWASP (A07 en particular)

---

## MCPs Configurados

Archivo: `~/.kiro/settings/mcp.json`

- **Atlassian (Jira):** conectado a `novamarket.atlassian.net` con usuario `christiansanti.martinez@gmail.com`
- **Figma:** conectado con token personal (expira 29/sep/2026 — renovar en https://www.figma.com/settings)

---

## Repo Anterior (archivado)

El repo anterior `Talently-Lab/NovaMarket-PYME` fue creado por Florencia Sombra (quien salió del proyecto).
Ya no se usa. Todo el trabajo de QA fue migrado al repo actual el 22/sep/2026.
El repo viejo sigue en `/home/christian/Escritorio/NovaMarket-PYME` como referencia local.

---

## Cómo Arrancar una Sesión Nueva

```bash
# 1. Ir al repo
cd /home/christian/Escritorio/NovaMarket-PYME-S2627

# 2. Sincronizar con el remoto
./update-repo.sh

# 3. Verificar que los tests siguen verdes
npm test

# 4. Leer este archivo y el TEST_PLAN.md para contexto
```

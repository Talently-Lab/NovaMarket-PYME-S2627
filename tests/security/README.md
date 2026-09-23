# Tests de Seguridad — NovaMarket-PYME

## Alcance

Esta carpeta contiene pruebas de seguridad basadas en **OWASP Top 10** y **OWASP API Security Top 10**,
enfocadas en los endpoints reales del backend.

> **Nota importante:** Esta iniciativa es un **complemento** al módulo "Seguridad y Roles" definido
> en `docs/TEST_PLAN.md` (sección 2.2), que está liderado por Agustina Fernandez Maidana con
> Christian Santibáñez en apoyo. Los tests de esta carpeta NO reemplazan ni duplican ese módulo —
> cubren vulnerabilidades a nivel de infraestructura y protocolo HTTP que van más allá de los
> flujos funcionales de autenticación y roles.

---

## Framework

- **Runner:** Jest
- **HTTP client:** Supertest
- **Fixtures:** reutilizados desde `tests/api/fixtures/`
- **Stack del proyecto:** Node.js + Express 5 + PostgreSQL/Supabase + JWT (pendiente de implementar)

---

## Estado actual del backend

El backend se encuentra en estado inicial. A la fecha de creación de esta carpeta, el único endpoint
implementado es `GET /api/health`. Toda la lógica de autenticación, rutas protegidas, consultas SQL
y manejo de roles está pendiente de implementación por el equipo Backend.

---

## Estructura de archivos

```
tests/security/
├── README.md                          ← este archivo
└── owasp/
    ├── A01-broken-access-control.test.ts    ✅ activo (health check público + estructura de rutas futuras)
    ├── A02-cryptographic-failures.test.ts   ✅ activo (configuración TLS/HTTPS, headers de seguridad)
    ├── A05-security-misconfiguration.test.ts ✅ activo (CORS, headers HTTP, información expuesta)
    ├── A07-auth-failures.test.ts            ⏸️  esqueleto — activar cuando JWT esté implementado
    ├── A09-logging-monitoring.test.ts       ✅ activo (respuestas de error sin stack traces)
    └── PENDIENTES.md                        ← categorías sin endpoint real aún
```

---

## Cómo ejecutar

```bash
# Solo los tests de seguridad
npx jest --testPathPattern="tests/security"

# Con reporte de cobertura
npx jest --testPathPattern="tests/security" --coverage
```

---

## Categorías OWASP pendientes de activar

Ver `tests/security/owasp/PENDIENTES.md` para el detalle de qué falta implementar en el backend
antes de poder cubrir cada categoría.

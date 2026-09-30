/**
 * OWASP A01 — Broken Access Control
 * https://owasp.org/Top10/A01_2021-Broken_Access_Control/
 *
 * Estado: PARCIALMENTE activo.
 * - Tests activos: verifican que el health check es público (no requiere auth)
 *   y que rutas inexistentes devuelven 404 (no exponen información de rutas internas).
 * - Tests pendientes: rutas protegidas por JWT/rol — ver PENDIENTES.md
 *
 * Complemento al módulo "Seguridad y Roles" del TEST_PLAN.md (sección 2.2).
 */

import request from 'supertest';
const app = require('../../../backend/src/index');

describe('OWASP A01 — Broken Access Control', () => {

  // ── Rutas públicas ────────────────────────────────────────────────────────

  describe('Rutas públicas — acceso sin autenticación', () => {
    it('GET /api/health es accesible sin token (ruta pública esperada)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
    });
  });

  // ── Rutas inexistentes — no deben revelar información interna ─────────────

  describe('Rutas inexistentes — no deben exponer información del servidor', () => {
    const rutasInexistentes = [
      '/admin',
      '/api/admin',
      '/api/users',
      '/.env',
      '/config',
      '/src/index.js',
    ];

    rutasInexistentes.forEach((ruta) => {
      it(`${ruta} devuelve 404 (no expone rutas internas ni archivos sensibles)`, async () => {
        const res = await request(app).get(ruta);
        // Debe ser 404, nunca 200 ni 500 con stack trace
        expect(res.status).toBe(404);
        // La respuesta no debe contener rutas del sistema de archivos
        const body = JSON.stringify(res.body) + (res.text || '');
        expect(body).not.toMatch(/\/home\//);
        expect(body).not.toMatch(/node_modules/);
        expect(body).not.toMatch(/at Object\./); // stack trace
      });
    });
  });

  // ── Métodos HTTP no permitidos ────────────────────────────────────────────

  describe('Métodos HTTP no permitidos en /api/health', () => {
    const metodosNoPermitidos = ['POST', 'PUT', 'DELETE', 'PATCH'];

    metodosNoPermitidos.forEach((method) => {
      it(`${method} /api/health devuelve 404 o 405 (no 200 ni 500)`, async () => {
        const res = await (request(app) as any)[method.toLowerCase()]('/api/health');
        expect([404, 405]).toContain(res.status);
      });
    });
  });

  // ── Rutas admin protegidas ────────────────────────────────────────────────

  describe('Rutas admin — acceso sin token devuelve 401', () => {
    it('GET /api/products/admin/all sin token devuelve 401', async () => {
      const res = await request(app).get('/api/products/admin/all');
      expect(res.status).toBe(401);
    });

    it('POST /api/products/admin sin token devuelve 401', async () => {
      const res = await request(app).post('/api/products/admin').send({});
      expect(res.status).toBe(401);
    });

    it('PUT /api/products/admin/1 sin token devuelve 401', async () => {
      const res = await request(app).put('/api/products/admin/1').send({});
      expect(res.status).toBe(401);
    });

    it('DELETE /api/products/admin/1 sin token devuelve 401', async () => {
      const res = await request(app).delete('/api/products/admin/1');
      expect(res.status).toBe(401);
    });

    it('GET /api/auth/me sin token devuelve 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('GET /api/orders sin token devuelve 401', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('POST /api/orders sin token devuelve 401', async () => {
      const res = await request(app).post('/api/orders').send({});
      expect(res.status).toBe(401);
    });

    it('GET /api/orders/admin/all sin token devuelve 401', async () => {
      const res = await request(app).get('/api/orders/admin/all');
      expect(res.status).toBe(401);
    });  });

  // ── Pendientes (requieren DB conectada) ───────────────────────────────────
  //
  // it('GET /api/products/admin/all con token de usuario normal devuelve 403', ...)
  // it('DELETE /api/products/admin/:id con token de usuario normal devuelve 403', ...)
  // → Ver PENDIENTES.md sección A01
});

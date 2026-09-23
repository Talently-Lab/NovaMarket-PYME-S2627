/**
 * OWASP A09 — Security Logging and Monitoring Failures
 * https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/
 *
 * Verifica que el servidor no exponga información de debug en respuestas de error
 * y que los errores sean manejados de forma controlada (no unhandled rejections
 * que corten el proceso en producción).
 *
 * Nota: la verificación de que los eventos se LOGUEAN correctamente requiere
 * acceder a los logs del servidor (stdout/stderr), lo cual está fuera del alcance
 * de Supertest. Estos tests cubren la parte verificable desde el cliente HTTP.
 *
 * Complemento al módulo "Seguridad y Roles" del TEST_PLAN.md (sección 2.2).
 */

import request from 'supertest';
const app = require('../../../backend/src/index');

describe('OWASP A09 — Security Logging and Monitoring Failures', () => {

  // ── Las respuestas de error no exponen información interna ────────────────

  describe('Respuestas de error no exponen información de debug', () => {
    it('Una ruta 404 no incluye stack trace en la respuesta', async () => {
      const res = await request(app).get('/ruta-inexistente-' + Date.now());
      const body = JSON.stringify(res.body) + (res.text || '');

      expect(body).not.toMatch(/Error:/);
      expect(body).not.toMatch(/at\s+\w+\s*\(/); // línea de stack trace
      expect(body).not.toMatch(/node:internal/);
      expect(body).not.toMatch(/node_modules/);
    });

    it.todo('Body JSON inválido genera 400 sin exponer el parser interno — requiere error handler global en src/index.js (hallazgo pendiente de aplicar)');

    it('Content-Type incorrecto no produce error 500', async () => {
      const res = await request(app)
        .post('/api/health')
        .set('Content-Type', 'text/plain')
        .send('datos en texto plano');

      // Debe ser 404 (ruta no existe para POST) o 415, nunca 500
      expect(res.status).not.toBe(500);
    });
  });

  // ── El servidor no se cae ante inputs inesperados ─────────────────────────

  describe('El servidor maneja inputs extremos sin colapsar', () => {
    it('Un payload extremadamente grande devuelve 413 o 400, no 500', async () => {
      const payloadGrande = JSON.stringify({ data: 'A'.repeat(50 * 1024) }); // 50KB
      const res = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send(payloadGrande);

      // El servidor debe rechazarlo o ignorarlo, nunca colapsar
      expect(res.status).not.toBe(500);
    });

    it('Headers con valores muy largos no producen error 500', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('X-Custom-Header', 'A'.repeat(8192));

      expect(res.status).not.toBe(500);
    });

    it('Método HTTP inusual (TRACE) no produce error 500', async () => {
      const res = await request(app)
        .trace('/api/health' as any);

      // TRACE puede devolver 404 o 405, nunca 500 ni 200 (TRACE habilitado es una misconfiguration)
      expect(res.status).not.toBe(500);
      expect(res.status).not.toBe(200); // TRACE no debería estar habilitado
    });

    it('El servidor sigue respondiendo después de una petición malformada', async () => {
      // Petición malformada
      await request(app)
        .get('/api/health')
        .set('Content-Type', 'application/json')
        .send('{broken json');

      // El servidor debe seguir vivo
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // ── Pendientes ─────────────────────────────────────────────────────────────

  describe('Logging de eventos de seguridad [PENDIENTE]', () => {
    it.todo('Los intentos de login fallidos se registran en el log del servidor');
    it.todo('El acceso a rutas protegidas sin token genera un log de advertencia');
    it.todo('Los errores 500 se loguean con suficiente contexto para diagnóstico');
  });
});

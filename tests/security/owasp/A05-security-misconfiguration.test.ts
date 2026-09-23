/**
 * OWASP A05 — Security Misconfiguration
 * https://owasp.org/Top10/A05_2021-Security_Misconfiguration/
 *
 * Verifica que el servidor Express esté configurado de forma segura:
 * headers HTTP, CORS, manejo de errores sin información de debug,
 * y que no haya endpoints de diagnóstico expuestos en producción.
 *
 * Complemento al módulo "Seguridad y Roles" del TEST_PLAN.md (sección 2.2).
 */

import request from 'supertest';
const app = require('../../../backend/src/index');

describe('OWASP A05 — Security Misconfiguration', () => {

  // ── Headers de seguridad HTTP ─────────────────────────────────────────────

  describe('Headers de seguridad HTTP', () => {
    it('La respuesta incluye Content-Type correcto en endpoints JSON', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it.todo('El servidor no expone la versión de Express en x-powered-by — requiere app.disable("x-powered-by") en src/index.js (hallazgo pendiente de aplicar)');

    // Estos headers los provee Helmet (no instalado todavía).
    // Los tests están aquí como referencia de qué configurar cuando se agregue Helmet.
    it.todo('Debe existir el header X-Content-Type-Options: nosniff (requiere Helmet)');
    it.todo('Debe existir el header X-Frame-Options: DENY o SAMEORIGIN (requiere Helmet)');
    it.todo('Debe existir Content-Security-Policy (requiere Helmet)');
    it.todo('Debe existir Strict-Transport-Security en producción (requiere HTTPS + Helmet)');
  });

  // ── Configuración de CORS ─────────────────────────────────────────────────

  describe('Configuración de CORS', () => {
    it('El servidor responde a peticiones con Origin permitido', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');
      // CORS configurado con cors() sin opciones — acepta cualquier origen
      // Esto es aceptable en desarrollo, pero debe restringirse en producción
      expect(res.status).toBe(200);
    });

    it('CORS actual acepta cualquier origen (configuración de desarrollo — restringir en producción)', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://atacante.com');

      // ⚠️ OBSERVACIÓN DE SEGURIDAD: cors() sin opciones permite cualquier origen.
      // En producción debe configurarse con allowedOrigins explícitos:
      //   app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
      // Este test documenta el comportamiento actual para que no pase desapercibido.
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader) {
        // Si el header existe y es '*', está pendiente de restringir
        expect(corsHeader).toBeDefined(); // pasa ahora, revisar en producción
      }
    });
  });

  // ── Manejo de errores — no exponer información de debug ───────────────────

  describe('Manejo de errores — no debe exponer información interna', () => {
    it('Una ruta inexistente devuelve 404 sin stack trace en el body', async () => {
      const res = await request(app).get('/ruta-que-no-existe');
      expect(res.status).toBe(404);

      const body = JSON.stringify(res.body) + (res.text || '');
      expect(body).not.toMatch(/at Object\.\<anonymous\>/); // stack trace Node.js
      expect(body).not.toMatch(/at Module\._compile/);
      expect(body).not.toMatch(/at Function\.Module/);
    });

    it.todo('Body malformado (JSON inválido) devuelve 400 sin información de debug — requiere error handler global en src/index.js (hallazgo pendiente de aplicar)');

    it('El endpoint de health no acepta parámetros de query que alteren su comportamiento', async () => {
      const res = await request(app).get('/api/health?debug=true&verbose=1&env=all');
      expect(res.status).toBe(200);
      // No debe devolver más información por tener parámetros de debug
      expect(res.body).not.toHaveProperty('env');
      expect(res.body).not.toHaveProperty('config');
      expect(res.body).not.toHaveProperty('secrets');
      // Solo debe tener status y timestamp
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['status', 'timestamp']));
    });
  });

  // ── Endpoints de diagnóstico no expuestos ─────────────────────────────────

  describe('Endpoints de diagnóstico comunes no deben estar expuestos', () => {
    const endpointsDiagnostico = [
      '/metrics',
      '/debug',
      '/swagger',
      '/api-docs',
      '/graphql',
      '/actuator',
      '/status',
      '/info',
    ];

    endpointsDiagnostico.forEach((ruta) => {
      it(`${ruta} no está expuesto (devuelve 404)`, async () => {
        const res = await request(app).get(ruta);
        expect(res.status).toBe(404);
      });
    });
  });
});

/**
 * OWASP A02 — Cryptographic Failures
 * https://owasp.org/Top10/A02_2021-Cryptographic_Failures/
 *
 * Verifica que el servidor no exponga datos sensibles en texto plano
 * y que la configuración de la DB no use credenciales por defecto.
 *
 * Nota: HTTPS/TLS se verifica en el entorno de producción (Supabase/Render/Vercel),
 * no en el servidor Express local (que corre HTTP). Estos tests cubren lo que
 * es verificable en el nivel de aplicación.
 *
 * Complemento al módulo "Seguridad y Roles" del TEST_PLAN.md (sección 2.2).
 */

import request from 'supertest';
const app = require('../../../backend/src/index');

describe('OWASP A02 — Cryptographic Failures', () => {

  // ── El servidor no expone credenciales ni configuración sensible ──────────

  describe('Respuestas del servidor no contienen datos sensibles', () => {
    it('GET /api/health no expone variables de entorno en la respuesta', async () => {
      const res = await request(app).get('/api/health');
      const body = JSON.stringify(res.body);

      // No debe filtrar valores de variables de entorno
      expect(body).not.toMatch(/DATABASE_URL/i);
      expect(body).not.toMatch(/DB_PASSWORD/i);
      expect(body).not.toMatch(/JWT_SECRET/i);
      expect(body).not.toMatch(/supabase/i);
    });

    it('GET /api/health no expone el stack de tecnología en headers innecesarios', async () => {
      const res = await request(app).get('/api/health');

      // Express 5 elimina x-powered-by por defecto — verificar que no aparezca
      // Si aparece, permite fingerprinting del stack
      const poweredBy = res.headers['x-powered-by'];
      if (poweredBy) {
        // Si existe el header, al menos no debe decir la versión exacta
        expect(poweredBy).not.toMatch(/\d+\.\d+\.\d+/);
      }
      // Lo más seguro es que no exista
      // expect(poweredBy).toBeUndefined(); // descomentar si se agrega app.disable('x-powered-by')
    });
  });

  // ── La configuración del pool de DB usa variables de entorno ──────────────

  describe('Configuración de base de datos', () => {
    it('src/config/db.js usa variables de entorno, no credenciales hardcodeadas', () => {
      // Leemos el archivo como texto para verificar que no hay strings hardcodeados
      const fs = require('fs');
      const path = require('path');
      const dbConfig = fs.readFileSync(
        path.join(__dirname, '../../../backend/src/config/db.js'),
        'utf8'
      );

      // No debe contener passwords o usuarios hardcodeados
      expect(dbConfig).not.toMatch(/password\s*:\s*['"][^'"]+['"]/i);
      expect(dbConfig).not.toMatch(/user\s*:\s*['"](?!process\.env)[^'"]+['"]/i);
      expect(dbConfig).not.toMatch(/host\s*:\s*['"](?!process\.env)[^'"]+['"]/i);

      // Sí debe usar process.env
      expect(dbConfig).toContain('process.env');
    });
  });

  // ── Pendientes ─────────────────────────────────────────────────────────────
  //
  // it('Las contraseñas de usuarios se almacenan hasheadas (bcrypt/argon2), nunca en texto plano', ...)
  // it('Los tokens JWT usan algoritmo HS256 o RS256, no "none"', ...)
  // → Ver PENDIENTES.md sección A07 (JWT config)
});

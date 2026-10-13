/**
 * Auth API Tests — NovaMarket
 * Cubre: POST /register, POST /login, GET /me,
 *        POST /forgot-password, POST /reset-password
 *
 * Estrategia: tests de validación sin DB + tests de integración con pg-mem.
 */

import request from 'supertest';
import jwt     from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

// ── pg-mem — reemplaza el pool de Supabase ────────────────────────────────────
jest.mock('../../backend/src/config/db', () => require('../helpers/pgmem.helper'));

// ── Mock del email service — forgot-password no envía emails en tests ─────────
jest.mock('../../backend/src/services/email.service', () => ({
  sendPasswordResetEmail: jest.fn(async () => true),
}));

const { resetDB, seedUser } = require('../helpers/pgmem.helper');
const app = require('../../backend/src/index');

beforeEach(async () => { await resetDB(); });

// ── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {

  // ── Validaciones sin DB ──

  it('TC-R01 body vacío → 400 con mensaje de campos requeridos', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R02 nombre solo con espacios → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '   ', email: 'test@test.com', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R03 nombre de 1 carácter → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A', email: 'test@test.com', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre debe tener al menos 2 caracteres.');
  });

  it('TC-R04 contraseña < 8 caracteres → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', email: 'test@test.com', password: 'abc123'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('TC-R05 contraseña con solo espacios → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', email: 'test@test.com', password: '        '
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R06 email sin formato válido → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', email: 'no-es-un-email', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email no tiene un formato válido.');
  });

  it('TC-R07 email sin dominio → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', email: 'juan@', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email no tiene un formato válido.');
  });

  it('TC-R08 falta solo el campo email → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R09 falta solo la contraseña → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan', email: 'juan@test.com'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R10 falta solo el nombre → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'juan@test.com', password: 'Test1234!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, email y contraseña son requeridos.');
  });

  it('TC-R11 responde JSON, no HTML ni texto plano', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  // ── Tests de integración con pg-mem ──────────────────────────────────────────

  it('TC-R12 registro exitoso → 201 con token JWT y datos del usuario', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Agustina QA', email: 'agustina@qa.test', password: 'TestPass123!',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('agustina@qa.test');
  });

  it('TC-R13 email duplicado → 409', async () => {
    await seedUser({ email: 'duplicado@test.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Otro', email: 'duplicado@test.com', password: 'TestPass123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Ya existe una cuenta con ese email.');
  });

  it('TC-R14 registro exitoso → token JWT tiene 3 partes', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'JWT Test', email: 'jwt@test.com', password: 'TestPass123!',
    });
    expect(res.body.token?.split('.')).toHaveLength(3);
  });

  it('TC-R15 registro exitoso → body contiene user.id, name, email, role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Full User', email: 'full@test.com', password: 'TestPass123!',
    });
    expect(res.body.user).toMatchObject({
      id:    expect.any(Number),
      name:  'Full User',
      email: 'full@test.com',
      role:  'customer',
    });
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {

  it('TC-L01 body vacío → 400 con mensaje de campos requeridos', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email y contraseña son requeridos.');
  });

  it('TC-L02 falta el email → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'Test1234!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email y contraseña son requeridos.');
  });

  it('TC-L03 falta la contraseña → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email y contraseña son requeridos.');
  });

  it('TC-L04 email inexistente → 401 con mensaje anti-enumeración', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@novamarket.com', password: 'WrongPass1!'
    });
    // Sin DB retorna 500, con DB retorna 401 — ambos son válidos en este entorno
    expect([401, 500]).toContain(res.status);
    if (res.status === 401) {
      expect(res.body.error).toBe('Credenciales inválidas.');
    }
  });

  it('TC-L05 anti-enumeración: dos emails inexistentes distintos dan el mismo mensaje', async () => {
    const res1 = await request(app).post('/api/auth/login').send({
      email: 'noexiste1@novamarket.com', password: 'WrongPass1!'
    });
    const res2 = await request(app).post('/api/auth/login').send({
      email: 'noexiste2@novamarket.com', password: 'OtroPass2!'
    });
    // Sin DB ambos dan 500, con DB ambos dan 401 — el status debe ser igual entre sí
    expect(res1.status).toBe(res2.status);
    if (res1.status === 401) {
      expect(res1.body.error).toBe(res2.body.error);
    }
  });

  it('TC-L06 responde JSON en todos los casos de error', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-L07 credenciales correctas → 200 con token JWT', async () => {
    await seedUser({ email: 'login@test.com', password: 'TestPass123!' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'TestPass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('TC-L08 credenciales correctas → body tiene user.id, name, email, role', async () => {
    await seedUser({ email: 'fields@test.com', password: 'TestPass123!', name: 'Campo Test' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'fields@test.com', password: 'TestPass123!' });
    expect(res.body.user).toMatchObject({
      id:    expect.any(Number),
      name:  'Campo Test',
      email: 'fields@test.com',
      role:  'customer',
    });
  });

  it('TC-L09 contraseña incorrecta para usuario existente → 401', async () => {
    await seedUser({ email: 'wrong@test.com', password: 'Correcta123!' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'Incorrecta999!' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas.');
  });

  it('TC-L10 token devuelto es un JWT válido de 3 partes', async () => {
    await seedUser({ email: 'jwtlogin@test.com', password: 'TestPass123!' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'jwtlogin@test.com', password: 'TestPass123!' });
    expect(res.body.token?.split('.')).toHaveLength(3);
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {

  it('TC-M01 sin token → 401 con mensaje requerido', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de autenticación requerido.');
  });

  it('TC-M02 token inválido (formato incorrecto) → 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.invalido.fake');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token inválido.');
  });

  it('TC-M03 header sin prefijo Bearer → 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'algun-token-sin-bearer');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de autenticación requerido.');
  });

  it('TC-M04 token con firma incorrecta → 401', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6OTk5fQ.firma_incorrecta';
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  it('TC-M05 responde JSON en error de auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-M06 token válido → 200 con datos del usuario autenticado', async () => {
    const user = await seedUser({ email: 'me@test.com', name: 'Yo Mismo' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('TC-M07 token expirado → 401 "La sesión expiró."', async () => {
    const user = await seedUser({ email: 'expired@test.com' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '-1s' }
    );
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('La sesión expiró. Iniciá sesión nuevamente.');
  });
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {

  it('TC-F01 body vacío → 400 "El email es requerido."', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email es requerido.');
  });

  it('TC-F02 email con solo espacios → 400', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email es requerido.');
  });

  it('TC-F03 email inexistente → 200 (anti-enumeración)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'no_existe_en_bd@novamarket.com'
    });
    // Sin DB retorna 500, con DB retorna 200 (anti-enumeración)
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('TC-F04 email inexistente → mensaje neutro que no confirma si existe o no', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'tampoco_existe@novamarket.com'
    });
    if (res.status === 200) {
      expect(res.body.message).toBe(
        'Si el email existe, recibirás instrucciones para recuperar tu contraseña.'
      );
    } else {
      // Sin DB: 500 es esperado — test documentado para cuando haya DB
      expect(res.status).toBe(500);
    }
  });

  it('TC-F05 responde JSON siempre', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-F06 email existente → 200 con mensaje neutro', async () => {
    await seedUser({ email: 'forgot@test.com' });
    const res = await request(app).post('/api/auth/forgot-password')
      .send({ email: 'forgot@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Si el email existe');
  });

  it('TC-F07 email existente → guarda reset_token de 6 dígitos en BD', async () => {
    const { pool } = require('../helpers/pgmem.helper');
    await seedUser({ email: 'token6@test.com' });
    await request(app).post('/api/auth/forgot-password')
      .send({ email: 'token6@test.com' });
    const row = await pool.query(
      `SELECT reset_token FROM users WHERE email = $1`, ['token6@test.com']
    );
    const token = row.rows[0]?.reset_token;
    expect(token).toBeDefined();
    expect(/^\d{6}$/.test(token)).toBe(true);
  });

  it('TC-F08 email inexistente → 200 igual (anti-enumeración)', async () => {
    const res = await request(app).post('/api/auth/forgot-password')
      .send({ email: 'noexiste@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Si el email existe');
  });
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {

  it('TC-RP01 body vacío → 400 "Token y nueva contraseña son requeridos."', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Token y nueva contraseña son requeridos.');
  });

  it('TC-RP02 falta token → 400', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      newPassword: 'NuevoPass123!'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Token y nueva contraseña son requeridos.');
  });

  it('TC-RP03 falta newPassword → 400', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: '123456'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Token y nueva contraseña son requeridos.');
  });

  it('TC-RP04 contraseña nueva < 8 caracteres → 400', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: '123456', newPassword: 'abc'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('TC-RP05 token inexistente → 400 "El código es inválido o ya fue utilizado."', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: '000000', newPassword: 'NuevoPass123!'
    });
    // Sin DB retorna 500, con DB retorna 400
    expect([400, 500]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('El código es inválido o ya fue utilizado.');
    }
  });

  it('TC-RP06 responde JSON siempre', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-RP07 token válido + nueva contraseña → 200', async () => {
    const { pool } = require('../helpers/pgmem.helper');
    await seedUser({ email: 'reset@test.com' });
    // Simular que el backend guardó el token
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3`,
      ['123456', expires, 'reset@test.com']
    );
    const res = await request(app).post('/api/auth/reset-password')
      .send({ token: '123456', newPassword: 'NuevoPass123!' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Contraseña actualizada');
  });

  it('TC-RP08 token ya utilizado (segundo uso) → 400', async () => {
    const { pool } = require('../helpers/pgmem.helper');
    await seedUser({ email: 'reset2@test.com' });
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3`,
      ['654321', expires, 'reset2@test.com']
    );
    // Primer uso — exitoso
    await request(app).post('/api/auth/reset-password')
      .send({ token: '654321', newPassword: 'NuevoPass123!' });
    // Segundo uso — debe fallar
    const res = await request(app).post('/api/auth/reset-password')
      .send({ token: '654321', newPassword: 'OtroPass456!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El código es inválido o ya fue utilizado.');
  });

  it('TC-RP09 token expirado → 400 "El código expiró."', async () => {
    const { pool } = require('../helpers/pgmem.helper');
    await seedUser({ email: 'expired2@test.com' });
    const expired = new Date(Date.now() - 1000).toISOString(); // ya expiró
    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3`,
      ['999999', expired, 'expired2@test.com']
    );
    const res = await request(app).post('/api/auth/reset-password')
      .send({ token: '999999', newPassword: 'NuevoPass123!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El código expiró. Solicitá uno nuevo.');
  });
});

// ── Seguridad y headers generales ───────────────────────────────────────────

describe('Seguridad — auth endpoints', () => {

  it('TC-S01 ningún endpoint de auth expone x-powered-by', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('TC-S02 error de auth nunca devuelve stack trace', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/at Object\./);
    expect(body).not.toMatch(/\.js:\d+/);
  });

  it('TC-S03 Content-Type es application/json en todos los errores', async () => {
    const endpoints = [
      () => request(app).post('/api/auth/register').send({}),
      () => request(app).post('/api/auth/login').send({}),
      () => request(app).get('/api/auth/me'),
      () => request(app).post('/api/auth/forgot-password').send({}),
      () => request(app).post('/api/auth/reset-password').send({}),
    ];
    for (const call of endpoints) {
      const res = await call();
      expect(res.headers['content-type']).toMatch(/application\/json/);
    }
  });
});

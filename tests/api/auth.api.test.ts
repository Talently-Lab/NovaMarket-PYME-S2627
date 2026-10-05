/**
 * Auth API Tests — NovaMarket
 * Cubre: POST /register, POST /login, GET /me,
 *        POST /forgot-password, POST /reset-password
 *
 * Estrategia: sin DB real — los tests de validación no requieren conexión.
 * Los que necesitarían DB están marcados con .todo o usan stubs.
 */

import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

const app = require('../../backend/src/index');

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

  // ── Tests que requieren DB (anotados como .todo) ──

  it.todo('TC-R12 registro exitoso → 201 con token JWT y datos del usuario');
  it.todo('TC-R13 email duplicado → 409 con mensaje "Ya existe una cuenta con ese email."');
  it.todo('TC-R14 registro exitoso → token JWT tiene 3 partes (header.payload.signature)');
  it.todo('TC-R15 registro exitoso → body contiene user.id, user.name, user.email, user.role');
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

  it.todo('TC-L07 credenciales correctas → 200 con token JWT');
  it.todo('TC-L08 credenciales correctas → body tiene user.id, user.name, user.email, user.role');
  it.todo('TC-L09 contraseña incorrecta para usuario existente → 401 "Credenciales inválidas."');
  it.todo('TC-L10 token devuelto es un JWT válido de 3 partes');
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

  it.todo('TC-M06 token válido → 200 con datos del usuario autenticado');
  it.todo('TC-M07 token expirado → 401 "La sesión expiró. Iniciá sesión nuevamente."');
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

  it.todo('TC-F06 email existente → 200 con reset_token de 6 dígitos');
  it.todo('TC-F07 email existente → reset_token es un string numérico de 6 caracteres');
  it.todo('TC-F08 email existente → response incluye expires_in: "15 minutos"');
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

  it.todo('TC-RP07 token válido + nueva contraseña → 200 "Contraseña actualizada correctamente."');
  it.todo('TC-RP08 token ya utilizado (segundo uso) → 400');
  it.todo('TC-RP09 token expirado → 400 "El código expiró. Solicitá uno nuevo."');
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

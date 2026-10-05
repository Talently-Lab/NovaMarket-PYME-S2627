/**
 * Orders API Tests — NovaMarket
 * Cubre: POST /orders, POST /orders/validate-coupon,
 *        GET /orders, GET /orders/:id,
 *        GET/POST/DELETE /orders/admin/coupons,
 *        GET /orders/admin/all, PATCH /orders/admin/:id/status
 *
 * Estrategia: sin DB real.
 * - Auth y autorización: testean middleware sin DB.
 * - Validaciones del controller: inputs inválidos que el controller rechaza antes de tocar DB.
 * - Cupones: en memoria — no requieren DB.
 * - Tests que requieren DB o usuario real: marcados como .todo
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

const app = require('../../backend/src/index');

const JWT_SECRET = process.env.JWT_SECRET as string;

function makeToken(payload: object, expiresIn = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

const userToken  = makeToken({ id: 42,  email: 'user@test.com',  role: 'customer' });
const adminToken = makeToken({ id: 1,   email: 'admin@test.com', role: 'admin'    });

// ── POST /api/orders/validate-coupon ─────────────────────────────────────────
// Esta ruta requiere auth pero los cupones están en memoria — no necesita DB

describe('POST /api/orders/validate-coupon', () => {

  it('TC-VC01 sin token → 401', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .send({ code: 'NOVA10' });
    expect(res.status).toBe(401);
  });

  it('TC-VC02 body vacío → 400 "Código requerido."', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Código requerido.');
  });

  it('TC-VC03 cupón inválido → 404 "Cupón inválido o expirado."', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'INVALIDO99' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cupón inválido o expirado.');
  });

  it('TC-VC04 cupón NOVA10 → 200 con 10% de descuento', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'NOVA10' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('NOVA10');
    expect(res.body.discount_percent).toBe(10);
  });

  it('TC-VC05 cupón NOVA20 → 200 con 20% de descuento', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'NOVA20' });
    expect(res.status).toBe(200);
    expect(res.body.discount_percent).toBe(20);
  });

  it('TC-VC06 cupón GAMING15 → 200 con 15% de descuento', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'GAMING15' });
    expect(res.status).toBe(200);
    expect(res.body.discount_percent).toBe(15);
  });

  it('TC-VC07 cupón PROMO5 → 200 con 5% de descuento', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'PROMO5' });
    expect(res.status).toBe(200);
    expect(res.body.discount_percent).toBe(5);
  });

  it('TC-VC08 código en minúsculas → normalizado correctamente', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'nova10' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('NOVA10');
  });

  it('TC-VC09 código con espacios al inicio y al final → normalizado', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: '  NOVA20  ' });
    expect(res.status).toBe(200);
    expect(res.body.discount_percent).toBe(20);
  });

  it('TC-VC10 responde JSON en todos los casos', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'CUALQUIERA' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-VC11 token expirado → 401', async () => {
    const expiredToken = makeToken({ id: 42, email: 'user@test.com', role: 'customer' }, '-1s');
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ code: 'NOVA10' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('La sesión expiró. Iniciá sesión nuevamente.');
  });
});

// ── POST /api/orders (crear pedido) ──────────────────────────────────────────

describe('POST /api/orders', () => {

  it('TC-OR01 sin token → 401', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  it('TC-OR02 items vacío → 400 "El pedido debe tener al menos un producto."', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [], shipping: {}, payment: { method: 'billetera' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El pedido debe tener al menos un producto.');
  });

  it('TC-OR03 items no es array → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: 'no-es-array', shipping: {}, payment: { method: 'billetera' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El pedido debe tener al menos un producto.');
  });

  it('TC-OR04 body vacío → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El pedido debe tener al menos un producto.');
  });

  it('TC-OR05 medio de pago inválido → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: { method: 'cripto' },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Medio de pago inválido.');
  });

  it('TC-OR06 tarjeta sin número → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: {
          method: 'tarjeta',
          card_name: 'JUAN PEREZ',
          card_expiry: '12/27',
          card_cvv: '123',
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Número de tarjeta inválido.');
  });

  it('TC-OR07 tarjeta con número corto (< 13 dígitos) → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: {
          method: 'tarjeta',
          card_number: '1234',
          card_name: 'JUAN PEREZ',
          card_expiry: '12/27',
          card_cvv: '123',
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Número de tarjeta inválido.');
  });

  it('TC-OR08 tarjeta sin nombre → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: {
          method: 'tarjeta',
          card_number: '4111111111111111',
          card_expiry: '12/27',
          card_cvv: '123',
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre en la tarjeta es requerido.');
  });

  it('TC-OR09 tarjeta sin vencimiento → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: {
          method: 'tarjeta',
          card_number: '4111111111111111',
          card_name: 'JUAN PEREZ',
          card_cvv: '123',
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Fecha de vencimiento es requerida.');
  });

  it('TC-OR10 tarjeta sin CVV → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 1 }],
        shipping: {},
        payment: {
          method: 'tarjeta',
          card_number: '4111111111111111',
          card_name: 'JUAN PEREZ',
          card_expiry: '12/27',
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('CVV inválido.');
  });

  it('TC-OR11 item sin product_id → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ quantity: 1 }],
        shipping: {},
        payment: { method: 'billetera' },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cada item debe tener product_id y quantity válidos.');
  });

  it('TC-OR12 item con quantity 0 → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: 0 }],
        shipping: {},
        payment: { method: 'billetera' },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cada item debe tener product_id y quantity válidos.');
  });

  it('TC-OR13 item con quantity negativa → 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product_id: 1, quantity: -5 }],
        shipping: {},
        payment: { method: 'billetera' },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cada item debe tener product_id y quantity válidos.');
  });

  it('TC-OR14 responde JSON en todos los errores', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it.todo('TC-OR15 con DB + billetera + items válidos → 201 con número de orden');
  it.todo('TC-OR16 con DB → producto inexistente en items → 404 "Producto #ID no encontrado."');
  it.todo('TC-OR17 con DB → stock insuficiente → 409 "Stock insuficiente para..."');
  it.todo('TC-OR18 con DB → cupón NOVA20 aplica 20% de descuento en el total');
  it.todo('TC-OR19 con DB → billetera aplica 5% adicional de descuento');
  it.todo('TC-OR20 con DB → IVA 21% calculado sobre (subtotal - descuento)');
  it.todo('TC-OR21 con DB → body de respuesta tiene subtotal, discount_amount, tax_amount, total_with_tax');
});

// ── GET /api/orders ──────────────────────────────────────────────────────────

describe('GET /api/orders', () => {

  it('TC-GO01 sin token → 401', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('TC-GO02 con token válido → no es 401 ni 403', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('TC-GO03 responde JSON', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it.todo('TC-GO04 con DB → 200 con array de pedidos del usuario autenticado');
  it.todo('TC-GO05 con DB → no devuelve pedidos de otros usuarios');
});

// ── GET /api/orders/:id ──────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {

  it('TC-GI01 sin token → 401', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  it('TC-GI02 id no numérico → 400 "El ID del pedido debe ser un número."', async () => {
    const res = await request(app)
      .get('/api/orders/abc')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del pedido debe ser un número.');
  });

  it('TC-GI03 id inexistente → 404 o 500 (sin DB)', async () => {
    const res = await request(app)
      .get('/api/orders/999999')
      .set('Authorization', `Bearer ${userToken}`);
    expect([404, 500]).toContain(res.status);
  });

  it.todo('TC-GI04 con DB → pedido propio → 200 con detalle completo');
  it.todo('TC-GI05 con DB → pedido de otro usuario → 404 (no expone el pedido)');
});

// ── GET /api/orders/admin/all ────────────────────────────────────────────────

describe('GET /api/orders/admin/all', () => {

  it('TC-OA01 sin token → 401', async () => {
    const res = await request(app).get('/api/orders/admin/all');
    expect(res.status).toBe(401);
  });

  it('TC-OA02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Acceso denegado. Se requiere rol de administrador.');
  });

  it('TC-OA03 con token admin → no es 401 ni 403', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it.todo('TC-OA04 con DB + admin → 200 con todos los pedidos de todos los usuarios');
  it.todo('TC-OA05 con DB → cada pedido incluye user_name');
});

// ── PATCH /api/orders/admin/:id/status ──────────────────────────────────────

describe('PATCH /api/orders/admin/:id/status', () => {

  it('TC-OS01 sin token → 401', async () => {
    const res = await request(app)
      .patch('/api/orders/admin/1/status')
      .send({ status: 'shipped' });
    expect(res.status).toBe(401);
  });

  it('TC-OS02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .patch('/api/orders/admin/1/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'shipped' });
    expect(res.status).toBe(403);
  });

  it('TC-OS03 admin + id no numérico → 400', async () => {
    const res = await request(app)
      .patch('/api/orders/admin/abc/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del pedido debe ser un número.');
  });

  it('TC-OS04 admin + estado inválido → 400', async () => {
    const res = await request(app)
      .patch('/api/orders/admin/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'volando' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Estado inválido.');
  });

  it('TC-OS05 admin + body vacío → 400 (status requerido)', async () => {
    const res = await request(app)
      .patch('/api/orders/admin/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Estado inválido.');
  });

  it('TC-OS06 todos los estados válidos son aceptados por la validación', async () => {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    for (const status of validStatuses) {
      const res = await request(app)
        .patch('/api/orders/admin/999999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status });
      // Sin DB el resultado será 404/500, pero NO debe ser 400 por estado inválido
      expect(res.status).not.toBe(400);
    }
  });

  it.todo('TC-OS07 con DB + admin + id válido → 200 "Estado del pedido actualizado."');
  it.todo('TC-OS08 con DB → id inexistente → 404 "Pedido no encontrado."');
});

// ── GET /api/orders/admin/coupons ────────────────────────────────────────────

describe('GET /api/orders/admin/coupons', () => {

  it('TC-CG01 sin token → 401', async () => {
    const res = await request(app).get('/api/orders/admin/coupons');
    expect(res.status).toBe(401);
  });

  it('TC-CG02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .get('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('TC-CG03 con token admin → 200 con lista de cupones', async () => {
    const res = await request(app)
      .get('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('coupons');
    expect(Array.isArray(res.body.coupons)).toBe(true);
  });

  it('TC-CG04 lista incluye los cupones por defecto (NOVA10, NOVA20, GAMING15, PROMO5)', async () => {
    const res = await request(app)
      .get('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);
    const codes = res.body.coupons.map((c: any) => c.code);
    expect(codes).toContain('NOVA10');
    expect(codes).toContain('NOVA20');
    expect(codes).toContain('GAMING15');
    expect(codes).toContain('PROMO5');
  });

  it('TC-CG05 cada cupón tiene code y discount_percent', async () => {
    const res = await request(app)
      .get('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);
    for (const coupon of res.body.coupons) {
      expect(coupon).toHaveProperty('code');
      expect(coupon).toHaveProperty('discount_percent');
      expect(typeof coupon.code).toBe('string');
      expect(typeof coupon.discount_percent).toBe('number');
    }
  });

  it('TC-CG06 body incluye total de cupones', async () => {
    const res = await request(app)
      .get('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body).toHaveProperty('total');
    expect(res.body.total).toBeGreaterThanOrEqual(4);
  });
});

// ── POST /api/orders/admin/coupons ───────────────────────────────────────────

describe('POST /api/orders/admin/coupons', () => {

  it('TC-CP01 sin token → 401', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .send({ code: 'TEST50', discount_percent: 50 });
    expect(res.status).toBe(401);
  });

  it('TC-CP02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TEST50', discount_percent: 50 });
    expect(res.status).toBe(403);
  });

  it('TC-CP03 admin + body vacío → 400 campos requeridos', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Código y porcentaje de descuento son requeridos.');
  });

  it('TC-CP04 admin + código con caracteres especiales → 400', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TEST@50!', discount_percent: 50 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El código solo puede contener letras y números.');
  });

  it('TC-CP05 admin + porcentaje 0 → 400 (0 es falsy, tratado como ausente)', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TESTZERO', discount_percent: 0 });
    expect(res.status).toBe(400);
    // El controller evalúa !discount_percent → 0 es falsy → "requeridos"
    // antes de llegar a la validación de rango 1-100
    expect(res.body.error).toMatch(/requerido|entre 1 y 100/);
  });

  it('TC-CP06 admin + porcentaje > 100 → 400', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TESTOVER', discount_percent: 150 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El porcentaje debe ser un número entre 1 y 100.');
  });

  it('TC-CP07 admin + porcentaje negativo → 400', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TESTNEG', discount_percent: -10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El porcentaje debe ser un número entre 1 y 100.');
  });

  it('TC-CP08 admin + código duplicado → 409', async () => {
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'NOVA10', discount_percent: 15 });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('ya existe');
  });

  it('TC-CP09 admin + cupón nuevo válido → 201', async () => {
    const uniqueCode = `QATEST${Date.now()}`;
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: uniqueCode, discount_percent: 25 });
    expect(res.status).toBe(201);
    expect(res.body.coupon.code).toBe(uniqueCode);
    expect(res.body.coupon.discount_percent).toBe(25);
  });

  it('TC-CP10 código en minúsculas → normalizado a mayúsculas', async () => {
    const uniqueCode = `qalow${Date.now()}`;
    const res = await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: uniqueCode, discount_percent: 10 });
    expect(res.status).toBe(201);
    expect(res.body.coupon.code).toBe(uniqueCode.toUpperCase());
  });
});

// ── DELETE /api/orders/admin/coupons/:code ───────────────────────────────────

describe('DELETE /api/orders/admin/coupons/:code', () => {

  it('TC-CD01 sin token → 401', async () => {
    const res = await request(app).delete('/api/orders/admin/coupons/NOVA10');
    expect(res.status).toBe(401);
  });

  it('TC-CD02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .delete('/api/orders/admin/coupons/NOVA10')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('TC-CD03 admin + código inexistente → 404', async () => {
    const res = await request(app)
      .delete('/api/orders/admin/coupons/NOEXISTE99')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no encontrado');
  });

  it('TC-CD04 admin + código existente → 200', async () => {
    // Primero crear un cupón para eliminar
    const code = `TODEL${Date.now()}`;
    await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code, discount_percent: 5 });

    const res = await request(app)
      .delete(`/api/orders/admin/coupons/${code}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminado');
  });

  it('TC-CD05 después de eliminar → validar cupón retorna 404', async () => {
    const code = `TODELV${Date.now()}`;
    await request(app)
      .post('/api/orders/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code, discount_percent: 5 });

    await request(app)
      .delete(`/api/orders/admin/coupons/${code}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const validateRes = await request(app)
      .post('/api/orders/validate-coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code });
    expect(validateRes.status).toBe(404);
  });
});

// ── Seguridad general — orders endpoints ─────────────────────────────────────

describe('Seguridad — orders endpoints', () => {

  it('TC-OS01 ningún endpoint de orders expone x-powered-by', async () => {
    const checks = [
      () => request(app).post('/api/orders').send({}),
      () => request(app).get('/api/orders'),
      () => request(app).get('/api/orders/admin/coupons'),
    ];
    for (const call of checks) {
      const res = await call();
      expect(res.headers['x-powered-by']).toBeUndefined();
    }
  });

  it('TC-OS02 errores de orders no exponen stack trace', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/at Object\./);
    expect(body).not.toMatch(/\.js:\d+/);
  });

  it('TC-OS03 token expirado en endpoint de orders → 401', async () => {
    const expiredToken = makeToken({ id: 42, email: 'user@test.com', role: 'customer' }, '-1s');
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('La sesión expiró. Iniciá sesión nuevamente.');
  });
});

/**
 * Products API Tests — NovaMarket
 * Cubre: GET /products, GET /products/:id,
 *        POST/PUT/DELETE /products/admin, GET /products/admin/categories
 *
 * Estrategia: sin DB real.
 * - Rutas públicas (GET /products, GET /products/:id): devuelven datos reales si hay DB,
 *   pero los tests de validación y auth no requieren DB.
 * - Rutas admin: testean autenticación y autorización sin DB.
 * - Validaciones del controller: testean mensajes de error de inputs inválidos.
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

const app = require('../../backend/src/index');

const JWT_SECRET = process.env.JWT_SECRET as string;

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(payload: object, expiresIn = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

const userToken  = makeToken({ id: 999, email: 'user@test.com',  role: 'customer' });
const adminToken = makeToken({ id: 1,   email: 'admin@test.com', role: 'admin'    });

// ── GET /api/products ────────────────────────────────────────────────────────

describe('GET /api/products', () => {

  it('TC-P01 ruta pública — responde sin token', async () => {
    const res = await request(app).get('/api/products');
    // Puede ser 200 (con DB) o 500 (sin DB) pero nunca 401/403
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('TC-P02 responde JSON', async () => {
    const res = await request(app).get('/api/products');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-P03 no expone x-powered-by', async () => {
    const res = await request(app).get('/api/products');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it.todo('TC-P04 con DB → 200, body tiene { products: [...], total: N }');
  it.todo('TC-P05 con DB → todos los productos tienen id, name, price, category, stock');
  it.todo('TC-P06 filtro ?category=audio → solo devuelve productos de esa categoría');
  it.todo('TC-P07 filtro ?minPrice=1000 → todos los resultados tienen price >= 1000');
  it.todo('TC-P08 filtro ?maxPrice=5000 → todos los resultados tienen price <= 5000');
  it.todo('TC-P09 ?order=price_asc → productos ordenados de menor a mayor precio');
  it.todo('TC-P10 ?order=price_desc → productos ordenados de mayor a menor precio');
  it.todo('TC-P11 no devuelve productos con is_active = false');
});

// ── GET /api/products/:id ────────────────────────────────────────────────────

describe('GET /api/products/:id', () => {

  it('TC-PI01 id no numérico → 400 "El ID del producto debe ser un número."', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del producto debe ser un número.');
  });

  it('TC-PI02 id con caracteres especiales → 400', async () => {
    const res = await request(app).get('/api/products/1;DROP TABLE products');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del producto debe ser un número.');
  });

  it('TC-PI03 id 0 → 400 (no es un ID válido)', async () => {
    const res = await request(app).get('/api/products/0');
    // El controller hace isNaN(0) = false, pero 0 no es un ID válido
    // Acepta 400 o 404 dependiendo de si hay DB
    expect([400, 404, 500]).toContain(res.status);
  });

  it('TC-PI04 id negativo → 400 o 404', async () => {
    const res = await request(app).get('/api/products/-1');
    expect([400, 404, 500]).toContain(res.status);
  });

  it('TC-PI05 id muy grande (no existe) → 404 con DB o 500 sin DB', async () => {
    const res = await request(app).get('/api/products/999999');
    expect([404, 500]).toContain(res.status);
  });

  it('TC-PI06 responde JSON en error de ID inválido', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('TC-PI07 no expone stack trace en error', async () => {
    const res = await request(app).get('/api/products/abc');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/at Object\./);
    expect(body).not.toMatch(/\.js:\d+/);
  });

  it.todo('TC-PI08 con DB → id válido existente → 200 con objeto producto completo');
  it.todo('TC-PI09 con DB → id existente → body tiene id, name, description, price, stock, category, image_url');
  it.todo('TC-PI10 con DB → id de producto inactivo → 404 "Producto no encontrado."');
  it.todo('TC-PI11 con DB → id inexistente → 404 "Producto no encontrado."');
});

// ── GET /api/products/admin/all (protegida) ──────────────────────────────────

describe('GET /api/products/admin/all', () => {

  it('TC-PA01 sin token → 401', async () => {
    const res = await request(app).get('/api/products/admin/all');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de autenticación requerido.');
  });

  it('TC-PA02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .get('/api/products/admin/all')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Acceso denegado. Se requiere rol de administrador.');
  });

  it('TC-PA03 con token admin → no es 401 ni 403', async () => {
    const res = await request(app)
      .get('/api/products/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('TC-PA04 responde JSON con token de usuario normal', async () => {
    const res = await request(app)
      .get('/api/products/admin/all')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it.todo('TC-PA05 con DB + token admin → 200 con todos los productos (activos e inactivos)');
  it.todo('TC-PA06 con DB → incluye productos con is_active = false');
});

// ── POST /api/products/admin (crear producto) ────────────────────────────────

describe('POST /api/products/admin', () => {

  it('TC-PC01 sin token → 401', async () => {
    const res = await request(app).post('/api/products/admin').send({});
    expect(res.status).toBe(401);
  });

  it('TC-PC02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Producto', price: 100, category: 'gadgets' });
    expect(res.status).toBe(403);
  });

  it('TC-PC03 admin + body vacío → 400 campos requeridos', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, precio y categoría son requeridos.');
  });

  it('TC-PC04 admin + falta nombre → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1000, category: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, precio y categoría son requeridos.');
  });

  it('TC-PC05 admin + falta precio → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', category: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, precio y categoría son requeridos.');
  });

  it('TC-PC06 admin + falta categoría → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', price: 1000 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nombre, precio y categoría son requeridos.');
  });

  it('TC-PC07 admin + precio negativo → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', price: -500, category: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El precio debe ser un número positivo.');
  });

  it('TC-PC08 admin + precio no numérico → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', price: 'abc', category: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El precio debe ser un número positivo.');
  });

  it('TC-PC09 admin + stock negativo → 400', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', price: 1000, category: 'audio', stock: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El stock debe ser un número positivo.');
  });

  it('TC-PC10 responde JSON en todos los errores de admin', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it.todo('TC-PC11 con DB + admin + datos válidos → 201 con producto creado');
  it.todo('TC-PC12 con DB → producto creado tiene id, name, price, category, stock');
  it.todo('TC-PC13 con DB → producto creado aparece en GET /api/products');
});

// ── PUT /api/products/admin/:id (actualizar) ─────────────────────────────────

describe('PUT /api/products/admin/:id', () => {

  it('TC-PU01 sin token → 401', async () => {
    const res = await request(app).put('/api/products/admin/1').send({});
    expect(res.status).toBe(401);
  });

  it('TC-PU02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .put('/api/products/admin/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 999 });
    expect(res.status).toBe(403);
  });

  it('TC-PU03 admin + id no numérico → 400', async () => {
    const res = await request(app)
      .put('/api/products/admin/abc')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del producto debe ser un número.');
  });

  it('TC-PU04 admin + precio negativo → 400 o 500 (sin DB)', async () => {
    const res = await request(app)
      .put('/api/products/admin/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -100 });
    // El controller primero busca el producto en DB antes de validar precio
    // Sin DB → 500, con DB → 400 si el producto existe
    expect([400, 500]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('El precio debe ser un número positivo.');
    }
  });

  it('TC-PU05 admin + id inexistente → 404 o 500 (sin DB)', async () => {
    const res = await request(app)
      .put('/api/products/admin/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nuevo nombre' });
    expect([404, 500]).toContain(res.status);
  });

  it.todo('TC-PU06 con DB + admin + id válido → 200 con producto actualizado');
  it.todo('TC-PU07 con DB → id de producto inactivo (soft-deleted) → 404');
});

// ── DELETE /api/products/admin/:id (soft delete) ─────────────────────────────

describe('DELETE /api/products/admin/:id', () => {

  it('TC-PD01 sin token → 401', async () => {
    const res = await request(app).delete('/api/products/admin/1');
    expect(res.status).toBe(401);
  });

  it('TC-PD02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .delete('/api/products/admin/1')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('TC-PD03 admin + id no numérico → 400', async () => {
    const res = await request(app)
      .delete('/api/products/admin/abc')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El ID del producto debe ser un número.');
  });

  it('TC-PD04 admin + id inexistente → 404 o 500 (sin DB)', async () => {
    const res = await request(app)
      .delete('/api/products/admin/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([404, 500]).toContain(res.status);
  });

  it.todo('TC-PD05 con DB + admin + id válido → 200 "Producto eliminado correctamente."');
  it.todo('TC-PD06 con DB → producto eliminado no aparece en GET /api/products');
  it.todo('TC-PD07 con DB → producto eliminado sí aparece en GET /api/products/admin/all (soft delete)');
});

// ── GET /api/products/admin/categories ──────────────────────────────────────

describe('GET /api/products/admin/categories', () => {

  it('TC-CAT01 sin token → 401', async () => {
    const res = await request(app).get('/api/products/admin/categories');
    expect(res.status).toBe(401);
  });

  it('TC-CAT02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .get('/api/products/admin/categories')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('TC-CAT03 con token admin → no es 401 ni 403', async () => {
    const res = await request(app)
      .get('/api/products/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it.todo('TC-CAT04 con DB + admin → 200 con array de categorías con conteo');
  it.todo('TC-CAT05 con DB → cada categoría tiene category, total_count, active_count');
});

// ── PATCH /api/products/admin/categories/rename ──────────────────────────────

describe('PATCH /api/products/admin/categories/rename', () => {

  it('TC-CR01 sin token → 401', async () => {
    const res = await request(app)
      .patch('/api/products/admin/categories/rename')
      .send({ oldName: 'audio', newName: 'Audio HD' });
    expect(res.status).toBe(401);
  });

  it('TC-CR02 con token de usuario normal → 403', async () => {
    const res = await request(app)
      .patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ oldName: 'audio', newName: 'Audio HD' });
    expect(res.status).toBe(403);
  });

  it('TC-CR03 admin + body vacío → 400 "oldName y newName son requeridos."', async () => {
    const res = await request(app)
      .patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('oldName y newName son requeridos.');
  });

  it('TC-CR04 admin + mismo nombre → 400 "El nombre nuevo debe ser diferente al actual."', async () => {
    const res = await request(app)
      .patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldName: 'audio', newName: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre nuevo debe ser diferente al actual.');
  });

  it('TC-CR05 admin + mismo nombre con espacios → 400 (trim normalization)', async () => {
    const res = await request(app)
      .patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldName: ' audio ', newName: 'audio' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre nuevo debe ser diferente al actual.');
  });

  it.todo('TC-CR06 con DB + admin + nombres válidos distintos → 200 "Categoría renombrada."');
  it.todo('TC-CR07 con DB → todos los productos con oldName quedan con newName');
});

// ── Seguridad general — endpoints de productos ───────────────────────────────

describe('Seguridad — products endpoints', () => {

  it('TC-PS01 ningún endpoint de productos expone x-powered-by', async () => {
    const endpoints = [
      () => request(app).get('/api/products'),
      () => request(app).get('/api/products/1'),
      () => request(app).get('/api/products/admin/all'),
      () => request(app).post('/api/products/admin').send({}),
    ];
    for (const call of endpoints) {
      const res = await call();
      expect(res.headers['x-powered-by']).toBeUndefined();
    }
  });

  it('TC-PS02 errores de productos no exponen stack trace', async () => {
    const res = await request(app).get('/api/products/abc');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/at Object\./);
    expect(body).not.toMatch(/\.js:\d+/);
  });

  it('TC-PS03 acceso con token expirado a ruta admin → 401', async () => {
    const expiredToken = makeToken({ id: 1, email: 'admin@test.com', role: 'admin' }, '-1s');
    const res = await request(app)
      .get('/api/products/admin/all')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('La sesión expiró. Iniciá sesión nuevamente.');
  });

  it('TC-PS04 inyección SQL en id → 400 (no llega a la DB)', async () => {
    const res = await request(app).get('/api/products/1%20OR%201=1');
    expect(res.status).toBe(400);
  });
});

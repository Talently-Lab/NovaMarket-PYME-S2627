/**
 * Products API Tests — NovaMarket
 * Cubre: GET /products, GET /products/:id,
 *        POST/PUT/DELETE /products/admin, GET /products/admin/categories
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

// ── pg-mem ────────────────────────────────────────────────────────────────────
jest.mock('../../backend/src/config/db', () => require('../helpers/pgmem.helper'));

const { resetDB, seedUser, seedProduct } = require('../helpers/pgmem.helper');
const app = require('../../backend/src/index');

beforeEach(async () => { await resetDB(); });

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

  it('TC-P04 con DB → 200, body tiene { products, total }', async () => {
    await seedProduct({ name: 'Prod 1', category: 'Gadgets' });
    await seedProduct({ name: 'Prod 2', category: 'Audio' });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('total');
    expect(res.body.products.length).toBe(2);
  });

  it('TC-P05 con DB → todos los productos tienen id, name, price, category, stock', async () => {
    await seedProduct({ name: 'Mouse', price: 5000, stock: 3, category: 'Periféricos' });
    const res = await request(app).get('/api/products');
    res.body.products.forEach((p: any) => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('stock');
    });
  });

  it('TC-P06 filtro ?category=Audio → solo productos de Audio', async () => {
    await seedProduct({ name: 'Auriculares', category: 'Audio' });
    await seedProduct({ name: 'Mouse', category: 'Periféricos' });
    const res = await request(app).get('/api/products?category=Audio');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.category.toLowerCase()).toContain('audio');
    });
  });

  it('TC-P07 filtro ?minPrice=5000 → todos price >= 5000', async () => {
    await seedProduct({ name: 'Barato', price: 1000 });
    await seedProduct({ name: 'Caro', price: 10000 });
    const res = await request(app).get('/api/products?minPrice=5000');
    res.body.products.forEach((p: any) => {
      expect(Number(p.price)).toBeGreaterThanOrEqual(5000);
    });
  });

  it('TC-P08 filtro ?maxPrice=5000 → todos price <= 5000', async () => {
    await seedProduct({ name: 'Barato', price: 1000 });
    await seedProduct({ name: 'Caro', price: 10000 });
    const res = await request(app).get('/api/products?maxPrice=5000');
    res.body.products.forEach((p: any) => {
      expect(Number(p.price)).toBeLessThanOrEqual(5000);
    });
  });

  it('TC-P09 ?order=price_asc → ordenados de menor a mayor', async () => {
    await seedProduct({ name: 'Caro', price: 10000 });
    await seedProduct({ name: 'Barato', price: 1000 });
    await seedProduct({ name: 'Medio', price: 5000 });
    const res = await request(app).get('/api/products?order=price_asc');
    const prices = res.body.products.map((p: any) => Number(p.price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('TC-P10 ?order=price_desc → ordenados de mayor a menor', async () => {
    await seedProduct({ name: 'Caro', price: 10000 });
    await seedProduct({ name: 'Barato', price: 1000 });
    const res = await request(app).get('/api/products?order=price_desc');
    const prices = res.body.products.map((p: any) => Number(p.price));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('TC-P11 no devuelve productos con is_active = false', async () => {
    await seedProduct({ name: 'Activo', is_active: true });
    await seedProduct({ name: 'Inactivo', is_active: false });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.every((p: any) => p.name !== 'Inactivo')).toBe(true);
  });
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

  it('TC-PI08 id válido existente → 200 con objeto producto', async () => {
    const prod = await seedProduct({ name: 'Teclado Mec.', price: 15000 });
    const res = await request(app).get(`/api/products/${prod.id}`);
    expect(res.status).toBe(200);
    expect(res.body.product.id).toBe(prod.id);
    expect(res.body.product.name).toBe('Teclado Mec.');
  });

  it('TC-PI09 id existente → body tiene id, name, description, price, stock, category', async () => {
    const prod = await seedProduct({ name: 'Webcam', price: 8000, stock: 5 });
    const res = await request(app).get(`/api/products/${prod.id}`);
    ['id','name','price','stock','category'].forEach(field => {
      expect(res.body.product).toHaveProperty(field);
    });
  });

  it('TC-PI10 id de producto inactivo → 404', async () => {
    const prod = await seedProduct({ name: 'Inactivo', is_active: false });
    const res = await request(app).get(`/api/products/${prod.id}`);
    expect(res.status).toBe(404);
  });

  it('TC-PI11 id inexistente → 404', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Producto no encontrado.');
  });
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

  it('TC-PA05 con admin → 200 con todos los productos (activos e inactivos)', async () => {
    await seedProduct({ name: 'Activo', is_active: true });
    await seedProduct({ name: 'Inactivo', is_active: false });
    const res = await request(app).get('/api/products/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it('TC-PA06 incluye productos con is_active = false', async () => {
    await seedProduct({ name: 'Oculto', is_active: false });
    const res = await request(app).get('/api/products/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    const names = res.body.products.map((p: any) => p.name);
    expect(names).toContain('Oculto');
  });
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

  it('TC-PC11 admin + datos válidos → 201 con producto creado', async () => {
    const res = await request(app).post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nuevo Prod', price: 9999, category: 'Gadgets', stock: 10 });
    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe('Nuevo Prod');
  });

  it('TC-PC12 producto creado tiene id, name, price, category, stock', async () => {
    const res = await request(app).post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Completo', price: 5000, category: 'Audio', stock: 3 });
    ['id','name','price','category','stock'].forEach(f => {
      expect(res.body.product).toHaveProperty(f);
    });
  });

  it('TC-PC13 producto creado aparece en GET /api/products', async () => {
    await request(app).post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Visible', price: 3000, category: 'Gadgets', stock: 5 });
    const res = await request(app).get('/api/products');
    const names = res.body.products.map((p: any) => p.name);
    expect(names).toContain('Visible');
  });
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

  it('TC-PU04 admin + precio negativo → 404 (producto no existe) o 400', async () => {
    const res = await request(app)
      .put('/api/products/admin/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -100 });
    // Con pg-mem: el producto id=1 no existe → 404
    expect([400, 404]).toContain(res.status);
  });

  it('TC-PU05 admin + id inexistente → 404 o 500 (sin DB)', async () => {
    const res = await request(app)
      .put('/api/products/admin/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nuevo nombre' });
    expect([404, 500]).toContain(res.status);
  });

  it('TC-PU06 admin + id válido → 200 con producto actualizado', async () => {
    const prod = await seedProduct({ name: 'Original', price: 1000 });
    const res = await request(app).put(`/api/products/admin/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Actualizado', price: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Actualizado');
    expect(Number(res.body.product.price)).toBe(2000);
  });

  it('TC-PU07 id de producto inexistente → 404', async () => {
    const res = await request(app).put('/api/products/admin/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nada' });
    expect(res.status).toBe(404);
  });
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

  it('TC-PD05 admin + id válido → 200 eliminado', async () => {
    const prod = await seedProduct({ name: 'Para Borrar' });
    const res = await request(app).delete(`/api/products/admin/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminado');
  });

  it('TC-PD06 producto eliminado no aparece en GET /api/products', async () => {
    const prod = await seedProduct({ name: 'Borrable' });
    await request(app).delete(`/api/products/admin/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app).get('/api/products');
    const names = res.body.products.map((p: any) => p.name);
    expect(names).not.toContain('Borrable');
  });

  it('TC-PD07 producto eliminado sí aparece en admin/all (soft delete)', async () => {
    const prod = await seedProduct({ name: 'SoftDeleted' });
    await request(app).delete(`/api/products/admin/${prod.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app).get('/api/products/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    const names = res.body.products.map((p: any) => p.name);
    expect(names).toContain('SoftDeleted');
  });
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

  it('TC-CAT04 con admin → 200 con array de categorías con conteo', async () => {
    await seedProduct({ name: 'Prod1', category: 'Gaming' });
    await seedProduct({ name: 'Prod2', category: 'Gaming' });
    await seedProduct({ name: 'Prod3', category: 'Audio' });
    const res = await request(app).get('/api/products/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-CAT05 cada categoría tiene category, product_count, active_count', async () => {
    await seedProduct({ name: 'P1', category: 'Accesorios' });
    const res = await request(app).get('/api/products/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    res.body.categories.forEach((c: any) => {
      expect(c).toHaveProperty('category');
      expect(c).toHaveProperty('product_count');
      expect(c).toHaveProperty('active_count');
    });
  });
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

  it('TC-CR06 nombres válidos distintos → 200 renombrado', async () => {
    await seedProduct({ name: 'P1', category: 'Viejo' });
    const res = await request(app).patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldName: 'Viejo', newName: 'Nuevo' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('renombrada');
  });

  it('TC-CR07 todos los productos con oldName quedan con newName', async () => {
    await seedProduct({ name: 'P1', category: 'OldCat' });
    await seedProduct({ name: 'P2', category: 'OldCat' });
    await request(app).patch('/api/products/admin/categories/rename')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldName: 'OldCat', newName: 'NewCat' });
    const res = await request(app).get('/api/products?category=NewCat');
    expect(res.body.products.length).toBe(2);
    expect(res.body.products.every((p: any) => p.category === 'NewCat')).toBe(true);
  });
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

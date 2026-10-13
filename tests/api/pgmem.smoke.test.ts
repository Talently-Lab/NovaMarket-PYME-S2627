/**
 * Smoke test del helper pg-mem
 * Verifica que el schema, seeds y resetDB funcionan correctamente
 * antes de usarlo en los tests de integración reales.
 */

process.env.NODE_ENV   = 'test';
process.env.JWT_SECRET = 'test_secret_para_jest_minimo_32_chars_ok';

jest.mock('../../backend/src/config/db', () => require('../helpers/pgmem.helper'));

const { resetDB, seedUser, seedProduct, seedCoupon, pool } = require('../helpers/pgmem.helper');

beforeEach(async () => { await resetDB(); });

describe('pg-mem helper — schema y seeds', () => {

  it('resetDB limpia todas las tablas', async () => {
    await seedUser({ email: 'a@test.com' });
    await resetDB();
    const res = await pool.query('SELECT COUNT(*) as n FROM users');
    expect(Number(res.rows[0].n)).toBe(0);
  });

  it('seedUser crea un usuario con email y role correctos', async () => {
    const user = await seedUser({ email: 'qa@test.com', role: 'admin' });
    expect(user.email).toBe('qa@test.com');
    expect(user.role).toBe('admin');
    expect(user.id).toBeDefined();
  });

  it('seedUser hashea la contraseña', async () => {
    const user = await seedUser({ password: 'MiPass123!' });
    const row = await pool.query('SELECT password FROM users WHERE id = $1', [user.id]);
    expect(row.rows[0].password).not.toBe('MiPass123!');
    expect(row.rows[0].password).toMatch(/^\$2[ab]\$/);
  });

  it('seedProduct crea un producto con los campos correctos', async () => {
    const prod = await seedProduct({ name: 'Mouse Gamer', price: 29999, stock: 5 });
    expect(prod.name).toBe('Mouse Gamer');
    expect(Number(prod.price)).toBe(29999);
    expect(prod.stock).toBe(5);
    expect(prod.is_active).toBe(true);
  });

  it('seedCoupon crea un cupón activo', async () => {
    const coupon = await seedCoupon({ code: 'TEST20', discount_percent: 20 });
    expect(coupon.code).toBe('TEST20');
    expect(Number(coupon.discount_percent)).toBe(20);
    expect(coupon.is_active).toBe(true);
  });

  it('las FK entre orders y users funcionan', async () => {
    const user = await seedUser({ email: 'buyer@test.com' });
    await pool.query(
      `INSERT INTO orders (user_id, total, total_with_tax) VALUES ($1, 10000, 12100)`,
      [user.id]
    );
    const res = await pool.query('SELECT COUNT(*) as n FROM orders');
    expect(Number(res.rows[0].n)).toBe(1);
  });

});

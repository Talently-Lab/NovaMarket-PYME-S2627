import request from 'supertest';
// El backend es CommonJS, lo importamos con require para compatibilidad
const app = require('../../backend/src/index');

describe('GET /api/health', () => {
  it('responde 200 con status OK', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

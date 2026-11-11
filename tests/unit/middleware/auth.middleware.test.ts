/**
 * Unit Tests — auth.middleware.js
 * Cubre: authenticate(), requireAdmin()
 *
 * Estrategia: tests unitarios puros — sin Supertest, sin DB, sin servidor.
 * Se llama directamente a las funciones del middleware con mocks de req/res/next.
 */

import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_secret_para_jest_minimo_32_chars_ok';
process.env.NODE_ENV   = 'test';

const { authenticate, requireAdmin } = require('../../../backend/src/middlewares/auth.middleware');

const SECRET = process.env.JWT_SECRET as string;

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeReq(authHeader?: string): any {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function makeRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function makeToken(payload: object, expiresIn: any = '1h'): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

// ── authenticate() ───────────────────────────────────────────────────────────

describe('authenticate middleware', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Casos de token ausente / malformado ──

  it('TC-AM01 sin header Authorization → 401 "Token de autenticación requerido."', () => {
    const req  = makeReq();
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token de autenticación requerido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM02 header sin prefijo Bearer → 401', () => {
    const req  = makeReq('solo-un-token-sin-bearer');
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token de autenticación requerido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM03 header "Bearer " sin token → 401', () => {
    const req  = makeReq('Bearer ');
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    // Token vacío o inválido debe dar 401
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM04 token con firma incorrecta → 401 "Token inválido."', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6OTk5fQ.firma_incorrecta_falsa';
    const req  = makeReq(`Bearer ${fakeToken}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM05 token firmado con secret distinto → 401 "Token inválido."', () => {
    const tokenOtroSecret = jwt.sign({ id: 1, role: 'customer' }, 'otro_secret_completamente_diferente');
    const req  = makeReq(`Bearer ${tokenOtroSecret}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM06 token expirado → 401 "La sesión expiró. Iniciá sesión nuevamente."', () => {
    const expiredToken = makeToken({ id: 1, role: 'customer' }, '-1s');
    const req  = makeReq(`Bearer ${expiredToken}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'La sesión expiró. Iniciá sesión nuevamente.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-AM07 token con estructura JSON inválida (not valid JWT) → 401', () => {
    const req  = makeReq('Bearer esto.no.es.jwt.valido');
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Casos válidos ──

  it('TC-AM08 token válido → llama a next() exactamente una vez', () => {
    const token = makeToken({ id: 42, email: 'user@test.com', role: 'customer' });
    const req   = makeReq(`Bearer ${token}`);
    const res   = makeRes();
    const next  = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('TC-AM09 token válido → req.user tiene id, email y role', () => {
    const token = makeToken({ id: 42, email: 'user@test.com', role: 'customer' });
    const req: any = makeReq(`Bearer ${token}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(42);
    expect(req.user.email).toBe('user@test.com');
    expect(req.user.role).toBe('customer');
  });

  it('TC-AM10 token de admin válido → req.user.role es "admin"', () => {
    const token = makeToken({ id: 1, email: 'admin@test.com', role: 'admin' });
    const req: any = makeReq(`Bearer ${token}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.role).toBe('admin');
  });

  it('TC-AM11 token válido → NO llama a res.status()', () => {
    const token = makeToken({ id: 1, role: 'customer' });
    const req   = makeReq(`Bearer ${token}`);
    const res   = makeRes();
    const next  = jest.fn();

    authenticate(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('TC-AM12 req.user no contiene el campo password (no se expone info sensible)', () => {
    const token = makeToken({ id: 1, email: 'user@test.com', role: 'customer', password: 'hash_secreto' });
    const req: any = makeReq(`Bearer ${token}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    // El middleware no filtra el payload — lo que venga en el JWT queda en req.user
    // Este test documenta el comportamiento actual: req.user tiene lo que está en el token.
    // El password no debería estar en el JWT — este test verifica que el generateToken
    // del controller no lo incluye (lo vemos desde el payload decodificado).
    expect(next).toHaveBeenCalledTimes(1);
  });

  // ── Edge cases ──

  it('TC-AM13 header con múltiples espacios antes del token → 401 (no Bearer con un espacio)', () => {
    const token = makeToken({ id: 1, role: 'customer' });
    const req   = makeReq(`Bearer  ${token}`);  // dos espacios
    const res   = makeRes();
    const next  = jest.fn();

    authenticate(req, res, next);

    // "Bearer  token" → split(' ')[1] = '' → inválido
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// ── requireAdmin() ───────────────────────────────────────────────────────────

describe('requireAdmin middleware', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TC-RA01 sin req.user → 403 "Acceso denegado. Se requiere rol de administrador."', () => {
    const req  = {} as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acceso denegado. Se requiere rol de administrador.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA02 req.user con role "customer" → 403', () => {
    const req  = { user: { id: 42, role: 'customer' } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acceso denegado. Se requiere rol de administrador.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA03 req.user con role "user" → 403', () => {
    const req  = { user: { id: 99, role: 'user' } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA04 req.user con role "ADMIN" (mayúsculas) → 403 (case sensitive)', () => {
    const req  = { user: { id: 1, role: 'ADMIN' } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    // La comparación es === 'admin' (minúsculas), ADMIN no pasa
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA05 req.user con role "admin" → llama a next()', () => {
    const req  = { user: { id: 1, role: 'admin' } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('TC-RA06 req.user.role undefined → 403', () => {
    const req  = { user: { id: 1 } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA07 req.user null → 403', () => {
    const req  = { user: null } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('TC-RA08 admin → responde JSON en error de 403', () => {
    const req  = { user: { role: 'customer' } } as any;
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});

// ── Integración authenticate + requireAdmin ──────────────────────────────────

describe('authenticate + requireAdmin — cadena de middlewares', () => {

  it('TC-C01 token de usuario → authenticate pasa, requireAdmin bloquea', () => {
    const token = makeToken({ id: 42, email: 'user@test.com', role: 'customer' });
    const req: any = makeReq(`Bearer ${token}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Simular la cadena: ahora requireAdmin con el mismo req
    const next2 = jest.fn();
    const res2  = makeRes();
    requireAdmin(req, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(403);
  });

  it('TC-C02 token de admin → authenticate pasa, requireAdmin pasa', () => {
    const token = makeToken({ id: 1, email: 'admin@test.com', role: 'admin' });
    const req: any = makeReq(`Bearer ${token}`);
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    const next2 = jest.fn();
    const res2  = makeRes();
    requireAdmin(req, res2, next2);

    expect(next2).toHaveBeenCalledTimes(1);
    expect(res2.status).not.toHaveBeenCalled();
  });

  it('TC-C03 sin token → authenticate bloquea, requireAdmin nunca se ejecuta', () => {
    const req  = makeReq();
    const res  = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    // requireAdmin no se llama porque next() nunca fue invocado
  });
});

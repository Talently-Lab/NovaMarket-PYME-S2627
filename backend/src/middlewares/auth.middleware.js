const jwt = require('jsonwebtoken');

/**
 * Middleware: verifica que el request tiene un JWT válido
 * Agrega req.user con { id, email, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesión expiró. Iniciá sesión nuevamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

/**
 * Middleware: verifica que el usuario autenticado tiene rol admin
 * Debe usarse DESPUÉS de authenticate
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };

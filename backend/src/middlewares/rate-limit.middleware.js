const rateLimit = require('express-rate-limit');

/**
 * Respuesta de error estándar cuando se supera el límite
 */
const handler = (req, res) => {
  res.status(429).json({
    error: 'Demasiadas solicitudes. Esperá un momento antes de intentar de nuevo.',
  });
};

/**
 * Límite estricto para rutas de autenticación sensibles:
 * login, register, forgot-password, reset-password
 * 10 intentos por IP cada 15 minutos
 */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutos
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});

/**
 * Límite general para toda la API:
 * 200 requests por IP cada 15 minutos
 * Cubre catálogo, checkout, etc.
 */
const apiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutos
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});

/**
 * Límite para el checkout — evita spam de pedidos:
 * 20 pedidos por IP cada hora
 */
const checkoutLimiter = rateLimit({
  windowMs:         60 * 60 * 1000, // 1 hora
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});

module.exports = { authLimiter, apiLimiter, checkoutLimiter };

const { Router } = require('express');
const { register, login, me, getAllUsers, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// POST /api/auth/register — registro público
router.post('/register', register);

// POST /api/auth/login — login público
router.post('/login', login);

// GET /api/auth/me — perfil del usuario autenticado
router.get('/me', authenticate, me);

// POST /api/auth/forgot-password — solicitar código de reseteo (público)
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password — resetear contraseña con código (público)
router.post('/reset-password', resetPassword);

// GET /api/auth/admin/users — lista todos los usuarios (solo admin)
router.get('/admin/users', authenticate, requireAdmin, getAllUsers);

// PATCH /api/auth/admin/change-password — cambia contraseña del admin autenticado
router.patch('/admin/change-password', authenticate, requireAdmin, changePassword);

module.exports = router;

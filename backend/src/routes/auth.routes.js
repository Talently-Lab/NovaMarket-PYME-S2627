const { Router } = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

// POST /api/auth/register — registro público
router.post('/register', register);

// POST /api/auth/login — login público
router.post('/login', login);

// GET /api/auth/me — perfil del usuario autenticado
router.get('/me', authenticate, me);

module.exports = router;

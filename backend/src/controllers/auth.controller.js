const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const SALT_ROUNDS = 12;

/**
 * Genera un JWT firmado con los datos básicos del usuario
 * @param {Object} user
 * @returns {string} token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario cliente
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  // Validación básica
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido.' });
  }

  // Verificar si el email ya existe
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Crear usuario
  const user = await UserModel.create(name, email, hashedPassword);

  // Generar token
  const token = generateToken(user);

  return res.status(201).json({
    message: 'Cuenta creada exitosamente.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

/**
 * POST /api/auth/login
 * Autentica un usuario existente
 */
async function login(req, res) {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  // Buscar usuario — mismo mensaje para email inexistente y contraseña incorrecta
  // (evita enumerar usuarios — OWASP A01)
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // Verificar contraseña
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // Generar token
  const token = generateToken(user);

  return res.status(200).json({
    message: 'Sesión iniciada correctamente.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado (requiere JWT)
 */
async function me(req, res) {
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  return res.status(200).json({ user });
}

module.exports = { register, login, me };

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');
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

  // Normalizar — eliminar espacios al inicio y al final
  const trimmedName     = (name     ?? '').trim();
  const trimmedEmail    = (email    ?? '').trim();
  const trimmedPassword = (password ?? '').trim();

  // Validación básica
  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
  }

  if (trimmedName.length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }

  if (trimmedPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido.' });
  }

  // Verificar si el email ya existe
  const existing = await UserModel.findByEmail(trimmedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

  // Crear usuario
  const user = await UserModel.create(trimmedName, trimmedEmail, hashedPassword);

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

/**
 * GET /api/auth/admin/users
 * Lista todos los usuarios — solo admin
 */
async function getAllUsers(req, res) {
  const users = await UserModel.findAll();
  return res.status(200).json({ users, total: users.length });
}

/**
 * PATCH /api/auth/admin/change-password
 * Cambia la contraseña del admin autenticado
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas.' });
  }

  const trimmedNew = (newPassword ?? '').trim();
  if (trimmedNew.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  // Obtener usuario completo (con password hash)
  const result = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
  const user   = result.rows[0];
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
  }

  const hashed = await bcrypt.hash(trimmedNew, SALT_ROUNDS);
  await UserModel.updatePassword(userId, hashed);

  return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
}

/**
 * POST /api/auth/forgot-password
 * Genera un token de reseteo y lo envía por email con Resend
 */
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'El email es requerido.' });
  }

  const user = await UserModel.findByEmail(email.trim().toLowerCase());

  // Responder igual si el email no existe — evita enumeración de usuarios
  if (!user) {
    return res.status(200).json({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
    });
  }

  // Generar token de 6 dígitos, expira en 15 minutos
  const crypto = require('crypto');
  const token   = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await UserModel.setResetToken(user.email, token, expires);

  // Enviar email con Resend
  const { sendPasswordResetEmail } = require('../services/email.service');
  const sent = await sendPasswordResetEmail(user.email, token);

  if (!sent) {
    // Si falla el email, igual responder 200 para no exponer si el usuario existe
    console.error(`[Auth] No se pudo enviar email de reseteo a ${user.email}`);
  }

  return res.status(200).json({
    message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
  });
}

/**
 * POST /api/auth/reset-password
 * Verifica el token y actualiza la contraseña
 */
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
  }

  const trimmedPassword = (newPassword ?? '').trim();
  if (trimmedPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const user = await UserModel.findByResetToken(token);

  if (!user) {
    return res.status(400).json({ error: 'El código es inválido o ya fue utilizado.' });
  }

  if (new Date() > new Date(user.reset_token_expires)) {
    await UserModel.clearResetToken(user.id);
    return res.status(400).json({ error: 'El código expiró. Solicitá uno nuevo.' });
  }

  const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);
  await UserModel.updatePassword(user.id, hashedPassword);
  await UserModel.clearResetToken(user.id);

  return res.status(200).json({ message: 'Contraseña actualizada correctamente. Ya podés iniciar sesión.' });
}

module.exports = { register, login, me, getAllUsers, changePassword, forgotPassword, resetPassword };

// backend/src/modules/auth/services/auth.service.js
const authModel = require('../models/auth.model');
const db = require('../../../shared/database/db'); // Necesitamos DB para validar el condominio
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ⚠️ CLAVE SECRETA AHORA LEE DESDE EL ENTORNO
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

/**
 * Registra un nuevo usuario y lo asocia a un condominio existente.
 */
const register = async ({ email, password, fullName, condominiumId, role = 'UNIT_OWNER' }) => {
  try {
    // 1. Validar Multi-Tenancy: Asegurar que el condominio existe
    const condoExists = await db.query('SELECT id FROM condominiums WHERE id = $1', [condominiumId]);
    if (condoExists.rows.length === 0) {
      throw new Error('El ID del condominio especificado no existe o es incorrecto.');
    }

    // 2. Regla de Negocio: Verificar si el email ya existe en ESE condominio
    const existingUser = await authModel.findUserByEmail(email, condominiumId);
    if (existingUser) {
      throw new Error('El email ya está registrado en este condominio.');
    }

    // 3. Lógica de Seguridad: Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Llamada al Modelo (interacción con la DB)
    const newUser = await authModel.createUser({
      email,
      passwordHash,
      fullName,
      condominiumId,
      role,  // <-- IMPORTANTE: Pasamos el rol
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
      condominiumId: newUser.condominium_id
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Valida credenciales, generando un token JWT con el ID del Condominio (aislamiento).
 */
const login = async ({ email, password, condominiumId }) => {
  try {
    // 1. Llamada al Modelo: Buscar el usuario por email y Condominio
    const user = await authModel.findUserByEmail(email, condominiumId);
    if (!user) {
      // Mensaje genérico para evitar dar pistas a atacantes
      throw new Error('Credenciales inválidas o condominio incorrecto.');
    }

    // 2. Lógica de Seguridad: Comparar la contraseña hasheada
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciales inválidas o condominio incorrecto.');
    }

    // 3. Generar el Token (Payload)
    // El token contiene el condoId, crucial para el aislamiento de datos en las peticiones futuras
    const tokenPayload = {
      id: user.id,
      role: user.role,
      condoId: user.condominium_id,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    return { token, role: user.role, fullName: user.full_name, condoId: user.condominium_id };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  JWT_SECRET,
};
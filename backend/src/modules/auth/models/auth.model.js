// backend/src/modules/auth/models/auth.model.js
const db = require('../../../shared/database/db'); // Importamos la conexión a PG

/**
 * Busca un usuario por su email y su ID de condominio. (Multi-Tenancy)
 * @param {string} email - Email del usuario.
 * @param {number} condominiumId - ID del condominio.
 * @returns {Promise<Object|null>} El objeto usuario o null si no se encuentra.
 */
const findUserByEmail = async (email, condominiumId) => {
  const query = `
    SELECT id, email, password_hash, full_name, role, condominium_id
    FROM users
    WHERE email = $1 AND condominium_id = $2
  `;
  const { rows } = await db.query(query, [email, condominiumId]);
  return rows[0] || null;
};

/**
 * Crea un nuevo usuario, incluyendo el ID del condominio.
 */
const createUser = async ({ email, passwordHash, fullName, role, condominiumId }) => {
  const query = `
    INSERT INTO users (email, password_hash, full_name, role, condominium_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, full_name, role, condominium_id
  `;
  const values = [email, passwordHash, fullName, role, condominiumId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
};
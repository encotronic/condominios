// backend/src/modules/auth/models/auth.model.js
const db = require('../../../shared/database/db'); // Importamos la conexión a PG

/**
 * Busca un usuario por su email. Si se proporciona condominiumId, busca específicamente en ese condominio.
 * Si no se proporciona condominiumId, busca por email y retorna error si el usuario existe en múltiples condominios.
 * @param {string} email - Email del usuario.
 * @param {string|null} condominiumId - ID del condominio (opcional).
 * @returns {Promise<Object|null>} El objeto usuario o null si no se encuentra.
 * @throws {Error} Si el usuario existe en múltiples condominios y no se especifica condominiumId.
 */
const findUserByEmail = async (email, condominiumId = null) => {
  let query, values;
  
  if (condominiumId) {
    // Búsqueda específica por condominio (multi-tenancy estricto)
    query = `
      SELECT id, email, password_hash, full_name, role, condominium_id, created_at
      FROM users
      WHERE email = $1 AND condominium_id = $2 AND is_active = true
    `;
    values = [email, condominiumId];
  } else {
    // Búsqueda general por email (para login inicial o usuarios únicos)
    query = `
      SELECT id, email, password_hash, full_name, role, condominium_id, created_at
      FROM users
      WHERE email = $1 AND is_active = true
    `;
    values = [email];
  }
  
  const { rows } = await db.query(query, values);
  
  // Validación de multi-tenancy ambigua
  if (!condominiumId && rows.length > 1) {
    const condominiums = rows.map(row => row.condominium_id);
    throw new Error(`Usuario encontrado en ${rows.length} condominios diferentes. Especifique condominiumId. Condominios: ${condominiums.join(', ')}`);
  }
  
  return rows[0] || null;
};

/**
 * Encuentra todos los condominios donde existe un usuario con el email dado.
 * @param {string} email - Email del usuario.
 * @returns {Promise<Array>} Lista de condominios del usuario.
 */
const findUserCondominiumsByEmail = async (email) => {
  const query = `
    SELECT DISTINCT c.id AS id, c.name AS name
    FROM users u
    INNER JOIN condominiums c ON c.id = u.condominium_id
    WHERE u.email = $1 AND u.is_active = true
    ORDER BY c.name ASC
  `;
  const { rows } = await db.query(query, [email]);
  return rows;
};

/**
 * Obtiene los condominios asociados al mismo email del usuario identificado por userId.
 * @param {string} userId - ID del usuario autenticado.
 * @returns {Promise<Array>} Lista de condominios (id, name).
 */
const findUserCondominiumsByUserId = async (userId) => {
  const query = `
    SELECT DISTINCT c.id AS id, c.name AS name
    FROM users source
    INNER JOIN users u ON u.email = source.email AND u.is_active = true
    INNER JOIN condominiums c ON c.id = u.condominium_id
    WHERE source.id = $1
    ORDER BY c.name ASC
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

/**
 * Crea un nuevo usuario, incluyendo el ID del condominio.
 */
const createUser = async ({ email, passwordHash, fullName, role, condominiumId }) => {
  const query = `
    INSERT INTO users (email, password_hash, full_name, role, condominium_id, is_active)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id, email, full_name, role, condominium_id, created_at
  `;
  const values = [email, passwordHash, fullName, role, condominiumId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

module.exports = {
  findUserByEmail,
  findUserCondominiumsByEmail,
  findUserCondominiumsByUserId,
  createUser,
};
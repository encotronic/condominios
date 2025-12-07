// backend/src/modules/units/models/unit.model.js
const db = require('../../../shared/database/db');

/**
 * Crea una nueva unidad habitacional.
 * @param {Object} unitData - Datos de la unidad (code, condominiumId, aliquotPercentage, ownerId).
 */
const createUnit = async ({ code, condominiumId, aliquotPercentage, ownerId }) => {
  const query = `
    INSERT INTO units (code, condominium_id, aliquot_percentage, owner_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, code, condominium_id, aliquot_percentage, owner_id;
  `;
  const values = [code, condominiumId, aliquotPercentage, ownerId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

/**
 * Obtiene todas las unidades de un condominio específico (Multi-Tenancy).
 * @param {string} condominiumId - ID del condominio.
 */
const findUnitsByCondominiumId = async (condominiumId) => {
  const query = `
    SELECT id, code, aliquot_percentage, owner_id
    FROM units 
    WHERE condominium_id = $1
    ORDER BY code ASC;
  `;
  const { rows } = await db.query(query, [condominiumId]);
  return rows;
};

// Por simplicidad, omitiremos temporalmente findById, update y delete.

module.exports = {
  createUnit,
  findUnitsByCondominiumId,
};
// backend/src/modules/condo/models/unit.model.js
const db = require('../../../shared/database/db');

class UnitModel {
    /**
     * Obtiene todas las unidades de un condominio específico (Multi-Tenancy).
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Array>} Array de unidades.
     */
    async findUnitsByCondominiumId(condominiumId) {
        try {
            const query = `
                SELECT id, code, aliquot_percentage, owner_id
                FROM units
                WHERE condominium_id = $1 
                ORDER BY code ASC;
            `;
            const { rows } = await db.query(query, [condominiumId]);
            return rows;
        } catch (error) {
            console.error('Error en UnitModel.findUnitsByCondominiumId:', error);
            throw error;
        }
    }

    /**
     * Obtiene una unidad por ID.
     * @param {string} id - ID de la unidad.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Object|null>} La unidad o null.
     */
    async findUnitById(id, condominiumId) {
        try {
            const query = `
                SELECT id, code, aliquot_percentage, owner_id
                FROM units
                WHERE id = $1 AND condominium_id = $2;
            `;
            const { rows } = await db.query(query, [id, condominiumId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error en UnitModel.findUnitById:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva unidad.
     * @param {Object} unitData - Datos de la unidad.
     * @returns {Promise<Object>} La unidad creada.
     */
    async createUnit(unitData) {
        try {
            const { code, condominiumId, aliquotPercentage, ownerId } = unitData;
            const query = `
                INSERT INTO units (code, condominium_id, aliquot_percentage, owner_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, code, condominium_id, aliquot_percentage, owner_id;
            `;
            const values = [code, condominiumId, aliquotPercentage, ownerId];
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            console.error('Error en UnitModel.createUnit:', error);
            throw error;
        }
    }

    /**
     * Actualiza una unidad.
     * @param {string} id - ID de la unidad.
     * @param {string} condominiumId - ID del condominio.
     * @param {Object} updateData - Datos a actualizar.
     * @returns {Promise<Object>} La unidad actualizada.
     */
    async updateUnit(id, condominiumId, updateData) {
        try {
            const { code, aliquotPercentage, ownerId } = updateData;
            
            const fields = [];
            const values = [];
            let index = 1;

            if (code !== undefined) {
                fields.push(`code = $${index++}`);
                values.push(code);
            }
            if (aliquotPercentage !== undefined) {
                fields.push(`aliquot_percentage = $${index++}`);
                values.push(aliquotPercentage);
            }
            if (ownerId !== undefined) {
                fields.push(`owner_id = $${index++}`);
                values.push(ownerId);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos válidos para actualizar');
            }

            values.push(id);
            values.push(condominiumId);

            const query = `
                UPDATE units
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${index++} AND condominium_id = $${index}
                RETURNING id, code, condominium_id, aliquot_percentage, owner_id;
            `;

            const { rows } = await db.query(query, values);
            
            if (rows.length === 0) {
                throw new Error('Unidad no encontrada');
            }
            
            return rows[0];
        } catch (error) {
            console.error('Error en UnitModel.updateUnit:', error);
            throw error;
        }
    }

    /**
     * Elimina (soft delete) una unidad.
     * @param {string} id - ID de la unidad.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<boolean>} True si se eliminó.
     */
    async deleteUnit(id, condominiumId) {
        try {
            const query = `
                UPDATE units
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND condominium_id = $2
                RETURNING id;
            `;
            const { rows } = await db.query(query, [id, condominiumId]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error en UnitModel.deleteUnit:', error);
            throw error;
        }
    }

    /**
     * Obtiene unidades disponibles (sin propietario).
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Array>} Array de unidades disponibles.
     */
    async findAvailableUnits(condominiumId) {
        try {
            const query = `
                SELECT id, code, aliquot_percentage
                FROM units
                WHERE condominium_id = $1 AND owner_id IS NULL AND is_active = TRUE
                ORDER BY code ASC;
            `;
            const { rows } = await db.query(query, [condominiumId]);
            return rows;
        } catch (error) {
            console.error('Error en UnitModel.findAvailableUnits:', error);
            throw error;
        }
    }
}

module.exports = new UnitModel();
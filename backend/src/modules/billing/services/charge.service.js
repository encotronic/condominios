// backend/src/modules/billing/services/charge.service.js
const db = require('../../../shared/database/db');

class ChargeService {
    /**
     * Obtiene todos los cargos de un condominio.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Array>} Array de cargos.
     */
    async getAllCharges(condominiumId) {
        try {
            const query = `
                SELECT * FROM charges 
                WHERE condominium_id = $1 
                ORDER BY created_at DESC
            `;
            const result = await db.query(query, [condominiumId]);
            return result.rows;
        } catch (error) {
            console.error('Error en ChargeService.getAllCharges:', error);
            throw error;
        }
    }

    /**
     * Obtiene un cargo específico por ID.
     * @param {string} id - ID del cargo.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Object>} El objeto cargo.
     */
    async getChargeById(id, condominiumId) {
        try {
            const query = `
                SELECT * FROM charges 
                WHERE id = $1 AND condominium_id = $2
            `;
            const result = await db.query(query, [id, condominiumId]);
            
            if (result.rows.length === 0) {
                throw new Error('Cargo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error en ChargeService.getChargeById:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo cargo.
     * @param {Object} chargeData - Datos del cargo.
     * @returns {Promise<Object>} El cargo creado.
     */
    async createCharge(chargeData) {
        try {
            const { 
                condominium_id, 
                name, 
                description, 
                amount, 
                frequency, 
                is_active, 
                apply_to_all_units 
            } = chargeData;

            const query = `
                INSERT INTO charges (
                    condominium_id, name, description, amount, 
                    frequency, is_active, apply_to_all_units
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;

            const values = [
                condominium_id, 
                name, 
                description, 
                amount, 
                frequency, 
                is_active !== undefined ? is_active : true,
                apply_to_all_units !== undefined ? apply_to_all_units : true
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en ChargeService.createCharge:', error);
            
            // Manejar errores de PostgreSQL
            if (error.code === '23505') {
                throw new Error('Ya existe un cargo con este nombre en el condominio');
            }
            if (error.code === '23514') {
                throw new Error('El monto debe ser mayor a 0 o la frecuencia no es válida');
            }
            
            throw error;
        }
    }

    /**
     * Actualiza un cargo existente.
     * @param {string} id - ID del cargo.
     * @param {Object} updateData - Datos a actualizar.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Object>} El cargo actualizado.
     */
    async updateCharge(id, updateData, condominiumId) {
        try {
            const { 
                name, 
                description, 
                amount, 
                frequency, 
                is_active, 
                apply_to_all_units 
            } = updateData;

            // Verificar que el cargo existe
            await this.getChargeById(id, condominiumId);

            const fields = [];
            const values = [];
            let index = 1;

            if (name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(name);
            }
            if (description !== undefined) {
                fields.push(`description = $${index++}`);
                values.push(description);
            }
            if (amount !== undefined) {
                fields.push(`amount = $${index++}`);
                values.push(parseFloat(amount));
            }
            if (frequency !== undefined) {
                fields.push(`frequency = $${index++}`);
                values.push(frequency);
            }
            if (is_active !== undefined) {
                fields.push(`is_active = $${index++}`);
                values.push(is_active);
            }
            if (apply_to_all_units !== undefined) {
                fields.push(`apply_to_all_units = $${index++}`);
                values.push(apply_to_all_units);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos válidos para actualizar');
            }

            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            
            values.push(id);
            values.push(condominiumId);

            const query = `
                UPDATE charges 
                SET ${fields.join(', ')}
                WHERE id = $${index++} AND condominium_id = $${index}
                RETURNING *
            `;

            const result = await db.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error('Cargo no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error en ChargeService.updateCharge:', error);
            throw error;
        }
    }

    /**
     * Elimina (desactiva) un cargo.
     * @param {string} id - ID del cargo.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Object>} Resultado de la eliminación.
     */
    async deleteCharge(id, condominiumId) {
        try {
            const query = `
                UPDATE charges 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND condominium_id = $2
                RETURNING id, name
            `;
            
            const result = await db.query(query, [id, condominiumId]);
            
            if (result.rows.length === 0) {
                throw new Error('Cargo no encontrado');
            }
            
            return { 
                message: 'Cargo desactivado exitosamente', 
                charge: result.rows[0] 
            };
        } catch (error) {
            console.error('Error en ChargeService.deleteCharge:', error);
            throw error;
        }
    }

    /**
     * Obtiene cargos activos para un condominio.
     * @param {string} condominiumId - ID del condominio.
     * @returns {Promise<Array>} Array de cargos activos.
     */
    async getActiveCharges(condominiumId) {
        try {
            const query = `
                SELECT * FROM charges 
                WHERE condominium_id = $1 
                AND is_active = TRUE
                ORDER BY name ASC
            `;
            const result = await db.query(query, [condominiumId]);
            return result.rows;
        } catch (error) {
            console.error('Error en ChargeService.getActiveCharges:', error);
            throw error;
        }
    }
}

module.exports = new ChargeService();
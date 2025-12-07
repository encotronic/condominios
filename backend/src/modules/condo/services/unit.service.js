// backend/src/modules/condo/services/unit.service.js
const db = require('../../../shared/database/db');

class UnitService {
    /**
     * Obtiene todas las unidades asociadas a un condominio específico (Multi-Tenancy).
     * @param {string} condoId - El ID del condominio.
     * @returns {Promise<Array>} Un array de objetos de unidad.
     */
    async getUnitsByCondoId(condoId) {
        const query = `
            SELECT id, code, aliquot_percentage, owner_id
            FROM units
            WHERE condominium_id = $1 
            ORDER BY code;
        `;

        try {
            const result = await db.query(query, [condoId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener unidades por condominio:', error);
            throw new Error('Error al acceder a los datos de unidades.');
        }
    }

    /**
     * Obtiene una sola unidad por ID.
     * @param {string} id - ID de la unidad.
     * @param {string} condoId - ID del condominio para seguridad.
     * @returns {Promise<Object>} El objeto unidad o null.
     */
    async getUnitById(id, condoId) {
        const query = `
            SELECT id, code, aliquot_percentage, owner_id
            FROM units
            WHERE id = $1 AND condominium_id = $2;
        `;

        try {
            const result = await db.query(query, [id, condoId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener unidad por ID:', error);
            throw new Error('Error interno al buscar la unidad.');
        }
    }

    /**
     * Crea una nueva unidad con validaciones.
     * @param {Object} unitData - Datos de la unidad (code, condominiumId, aliquotPercentage, ownerId).
     * @returns {Promise<Object>} La unidad recién creada.
     */
    async createUnit(unitData) {
        const { code, condominiumId, aliquotPercentage, ownerId } = unitData;
        
        // 1. Validar que el dueño exista y pertenezca a este condominio
        const ownerExists = await db.query(
            'SELECT id FROM users WHERE id = $1 AND condominium_id = $2',
            [ownerId, condominiumId]
        );

        if (ownerExists.rows.length === 0) {
            throw new Error('El dueño especificado no existe o no pertenece a este condominio.');
        }

        // 2. Validar que el código de unidad no esté duplicado
        const existingUnits = await this.getUnitsByCondoId(condominiumId);
        const codeExists = existingUnits.some(unit => unit.code === code);

        if (codeExists) {
            throw new Error(`Ya existe una unidad con el código "${code}" en este condominio.`);
        }

        // 3. Crear la unidad
        const query = `
            INSERT INTO units (code, condominium_id, aliquot_percentage, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, code, condominium_id, aliquot_percentage, owner_id;
        `;
        const values = [code, condominiumId, aliquotPercentage, ownerId];
        
        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Error de validación: Ya existe una unidad con este código en el condominio.');
            }
            if (error.code === '23503') {
                throw new Error('Error de validación: El ID de usuario o del condominio no es válido.');
            }
            console.error('Error desconocido al crear la unidad:', error);
            throw new Error('Error interno al guardar la unidad.');
        }
    }

    /**
     * Actualiza una unidad específica.
     * @param {string} id - ID de la unidad a actualizar.
     * @param {string} condoId - ID del condominio para seguridad Multi-Tenancy.
     * @param {Object} updateData - Datos a actualizar (code, aliquotPercentage, ownerId).
     * @returns {Promise<Object>} La unidad actualizada.
     */
    async updateUnit(id, condoId, updateData) {
        const { code, aliquotPercentage, ownerId } = updateData;

        // Construir consulta dinámica
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
            // Validar que el nuevo dueño exista
            const ownerExists = await db.query(
                'SELECT id FROM users WHERE id = $1 AND condominium_id = $2',
                [ownerId, condoId]
            );
            if (ownerExists.rows.length === 0) {
                throw new Error('El nuevo dueño no existe o no pertenece a este condominio.');
            }
            fields.push(`owner_id = $${index++}`);
            values.push(ownerId);
        }

        if (fields.length === 0) {
            throw new Error('No hay campos válidos para actualizar.');
        }

        values.push(id);
        values.push(condoId);

        const query = `
            UPDATE units
            SET ${fields.join(', ')}
            WHERE id = $${index++} AND condominium_id = $${index}
            RETURNING id, code, aliquot_percentage, owner_id;
        `;

        try {
            const result = await db.query(query, values);

            if (result.rowCount === 0) {
                throw new Error('Unidad no encontrada o no pertenece a este condominio.');
            }
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Error de validación: Ya existe otra unidad con el mismo código.');
            }
            console.error('Error desconocido al actualizar la unidad:', error);
            throw new Error('Error interno al actualizar la unidad.');
        }
    }

    /**
     * Elimina una unidad específica.
     * @param {string} id - ID de la unidad a eliminar.
     * @param {string} condoId - ID del condominio para seguridad Multi-Tenancy.
     * @returns {Promise<boolean>} True si la unidad fue eliminada.
     */
    async deleteUnit(id, condoId) {
        const query = `
            DELETE FROM units
            WHERE id = $1 AND condominium_id = $2
            RETURNING id;
        `;

        try {
            const result = await db.query(query, [id, condoId]);

            if (result.rowCount === 0) {
                throw new Error('Unidad no encontrada o no pertenece a este condominio.');
            }
            return true;
        } catch (error) {
            if (error.code === '23503') {
                throw new Error('No se puede eliminar la unidad porque tiene registros asociados.');
            }
            console.error('Error desconocido al eliminar la unidad:', error);
            throw new Error('Error interno al eliminar la unidad.');
        }
    }
}

module.exports = new UnitService();
// backend/src/modules/condo/services/owner.service.js

const db = require('../../../shared/database/db'); 

class OwnerService {
    /**
     * Obtiene todos los propietarios asociados a un condominio específico (Multi-Tenancy).
     * @param {string} condoId - El ID del condominio.
     * @returns {Promise<Array>} Un array de objetos de propietario.
     */
    async getOwnersByCondoId(condoId) {
        const query = `
            SELECT id, user_id, full_name, email, phone
            FROM owners
            WHERE condominium_id = $1
            ORDER BY full_name;
        `;
        
        try {
            const result = await db.query(query, [condoId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener propietarios por condominio:', error);
            throw new Error('Error al acceder a los datos de propietarios.');
        }
    }

    /**
     * Obtiene un solo propietario por ID.
     * @param {string} id - ID del propietario.
     * @param {string} condoId - ID del condominio para seguridad.
     * @returns {Promise<Object>} El objeto propietario o null.
     */
    async getOwnerById(id, condoId) {
        const query = `
            SELECT id, user_id, full_name, email, phone
            FROM owners
            WHERE id = $1 AND condominium_id = $2;
        `;
        
        try {
            const result = await db.query(query, [id, condoId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener propietario por ID:', error);
            throw new Error('Error interno al buscar el propietario.');
        }
    }

    /**
     * Crea un nuevo propietario.
     * @param {Object} ownerData - Datos del propietario (fullName, email, phone, userId, condominiumId).
     * @returns {Promise<Object>} El propietario recién creado.
     */
    async createOwner(ownerData) {
        const { fullName, email, phone, userId, condominiumId } = ownerData;
        console.log('SERVICE createOwner - Data:', { fullName, email, phone, userId, condominiumId });
        const query = `
            INSERT INTO owners (full_name, email, phone, user_id, condominium_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, full_name, email, phone, user_id;
        `;

        try {
            const result = await db.query(query, [fullName, email, phone, userId, condominiumId]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { 
                throw new Error('Error de validación: Ya existe un propietario registrado con este email en el condominio.');
            }
            if (error.code === '23503') {
                throw new Error('Error de validación: El ID de usuario o del condominio proporcionado no es válido.');
            }
            console.error('Error desconocido al crear el propietario:', error);
            throw new Error('Error interno al guardar el propietario.');
        }
    }
    
    /**
     * Actualiza un propietario específico.
     * @param {string} id - ID del propietario a actualizar.
     * @param {string} condoId - ID del condominio para seguridad Multi-Tenancy.
     * @param {Object} updateData - Datos a actualizar (fullName, email, phone).
     * @returns {Promise<Object>} El propietario actualizado.
     */
    async updateOwner(id, condoId, updateData) {
        const { fullName, email, phone } = updateData;

        // Construir la consulta de manera dinámica para solo actualizar los campos proporcionados
        const fields = [];
        const values = [];
        let index = 1;

        if (fullName !== undefined) {
            fields.push(`full_name = $${index++}`);
            values.push(fullName);
        }
        if (email !== undefined) {
            fields.push(`email = $${index++}`);
            values.push(email);
        }
        if (phone !== undefined) {
            fields.push(`phone = $${index++}`);
            values.push(phone);
        }

        if (fields.length === 0) {
            throw new Error('No hay campos válidos para actualizar.');
        }

        values.push(id);       // $index (ID del propietario)
        values.push(condoId);  // $(index+1) (ID del condominio)

        const query = `
            UPDATE owners
            SET ${fields.join(', ')}
            WHERE id = $${index++} AND condominium_id = $${index}
            RETURNING id, full_name, email, phone, user_id;
        `;
        
        try {
            const result = await db.query(query, values);

            if (result.rowCount === 0) {
                throw new Error('Propietario no encontrado o no pertenece a este condominio.');
            }
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { 
                throw new Error('Error de validación: Ya existe otro propietario con el mismo email.');
            }
            console.error('Error desconocido al actualizar el propietario:', error);
            throw new Error('Error interno al actualizar el propietario.');
        }
    }

    /**
     * Elimina un propietario específico.
     * @param {string} id - ID del propietario a eliminar.
     * @param {string} condoId - ID del condominio para seguridad Multi-Tenancy.
     * @returns {Promise<boolean>} True si el propietario fue eliminado.
     */
    async deleteOwner(id, condoId) {
        const query = `
            DELETE FROM owners
            WHERE id = $1 AND condominium_id = $2
            RETURNING id;
        `;
        
        try {
            const result = await db.query(query, [id, condoId]);
            
            if (result.rowCount === 0) {
                throw new Error('Propietario no encontrado o no pertenece a este condominio.');
            }
            return true;
        } catch (error) {
            if (error.code === '23503') {
                throw new Error('No se puede eliminar el propietario porque tiene unidades asociadas. Reasigne la unidad primero.');
            }
            console.error('Error desconocido al eliminar el propietario:', error);
            throw new Error('Error interno al eliminar el propietario.');
        }
    }
}

module.exports = new OwnerService();
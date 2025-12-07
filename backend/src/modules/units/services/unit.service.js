// backend/src/modules/units/services/unit.service.js
const unitModel = require('../models/unit.model');
const db = require('../../../shared/database/db'); // Necesario para la validación de dueños

/**
 * Servicio para crear una nueva unidad, con validación de existencia del dueño.
 * @param {Object} data - Datos de la unidad a crear.
 */
const createUnit = async ({ code, condominiumId, aliquotPercentage, ownerId }) => {
    
    // 1. Lógica de Negocio: Validar que el dueño (ownerId) exista y pertenezca a este condominio.
    const ownerExists = await db.query(
        'SELECT id FROM users WHERE id = $1 AND condominium_id = $2',
        [ownerId, condominiumId]
    );

    if (ownerExists.rows.length === 0) {
        throw new Error('El dueño especificado no existe o no pertenece a este condominio. Debe registrar al dueño primero.');
    }

    // 2. Lógica de Negocio: Validar que el código de unidad no esté duplicado en este condominio.
    const existingUnits = await unitModel.findUnitsByCondominiumId(condominiumId);
    const codeExists = existingUnits.some(unit => unit.code === code);

    if (codeExists) {
        throw new Error(`Ya existe una unidad con el código "${code}" en este condominio.`);
    }

    // 3. Llamada al Modelo (Capa de Datos)
    const newUnit = await unitModel.createUnit({
        code,
        condominiumId,
        aliquotPercentage,
        ownerId,
    });

    return newUnit;
};

/**
 * Servicio para obtener todas las unidades de un condominio.
 * @param {string} condominiumId - ID del condominio.
 */
const getUnitsByCondominiumId = async (condominiumId) => {
    // 1. Llamada al Modelo (Capa de Datos)
    return await unitModel.findUnitsByCondominiumId(condominiumId);
};

module.exports = {
    createUnit,
    getUnitsByCondominiumId,
};
// backend/src/modules/units/controllers/unit.controller.js
const unitService = require('../services/unit.service');

/**
 * Crea una nueva unidad habitacional.
 * Ruta: POST /api/units/
 * Roles requeridos: ADMIN, MANAGER
 */
const createUnitController = async (req, res) => {
    // El condoId objetivo: permitimos override por query/body cuando es ADMIN/MANAGER
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { code, aliquotPercentage, ownerId } = req.body;

    // 1. Validar datos básicos
    if (!code || !aliquotPercentage || !ownerId) {
        return res.status(400).json({ message: 'El código, el porcentaje de alícuota y el ID del dueño son requeridos.' });
    }

    // Convertir la alícuota a número, si no lo es
    const aliquotValue = parseFloat(aliquotPercentage);
    if (isNaN(aliquotValue) || aliquotValue <= 0) {
        return res.status(400).json({ message: 'El porcentaje de alícuota debe ser un número positivo.' });
    }

    try {
        // 2. Llamar al Servicio (Lógica de Negocio)
        const newUnit = await unitService.createUnit({
            code,
            condominiumId,
            aliquotPercentage: aliquotValue,
            ownerId,
        });

        return res.status(201).json({ 
            message: 'Unidad creada exitosamente.',
            unit: newUnit 
        });
    } catch (error) {
        const statusCode = error.message.includes('duplicado') || error.message.includes('dueño') ? 409 : 500;
        return res.status(statusCode).json({ message: error.message || 'Error interno al crear la unidad.' });
    }
};

/**
 * Obtiene todas las unidades del condominio del usuario.
 * Ruta: GET /api/units/
 * Roles requeridos: ADMIN, MANAGER, UNIT_OWNER (solo ve sus datos)
 */
const getUnitsController = async (req, res) => {
    // El condoId objetivo: permitimos override por query cuando es ADMIN/MANAGER
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);

    try {
        const units = await unitService.getUnitsByCondominiumId(condominiumId);
        
        // En una implementación real, aquí se filtraría la data si el rol es UNIT_OWNER.
        // Pero por ahora, mostramos todas las unidades del condominio.

        return res.status(200).json(units);
    } catch (error) {
        return res.status(500).json({ message: 'Error interno al obtener las unidades.' });
    }
};

module.exports = {
    createUnitController,
    getUnitsController,
};
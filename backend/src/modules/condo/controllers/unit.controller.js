// backend/src/modules/condo/controllers/unit.controller.js

const unitService = require('../services/unit.service');

/**
 * [POST] Crea una nueva unidad.
 * Roles: ADMIN, MANAGER
 */
const createUnitController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { code, aliquotPercentage, ownerId } = req.body;

    if (!code || !aliquotPercentage || !ownerId) {
        return res.status(400).json({ message: 'Código, alícuota y ID de propietario son requeridos.' });
    }

    try {
        const newUnit = await unitService.createUnit({
            code, 
            condominiumId, 
            aliquotPercentage, 
            ownerId
        });
        return res.status(201).json({ message: 'Unidad creada exitosamente.', unit: newUnit });
    } catch (error) {
        // Manejo de errores 23505 (duplicado) o 23503 (FK)
        if (error.message.includes('validación')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al crear la unidad:', error);
        return res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
    }
};

/**
 * [GET] Obtiene todas las unidades del condominio.
 * Roles: ADMIN, MANAGER, UNIT_OWNER
 */
const getUnitsController = async (req, res) => {
    const { condoId: condominiumId } = req.user; 

    try {
        const units = await unitService.getUnitsByCondoId(condominiumId);
        return res.status(200).json(units);
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener la lista de unidades.' });
    }
};

/**
 * [GET] Obtiene una unidad por su ID.
 * Roles: ADMIN, MANAGER, UNIT_OWNER (solo su propia unidad)
 */
const getUnitByIdController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { id } = req.params;

    try {
        const unit = await unitService.getUnitById(id, condominiumId);
        
        if (!unit) {
            return res.status(404).json({ message: 'Unidad no encontrada.' });
        }
        
        return res.status(200).json(unit);
    } catch (error) {
        console.error('Error al obtener la unidad por ID:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * [PUT] Actualiza una unidad específica.
 * Roles: ADMIN, MANAGER
 */
const updateUnitController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { id } = req.params;
    const { code, aliquotPercentage, ownerId } = req.body;

    // Validación mínima para asegurar que se está enviando algo relevante
    if (!code && aliquotPercentage === undefined && ownerId === undefined) {
        return res.status(400).json({ message: 'Se requiere al menos un campo para actualizar (código, alícuota o ownerId).' });
    }
    
    try {
        const updatedUnit = await unitService.updateUnit(id, condominiumId, {
            code,
            aliquotPercentage,
            ownerId
        });

        return res.status(200).json({ message: 'Unidad actualizada exitosamente.', unit: updatedUnit });
    } catch (error) {
        if (error.message.includes('no encontrada') || error.message.includes('no pertenece')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('validación')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al actualizar la unidad:', error);
        return res.status(500).json({ message: 'Error interno al actualizar la unidad.' });
    }
};

/**
 * [DELETE] Elimina una unidad específica.
 * Roles: ADMIN, MANAGER
 */
const deleteUnitController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { id } = req.params;

    try {
        await unitService.deleteUnit(id, condominiumId);
        // Respuesta 204 No Content es estándar para eliminación exitosa
        return res.status(204).send(); 
    } catch (error) {
        if (error.message.includes('no encontrada') || error.message.includes('no pertenece')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('asociados')) { // Error de violación FK desde el servicio
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al eliminar la unidad:', error);
        return res.status(500).json({ message: 'Error interno al eliminar la unidad.' });
    }
};


module.exports = {
    createUnitController,
    getUnitsController,
    getUnitByIdController,
    updateUnitController,
    deleteUnitController,
};
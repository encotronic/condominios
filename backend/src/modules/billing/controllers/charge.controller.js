// backend/src/modules/billing/controllers/charge.controller.js
const chargeService = require('../services/charge.service');

/**
 * Obtiene todos los cargos del condominio.
 * @route GET /api/billing/charges
 * @roles ADMIN, MANAGER
 */
const getChargesController = async (req, res) => {
    try {
        const { condoId } = req.user;
        const charges = await chargeService.getAllCharges(condoId);
        
        res.status(200).json({
            success: true,
            count: charges.length,
            data: charges
        });
    } catch (error) {
        console.error('Error en getChargesController:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los cargos',
            error: error.message
        });
    }
};

/**
 * Obtiene un cargo específico por ID.
 * @route GET /api/billing/charges/:id
 * @roles ADMIN, MANAGER
 */
const getChargeByIdController = async (req, res) => {
    try {
        const { condoId } = req.user;
        const { id } = req.params;
        
        const charge = await chargeService.getChargeById(id, condoId);
        
        res.status(200).json({
            success: true,
            data: charge
        });
    } catch (error) {
        console.error('Error en getChargeByIdController:', error);
        
        if (error.message === 'Cargo no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al obtener el cargo',
            error: error.message
        });
    }
};

/**
 * Crea un nuevo cargo.
 * @route POST /api/billing/charges
 * @roles ADMIN, MANAGER
 */
const createChargeController = async (req, res) => {
    try {
        const { condoId } = req.user;
        const { name, description, amount, frequency, is_active, apply_to_all_units } = req.body;
        
        // Validaciones básicas
        if (!name || !amount || !frequency) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, monto y frecuencia son requeridos'
            });
        }
        
        const chargeData = {
            condominium_id: condoId,
            name,
            description,
            amount: parseFloat(amount),
            frequency,
            is_active: is_active !== undefined ? is_active : true,
            apply_to_all_units: apply_to_all_units !== undefined ? apply_to_all_units : true
        };
        
        const newCharge = await chargeService.createCharge(chargeData);
        
        res.status(201).json({
            success: true,
            message: 'Cargo creado exitosamente',
            data: newCharge
        });
    } catch (error) {
        console.error('Error en createChargeController:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el cargo',
            error: error.message
        });
    }
};

/**
 * Actualiza un cargo existente.
 * @route PUT /api/billing/charges/:id
 * @roles ADMIN, MANAGER
 */
const updateChargeController = async (req, res) => {
    try {
        const { condoId } = req.user;
        const { id } = req.params;
        const updateData = req.body;
        
        const updatedCharge = await chargeService.updateCharge(id, updateData, condoId);
        
        res.status(200).json({
            success: true,
            message: 'Cargo actualizado exitosamente',
            data: updatedCharge
        });
    } catch (error) {
        console.error('Error en updateChargeController:', error);
        
        if (error.message === 'Cargo no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el cargo',
            error: error.message
        });
    }
};

/**
 * Elimina (desactiva) un cargo.
 * @route DELETE /api/billing/charges/:id
 * @roles ADMIN, MANAGER
 */
const deleteChargeController = async (req, res) => {
    try {
        const { condoId } = req.user;
        const { id } = req.params;
        
        const result = await chargeService.deleteCharge(id, condoId);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.charge
        });
    } catch (error) {
        console.error('Error en deleteChargeController:', error);
        
        if (error.message === 'Cargo no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el cargo',
            error: error.message
        });
    }
};

module.exports = {
    getChargesController,
    getChargeByIdController,
    createChargeController,
    updateChargeController,
    deleteChargeController
};
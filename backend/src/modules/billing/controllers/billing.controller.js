// backend/src/modules/billing/controllers/billing.controller.js
const billingService = require('../services/billing.service');

/**
 * Controlador para la generación manual de un periodo de facturación.
 * Ahora usa cargos automáticamente, no necesita totalCost.
 * Ruta: POST /api/billing/generate
 * Roles requeridos: ADMIN, MANAGER
 */
const generateBillingController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ 
            message: 'Las fechas de inicio y fin son requeridas.' 
        });
    }

    try {
        const result = await billingService.generateBillingPeriod({
            condominiumId,
            startDate,
            endDate
        });

        // Formato de respuesta para la prueba exitosa
        return res.status(201).json({ 
            message: 'Periodo de facturación generado exitosamente.',
            summary: {
                billingPeriodId: result.billingPeriodId,
                recordsCreated: result.recordsCount,
                totalCost: result.totalCost,
                totalAliquotSum: result.totalAliquotSum,
                chargesUsed: result.chargesUsed.length
            },
            chargesUsed: result.chargesUsed,
            debts: result.unitDebts
        });
    } catch (error) {
        console.error('Error al generar periodo de facturación:', error);
        
        let statusCode = 500;
        let message = error.message || 'Error interno al generar el periodo de facturación.';
        
        if (error.message.includes('No hay cargos activos') || 
            error.message.includes('No hay cargos mensuales') ||
            error.message.includes('No hay unidades registradas')) {
            statusCode = 400;
        }
        
        return res.status(statusCode).json({ message });
    }
};

/**
 * Controlador para listar los registros de deuda.
 * Se filtra automáticamente si el rol es UNIT_OWNER.
 * Ruta: GET /api/billing/debts
 */
const listDebtRecordsController = async (req, res) => {
    const { condoId: condominiumId, id: userId, role } = req.user;

    // Determinar si debemos filtrar por el ID del usuario
    // Si es ADMIN o MANAGER, el userId es null para el modelo (ver todas las deudas)
    const filterByUserId = (role === 'UNIT_OWNER') ? userId : null;

    try {
        const debts = await billingService.listDebtRecords(condominiumId, filterByUserId);

        return res.status(200).json({ 
            count: debts.length,
            role: role,
            debts
        });

    } catch (error) {
        console.error('Error al listar registros de deuda:', error);
        return res.status(500).json({ 
            message: 'Error interno al obtener los registros de deuda.' 
        });
    }
};

/**
 * Controlador para obtener resumen de cargos
 * Ruta: GET /api/billing/charges-summary
 */
const getChargesSummaryController = async (req, res) => {
    const { condoId: condominiumId } = req.user;

    try {
        const summary = await billingService.getChargesSummary(condominiumId);
        
        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error al obtener resumen de cargos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el resumen de cargos.'
        });
    }
};

module.exports = {
    generateBillingController,
    listDebtRecordsController,
    getChargesSummaryController
};
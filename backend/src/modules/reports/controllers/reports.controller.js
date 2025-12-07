// backend/src/modules/reports/controllers/reports.controller.js
const reportsService = require('../services/reports.service');
const db = require('../../../shared/database/db');

/**
 * Controlador para que UNIT_OWNER obtenga estado de cuenta de SU propia unidad.
 * Ruta: GET /api/reports/unit-statement (sin unitId)
 */
const getUnitStatementController = async (req, res) => {
    const { condoId: condominiumId, id: userId, role } = req.user;

    // Solo UNIT_OWNER puede usar esta ruta sin unitId
    if (role !== 'UNIT_OWNER') {
        return res.status(403).json({
            success: false,
            message: 'Esta ruta es solo para UNIT_OWNER. Use /unit-statement/:unitId para especificar una unidad.'
        });
    }

    try {
        // Primero necesitamos obtener el unitId del usuario
        const unitQuery = `
            SELECT u.id as unit_id
            FROM units u
            LEFT JOIN owners o ON u.owner_id = o.id
            WHERE u.condominium_id = $1 AND o.user_id = $2
            LIMIT 1
        `;
        
        const unitResult = await db.query(unitQuery, [condominiumId, userId]);
        
        if (unitResult.rows.length === 0) {
            throw new Error('No se encontró una unidad asignada a su usuario.');
        }
        
        const unitId = unitResult.rows[0].unit_id;
        
        const statement = await reportsService.getUnitStatement(
            unitId, 
            condominiumId, 
            userId, 
            role
        );

        return res.status(200).json({
            success: true,
            data: statement
        });
        
    } catch (error) {
        console.error('Error en getUnitStatementController:', error);
        
        const statusCode = error.message.includes('No se encontró') ? 404 : 500;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno al obtener el estado de cuenta.'
        });
    }
};

/**
 * Controlador para obtener estado de cuenta de una unidad específica por ID.
 * ADMIN/MANAGER pueden ver cualquier unidad, UNIT_OWNER solo la suya.
 * Ruta: GET /api/reports/unit-statement/:unitId
 */
const getUnitStatementByIdController = async (req, res) => {
    const { condoId: condominiumId, id: userId, role } = req.user;
    const { unitId } = req.params;

    if (!unitId) {
        return res.status(400).json({
            success: false,
            message: 'El ID de la unidad es requerido.'
        });
    }

    try {
        const statement = await reportsService.getUnitStatement(
            unitId, 
            condominiumId, 
            userId, 
            role
        );

        return res.status(200).json({
            success: true,
            data: statement
        });
        
    } catch (error) {
        console.error('Error en getUnitStatementByIdController:', error);
        
        const statusCode = error.message.includes('no encontrada') || 
                          error.message.includes('no autorizado') ? 
                          (error.message.includes('no autorizado') ? 403 : 404) : 500;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Error interno al obtener el estado de cuenta.'
        });
    }
};

/**
 * Controlador para obtener reporte de morosidad.
 * Solo para ADMIN y MANAGER.
 * Ruta: GET /api/reports/delinquency
 */
const getDelinquencyReportController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { daysOverdue = 30 } = req.query;

    try {
        const delinquencyReport = await reportsService.getDelinquencyReport(
            condominiumId, 
            parseInt(daysOverdue)
        );

        return res.status(200).json({
            success: true,
            count: delinquencyReport.length,
            data: delinquencyReport,
            filters: {
                daysOverdue: parseInt(daysOverdue),
                generatedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error en getDelinquencyReportController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al generar el reporte de morosidad.'
        });
    }
};

/**
 * Controlador para obtener resumen financiero.
 * Solo para ADMIN y MANAGER.
 * Ruta: GET /api/reports/financial-summary
 */
const getFinancialSummaryController = async (req, res) => {
    const { condoId: condominiumId } = req.user;
    const { 
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0]
    } = req.query;

    try {
        const financialSummary = await reportsService.getFinancialSummary(
            condominiumId, 
            startDate, 
            endDate
        );

        return res.status(200).json({
            success: true,
            period: { startDate, endDate },
            data: financialSummary
        });
        
    } catch (error) {
        console.error('Error en getFinancialSummaryController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al generar el resumen financiero.'
        });
    }
};

/**
 * Controlador para obtener historial de pagos.
 * ADMIN/MANAGER ven todos, UNIT_OWNER solo los suyos.
 * Ruta: GET /api/reports/payment-history
 */
const getPaymentHistoryController = async (req, res) => {
    const { condoId: condominiumId, id: userId, role } = req.user;
    const { 
        startDate, 
        endDate,
        unitId,
        paymentMethod
    } = req.query;

    try {
        const paymentHistory = await reportsService.getPaymentHistory(
            condominiumId, 
            userId, 
            role,
            { startDate, endDate, unitId, paymentMethod }
        );

        return res.status(200).json({
            success: true,
            count: paymentHistory.length,
            role: role,
            data: paymentHistory,
            filters: {
                startDate: startDate || 'No aplicado',
                endDate: endDate || 'No aplicado',
                unitId: unitId || 'Todas',
                paymentMethod: paymentMethod || 'Todos'
            }
        });
        
    } catch (error) {
        console.error('Error en getPaymentHistoryController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el historial de pagos.'
        });
    }
};

/**
 * Controlador para obtener resumen por unidades.
 * Solo para ADMIN y MANAGER.
 * Ruta: GET /api/reports/units-summary
 */
const getUnitsSummaryController = async (req, res) => {
    const { condoId: condominiumId } = req.user;

    try {
        const unitsSummary = await reportsService.getUnitsSummary(condominiumId);

        return res.status(200).json({
            success: true,
            count: unitsSummary.length,
            data: unitsSummary
        });
        
    } catch (error) {
        console.error('Error en getUnitsSummaryController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al generar el resumen de unidades.'
        });
    }
};

module.exports = {
    getUnitStatementController,
    getUnitStatementByIdController,
    getDelinquencyReportController,
    getFinancialSummaryController,
    getPaymentHistoryController,
    getUnitsSummaryController
};
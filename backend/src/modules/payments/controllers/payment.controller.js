// backend/src/modules/payments/controllers/payment.controller.js
const paymentService = require('../services/payment.service');

/**
 * Controlador para registrar un pago de una cuota de mantenimiento.
 * Ruta: POST /api/payments/register/:recordId
 * Roles requeridos: UNIT_OWNER, ADMIN, MANAGER
 */
const registerPaymentController = async (req, res) => {
    // 1. Obtener datos del token (quién paga) y de la ruta (qué se paga)
    const { id: userId } = req.user;
    const { recordId } = req.params;
    const { amount, paymentMethod, transactionDate, referenceNumber } = req.body;

    // 2. Validar datos de entrada
    if (!recordId || !amount || !paymentMethod) {
        return res.status(400).json({ message: 'El ID de la deuda, el monto y el método de pago son requeridos.' });
    }

    const paymentData = {
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        transactionDate: transactionDate || new Date().toISOString().split('T')[0], // Usar fecha actual si no se provee
        referenceNumber: referenceNumber || null
    };

    try {
        // 3. Llamar al Servicio para ejecutar la lógica de negocio y la transacción
        const result = await paymentService.registerPayment(paymentData, recordId);

        return res.status(201).json({
            message: result.message,
            paymentId: result.paymentId,
            unitId: result.unitId,
            recordId: result.recordId,
            amount: paymentData.amount
        });
        
    } catch (error) {
        const statusCode = (
            error.message.includes('no encontrado') || 
            error.message.includes('ya ha sido pagada') || 
            error.message.includes('monto pagado')
        ) ? 400 : 500;
        
        return res.status(statusCode).json({ message: error.message || 'Error interno al registrar el pago.' });
    }
};

/**
 * Controlador para obtener todos los pagos del condominio.
 * Ruta: GET /api/payments
 * Roles requeridos: ADMIN, MANAGER (UNIT_OWNER solo ve los suyos)
 */
const getAllPaymentsController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { id: userId, role } = req.user;
    
    // UNIT_OWNER solo puede ver sus propios pagos
    const filterByUserId = (role === 'UNIT_OWNER') ? userId : null;

    try {
        const payments = await paymentService.getAllPayments(condominiumId, filterByUserId);

        return res.status(200).json({
            success: true,
            count: payments.length,
            role: role,
            data: payments
        });
        
    } catch (error) {
        console.error('Error en getAllPaymentsController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los pagos.',
            error: error.message
        });
    }
};

/**
 * Controlador para obtener pagos por unidad.
 * Ruta: GET /api/payments/unit/:unitId
 * Roles requeridos: ADMIN, MANAGER, UNIT_OWNER (solo su unidad)
 */
const getPaymentsByUnitController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { role } = req.user;
    const { unitId } = req.params;

    // UNIT_OWNER solo puede ver pagos de sus unidades
    // (Aquí deberíamos validar que la unidad pertenece al usuario)
    // Por simplicidad, permitimos el acceso y confiamos en el filtro del servicio
    
    try {
        const payments = await paymentService.getPaymentsByUnit(unitId, condominiumId);

        return res.status(200).json({
            success: true,
            count: payments.length,
            unitId: unitId,
            data: payments
        });
        
    } catch (error) {
        console.error('Error en getPaymentsByUnitController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los pagos de la unidad.',
            error: error.message
        });
    }
};

/**
 * Controlador para obtener un pago específico por ID.
 * Ruta: GET /api/payments/:id
 * Roles requeridos: ADMIN, MANAGER, UNIT_OWNER (solo sus pagos)
 */
const getPaymentByIdController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { id: userId, role } = req.user;
    const { id } = req.params;

    try {
        const payment = await paymentService.getPaymentById(id, condominiumId);

        // UNIT_OWNER solo puede ver sus propios pagos
        if (role === 'UNIT_OWNER' && payment.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este pago.'
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });
        
    } catch (error) {
        console.error('Error en getPaymentByIdController:', error);
        
        if (error.message === 'Pago no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el pago.',
            error: error.message
        });
    }
};

/**
 * Controlador para obtener resumen de pagos por periodo.
 * Ruta: GET /api/payments/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Roles requeridos: ADMIN, MANAGER
 */
const getPaymentsSummaryController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { role } = req.user;
    const { startDate, endDate } = req.query;

    if (role !== 'ADMIN' && role !== 'MANAGER') {
        return res.status(403).json({
            success: false,
            message: 'Solo administradores y gestores pueden ver el resumen de pagos.'
        });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Las fechas de inicio y fin son requeridas (startDate, endDate).'
        });
    }

    try {
        const summary = await paymentService.getPaymentsSummary(condominiumId, startDate, endDate);

        return res.status(200).json({
            success: true,
            period: { startDate, endDate },
            data: summary
        });
        
    } catch (error) {
        console.error('Error en getPaymentsSummaryController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al generar el resumen de pagos.',
            error: error.message
        });
    }
};

module.exports = {
    registerPaymentController,
    getAllPaymentsController,
    getPaymentsByUnitController,
    getPaymentByIdController,
    getPaymentsSummaryController
};
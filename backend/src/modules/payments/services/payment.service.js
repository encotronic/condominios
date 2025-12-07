// backend/src/modules/payments/services/payment.service.js
const paymentModel = require('../models/payment.model');
const db = require('../../../shared/database/db');

/**
 * Servicio para registrar un pago y validar que el monto sea el correcto.
 * @param {Object} paymentData - Datos del pago.
 * @param {string} recordId - ID del registro de deuda (billing_unit_records).
 */
const registerPayment = async (paymentData, recordId) => {
    
    // 1. Obtener el registro de deuda para validación
    const recordQuery = `
        SELECT amount_due, unit_id, is_paid
        FROM billing_unit_records
        WHERE id = $1;
    `;
    const recordResult = await db.pool.query(recordQuery, [recordId]);

    if (recordResult.rows.length === 0) {
        throw new Error('Registro de deuda no encontrado.');
    }

    const debtRecord = recordResult.rows[0];

    // 2. Reglas de Negocio / Validaciones
    
    if (debtRecord.is_paid) {
        throw new Error('Esta cuota ya ha sido pagada previamente.');
    }

    const amountDue = parseFloat(debtRecord.amount_due);
    const amountPaid = parseFloat(paymentData.amount);

    if (amountPaid !== amountDue) {
        throw new Error(`El monto pagado (${amountPaid}) no coincide con la deuda (${amountDue}). Debe pagar el monto total.`);
    }

    // 3. Si las validaciones pasan, se ejecuta la transacción del modelo
    const result = await paymentModel.createPaymentAndMarkAsPaid(paymentData, recordId);

    return { 
        ...result, 
        unitId: debtRecord.unit_id
    };
};

/**
 * Obtiene todos los pagos del condominio.
 * @param {string} condominiumId - ID del condominio.
 * @param {string|null} userId - ID del usuario (null para todos).
 * @returns {Promise<Array>} Array de pagos.
 */
const getAllPayments = async (condominiumId, userId = null) => {
    try {
        const payments = await paymentModel.getAllPayments(condominiumId, userId);
        
        // Formatear datos para respuesta
        return payments.map(payment => ({
            id: payment.id,
            amount: parseFloat(payment.amount),
            paymentMethod: payment.payment_method,
            transactionDate: payment.transaction_date,
            referenceNumber: payment.reference_number,
            createdAt: payment.created_at,
            unitCode: payment.unit_code,
            userName: payment.user_name,
            amountDue: parseFloat(payment.amount_due),
            period: {
                startDate: payment.start_date,
                endDate: payment.end_date,
                description: payment.period_description
            }
        }));
    } catch (error) {
        console.error('Error en PaymentService.getAllPayments:', error);
        throw error;
    }
};

/**
 * Obtiene pagos por unidad.
 * @param {string} unitId - ID de la unidad.
 * @param {string} condominiumId - ID del condominio.
 * @returns {Promise<Array>} Array de pagos.
 */
const getPaymentsByUnit = async (unitId, condominiumId) => {
    try {
        const payments = await paymentModel.getPaymentsByUnit(unitId, condominiumId);
        
        return payments.map(payment => ({
            id: payment.id,
            amount: parseFloat(payment.amount),
            paymentMethod: payment.payment_method,
            transactionDate: payment.transaction_date,
            referenceNumber: payment.reference_number,
            createdAt: payment.created_at,
            amountDue: parseFloat(payment.amount_due),
            period: {
                startDate: payment.start_date,
                endDate: payment.end_date
            }
        }));
    } catch (error) {
        console.error('Error en PaymentService.getPaymentsByUnit:', error);
        throw error;
    }
};

/**
 * Obtiene un pago específico por ID.
 * @param {string} paymentId - ID del pago.
 * @param {string} condominiumId - ID del condominio.
 * @returns {Promise<Object>} El pago.
 */
const getPaymentById = async (paymentId, condominiumId) => {
    try {
        const payment = await paymentModel.getPaymentById(paymentId, condominiumId);
        
        if (!payment) {
            throw new Error('Pago no encontrado');
        }
        
        return {
            id: payment.id,
            amount: parseFloat(payment.amount),
            paymentMethod: payment.payment_method,
            transactionDate: payment.transaction_date,
            referenceNumber: payment.reference_number,
            createdAt: payment.created_at,
            unitCode: payment.unit_code,
            userName: payment.user_name,
            amountDue: parseFloat(payment.amount_due),
            period: {
                startDate: payment.start_date,
                endDate: payment.end_date
            }
        };
    } catch (error) {
        console.error('Error en PaymentService.getPaymentById:', error);
        throw error;
    }
};

/**
 * Obtiene resumen de pagos por periodo.
 * @param {string} condominiumId - ID del condominio.
 * @param {string} startDate - Fecha inicio.
 * @param {string} endDate - Fecha fin.
 * @returns {Promise<Object>} Resumen de pagos.
 */
const getPaymentsSummary = async (condominiumId, startDate, endDate) => {
    try {
        const summary = await paymentModel.getPaymentsSummary(condominiumId, startDate, endDate);
        
        // Formatear datos
        return {
            totalPayments: parseInt(summary.summary.total_count) || 0,
            totalAmount: parseFloat(summary.summary.total_sum) || 0,
            averageAmount: parseFloat(summary.summary.average_amount) || 0,
            byMethod: summary.byMethod.map(method => ({
                paymentMethod: method.payment_method,
                totalPayments: parseInt(method.total_payments),
                totalAmount: parseFloat(method.total_amount),
                uniquePayers: parseInt(method.unique_payers)
            }))
        };
    } catch (error) {
        console.error('Error en PaymentService.getPaymentsSummary:', error);
        throw error;
    }
};

module.exports = {
    registerPayment,
    getAllPayments,
    getPaymentsByUnit,
    getPaymentById,
    getPaymentsSummary
};
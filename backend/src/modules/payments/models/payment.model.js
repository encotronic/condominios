// backend/src/modules/payments/models/payment.model.js
const db = require('../../../shared/database/db');

/**
 * Registra un pago y marca la deuda correspondiente como pagada dentro de una transacción.
 * @param {Object} paymentData - Datos del pago.
 * @param {string} recordId - ID del registro de deuda (billing_unit_records) que se está pagando.
 */
const createPaymentAndMarkAsPaid = async (paymentData, recordId) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); // Inicia la transacción

        // 1. Insertar el Registro de Pago (Tabla payments)
        const paymentQuery = `
            INSERT INTO payments (
                billing_unit_record_id,
                user_id,
                amount,
                payment_method,
                transaction_date,
                reference_number
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, created_at;
        `;
        const paymentValues = [
            recordId,
            paymentData.userId,
            paymentData.amount,
            paymentData.paymentMethod,
            paymentData.transactionDate,
            paymentData.referenceNumber
        ];
        const paymentResult = await client.query(paymentQuery, paymentValues);
        const paymentId = paymentResult.rows[0].id;

        // 2. Actualizar el Registro de Deuda (billing_unit_records) a pagado
        const updateRecordQuery = `
            UPDATE billing_unit_records
            SET is_paid = TRUE, paid_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_paid = FALSE;
        `;
        const updateResult = await client.query(updateRecordQuery, [recordId]);

        if (updateResult.rowCount === 0) {
            throw new Error('El registro de deuda no existe o ya ha sido marcado como pagado.');
        }

        await client.query('COMMIT'); // Confirma la transacción

        return {
            paymentId,
            recordId,
            message: 'Pago registrado y deuda marcada como saldada.'
        };

    } catch (error) {
        await client.query('ROLLBACK'); // Revierte la operación si algo falla
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Obtiene todos los pagos de un condominio con información relacionada.
 * @param {string} condominiumId - ID del condominio.
 * @param {string|null} userId - ID del usuario para filtrar (null para todos).
 * @returns {Promise<Array>} Array de pagos con detalles.
 */
const getAllPayments = async (condominiumId, userId = null) => {
    try {
        let query = `
            SELECT 
                p.id,
                p.amount,
                p.payment_method,
                p.transaction_date,
                p.reference_number,
                p.created_at,
                u.code as unit_code,
                u2.full_name as user_name,
                bur.amount_due,
                bp.start_date,
                bp.end_date,
                bp.description as period_description
            FROM payments p
            JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
            JOIN billing_periods bp ON bur.billing_period_id = bp.id
            JOIN units u ON bur.unit_id = u.id
            JOIN users u2 ON p.user_id = u2.id
            WHERE bp.condominium_id = $1
        `;
        
        const values = [condominiumId];
        
        if (userId) {
            query += ` AND p.user_id = $2`;
            values.push(userId);
        }
        
        query += ` ORDER BY p.created_at DESC`;
        
        const { rows } = await db.query(query, values);
        return rows;
    } catch (error) {
        console.error('Error en PaymentModel.getAllPayments:', error);
        throw error;
    }
};

/**
 * Obtiene pagos por unidad específica.
 * @param {string} unitId - ID de la unidad.
 * @param {string} condominiumId - ID del condominio.
 * @returns {Promise<Array>} Array de pagos de la unidad.
 */
const getPaymentsByUnit = async (unitId, condominiumId) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.amount,
                p.payment_method,
                p.transaction_date,
                p.reference_number,
                p.created_at,
                bur.amount_due,
                bp.start_date,
                bp.end_date
            FROM payments p
            JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
            JOIN billing_periods bp ON bur.billing_period_id = bp.id
            WHERE bur.unit_id = $1 AND bp.condominium_id = $2
            ORDER BY p.created_at DESC
        `;
        
        const { rows } = await db.query(query, [unitId, condominiumId]);
        return rows;
    } catch (error) {
        console.error('Error en PaymentModel.getPaymentsByUnit:', error);
        throw error;
    }
};

/**
 * Obtiene un pago específico por ID.
 * @param {string} paymentId - ID del pago.
 * @param {string} condominiumId - ID del condominio.
 * @returns {Promise<Object|null>} El pago o null.
 */
const getPaymentById = async (paymentId, condominiumId) => {
    try {
        const query = `
            SELECT 
                p.*,
                u.code as unit_code,
                u2.full_name as user_name,
                bur.amount_due,
                bp.start_date,
                bp.end_date
            FROM payments p
            JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
            JOIN billing_periods bp ON bur.billing_period_id = bp.id
            JOIN units u ON bur.unit_id = u.id
            JOIN users u2 ON p.user_id = u2.id
            WHERE p.id = $1 AND bp.condominium_id = $2
        `;
        
        const { rows } = await db.query(query, [paymentId, condominiumId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error en PaymentModel.getPaymentById:', error);
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
        const query = `
            SELECT 
                COUNT(p.id) as total_payments,
                SUM(p.amount) as total_amount,
                p.payment_method,
                COUNT(DISTINCT p.user_id) as unique_payers
            FROM payments p
            JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
            JOIN billing_periods bp ON bur.billing_period_id = bp.id
            WHERE bp.condominium_id = $1 
                AND p.transaction_date BETWEEN $2 AND $3
            GROUP BY p.payment_method
            ORDER BY total_amount DESC
        `;
        
        const { rows } = await db.query(query, [condominiumId, startDate, endDate]);
        
        const summaryQuery = `
            SELECT 
                COUNT(p.id) as total_count,
                SUM(p.amount) as total_sum,
                AVG(p.amount) as average_amount
            FROM payments p
            JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
            JOIN billing_periods bp ON bur.billing_period_id = bp.id
            WHERE bp.condominium_id = $1 
                AND p.transaction_date BETWEEN $2 AND $3
        `;
        
        const summaryResult = await db.query(summaryQuery, [condominiumId, startDate, endDate]);
        
        return {
            summary: summaryResult.rows[0],
            byMethod: rows
        };
    } catch (error) {
        console.error('Error en PaymentModel.getPaymentsSummary:', error);
        throw error;
    }
};

module.exports = {
    createPaymentAndMarkAsPaid,
    getAllPayments,
    getPaymentsByUnit,
    getPaymentById,
    getPaymentsSummary
};
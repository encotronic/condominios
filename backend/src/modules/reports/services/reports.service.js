// backend/src/modules/reports/services/reports.service.js
const reportsModel = require('../models/reports.model');
const db = require('../../../shared/database/db');

class ReportsService {
    /**
     * Obtiene estado de cuenta de una unidad.
     * Valida que UNIT_OWNER solo pueda acceder a su unidad.
     */
    async getUnitStatement(unitId, condominiumId, userId, role) {
        try {
            // Si es UNIT_OWNER, validar que la unidad le pertenece
            if (role === 'UNIT_OWNER') {
                const validationQuery = `
                    SELECT u.id 
                    FROM units u
                    LEFT JOIN owners o ON u.owner_id = o.id
                    WHERE u.id = $1 AND u.condominium_id = $2 
                    AND (o.user_id = $3 OR u.owner_id IS NULL)
                `;
                
                const validationResult = await db.query(validationQuery, [unitId, condominiumId, userId]);
                
                if (validationResult.rows.length === 0) {
                    throw new Error('No tienes permiso para ver esta unidad o la unidad no existe.');
                }
            }

            const statement = await reportsModel.getUnitStatement(unitId, condominiumId);
            return statement;
            
        } catch (error) {
            console.error('Error en ReportsService.getUnitStatement:', error);
            throw error;
        }
    }

    /**
     * Obtiene reporte de morosidad (unidades con deudas vencidas).
     */
    async getDelinquencyReport(condominiumId, daysOverdue = 30) {
        try {
            const report = await reportsModel.getDelinquencyReport(condominiumId, daysOverdue);
            return report;
        } catch (error) {
            console.error('Error en ReportsService.getDelinquencyReport:', error);
            throw error;
        }
    }

    /**
     * Obtiene resumen financiero del condominio.
     */
    async getFinancialSummary(condominiumId, startDate, endDate) {
        try {
            // Validar fechas
            if (!startDate || !endDate) {
                throw new Error('Las fechas de inicio y fin son requeridas.');
            }

            if (new Date(startDate) > new Date(endDate)) {
                throw new Error('La fecha de inicio no puede ser mayor a la fecha de fin.');
            }

            const summary = await reportsModel.getFinancialSummary(condominiumId, startDate, endDate);
            return summary;
            
        } catch (error) {
            console.error('Error en ReportsService.getFinancialSummary:', error);
            throw error;
        }
    }

    /**
     * Obtiene historial de pagos con filtros.
     */
    async getPaymentHistory(condominiumId, userId, role, filters = {}) {
        try {
            const { startDate, endDate, unitId, paymentMethod } = filters;
            
            // Construir condiciones de filtro
            const conditions = [];
            const values = [condominiumId];
            let paramIndex = 2;

            // Si es UNIT_OWNER, solo ver sus pagos
            if (role === 'UNIT_OWNER') {
                conditions.push(`p.user_id = $${paramIndex}`);
                values.push(userId);
                paramIndex++;
            }

            // Filtro por unidad
            if (unitId) {
                conditions.push(`bur.unit_id = $${paramIndex}`);
                values.push(unitId);
                paramIndex++;
            }

            // Filtro por método de pago
            if (paymentMethod) {
                conditions.push(`p.payment_method = $${paramIndex}`);
                values.push(paymentMethod);
                paramIndex++;
            }

            // Filtro por fechas
            if (startDate && endDate) {
                conditions.push(`p.transaction_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
                values.push(startDate, endDate);
            } else if (startDate) {
                conditions.push(`p.transaction_date >= $${paramIndex}`);
                values.push(startDate);
            } else if (endDate) {
                conditions.push(`p.transaction_date <= $${paramIndex}`);
                values.push(endDate);
            }

            // Construir query
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
                    bp.start_date as period_start,
                    bp.end_date as period_end
                FROM payments p
                JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                JOIN units u ON bur.unit_id = u.id
                JOIN users u2 ON p.user_id = u2.id
                WHERE bp.condominium_id = $1
            `;

            if (conditions.length > 0) {
                query += ` AND ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY p.transaction_date DESC, p.created_at DESC`;

            const { rows } = await db.query(query, values);
            
            // Formatear respuesta
            return rows.map(row => ({
                id: row.id,
                amount: parseFloat(row.amount),
                paymentMethod: row.payment_method,
                transactionDate: row.transaction_date,
                referenceNumber: row.reference_number,
                createdAt: row.created_at,
                unitCode: row.unit_code,
                userName: row.user_name,
                amountDue: parseFloat(row.amount_due),
                period: {
                    startDate: row.period_start,
                    endDate: row.period_end
                }
            }));

        } catch (error) {
            console.error('Error en ReportsService.getPaymentHistory:', error);
            throw error;
        }
    }

    /**
     * Obtiene resumen por unidad (deuda total, pagos, saldo).
     */
    async getUnitsSummary(condominiumId) {
        try {
            const query = `
                SELECT 
                    u.id as unit_id,
                    u.code as unit_code,
                    COALESCE(o.full_name, 'Sin propietario') as owner_name,
                    u.aliquot_percentage,
                    COUNT(DISTINCT bur.id) as total_records,
                    SUM(CASE WHEN bur.is_paid = FALSE THEN bur.amount_due ELSE 0 END) as total_debt,
                    SUM(CASE WHEN bur.is_paid = TRUE THEN bur.amount_due ELSE 0 END) as total_paid,
                    COUNT(DISTINCT CASE WHEN bur.is_paid = TRUE THEN bur.id END) as paid_records,
                    COUNT(DISTINCT CASE WHEN bur.is_paid = FALSE THEN bur.id END) as pending_records,
                    MAX(bp.end_date) as last_period_end
                FROM units u
                LEFT JOIN owners o ON u.owner_id = o.id
                LEFT JOIN billing_unit_records bur ON u.id = bur.unit_id
                LEFT JOIN billing_periods bp ON bur.billing_period_id = bp.id AND bp.condominium_id = u.condominium_id
                WHERE u.condominium_id = $1
                GROUP BY u.id, u.code, o.full_name, u.aliquot_percentage
                ORDER BY u.code ASC
            `;

            const { rows } = await db.query(query, [condominiumId]);
            
            return rows.map(row => ({
                unitId: row.unit_id,
                unitCode: row.unit_code,
                ownerName: row.owner_name,
                aliquotPercentage: parseFloat(row.aliquot_percentage),
                totalRecords: parseInt(row.total_records) || 0,
                totalDebt: parseFloat(row.total_debt) || 0,
                totalPaid: parseFloat(row.total_paid) || 0,
                paidRecords: parseInt(row.paid_records) || 0,
                pendingRecords: parseInt(row.pending_records) || 0,
                balance: parseFloat((row.total_debt || 0) - (row.total_paid || 0)).toFixed(2),
                lastPeriodEnd: row.last_period_end,
                status: this.getUnitStatus(parseInt(row.pending_records) || 0, row.last_period_end)
            }));

        } catch (error) {
            console.error('Error en ReportsService.getUnitsSummary:', error);
            throw error;
        }
    }

    /**
     * Determina el estado de una unidad basado en deudas pendientes.
     */
    getUnitStatus(pendingRecords, lastPeriodEnd) {
        if (pendingRecords === 0) return 'AL_DÍA';
        
        if (!lastPeriodEnd) return 'CON_DEUDAS';
        
        const daysSinceLastPeriod = Math.floor((new Date() - new Date(lastPeriodEnd)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPeriod > 90) return 'MOROSO_GRAVE';
        if (daysSinceLastPeriod > 60) return 'MOROSO_MODERADO';
        if (daysSinceLastPeriod > 30) return 'MOROSO_LEVE';
        
        return 'PENDIENTE_RECIENTE';
    }
}

module.exports = new ReportsService();
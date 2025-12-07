// backend/src/modules/reports/models/reports.model.js
const db = require('../../../shared/database/db');

class ReportsModel {
    /**
     * Obtiene el estado de cuenta de una unidad específica.
     */
    async getUnitStatement(unitId, condominiumId) {
        try {
            // 1. Información básica de la unidad
            const unitQuery = `
                SELECT 
                    u.id, u.code, u.aliquot_percentage,
                    o.full_name as owner_name,
                    o.email as owner_email,
                    o.phone as owner_phone
                FROM units u
                LEFT JOIN owners o ON u.owner_id = o.id
                WHERE u.id = $1 AND u.condominium_id = $2
            `;
            
            const unitResult = await db.query(unitQuery, [unitId, condominiumId]);
            
            if (unitResult.rows.length === 0) {
                throw new Error('Unidad no encontrada en este condominio');
            }
            
            const unitInfo = unitResult.rows[0];

            // 2. Deudas PENDIENTES de la unidad
            const debtsQuery = `
                SELECT 
                    bur.id as record_id,
                    bur.amount_due,
                    bur.is_paid,
                    bur.paid_at,
                    bp.start_date,
                    bp.end_date,
                    bp.description as period_description
                FROM billing_unit_records bur
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bur.unit_id = $1 
                    AND bp.condominium_id = $2
                    AND bur.is_paid = FALSE
                ORDER BY bp.start_date ASC
            `;
            
            const debtsResult = await db.query(debtsQuery, [unitId, condominiumId]);

            // 3. Pagos REALIZADOS por la unidad
            const paymentsQuery = `
                SELECT 
                    p.id,
                    p.amount,
                    p.payment_method,
                    p.transaction_date,
                    p.reference_number,
                    p.created_at,
                    bp.start_date as period_start,
                    bp.end_date as period_end
                FROM payments p
                JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bur.unit_id = $1 
                    AND bp.condominium_id = $2
                ORDER BY p.transaction_date DESC
            `;
            
            const paymentsResult = await db.query(paymentsQuery, [unitId, condominiumId]);

            // 4. Cargos aplicados (TEMPORALMENTE DESHABILITADO - problema con charge_id)
            // TODO: Revisar estructura de billing_unit_records para ver si tiene charge_id
            const currentCharges = [];

            // 5. Calcular totales
            const totalDebt = debtsResult.rows.reduce((sum, debt) => 
                sum + parseFloat(debt.amount_due), 0);
            
            const totalPaid = paymentsResult.rows.reduce((sum, payment) => 
                sum + parseFloat(payment.amount), 0);

            const balance = totalDebt - totalPaid;

            return {
                unitInfo: {
                    id: unitInfo.id,
                    code: unitInfo.code,
                    aliquotPercentage: parseFloat(unitInfo.aliquot_percentage),
                    ownerName: unitInfo.owner_name,
                    ownerEmail: unitInfo.owner_email,
                    ownerPhone: unitInfo.owner_phone
                },
                debts: debtsResult.rows.map(debt => ({
                    recordId: debt.record_id,
                    amountDue: parseFloat(debt.amount_due),
                    isPaid: debt.is_paid,
                    paidAt: debt.paid_at,
                    period: {
                        startDate: debt.start_date,
                        endDate: debt.end_date,
                        description: debt.period_description
                    }
                })),
                payments: paymentsResult.rows.map(payment => ({
                    id: payment.id,
                    amount: parseFloat(payment.amount),
                    paymentMethod: payment.payment_method,
                    transactionDate: payment.transaction_date,
                    referenceNumber: payment.reference_number,
                    createdAt: payment.created_at,
                    period: {
                        startDate: payment.period_start,
                        endDate: payment.period_end
                    }
                })),
                currentCharges: currentCharges, // Temporalmente vacío
                summary: {
                    totalDebt: parseFloat(totalDebt.toFixed(2)),
                    totalPaid: parseFloat(totalPaid.toFixed(2)),
                    balance: parseFloat(balance.toFixed(2)),
                    pendingRecords: debtsResult.rows.length,
                    completedPayments: paymentsResult.rows.length,
                    status: this.getBalanceStatus(balance)
                },
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error en ReportsModel.getUnitStatement:', error);
            throw error;
        }
    }

    /**
     * Obtiene reporte de morosidad.
     */
    async getDelinquencyReport(condominiumId, daysOverdue = 30) {
        try {
            const query = `
                SELECT 
                    u.id as unit_id,
                    u.code as unit_code,
                    o.full_name as owner_name,
                    o.email as owner_email,
                    o.phone as owner_phone,
                    COUNT(bur.id) as pending_records,
                    SUM(bur.amount_due) as total_debt,
                    MIN(bp.end_date) as oldest_due_date,
                    MAX(bp.end_date) as newest_due_date,
                    EXTRACT(DAY FROM CURRENT_DATE - MAX(bp.end_date)) as days_late
                FROM units u
                LEFT JOIN owners o ON u.owner_id = o.id
                JOIN billing_unit_records bur ON u.id = bur.unit_id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE u.condominium_id = $1 
                    AND bur.is_paid = FALSE
                    AND bp.end_date < CURRENT_DATE
                GROUP BY u.id, u.code, o.full_name, o.email, o.phone
                HAVING EXTRACT(DAY FROM CURRENT_DATE - MAX(bp.end_date)) >= $2
                ORDER BY days_late DESC, total_debt DESC
            `;
            
            const { rows } = await db.query(query, [condominiumId, daysOverdue]);
            
            return rows.map(row => ({
                unitId: row.unit_id,
                unitCode: row.unit_code,
                ownerName: row.owner_name,
                ownerEmail: row.owner_email,
                ownerPhone: row.owner_phone,
                pendingRecords: parseInt(row.pending_records),
                totalDebt: parseFloat(row.total_debt),
                oldestDueDate: row.oldest_due_date,
                newestDueDate: row.newest_due_date,
                daysLate: parseInt(row.days_late),
                delinquencyStatus: this.getDelinquencyStatus(parseInt(row.days_late))
            }));

        } catch (error) {
            console.error('Error en ReportsModel.getDelinquencyReport:', error);
            throw error;
        }
    }

    /**
     * Obtiene resumen financiero del condominio.
     */
    async getFinancialSummary(condominiumId, startDate, endDate) {
        try {
            // 1. Total generado (deudas creadas)
            const generatedQuery = `
                SELECT 
                    COUNT(bur.id) as total_records,
                    SUM(bur.amount_due) as total_generated,
                    COUNT(DISTINCT bur.unit_id) as units_with_debt
                FROM billing_unit_records bur
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bp.condominium_id = $1 
                    AND bp.start_date >= $2 
                    AND bp.end_date <= $3
            `;
            
            const generatedResult = await db.query(generatedQuery, [condominiumId, startDate, endDate]);
            
            // 2. Total pagado
            const paidQuery = `
                SELECT 
                    COUNT(p.id) as total_payments,
                    SUM(p.amount) as total_paid,
                    COUNT(DISTINCT p.user_id) as unique_payers,
                    COUNT(DISTINCT bur.unit_id) as units_with_payments
                FROM payments p
                JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bp.condominium_id = $1 
                    AND p.transaction_date BETWEEN $2 AND $3
            `;
            
            const paidResult = await db.query(paidQuery, [condominiumId, startDate, endDate]);
            
            // 3. Deudas pendientes
            const pendingQuery = `
                SELECT 
                    COUNT(bur.id) as pending_records,
                    SUM(bur.amount_due) as total_pending,
                    COUNT(DISTINCT bur.unit_id) as units_pending
                FROM billing_unit_records bur
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bp.condominium_id = $1 
                    AND bp.start_date >= $2 
                    AND bp.end_date <= $3
                    AND bur.is_paid = FALSE
            `;
            
            const pendingResult = await db.query(pendingQuery, [condominiumId, startDate, endDate]);
            
            // 4. Métodos de pago utilizados
            const methodsQuery = `
                SELECT 
                    p.payment_method,
                    COUNT(p.id) as count,
                    SUM(p.amount) as total_amount
                FROM payments p
                JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bp.condominium_id = $1 
                    AND p.transaction_date BETWEEN $2 AND $3
                GROUP BY p.payment_method
                ORDER BY total_amount DESC
            `;
            
            const methodsResult = await db.query(methodsQuery, [condominiumId, startDate, endDate]);

            // 5. Ingresos por mes (para gráfico)
            const monthlyQuery = `
                SELECT 
                    DATE_TRUNC('month', p.transaction_date) as month,
                    COUNT(p.id) as payment_count,
                    SUM(p.amount) as monthly_income
                FROM payments p
                JOIN billing_unit_records bur ON p.billing_unit_record_id = bur.id
                JOIN billing_periods bp ON bur.billing_period_id = bp.id
                WHERE bp.condominium_id = $1 
                    AND p.transaction_date BETWEEN $2 AND $3
                GROUP BY DATE_TRUNC('month', p.transaction_date)
                ORDER BY month DESC
            `;
            
            const monthlyResult = await db.query(monthlyQuery, [condominiumId, startDate, endDate]);

            return {
                period: { startDate, endDate },
                generated: {
                    totalRecords: parseInt(generatedResult.rows[0]?.total_records) || 0,
                    totalAmount: parseFloat(generatedResult.rows[0]?.total_generated) || 0,
                    unitsWithDebt: parseInt(generatedResult.rows[0]?.units_with_debt) || 0
                },
                collected: {
                    totalPayments: parseInt(paidResult.rows[0]?.total_payments) || 0,
                    totalAmount: parseFloat(paidResult.rows[0]?.total_paid) || 0,
                    uniquePayers: parseInt(paidResult.rows[0]?.unique_payers) || 0,
                    unitsWithPayments: parseInt(paidResult.rows[0]?.units_with_payments) || 0,
                    collectionRate: this.calculateCollectionRate(
                        parseFloat(generatedResult.rows[0]?.total_generated) || 0,
                        parseFloat(paidResult.rows[0]?.total_paid) || 0
                    )
                },
                pending: {
                    totalRecords: parseInt(pendingResult.rows[0]?.pending_records) || 0,
                    totalAmount: parseFloat(pendingResult.rows[0]?.total_pending) || 0,
                    unitsPending: parseInt(pendingResult.rows[0]?.units_pending) || 0
                },
                paymentMethods: methodsResult.rows.map(method => ({
                    method: method.payment_method,
                    count: parseInt(method.count),
                    totalAmount: parseFloat(method.total_amount),
                    percentage: this.calculatePercentage(
                        parseFloat(method.total_amount),
                        parseFloat(paidResult.rows[0]?.total_paid) || 1
                    )
                })),
                monthlyTrends: monthlyResult.rows.map(month => ({
                    month: month.month.toISOString().split('T')[0].substring(0, 7), // YYYY-MM
                    paymentCount: parseInt(month.payment_count),
                    monthlyIncome: parseFloat(month.monthly_income)
                })),
                summary: {
                    netBalance: parseFloat(
                        (parseFloat(paidResult.rows[0]?.total_paid) || 0) - 
                        (parseFloat(pendingResult.rows[0]?.total_pending) || 0)
                    ).toFixed(2),
                    averagePayment: this.calculateAverage(
                        parseFloat(paidResult.rows[0]?.total_paid) || 0,
                        parseInt(paidResult.rows[0]?.total_payments) || 1
                    )
                }
            };

        } catch (error) {
            console.error('Error en ReportsModel.getFinancialSummary:', error);
            throw error;
        }
    }

    /**
     * Métodos auxiliares
     */
    getBalanceStatus(balance) {
        if (balance === 0) return 'SALDADO';
        if (balance < 0) return 'A_FAVOR';
        if (balance <= 100) return 'DEUDA_MENOR';
        if (balance <= 500) return 'DEUDA_MODERADA';
        return 'DEUDA_ALTA';
    }

    getDelinquencyStatus(daysLate) {
        if (daysLate >= 90) return 'MOROSIDAD_GRAVE';
        if (daysLate >= 60) return 'MOROSIDAD_ALTA';
        if (daysLate >= 30) return 'MOROSIDAD_MODERADA';
        return 'MOROSIDAD_LEVE';
    }

    calculateCollectionRate(generated, collected) {
        if (generated === 0) return 0;
        return parseFloat(((collected / generated) * 100).toFixed(2));
    }

    calculatePercentage(part, total) {
        if (total === 0) return 0;
        return parseFloat(((part / total) * 100).toFixed(2));
    }

    calculateAverage(total, count) {
        if (count === 0) return 0;
        return parseFloat((total / count).toFixed(2));
    }
}

module.exports = new ReportsModel();
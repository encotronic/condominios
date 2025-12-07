// backend/src/modules/billing/models/billing.model.js
const db = require('../../../shared/database/db');

/**
 * Inserta la cuota maestra (Billing Period) y las deudas individuales (Billing Unit Records) en una transacción.
 * Esto asegura que la cuota se registre solo si todas las unidades reciben su deuda.
 * @param {Object} periodData - Datos del periodo de facturación (condominiumId, startDate, endDate, totalCost).
 * @param {Array<Object>} unitDebts - Array de objetos de deuda por unidad.
 */
const createBillingPeriodWithDebts = async (periodData, unitDebts) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); // Inicia la transacción

        // 1. Crear el Periodo de Facturación (Cuota Maestra)
        const periodQuery = `
            INSERT INTO billing_periods (condominium_id, start_date, end_date, total_cost)
            VALUES ($1, $2, $3, $4)
            RETURNING id, condominium_id;
        `;
        const periodValues = [
            periodData.condominiumId,
            periodData.startDate,
            periodData.endDate,
            periodData.totalCost
        ];
        const periodResult = await client.query(periodQuery, periodValues);
        const billingPeriodId = periodResult.rows[0].id;

        // 2. Crear los Registros de Deuda por Unidad (Batch Insert)
        const debtInsertPromises = unitDebts.map(debt => {
            const debtQuery = `
                INSERT INTO billing_unit_records (billing_period_id, unit_id, amount_due)
                VALUES ($1, $2, $3);
            `;
            const debtValues = [
                billingPeriodId,
                debt.unitId,
                debt.amountDue
            ];
            return client.query(debtQuery, debtValues);
        });

        await Promise.all(debtInsertPromises);

        await client.query('COMMIT'); // Confirma la transacción
        return { 
            billingPeriodId, 
            condominiumId: periodData.condominiumId,
            recordsCount: unitDebts.length
        };

    } catch (error) {
        await client.query('ROLLBACK'); // Revierte todo en caso de error
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Obtiene los registros de deuda filtrados por condominio o por usuario/unidad.
 * @param {string} condominiumId
 * @param {string} userId (Opcional, si es UNIT_OWNER)
 */
const getDebtRecords = async (condominiumId, userId = null) => {
    let query = `
        SELECT 
            b_r.id AS record_id,
            b_r.amount_due,
            b_r.is_paid,
            b_r.paid_at,
            u.code AS unit_code,
            u.aliquot_percentage,
            bp.start_date,
            bp.end_date,
            u.owner_id
        FROM billing_unit_records b_r
        JOIN units u ON b_r.unit_id = u.id
        JOIN billing_periods bp ON b_r.billing_period_id = bp.id
        WHERE bp.condominium_id = $1
    `;
    const values = [condominiumId];
    
    // Si el usuario no es ADMIN/MANAGER, filtramos por sus unidades
    if (userId) {
        // Obtenemos las unidades que le pertenecen a este userId
        // Esto es necesario para manejar casos donde un usuario posee varias unidades
        const userUnits = await db.pool.query('SELECT id FROM units WHERE owner_id = $1', [userId]);
        const unitIds = userUnits.rows.map(row => row.id);

        if (unitIds.length === 0) {
            return []; // No tiene unidades, no tiene deudas
        }

        // Usamos ANY para filtrar los registros que coincidan con cualquiera de los Unit IDs del usuario
        query += ` AND b_r.unit_id = ANY($2::UUID[])`;
        values.push(unitIds);
    }
    
    query += ` ORDER BY bp.start_date DESC;`;

    const result = await db.pool.query(query, values);
    return result.rows;
};


module.exports = {
    createBillingPeriodWithDebts,
    getDebtRecords,
};
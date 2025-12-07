// backend/src/modules/billing/services/billing.service.js
const billingModel = require('../models/billing.model');
const unitModel = require('../../condo/models/unit.model');
const chargeService = require('./charge.service'); // Importar servicio de cargos

/**
 * Servicio central para la generación de cuotas de mantenimiento.
 * Ahora usa cargos activos automáticamente.
 * @param {Object} periodData - Datos del periodo (condominiumId, startDate, endDate).
 */
const generateBillingPeriod = async ({ condominiumId, startDate, endDate }) => {

    // 1. Obtener todos los cargos activos del condominio
    const activeCharges = await chargeService.getActiveCharges(condominiumId);
    
    if (activeCharges.length === 0) {
        throw new Error('No hay cargos activos configurados para este condominio.');
    }

    // 2. Filtrar cargos mensuales (por ahora solo MONTHLY, después expandiremos)
    const monthlyCharges = activeCharges.filter(charge => charge.frequency === 'MONTHLY');
    
    if (monthlyCharges.length === 0) {
        throw new Error('No hay cargos mensuales activos. Configure al menos un cargo con frecuencia MONTHLY.');
    }

    // 3. Calcular costo total sumando todos los cargos mensuales
    const totalCost = monthlyCharges.reduce((sum, charge) => {
        return sum + parseFloat(charge.amount);
    }, 0);

    // 4. Obtener todas las unidades y sus alícuotas
    const units = await unitModel.findUnitsByCondominiumId(condominiumId);

    if (units.length === 0) {
        throw new Error('No hay unidades registradas en este condominio para generar cuotas.');
    }

    // 5. Calcular la suma total de todas las alícuotas
    const totalAliquotSum = units.reduce((sum, unit) => sum + parseFloat(unit.aliquot_percentage), 0);

    // 6. Validar si la suma de alícuotas es 100% (idealmente) o cercana
    if (totalAliquotSum < 99.9 || totalAliquotSum > 100.1) {
        console.warn(`Advertencia: La suma de alícuotas del condominio (${totalAliquotSum.toFixed(2)}%) no es 100%.`);
    }

    // 7. Calcular la deuda individual para cada unidad
    const unitDebts = units.map(unit => {
        // Fórmula: Deuda = (Costo Total * Alícuota) / 100
        const amountDue = (totalCost * parseFloat(unit.aliquot_percentage)) / 100;

        return {
            unitId: unit.id,
            amountDue: parseFloat(amountDue.toFixed(2)),
            chargesApplied: monthlyCharges.map(charge => ({
                chargeId: charge.id,
                chargeName: charge.name,
                chargeAmount: parseFloat(charge.amount),
                aliquotPercentage: parseFloat(unit.aliquot_percentage),
                unitShare: parseFloat((parseFloat(charge.amount) * parseFloat(unit.aliquot_percentage) / 100).toFixed(2))
            }))
        };
    });

    // 8. Llamar al Modelo para la inserción Transaccional
    const result = await billingModel.createBillingPeriodWithDebts(
        { 
            condominiumId, 
            startDate, 
            endDate, 
            totalCost,
            description: `Generado automáticamente con ${monthlyCharges.length} cargos mensuales`
        },
        unitDebts
    );

    return {
        ...result,
        unitDebts,
        totalAliquotSum: parseFloat(totalAliquotSum.toFixed(2)),
        chargesUsed: monthlyCharges.map(charge => ({
            id: charge.id,
            name: charge.name,
            amount: parseFloat(charge.amount),
            frequency: charge.frequency
        })),
        totalCost: parseFloat(totalCost.toFixed(2))
    };
};

/**
 * Servicio para listar todas las deudas de un condominio o las deudas de un usuario específico.
 * @param {string} condominiumId
 * @param {string | null} userId - ID del usuario, null si es ADMIN/MANAGER.
 */
const listDebtRecords = async (condominiumId, userId) => {
    // Llama al modelo de facturación para obtener los datos con las uniones necesarias
    const records = await billingModel.getDebtRecords(condominiumId, userId);

    // Mapear y formatear la salida
    return records.map(record => ({
        id: record.record_id,
        unitCode: record.unit_code,
        aliquotPercentage: parseFloat(record.aliquot_percentage),
        amountDue: parseFloat(record.amount_due),
        status: record.is_paid ? 'PAGADO' : 'PENDIENTE',
        paidAt: record.paid_at,
        period: {
            startDate: record.start_date.toISOString().split('T')[0],
            endDate: record.end_date.toISOString().split('T')[0],
            description: record.description
        }
    }));
};

/**
 * Obtiene el resumen de cargos para un periodo
 */
const getChargesSummary = async (condominiumId) => {
    const activeCharges = await chargeService.getActiveCharges(condominiumId);
    
    const summary = {
        total: activeCharges.length,
        byFrequency: {},
        totalMonthlyAmount: 0
    };

    // Agrupar por frecuencia y calcular totales
    activeCharges.forEach(charge => {
        const frequency = charge.frequency;
        const amount = parseFloat(charge.amount);
        
        if (!summary.byFrequency[frequency]) {
            summary.byFrequency[frequency] = {
                count: 0,
                totalAmount: 0,
                charges: []
            };
        }
        
        summary.byFrequency[frequency].count++;
        summary.byFrequency[frequency].totalAmount += amount;
        summary.byFrequency[frequency].charges.push({
            id: charge.id,
            name: charge.name,
            amount: amount,
            is_active: charge.is_active
        });

        if (frequency === 'MONTHLY') {
            summary.totalMonthlyAmount += amount;
        }
    });

    return summary;
};

module.exports = {
    generateBillingPeriod,
    listDebtRecords,
    getChargesSummary
};